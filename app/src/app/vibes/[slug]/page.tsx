// src/app/vibes/[slug]/page.tsx
import fs from "fs";
import path from "path";
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { X } from "lucide-react";
// Ensure this import path matches your project structure (e.g., src/lib/vibes.ts)
import { getVibeTitleFromHtml, formatSlugToTitle } from "@/lib/vibes";

/**
 * Generates static paths for each vibe based on directories
 * in public/vibes during build time.
 */
export async function generateStaticParams() {
  const vibesDirectory = path.join(process.cwd(), "public", "vibes");
  try {
    // Using sync readdir here is generally acceptable for generateStaticParams
    const directories = fs
      .readdirSync(vibesDirectory, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    return directories.map((slug) => ({ slug }));
  } catch (error) {
    // Log error during build for visibility
    console.error(
      `Error reading public/vibes directory during generateStaticParams: ${error}`
    );
    return []; // Prevent build failure on error
  }
}

// Define Props type for the page component
type Props = { params: { slug: string } };

/**
 * Generates metadata for the vibe page, fetching the title
 * dynamically from the vibe's index.html.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  let actualTitle = formatSlugToTitle(slug); // Start with a fallback title
  try {
    // Fetch the actual title from the HTML file
    actualTitle = await getVibeTitleFromHtml(slug);
  } catch (e) {
    console.error(`Metadata: Failed to get title for slug "${slug}":`, e);
    // Fallback is handled within getVibeTitleFromHtml, but log error here too
  }

  const siteName = "Sanagi Labs"; // Use consistent site name
  const pageTitle = `${actualTitle} | ${siteName}`;
  const description = `Explore the interactive vibe '${actualTitle}' on ${siteName}.`;

  // Recommended Open Graph and Twitter Card metadata
  return {
    title: pageTitle,
    description: description,
    openGraph: {
      title: pageTitle,
      description: description,
      siteName: siteName,
      type: "website", // Or 'article' if more appropriate
      // Consider adding a default or specific OGP image URL:
      // images: [ { url: `/ogp/vibes/${slug}.png` or '/default-vibe-og.png' } ],
    },
    twitter: {
      card: "summary_large_image", // Assuming you might have OGP images
      title: pageTitle,
      description: description,
      // images: [`/ogp/vibes/${slug}.png` or '/default-vibe-og.png'], // Match OGP image
    },
  };
}

/**
 * Renders the individual vibe page, displaying the interactive
 * content in a full-screen iframe with a stylish close button.
 */
export default async function VibePage({ params }: Props) {
  const { slug } = params;
  // Fetch title for iframe - uses async helper with built-in fallback
  const actualTitle = await getVibeTitleFromHtml(slug);
  const siteName = "Sanagi Labs";
  const iframeTitle = `${actualTitle} - ${siteName}`; // Clean title for iframe accessibility
  const iframeSrc = `/vibes/${slug}/index.html`; // Path to the vibe's entry point

  return (
    // Use isolate to create a new stacking context, ensuring z-index works reliably
    // Full screen, dark background assumed for vibes
    <div className="flex flex-col w-full h-screen relative bg-black text-white isolate">
      {/* Stylish Close/Return Button */}
      <div className="absolute top-3 right-3 z-50">
        {" "}
        {/* High z-index to stay on top */}
        <Link
          href="/vibes" // Always returns to the main vibes gallery
          title="Return to Vibes Gallery"
          aria-label="Return to Vibes Gallery"
          className="
                        group // Enable group hover effects on child elements (icon)
                        flex items-center justify-center
                        w-10 h-10
                        rounded-full
                        bg-black/30 backdrop-blur-sm // Subtle glass effect background
                        text-neutral-300 // Default icon color
                        shadow-lg shadow-black/30 // Soft shadow for depth
                        outline-none // Remove browser default outline
                        ring-1 ring-white/10 // Subtle border ring
                        hover:bg-white/20 hover:text-white hover:ring-white/30 // Enhanced hover state
                        focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black // Clear, accessible focus state (adjust teal-400 if needed)
                        transition-all duration-200 ease-in-out // Smooth transition for all changes
                    "
        >
          <X
            className="w-5 h-5 transition-transform duration-200 ease-in-out group-hover:scale-110" // Subtle icon scale on hover
          />
        </Link>
      </div>

      {/* Full-screen Iframe for the Vibe Content */}
      <iframe
        src={iframeSrc}
        title={iframeTitle} // Important for accessibility
        className="w-full h-full flex-1 block border-0" // Takes up all space, no border
        // Security consideration: Uncomment if vibes might contain less trusted scripts
        // sandbox="allow-scripts allow-same-origin"
        // loading="lazy" // Usually not needed for primary content iframe, browser handles it well
      />
    </div>
  );
}
