export function requireAdmin(req: Request) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    throw new Error("ADMIN_TOKEN is not configured.");
  }

  const auth = req.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
  if (!token || token !== expected) {
    const err = new Error("Unauthorized");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).status = 401;
    throw err;
  }
}

export function errorStatus(err: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any;
  const status = typeof anyErr?.status === "number" ? anyErr.status : 500;
  return status >= 400 && status <= 599 ? status : 500;
}

