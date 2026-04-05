import { isAdminRequest } from "@/lib/adminSession";

export async function requireAdmin(req: Request) {
  const ok = await isAdminRequest(req);
  if (!ok) {
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
