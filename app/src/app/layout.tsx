// src/app/layout.tsx
import "./globals.css";
import { Noto_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Link from "next/link";

const noto = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentYear = 2025; // Note: Consider using `new Date().getFullYear()` for dynamic year

  return (
    <html lang="en" className="dark">
      <body
        className={`${noto.className} antialiased selection:bg-teal-400/30`}
      >
        <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-300">
          <header className="w-full px-4 py-3 flex justify-between items-center border-b border-neutral-800/60 sticky top-0 bg-neutral-950/85 backdrop-blur-sm z-10">
            <Link
              href="/"
              className="text-sm font-medium transition-colors duration-200 ease-in-out text-neutral-400 hover:text-teal-400"
            >
              Sanagi Labs
            </Link>
          </header>
          <main className="flex-1 flex flex-col items-center w-full">
            {children}
          </main>
          <footer className="w-full text-xs text-center font-normal py-4 mt-10 text-neutral-600 border-t border-neutral-800/60">
            © {currentYear} Taiju Sanagi. Experiments in progress...
          </footer>
        </div>
        <GoogleAnalytics gaId="G-W9Q0NSFK9F" />
      </body>
    </html>
  );
}
