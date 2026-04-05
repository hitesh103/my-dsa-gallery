import type { Metadata } from "next";
import NextLink from "next/link";
import "./globals.css";
import "./prism.css";
import { ThemeInitScript } from "@/components/theme/ThemeInitScript";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { CloudIcon, HeartIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "My DSA Gallery",
  description: "Minimalist DSA + Study Gallery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
            <NextLink href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span>My DSA Gallery</span>
              <HeartIcon className="h-4 w-4 text-muted-foreground" />
            </NextLink>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <ThemeToggle />
              <NextLink
                href="/problems"
                className="hover:text-foreground transition-colors"
              >
                Problems
              </NextLink>
              <NextLink
                href="/gallery"
                className="hover:text-foreground transition-colors"
              >
                Gallery
              </NextLink>
              <NextLink
                href="/admin"
                className="hover:text-foreground transition-colors"
              >
                Admin
              </NextLink>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-auto border-t">
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
      </body>
    </html>
  );
}
