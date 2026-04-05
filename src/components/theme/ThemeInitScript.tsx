import Script from "next/script";

export function ThemeInitScript() {
  // Sets the initial theme before React hydration to avoid a flash.
  const code = `
(() => {
  try {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useDark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", useDark);
  } catch {}
})();
`;

  return <Script id="theme-init" strategy="beforeInteractive">{code}</Script>;
}

