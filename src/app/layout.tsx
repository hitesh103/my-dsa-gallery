import type { Metadata } from "next";
import "./globals.css";
import "./prism.css";
import { ThemeInitScript } from "@/components/theme/ThemeInitScript";
import { AppShell } from "@/components/ui/AppShell";

export const metadata: Metadata = {
  title: "My DSA Gallery",
  description: "Minimalist DSA + Study Gallery",
  icons: {
    icon: "/icon.svg",
  },
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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
