// lib/metadata.ts
import { Metadata } from "next";

const SITE_NAME = "Taiju Sanagi: Experiments";
const BASE_URL = "https://taijusanagi.com";
const DEFAULT_LOCALE = "en_US";
const OGP_IMAGE_WIDTH = 1200;
const OGP_IMAGE_HEIGHT = 630;

interface PageMetadataDetails {
  title?: string;
  description: string;
  pagePath: string;
  ogType?: "website" | "article";
}

export function buildPageMetadata({
  title,
  description,
  pagePath,
  ogType = "website",
}: PageMetadataDetails): Metadata {
  const coreTitle = title?.trim() || SITE_NAME;
  const pageUrl = `${BASE_URL}${pagePath === "/" ? "" : pagePath}`;

  let ogImagePath: string;
  if (pagePath === "/") {
    ogImagePath = "/ogp/og-img.png";
  } else {
    const cleanedPagePath = pagePath.endsWith("/")
      ? pagePath.slice(0, -1)
      : pagePath;
    ogImagePath = `/ogp${cleanedPagePath}/og-img.png`;
  }
  const ogImageUrl = `${BASE_URL}${ogImagePath}`;

  const finalBrowserTitle =
    coreTitle === SITE_NAME ? SITE_NAME : `${coreTitle} | ${SITE_NAME}`;

  return {
    title: finalBrowserTitle,
    description: description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: coreTitle,
      description: description,
      url: pageUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImageUrl,
          width: OGP_IMAGE_WIDTH,
          height: OGP_IMAGE_HEIGHT,
          alt: `${coreTitle} OGP Image`,
        },
      ],
      locale: DEFAULT_LOCALE,
      type: ogType,
    },
    twitter: {
      card: "summary_large_image",
      title: coreTitle,
      description: description,
      images: [ogImageUrl],
    },
  };
}
