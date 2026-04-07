import { NextResponse } from "next/server";

import { errorStatus } from "@/lib/adminAuth";
import {
  createSession,
  deleteSession,
  getSessionTokenFromCookieHeader,
  getSessionCookieName,
  hasPassword,
  isValidSessionToken,
  setPasswordOnce,
} from "@/lib/adminSession";

export async function GET(req: Request) {
  try {
    const token = getSessionTokenFromCookieHeader(req.headers.get("cookie"));

    const loggedIn = token ? await isValidSessionToken(token) : false;
    return NextResponse.json({ hasPassword: await hasPassword(), loggedIn });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as
      | { mode: "setup"; setupKey?: string; password?: string }
      | { mode: "login"; password?: string };

    if (body.mode === "setup") {
      const setupKey = body.setupKey ?? "";
      const password = body.password ?? "";
      if (!setupKey || !password) {
        return NextResponse.json({ error: "Missing setupKey/password" }, { status: 400 });
      }
      await setPasswordOnce(setupKey, password);
      return NextResponse.json({ ok: true });
    }

    if (body.mode === "login") {
      const password = body.password ?? "";
      if (!password) return NextResponse.json({ error: "Missing password" }, { status: 400 });

      const { rawToken, expires } = await createSession(password);
      const res = NextResponse.json({ ok: true, expires });
      const secure = new URL(req.url).protocol === "https:";
      res.cookies.set(getSessionCookieName(), rawToken, {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return res;
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err) {
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const name = getSessionCookieName();
    const token = getSessionTokenFromCookieHeader(req.headers.get("cookie"));

    if (token) await deleteSession(token);
    const res = NextResponse.json({ ok: true });
    const secure = new URL(req.url).protocol === "https:";
    res.cookies.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch (err) {
    const status = errorStatus(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
