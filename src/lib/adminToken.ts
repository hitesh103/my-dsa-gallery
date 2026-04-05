"use client";

const KEY = "adminToken";

export function getAdminToken(): string | null {
  try {
    const t = localStorage.getItem(KEY);
    return t ? t : null;
  } catch {
    return null;
  }
}

export function setAdminToken(token: string) {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    // no-op
  }
}

export function clearAdminToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}

