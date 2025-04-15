// src/app/vibes/[slug]/page.tsx
import fs from "fs";
import path from "path";
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { X } from "lucide-react";
import { getVibeTitleFromHtml } from "@/lib/vibes"; // Ensure this path is correct (e.g., src/lib/vibes.ts)

// --- generateStaticParams (remains the same) ---
export async function generateStaticParams() {
  const vibesDirectory = path.join(process.cwd(), "public", "vibes");
  try {
    // Using sync readdir here is okay for generateStaticParams if preferred
    const directories = fs
      .readdirSync(vibesDirectory, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    return directories.map((slug) => ({ slug }));
  } catch (error) {
    // Log the error for debugging during build
    console.error(
      `Error reading public/vibes directory during generateStaticParams: ${error}`
    );
    // Return empty array to prevent build failure, but signal the issue
    return [];
  }
}

// --- Props Type ---
type Props = { params: { slug: string } };

// --- generateMetadata: Use "Sanagi Labs" ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  // Use a default title if fetching fails unexpectedly early
  let actualTitle = "Vibe";
  try {
    actualTitle = await getVibeTitleFromHtml(slug);
  } catch (e) {
    console.error(`Metadata: Failed to get title for slug "${slug}":`, e);
    // Fallback handled within getVibeTitleFromHtml, but added safety here
    actualTitle = slug.replace(/-/g, " "); // Simple fallback if needed
  }

  const siteName = "Sanagi Labs"; // <-- Updated Site Name
  const pageTitle = `${actualTitle} | ${siteName}`;
  const description = `Explore the interactive vibe '${actualTitle}' on ${siteName}.`; // Refined description

  return {
    title: pageTitle,
    description: description,
    openGraph: {
      title: pageTitle,
      description: description,
      siteName: siteName, // Add siteName to OGP
      // Consider adding a default OGP image for vibes if specific ones aren't available
      // images: [ { url: '/default-vibe-og.png' } ],
    },
    // Add other relevant metadata like keywords if desired
    // keywords: ["interactive", "vibe", "Sanagi Labs", actualTitle],
  };
}

// --- The Page Component: Updated Close Button Style ---
export default async function VibePage({ params }: Props) {
  const { slug } = params;
  // Fetch title for iframe - fallback handled within the function
  const actualTitle = await getVibeTitleFromHtml(slug);
  const siteName = "Sanagi Labs";
  // Iframe title doesn't need the full "Vibe: " prefix maybe? Keep it clean.
  const iframeTitle = `${actualTitle} - ${siteName}`;
  const iframeSrc = `/vibes/${slug}/index.html`;

  return (
    // Assuming a dark theme for vibes based on screenshot. Full viewport height/width.
    <div className="flex flex-col w-full h-screen relative bg-black text-white isolate">
      {/* Stylish Close button - using 'isolate' on parent to ensure z-index works reliably */}
      <div className="absolute top-3 right-3 z-50">
        {" "}
        {/* Increased z-index */}
        <Link
          href="/vibes" // Link back to the main vibes gallery
          title="Return to Vibes Gallery" // Clearer title
          aria-label="Return to Vibes Gallery"
          className="
                        group // Add group for potential icon effects on hover
                        flex items-center justify-center
                        w-10 h-10 // Consistent size
                        rounded-full
                        bg-black/30 backdrop-blur-sm // Subtle glass effect
                        text-neutral-300 // Default icon color
                        shadow-lg shadow-black/30 // Add subtle shadow for depth
                        outline-none // Remove default outline
                        ring-1 ring-white/10 // Subtle border
                        hover:bg-white/20 hover:text-white hover:ring-white/30 // Enhanced hover state
                        focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black // Custom focus ring using a brand color (adjust teal-400 if needed)
                        transition-all duration-200 ease-in-out
                    "
        >
          <X
            className="w-5 h-5 transition-transform duration-200 ease-in-out group-hover:scale-110" // Icon scales slightly on hover
          />
        </Link>
      </div>

      {/* Full-height iframe */}
      <iframe
        src={iframeSrc}
        title={iframeTitle} // Use the cleaned-up iframe title
        className="w-full h-full flex-1 block border-0" // Ensure no border and takes remaining space
        // Consider sandbox attribute for security if vibes contain external scripts or untrusted content
        // sandbox="allow-scripts allow-same-origin"
        loading="lazy" // Keep lazy loading for performance iframes below the fold (though this one is likely primary content)
      />
    </div>
  );
}
