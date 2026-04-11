"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { CloudIcon, HeartIcon } from "@/components/ui/Icons";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    href: "/problems",
    label: "Problems",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 7h10" />
        <path d="M7 12h10" />
        <path d="M7 17h10" />
      </svg>
    ),
  },
  {
    href: "/gallery",
    label: "Gallery",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
  },
  {
    href: "/admin",
    label: "Admin",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

function MobileHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <NextLink
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <HeartIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">my dsa gallery</span>
        </NextLink>
        <ThemeToggle />
      </div>
    </header>
  );
}

function DesktopHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur hidden md:block">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <NextLink
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span>my dsa gallery</span>
          <HeartIcon className="h-4 w-4 text-muted-foreground" />
        </NextLink>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <ThemeToggle />
          {navItems.map((item) => (
            <NextLink
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors hover:bg-muted hover:text-foreground",
                pathname === item.href &&
                  "bg-muted text-foreground font-medium",
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </NextLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur md:hidden safe-area-bottom">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <NextLink
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-xs transition-colors",
                isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn("transition-transform", isActive && "scale-110")}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-foreground" />
              )}
            </NextLink>
          );
        })}
      </div>
    </nav>
  );
}

function MobileFooter() {
  return (
    <footer className="border-t md:hidden">
      <div className="flex flex-col gap-2 px-4 py-4 text-xs text-muted-foreground">
        <div>Made for revisions. Minimal, fast, personal.</div>
        <a
          href="https://www.cloudflare.com/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 hover:text-foreground"
        >
          <CloudIcon className="h-3 w-3" />
          <span>Powered by Cloudflare</span>
        </a>
      </div>
    </footer>
  );
}

function DesktopFooter() {
  return (
    <footer className="mt-auto border-t hidden md:block">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>Made for revisions. Minimal, fast, personal.</div>
        <a
          href="https://www.cloudflare.com/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 hover:text-foreground"
        >
          <CloudIcon className="h-4 w-4" />
          <span>Powered by Cloudflare</span>
        </a>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileHeader />
      <DesktopHeader />
      {children}
      <MobileFooter />
      <DesktopFooter />
      <BottomNav />
    </>
  );
}
