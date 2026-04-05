import { cookies } from "next/headers";

import { getSessionCookieName, isValidSessionToken } from "@/lib/adminSession";

export async function isAdminPageRequest() {
  const token = (await cookies()).get(getSessionCookieName())?.value ?? null;
  if (!token) return false;
  return isValidSessionToken(token);
}

