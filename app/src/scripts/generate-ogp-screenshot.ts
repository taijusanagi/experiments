// scripts/generate-ogp-screenshot.ts
import fs from "fs";
import path from "path";
import playwright, { Browser, Page, BrowserContext } from "playwright";
import { getSortedNotebooksData } from "@/lib/content";
import { getSortedHtmlPagesData } from "@/lib/content";

const BASE_URL: string = "http://localhost:3000";
const OGP_WIDTH: number = 1200;
const OGP_HEIGHT: number = 630;
const BASE_OUTPUT_DIR: string = path.resolve("./out/ogp");

const STATIC_PAGES = [
  {
    name: "Homepage",
    pagePath: "/",
    outputDir: BASE_OUTPUT_DIR,
    outputFilename: "og-img.png",
  },
];

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
      } catch (e: any) {
        console.error("  Error closing page:", e?.message);
      }
    }
    if (context) {
      try {
        await context.close();
      } catch (e: any) {
        console.error("  Error closing context:", e?.message);
      }
    }
  }
}

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

    console.log("\n--- Generating OGP images for Notes ---");
    const allNotes = getSortedNotebooksData();
    console.log(`   Found ${allNotes.length} notes.`);

    for (const note of allNotes) {
      if (!note.slug) {
        console.warn(
          `   ⚠️ Skipping note with missing slug: ${JSON.stringify(note)}`
        );
        continue;
      }

      const pageUrl: string = `${BASE_URL}/${note.slug}`;
      const title: string = note.title || `Note: ${note.slug}`;
      console.log(`\nProcessing Note: ${note.slug} ('${title}')`);

      const outPath: string = path.join(
        BASE_OUTPUT_DIR,
        note.slug,
        "og-img.png"
      );
      const noteSpecificDir = path.dirname(outPath);

      try {
        console.log(`   Ensuring output directory exists: ${noteSpecificDir}`);
        fs.mkdirSync(noteSpecificDir, { recursive: true });

        if (!browser) throw new Error("Browser not launched");
        const buffer = await generateOGScreenshot(pageUrl, browser);
        fs.writeFileSync(outPath, buffer);
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

    console.log("\n--- Generating OGP images for Demos ---");
    const allDemos = await getSortedHtmlPagesData();
    console.log(`   Found ${allDemos.length} demos.`);

    for (const demo of allDemos) {
      if (!demo.slug) {
        console.warn(
          `   ⚠️ Skipping demo with missing slug: ${JSON.stringify(demo)}`
        );
        continue;
      }

      const pageUrl: string = `${BASE_URL}/${demo.slug}`;
      const title: string = demo.title || `Demo: ${demo.slug}`;
      console.log(`\nProcessing Demo: ${demo.slug} ('${title}')`);

      const outPath: string = path.join(
        BASE_OUTPUT_DIR,
        demo.slug,
        "og-img.png"
      );
      const demoSpecificDir = path.dirname(outPath);

      try {
        console.log(`   Ensuring output directory exists: ${demoSpecificDir}`);
        fs.mkdirSync(demoSpecificDir, { recursive: true });

        if (!browser) throw new Error("Browser not launched");
        const buffer = await generateOGScreenshot(pageUrl, browser);
        fs.writeFileSync(outPath, buffer);
        console.log(
          `   ✅ Generated OGP image: ${path.relative(process.cwd(), outPath)}`
        );
      } catch (error: any) {
        console.error(
          `   ❌ FAILED OGP generation for Demo ${demo.slug} (${pageUrl}):`,
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

main().catch((err: any) => {
  console.error(
    "\nUnhandled error during OGP script execution:",
    err?.message || err
  );
  process.exit(1);
});
