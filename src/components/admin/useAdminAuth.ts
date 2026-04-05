"use client";

import { useCallback, useEffect, useState } from "react";

type Status = { hasPassword: boolean; loggedIn: boolean } | { error: string };

export function useAdminAuth() {
  const [status, setStatus] = useState<Status | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth", { cache: "no-store" });
      const json = (await res.json()) as Status;
      setStatus(json);
    } catch {
      setStatus({ error: "Failed to load admin status" });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loggedIn = Boolean(status && !("error" in status) && status.loggedIn);

  return { status, loggedIn, refresh };
}

