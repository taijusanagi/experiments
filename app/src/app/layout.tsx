import "./globals.css";
import { Noto_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Link from "next/link";

const noto = Noto_Sans({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en" className="dark">
      <body className={`${noto.className} antialiased`}>
        <div className="min-h-screen flex flex-col bg-[#1e1e1e] text-[#e5e5e5]">
          <header className="w-full p-4 flex justify-between items-center">
            <Link
              href="/"
              className="text-sm font-medium transition-colors duration-300 ease-in-out text-neutral-300 hover:text-teal-400"
            >
              Sanagi Labs
            </Link>
          </header>
          <main className="flex-1 flex flex-col items-center w-full">
            {children}
          </main>
          <footer className="w-full text-sm text-center font-light py-4 mt-8 text-neutral-600">
            © {currentYear} Taiju Sanagi. All experiments welcome.
          </footer>
        </div>
        <GoogleAnalytics gaId="G-W9Q0NSFK9F" />
      </body>
    </html>
  );
}
