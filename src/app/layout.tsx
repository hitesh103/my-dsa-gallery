import type { Metadata } from "next";
import NextLink from "next/link";
import "./globals.css";
import "./prism.css";
import { ThemeInitScript } from "@/components/theme/ThemeInitScript";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const metadata: Metadata = {
  title: "My DSA Hub",
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
            <NextLink href="/" className="font-semibold tracking-tight">
              My DSA Hub
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
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-auto border-t">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-muted-foreground">
            Minimalist DSA write-ups + study gallery (Next.js + Cloudflare R2).
          </div>
        </footer>
      </body>
    </html>
  );
}
