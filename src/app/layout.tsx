import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import "./prism.css";
import { ThemeInitScript } from "@/components/theme/ThemeInitScript";
import { AppShell } from "@/components/ui/AppShell";
import { ClarityInitializer } from "@/components/analytics/ClarityInitializer";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
});

export const metadata: Metadata = {
  title: {
    default: "DSA Problems Gallery",
    template: "%s | DSA Gallery",
  },
  description: "Collection of Data Structures and Algorithms problems with detailed solutions, brute force, optimal approaches, and quick revision notes.",
  keywords: ["DSA", "algorithms", "data structures", "coding problems", "LeetCode", "GeeksforGeeks", "practice", "interview prep"],
  authors: [{ name: "Hitesh Prajapati" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DSA Problems Gallery",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
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
    <html lang="en" className={`${shareTechMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <ThemeInitScript />
        <ClarityInitializer />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
