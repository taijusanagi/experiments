// lib/metadata.ts (or similar path)
import { Metadata } from "next";

// --- Site Configuration Constants ---
const SITE_NAME = "Sanagi Labs";
const BASE_URL = "https://taijusanagi.com"; // Replace with your actual domain
const DEFAULT_LOCALE = "en_US";
const OGP_IMAGE_WIDTH = 1200;
const OGP_IMAGE_HEIGHT = 630;
// const TWITTER_HANDLE = "@YourHandle"; // Optional: Add your Twitter handle

/**
 * Interface for page metadata details.
 * Title is optional; defaults to SITE_NAME.
 * ogImagePath is derived automatically.
 */
interface PageMetadataDetails {
  title?: string; // Title is now optional
  description: string;
  pagePath: string; // Relative path (e.g., "/", "/notes", "/notes/my-slug")
  ogType?: "website" | "article"; // (default: 'website')
}

/**
 * Builds the complete Next.js Metadata object for a page.
 * Derives OGP image path. Handles optional title (defaults to SITE_NAME).
 * Prevents "Site Name | Site Name" title for homepage or pages where title isn't set.
 * @param details - The specific details for the page.
 * @returns The constructed Metadata object.
 */
export function buildPageMetadata({
  title, // Can be undefined/null/empty string
  description,
  pagePath,
  ogType = "website",
}: PageMetadataDetails): Metadata {
  // --- Determine Core Title ---
  // Use the provided title if it's truthy (not null, undefined, or empty string),
  // otherwise default to the SITE_NAME.
  const coreTitle = title?.trim() || SITE_NAME;
  // --- End Determine Core Title ---

  // Construct canonical URL, handling root path correctly
  const pageUrl = `${BASE_URL}${pagePath === "/" ? "" : pagePath}`;

  // Derive OGP Image Path Automatically
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

  // --- Determine Final Browser Title ---
  // If the core title IS the site name (either because it's the homepage
  // default or was explicitly set to the site name), just use SITE_NAME.
  // Otherwise, append " | SITE_NAME".
  const finalBrowserTitle =
    coreTitle === SITE_NAME ? SITE_NAME : `${coreTitle} | ${SITE_NAME}`;
  // --- End Determine Final Browser Title ---

  return {
    // Use the calculated final title for the browser tab
    title: finalBrowserTitle,
    description: description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      // Use the coreTitle for social previews (without | Site Name)
      title: coreTitle,
      description: description,
      url: pageUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImageUrl,
          width: OGP_IMAGE_WIDTH,
          height: OGP_IMAGE_HEIGHT,
          // Use the coreTitle for alt text
          alt: `${coreTitle} OGP Image`,
        },
      ],
      locale: DEFAULT_LOCALE,
      type: ogType,
    },
    twitter: {
      card: "summary_large_image",
      // Use the coreTitle for Twitter card
      title: coreTitle,
      description: description,
      images: [ogImageUrl],
      // creator: TWITTER_HANDLE, // Uncomment if TWITTER_HANDLE is defined
    },
  };
}
