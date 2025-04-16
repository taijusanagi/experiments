/* eslint-disable */

// scripts/generate-ogp-screenshot.ts
// Saves images to:
// - out/ogp/og-img.png (for '/')
// - out/ogp/notes/og-img.png (for '/notes' index)
// - out/ogp/vibes/og-img.png (for '/vibes' index)
// - out/ogp/notes/<slug>/og-img.png (for '/notes/<slug>') <--- UPDATED
// - out/ogp/vibes/<slug>/og-img.png (for '/vibes/<slug>') <--- UPDATED
// Assumes a static server is running on BASE_URL.

import fs from "fs";
import path from "path";
import playwright, { Browser, Page, BrowserContext } from "playwright";

// --- Data Fetching Functions ---
// Adjust these paths to match your project structure if needed.
import { getSortedNotesData } from "@/lib/notes"; // Assuming sync
import { getSortedVibesData } from "@/lib/vibes"; // Assuming async based on prev code

// --- Configuration ---
const BASE_URL: string = "http://localhost:3000"; // URL of the running static server
const OGP_WIDTH: number = 1200;
const OGP_HEIGHT: number = 630;
const BASE_OUTPUT_DIR: string = path.resolve("./out/ogp"); // Now resolves to <project>/out/ogp

// --- Static Pages to Screenshot ---
const STATIC_PAGES = [
  {
    name: "Homepage",
    pagePath: "/",
    outputDir: BASE_OUTPUT_DIR, // Saved directly in out/ogp
    outputFilename: "og-img.png",
  },
  {
    name: "Notes Index",
    pagePath: "/notes",
    outputDir: path.join(BASE_OUTPUT_DIR, "notes"), // Saved in out/ogp/notes
    outputFilename: "og-img.png",
  },
  {
    name: "Vibes Index",
    pagePath: "/vibes",
    outputDir: path.join(BASE_OUTPUT_DIR, "vibes"), // Saved in out/ogp/vibes
    outputFilename: "og-img.png",
  },
];

/**
 * Generates an OGP screenshot for a given page URL using Playwright.
 * (Function remains the same)
 * @param pageUrl The full URL of the page to screenshot
 * @param browser A running Playwright Browser instance
 * @returns A Promise resolving to the PNG image buffer
 */
async function generateOGScreenshot(
  pageUrl: string,
  browser: Browser
): Promise<Buffer> {
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  console.log(`  Attempting to screenshot: ${pageUrl}`);

  try {
    context = await browser.newContext({
      viewport: { width: OGP_WIDTH, height: OGP_HEIGHT },
      deviceScaleFactor: 1,
    });
    page = await context.newPage();

    console.log(`  Navigating...`);
    await page.goto(pageUrl, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // await page.waitForTimeout(500); // Optional delay

    console.log(`  Taking screenshot...`);
    const buffer: Buffer = await page.screenshot({
      type: "png",
      timeout: 15000,
    });

    console.log(`  Screenshot captured successfully.`);
    return buffer;
  } catch (error: any) {
    console.error(
      `❌ Failed to generate screenshot for ${pageUrl}:`,
      error?.message || error
    );
    throw error;
  } finally {
    if (page && !page.isClosed()) {
      try {
        await page.close();
        // console.log("  Page closed."); // Less verbose logging
      } catch (e: any) {
        console.error("  Error closing page:", e?.message);
      }
    }
    if (context) {
      try {
        await context.close();
        // console.log("  Context closed."); // Less verbose logging
      } catch (e: any) {
        console.error("  Error closing context:", e?.message);
      }
    }
  }
}

/**
 * Main function to orchestrate the OGP image generation.
 */
async function main(): Promise<void> {
  console.log(`🚀 Starting OGP screenshot generation...`);
  console.log(`   Targeting base URL: ${BASE_URL}`);
  console.log(`   Base output directory: ${BASE_OUTPUT_DIR}`);

  console.log(`   Ensuring base output directory exists: ${BASE_OUTPUT_DIR}`);
  fs.mkdirSync(BASE_OUTPUT_DIR, { recursive: true });

  let browser: Browser | null = null;

  try {
    console.log("   Launching browser (Chromium)...");
    browser = await playwright.chromium.launch();

    // --- Generate for Static Pages ---
    console.log("\n--- Generating OGP images for Static Pages ---");
    for (const staticPage of STATIC_PAGES) {
      console.log(
        `\nProcessing Static Page: ${staticPage.name} (${staticPage.pagePath})`
      );
      const pageUrl = `${BASE_URL}${staticPage.pagePath}`;
      const outputFullPath = path.join(
        staticPage.outputDir,
        staticPage.outputFilename
      );

      try {
        console.log(
          `   Ensuring output directory exists: ${staticPage.outputDir}`
        );
        fs.mkdirSync(staticPage.outputDir, { recursive: true });

        if (!browser) throw new Error("Browser not launched");
        const buffer = await generateOGScreenshot(pageUrl, browser);
        fs.writeFileSync(outputFullPath, buffer);
        console.log(
          `   ✅ Generated OGP image: ${path.relative(
            process.cwd(),
            outputFullPath
          )}`
        );
      } catch (error: any) {
        console.error(
          `   ❌ FAILED OGP generation for Static Page ${staticPage.name} (${pageUrl}):`,
          error?.message
        );
      }
    }

    // --- Generate for Notes (Individual Items) ---
    console.log("\n--- Generating OGP images for Notes ---");
    // Base directory for all notes OGP images (e.g., out/ogp/notes)
    const notesBaseOutputDir = path.join(BASE_OUTPUT_DIR, "notes");
    // We still ensure this base exists, static pages section might have done it already
    fs.mkdirSync(notesBaseOutputDir, { recursive: true });

    const allNotes = getSortedNotesData();
    console.log(`   Found ${allNotes.length} notes.`);

    for (const note of allNotes) {
      if (!note.slug) {
        console.warn(
          `   ⚠️ Skipping note with missing slug: ${JSON.stringify(note)}`
        );
        continue;
      }

      const pageUrl: string = `${BASE_URL}/notes/${note.slug}`;
      const title: string = note.title || `Note: ${note.slug}`;
      console.log(`\nProcessing Note: ${note.slug} ('${title}')`);

      // --- NEW PATH STRUCTURE ---
      // Construct path like: out/ogp/notes/<slug>/og-img.png
      const outPath: string = path.join(
        notesBaseOutputDir,
        note.slug,
        "og-img.png"
      );
      // Get the directory part: out/ogp/notes/<slug>
      const noteSpecificDir = path.dirname(outPath);

      try {
        // --- Ensure the specific subdirectory for this note exists ---
        console.log(`   Ensuring output directory exists: ${noteSpecificDir}`);
        fs.mkdirSync(noteSpecificDir, { recursive: true });

        if (!browser) throw new Error("Browser not launched");
        const buffer = await generateOGScreenshot(pageUrl, browser);
        fs.writeFileSync(outPath, buffer); // Write to the new path
        console.log(
          `   ✅ Generated OGP image: ${path.relative(process.cwd(), outPath)}`
        );
      } catch (error: any) {
        console.error(
          `   ❌ FAILED OGP generation for Note ${note.slug} (${pageUrl}):`,
          error?.message
        );
      }
    }

    // --- Generate for Vibes (Individual Items) ---
    console.log("\n--- Generating OGP images for Vibes ---");
    // Base directory for all vibes OGP images (e.g., out/ogp/vibes)
    const vibesBaseOutputDir = path.join(BASE_OUTPUT_DIR, "vibes");
    // We still ensure this base exists, static pages section might have done it already
    fs.mkdirSync(vibesBaseOutputDir, { recursive: true });

    const allVibes = await getSortedVibesData();
    console.log(`   Found ${allVibes.length} vibes.`);

    for (const vibe of allVibes) {
      if (!vibe.slug) {
        console.warn(
          `   ⚠️ Skipping vibe with missing slug: ${JSON.stringify(vibe)}`
        );
        continue;
      }

      const pageUrl: string = `${BASE_URL}/vibes/${vibe.slug}`;
      const title: string = vibe.title || `Vibe: ${vibe.slug}`;
      console.log(`\nProcessing Vibe: ${vibe.slug} ('${title}')`);

      // --- NEW PATH STRUCTURE ---
      // Construct path like: out/ogp/vibes/<slug>/og-img.png
      const outPath: string = path.join(
        vibesBaseOutputDir,
        vibe.slug,
        "og-img.png"
      );
      // Get the directory part: out/ogp/vibes/<slug>
      const vibeSpecificDir = path.dirname(outPath);

      try {
        // --- Ensure the specific subdirectory for this vibe exists ---
        console.log(`   Ensuring output directory exists: ${vibeSpecificDir}`);
        fs.mkdirSync(vibeSpecificDir, { recursive: true });

        if (!browser) throw new Error("Browser not launched");
        const buffer = await generateOGScreenshot(pageUrl, browser);
        fs.writeFileSync(outPath, buffer); // Write to the new path
        console.log(
          `   ✅ Generated OGP image: ${path.relative(process.cwd(), outPath)}`
        );
      } catch (error: any) {
        console.error(
          `   ❌ FAILED OGP generation for Vibe ${vibe.slug} (${pageUrl}):`,
          error?.message
        );
      }
    }
  } catch (error: any) {
    console.error(
      "\n❌ An critical error occurred during the main generation process:",
      error?.message || error
    );
    process.exitCode = 1;
  } finally {
    if (browser) {
      console.log("\n   Closing browser...");
      await browser.close();
      console.log("   Browser closed.");
    }
  }

  if (process.exitCode === 1) {
    console.error(
      "\n--- OGP Screenshot Generation FAILED (see errors above) ---"
    );
  } else {
    console.log("\n--- OGP Screenshot Generation Complete ---");
  }
}

// --- Execute Main Function ---
main().catch((err: any) => {
  console.error(
    "\nUnhandled error during OGP script execution:",
    err?.message || err
  );
  process.exit(1);
});
