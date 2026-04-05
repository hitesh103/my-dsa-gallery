import { getD1 } from "@/lib/d1";

const PASSWORD_KEY = "admin_password_v1";
const SESSION_COOKIE = "admin_session";

type PasswordRecord = {
  alg: "pbkdf2-sha256";
  iter: number;
  saltB64: string;
  hashB64: string;
};

function bytesToB64(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function b64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function toUtf8Bytes(text: string) {
  return new TextEncoder().encode(text);
}

async function pbkdf2Sha256(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey("raw", toUtf8Bytes(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const saltBuffer = salt.buffer.slice(
    salt.byteOffset,
    salt.byteOffset + salt.byteLength,
  ) as ArrayBuffer;
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBuffer, iterations, hash: "SHA-256" },
    key,
    256,
  );
  return new Uint8Array(bits);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function sha256B64(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", toUtf8Bytes(text));
  return bytesToB64(new Uint8Array(digest));
}

function randomTokenB64(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return bytesToB64(arr);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export async function hasPassword(): Promise<boolean> {
  const db = getD1();
  const row = await db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .bind(PASSWORD_KEY)
    .first<{ value: string }>();
  return Boolean(row?.value);
}

export async function setPasswordOnce(setupKey: string, password: string) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) throw new Error("ADMIN_TOKEN is not configured.");
  if (setupKey !== expected) {
    const err = new Error("Unauthorized");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).status = 401;
    throw err;
  }

  const db = getD1();
  const existing = await db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .bind(PASSWORD_KEY)
    .first<{ value: string }>();
  if (existing?.value) {
    const err = new Error("Password already set");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).status = 409;
    throw err;
  }

  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  // Cloudflare Workers PBKDF2 currently caps iterations at 100_000.
  const iter = 100_000;
  const hash = await pbkdf2Sha256(password, salt, iter);

  const record: PasswordRecord = {
    alg: "pbkdf2-sha256",
    iter,
    saltB64: bytesToB64(salt),
    hashB64: bytesToB64(hash),
  };

  await db
    .prepare("INSERT INTO settings (key, value) VALUES (?, ?)")
    .bind(PASSWORD_KEY, JSON.stringify(record))
    .run();
}

async function getPasswordRecord(): Promise<PasswordRecord | null> {
  const db = getD1();
  const row = await db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .bind(PASSWORD_KEY)
    .first<{ value: string }>();
  if (!row?.value) return null;
  try {
    const parsed = JSON.parse(row.value) as PasswordRecord;
    if (
      parsed &&
      parsed.alg === "pbkdf2-sha256" &&
      typeof parsed.iter === "number" &&
      typeof parsed.saltB64 === "string" &&
      typeof parsed.hashB64 === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export async function createSession(password: string) {
  const record = await getPasswordRecord();
  if (!record) {
    const err = new Error("Password not set");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).status = 400;
    throw err;
  }

  const salt = b64ToBytes(record.saltB64);
  const derived = await pbkdf2Sha256(password, salt, record.iter);
  const derivedB64 = bytesToB64(derived);
  if (!timingSafeEqual(derivedB64, record.hashB64)) {
    const err = new Error("Wrong password");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).status = 401;
    throw err;
  }

  const rawToken = randomTokenB64(32);
  const tokenHash = await sha256B64(rawToken);
  const db = getD1();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(); // 30 days
  await db
    .prepare("INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)")
    .bind(tokenHash, expires)
    .run();

  return { rawToken, expires };
}

export async function deleteSession(rawToken: string) {
  const tokenHash = await sha256B64(rawToken);
  const db = getD1();
  await db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(tokenHash).run();
}

function parseCookieHeader(cookieHeader: string | null) {
  const out = new Map<string, string>();
  if (!cookieHeader) return out;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (!k) continue;
    out.set(k, rest.join("="));
  }
  return out;
}

export async function isAdminRequest(req: Request): Promise<boolean> {
  // 1) session cookie (preferred)
  const cookies = parseCookieHeader(req.headers.get("cookie"));
  const token = cookies.get(SESSION_COOKIE) ?? null;
  if (token) {
    const ok = await isValidSessionToken(token);
    if (ok) return true;
  }

  // 2) Bearer ADMIN_TOKEN (bootstrap / manual)
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
  return Boolean(bearer && bearer === expected);
}

export async function isValidSessionToken(rawToken: string): Promise<boolean> {
  const tokenHash = await sha256B64(rawToken);
  const db = getD1();
  const row = await db
    .prepare(
      "SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND expires_at > ? LIMIT 1",
    )
    .bind(tokenHash, new Date().toISOString())
    .first<{ token_hash: string }>();
  return Boolean(row?.token_hash);
}
