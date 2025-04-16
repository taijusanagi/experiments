// src/app/layout.tsx
import "./globals.css";
import { Inter, IBM_Plex_Mono } from "next/font/google";

import { GoogleAnalytics } from "@next/third-parties/google";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${plexMono.variable} font-sans antialiased selection:bg-emerald-400/40`}
      >
        <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-300 overflow-x-hidden">
          <header className="w-full px-5 py-4 flex justify-between items-center border-b border-neutral-800/50 sticky top-0 bg-neutral-950/90 backdrop-blur-md z-10">
            <Link
              href="/"
              className="font-mono text-sm opacity-80 font-medium tracking-tighter transition-colors duration-200 ease-in-out text-neutral-200 hover:text-emerald-400"
            >
              Taiju Sanagi: Experiments
            </Link>
          </header>
          <main className="flex-1 flex flex-col items-center w-full">
            {children}
          </main>
          <footer className="w-full text-xs text-center font-normal py-5 mt-12 text-neutral-500 border-t border-neutral-800/50">
            © {currentYear} Taiju Sanagi. Experiments in progress...
          </footer>
        </div>
        <GoogleAnalytics gaId="G-W9Q0NSFK9F" />
      </body>
    </html>
  );
}
