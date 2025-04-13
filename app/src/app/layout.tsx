import "./globals.css";
import { Noto_Sans } from "next/font/google";

const noto = Noto_Sans({
  subsets: ["latin"],
});

export const metadata = {
  title: "Sanagi Labs",
  description: "A space for learning, building, and soft experiments in AI",
  openGraph: {
    title: "Sanagi Labs",
    description: "A space for learning, building, and soft experiments in AI",
    images: [
      {
        url: "https://taijusanagi.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sanagi Labs Open Graph Image",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${noto.className} antialiased`}>{children}</body>
    </html>
  );
}
