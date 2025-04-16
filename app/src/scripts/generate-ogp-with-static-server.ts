/* eslint-disable */

// scripts/generate-ogp-with-static-server.ts
import { execSync, spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import waitOn from "wait-on";
import { kill } from "cross-port-killer";

const PORT: number = 3000;
const STATIC_DIR: string = "out";
const OGP_SCRIPT_PATH: string = "src/scripts/generate-ogp-screenshot.ts";
const BASE_URL: string = `http://localhost:${PORT}`;
const OUT_DIR_PATH: string = path.resolve(process.cwd(), STATIC_DIR);

async function run(): Promise<void> {
  let serverProcess: ChildProcess | null = null;
  // --- Add a flag ---
  let isCleaningUp: boolean = false;

  try {
    console.log(`🚀 Checking for static export directory: ${OUT_DIR_PATH}...`);
    if (!fs.existsSync(OUT_DIR_PATH)) {
      console.error(`🚨 Error: Directory "${STATIC_DIR}" not found.`);
      console.error(
        `   Run 'next build' with 'output: "export"' in next.config.js first.`
      );
      throw new Error(`Directory "${STATIC_DIR}" not found.`);
    }
    console.log(`✅ Found directory: ${OUT_DIR_PATH}`);

    console.log(
      `🚀 Starting static server for "${STATIC_DIR}" on port ${PORT}...`
    );
    serverProcess = spawn(
      "npx",
      ["serve", STATIC_DIR, "-l", String(PORT), "--no-clipboard"],
      {
        stdio: "ignore",
        detached: true,
      }
    );

    serverProcess.on("error", (err: Error) => {
      console.error("🚨 Failed to start static server:", err);
      serverProcess = null;
      throw err;
    });

    serverProcess.on(
      "exit",
      (code: number | null, signal: NodeJS.Signals | null) => {
        // --- Check the flag ---
        if (isCleaningUp) {
          serverProcess = null;
          return; // Don't proceed to the 'unexpected' warning
        }

        // Original logic for truly unexpected exits
        if (code !== 0 && signal !== "SIGTERM" && signal !== "SIGINT") {
          console.warn(
            `⚠️ Static server process exited unexpectedly with code: ${code}, signal: ${signal}`
          );
        } else {
          console.log(
            `ℹ️ Static server process exited normally before cleanup (code: ${code}, signal: ${signal}).`
          );
        }
        // Ensure it's nullified if it exits before finally block cleanup attempt
        serverProcess = null;
      }
    );

    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!serverProcess) {
      throw new Error(
        "Server process failed to initialize or exited immediately."
      );
    }

    console.log(`⏳ Waiting for server at ${BASE_URL}...`);
    await waitOn({
      resources: [BASE_URL],
      timeout: 30000,
      tcpTimeout: 1000,
      window: 500,
    });
    console.log("✅ Server is ready.");

    console.log(
      `🚀 Running OGP screenshot generation script (${OGP_SCRIPT_PATH}) via tsx...`
    );
    execSync(`tsx ${OGP_SCRIPT_PATH}`, { stdio: "inherit" });
    console.log("✅ OGP generation complete.");
  } catch (error: any) {
    console.error("\n🚨 An error occurred during the process:");
    console.error(error?.message || error);
    process.exitCode = 1;
  } finally {
    // --- Set the flag before attempting to kill ---
    isCleaningUp = true;

    if (serverProcess && serverProcess.pid && !serverProcess.killed) {
      console.log(
        `🛑 Stopping static server process (PID: ${serverProcess.pid}) on port ${PORT}...`
      );
      try {
        await kill(PORT);
        console.log("✅ Server stopped via kill(PORT).");
        // Prevent fallback kill attempt if this succeeds and exit handler already ran
        serverProcess = null;
      } catch (killError: any) {
        console.warn(
          `⚠️ Could not automatically stop server on port ${PORT} via kill(${PORT}). It might already be stopped or kill failed. Trying direct kill. Message: ${killError?.message}`
        );
        // Check again if serverProcess is still valid before direct kill
        if (serverProcess && serverProcess.pid && !serverProcess.killed) {
          try {
            // Use SIGTERM first for graceful shutdown attempt
            process.kill(-serverProcess.pid, "SIGTERM");
            console.log(
              `   Sent SIGTERM to process group ${serverProcess.pid}.`
            );
            // Optional: wait a very brief moment for SIGTERM to take effect
            await new Promise((resolve) => setTimeout(resolve, 100));
            // If it still exists, force with SIGKILL (less common needed here)
            if (serverProcess && !serverProcess.killed) {
              // process.kill(-serverProcess.pid, "SIGKILL"); // Usually not needed if SIGTERM works
              // console.log(`   Sent SIGKILL to process group ${serverProcess.pid}.`);
            }
          } catch (e: any) {
            // Ignore errors like "process doesn't exist" if it already stopped
            if (e.code !== "ESRCH") {
              console.error(
                `   Failed to send signal to process group ${serverProcess.pid}:`,
                e?.message
              );
            } else {
              console.log(
                `   Process group ${serverProcess.pid} likely already exited.`
              );
            }
          }
          serverProcess = null; // Mark as handled
        } else {
          console.log(
            "   Server process already stopped or invalid before direct kill attempt."
          );
        }
      }
    } else {
      // Check if serverProcess is null because it exited *before* cleanup
      if (serverProcess === null) {
        console.log(
          "🤔 Static server process had already exited or failed to start before cleanup."
        );
      } else {
        console.log(
          "🤔 Static server process already stopped or has no PID before cleanup."
        );
      }
      // Fallback: Ensure nothing is lingering on the port anyway
      try {
        await kill(PORT);
        console.log(
          `   (Fallback) Attempted kill on port ${PORT} completed (might have done nothing if process was gone).`
        );
      } catch {} // Ignore errors here
    }
  }
}

run();
