"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type Status = { hasPassword: boolean; loggedIn: boolean } | { error: string };

export function AdminLogin() {
  const router = useRouter();
  const [status, setStatus] = useState<Status | null>(null);
  const [password, setPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = async () => {
    const res = await fetch("/api/admin/auth", { cache: "no-store" });
    const json = (await res.json()) as Status;
    setStatus(json);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const onLogin = async () => {
    setMsg(null);
    const p = password.trim();
    if (!p) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "login", password: p }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Login failed");
      setPassword("");
      setMsg("Welcome back 😌");
      router.refresh();
    } catch (e) {
      const err = e instanceof Error ? e.message : "Unknown error";
      setMsg(err === "Wrong password" ? "Nope 😅 Try again." : err);
    } finally {
      setBusy(false);
    }
  };

  const onSetup = async () => {
    setMsg(null);
    const key = setupKey.trim();
    const p = password.trim();
    if (!key || !p) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "setup", setupKey: key, password: p }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Setup failed");
      setMsg("Password saved 🔐 Now login.");
      setSetupKey("");
      setPassword("");
      await refresh();
    } catch (e) {
      const err = e instanceof Error ? e.message : "Unknown error";
      setMsg(err);
    } finally {
      setBusy(false);
    }
  };

  const hasPassword = status && !("error" in status) ? status.hasPassword : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hasPassword ? "Admin Login" : "First-time Setup"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {status && "error" in status ? (
          <div className="rounded-xl border bg-card p-3 text-sm text-muted-foreground">
            {status.error}
          </div>
        ) : null}

        {!hasPassword ? (
          <div className="text-sm text-muted-foreground">
            New here? Prove you’re the owner 🕵️‍♂️ (enter your setup key), then set a password.
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Enter the secret phrase 😌
          </div>
        )}

        {!hasPassword ? (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Setup key</span>
            <input
              value={setupKey}
              onChange={(e) => setSetupKey(e.target.value)}
              placeholder="(your ADMIN_TOKEN)"
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={hasPassword ? "Password" : "Set a strong password"}
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
          />
        </label>

        <div className="flex items-center gap-2">
          {hasPassword ? (
            <button
              type="button"
              onClick={onLogin}
              disabled={busy}
              className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50"
            >
              {busy ? "Checking…" : "Login"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onSetup}
              disabled={busy}
              className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save password"}
            </button>
          )}

          {msg ? <div className="text-xs text-muted-foreground">{msg}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}

