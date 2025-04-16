import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";
import { Noto_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { DefaultLayout } from "@/components/DefaultLayout";
import { buildPageMetadata } from "@/lib/metadata";
import { Metadata } from "next";

const noto = Noto_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = buildPageMetadata({
  description: "A space for learning, building, and soft experiments in AI",
  pagePath: "/",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${noto.className} antialiased`}>
        <ThemeProvider>
          <DefaultLayout>{children}</DefaultLayout>
        </ThemeProvider>
        <GoogleAnalytics gaId="G-W9Q0NSFK9F" />
      </body>
    </html>
  );
}
