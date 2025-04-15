// scripts/generate-ogp.ts
import fs from "fs";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFile } from "fs/promises"; // Use promises for async file reading
import React from "react";

// Import data fetching functions
import { getSortedNotesData } from "@/lib/notes"; // Adjust path if needed
import { getSortedVibesData } from "@/lib/vibes"; // Adjust path if needed

// --- Helper Function to Convert Image to Base64 Data URL (No longer needed for character) ---
// async function imageToBase64(filePath: string): Promise<string | null> { ... }

// --- Updated generateOG function ---
async function generateOG(title: string, itemType: "Note" | "Vibe") {
  const displayTitle = title || "Sanagi Labs";

  // --- Load Resources ---
  // Paths for fonts (adjust if necessary)
  const fontPath = path.resolve("./public/fonts/NotoSans-Regular.ttf");
  const fontBoldPath = path.resolve("./public/fonts/NotoSans-Bold.ttf");
  // Removed character image path

  let fontData: Buffer | null = null;
  let fontBoldData: Buffer | null = null;
  // Removed characterBase64 variable

  try {
    fontData = await readFile(fontPath);
  } catch {
    console.warn(`⚠️ Could not load regular font: ${fontPath}`);
  }
  try {
    fontBoldData = await readFile(fontBoldPath);
  } catch {
    console.warn(`⚠️ Could not load bold font: ${fontBoldPath}`);
  }
  // Removed call to imageToBase64 for character
  // --- ---

  const bgColor = "#1e1e1e";
  const primaryTextColor = "#e5e5e5";
  const secondaryTextColor = "#a0a0a0";
  const accentColor = itemType === "Note" ? "#5eead4" : "#d8b4fe"; // Teal for Note, Purple for Vibe

  const satoriElement = React.createElement(
    "div", // Outermost container
    {
      style: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Center items horizontally
        justifyContent: "center", // Center items vertically
        backgroundColor: bgColor,
        fontFamily: '"Noto Sans"',
        color: primaryTextColor,
        padding: "60px", // Keep overall padding
        position: "relative",
      },
    },
    // --- Top Left: "Sanagi Labs" --- (remains the same)
    React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: "40px",
          left: "60px",
          fontSize: "24px",
          color: secondaryTextColor,
          fontWeight: 400,
        },
      },
      "Sanagi Labs"
    ),

    // --- Character Image REMOVED ---
    // The img element and its placeholder div are now gone.

    // --- Main Title --- (Now vertically centered by the flex container)
    React.createElement(
      "div",
      {
        style: {
          fontSize: "72px", // Slightly larger font size? Optional.
          fontWeight: 700,
          color: primaryTextColor,
          textAlign: "center",
          lineHeight: 1.3,
          maxWidth: "90%", // Allow slightly wider text now? Optional.
          fontFamily: fontBoldData ? '"Noto Sans Bold"' : '"Noto Sans"',
        },
      },
      displayTitle
    ),

    // --- Bottom Right: Type Indicator ("Note" / "Vibe") --- (remains the same)
    React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          bottom: "40px",
          right: "60px",
          fontSize: "28px",
          color: accentColor,
          fontWeight: 700,
          fontFamily: fontBoldData ? '"Noto Sans Bold"' : '"Noto Sans"',
        },
      },
      itemType
    )
  );

  // --- Font Configuration for Satori (remains the same) ---
  const fonts = [];
  if (fontData) {
    fonts.push({
      name: "Noto Sans",
      data: fontData,
      weight: 400,
      style: "normal",
    });
  }
  if (fontBoldData) {
    fonts.push({
      name: "Noto Sans Bold",
      data: fontBoldData,
      weight: 700,
      style: "normal",
    });
  }
  if (fontData && !fontBoldData) {
    // Add pseudo-bold using regular font data if bold wasn't loaded but weight 700 is requested
    fonts.push({
      name: "Noto Sans",
      data: fontData,
      weight: 700,
      style: "normal",
    });
  }
  // --- ---

  // --- SVG and PNG Generation (remains the same) ---
  const svg = await satori(satoriElement, {
    width: 1200,
    height: 630,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fonts: fonts as any,
  });
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: { loadSystemFonts: false },
  });
  const png = resvg.render();
  return png.asPng();
  // --- ---
}

// --- Main generation function (remains the same) ---
async function main() {
  const outputDir = path.resolve("./public/ogp");
  fs.mkdirSync(outputDir, { recursive: true });

  // --- Generate for Notes ---
  console.log("\n--- Generating OGP images for Notes ---");
  const allNotes = getSortedNotesData();
  for (const note of allNotes) {
    const title = note.title || `Note: ${note.slug}`;
    if (!note.slug) {
      console.warn(`Skipping note with missing slug: ${JSON.stringify(note)}`);
      continue;
    }
    console.log(`Generating OGP for Note: ${note.slug} ('${title}')`);
    try {
      const buffer = await generateOG(title, "Note");
      const outPath = path.join(outputDir, `${note.slug}.png`);
      fs.writeFileSync(outPath, buffer);
      console.log(`✅ Generated ${outPath}`);
    } catch (error) {
      console.error(`❌ Failed to generate OGP for Note ${note.slug}:`, error);
    }
  }

  // --- Generate for Vibes ---
  console.log("\n--- Generating OGP images for Vibes ---");
  const allVibes = await getSortedVibesData();
  for (const vibe of allVibes) {
    const title = vibe.title || `Vibe: ${vibe.slug}`;
    if (!vibe.slug) {
      console.warn(`Skipping vibe with missing slug: ${JSON.stringify(vibe)}`);
      continue;
    }
    console.log(`Generating OGP for Vibe: ${vibe.slug} ('${title}')`);
    try {
      const buffer = await generateOG(title, "Vibe");
      const outPath = path.join(outputDir, `${vibe.slug}.png`);
      fs.writeFileSync(outPath, buffer);
      console.log(`✅ Generated ${outPath}`);
    } catch (error) {
      console.error(`❌ Failed to generate OGP for Vibe ${vibe.slug}:`, error);
    }
  }

  console.log("\n--- OGP Generation Complete ---");
}

// --- Execute Main Function (remains the same) ---
main().catch((err) => {
  console.error("Error during OGP generation process:", err);
  process.exit(1);
});
