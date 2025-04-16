/* eslint-disable */

// scripts/generate-ogp-with-static-server.ts
// Starts a static server, waits for it, runs the OGP screenshot script,
// and then stops the server using process.kill directly to avoid lsof dependency.

import { execSync, spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import waitOn from "wait-on"; // Uses ES module interop

// --- Configuration ---
const PORT: number = 3000; // Port for the static server
const STATIC_DIR: string = "out"; // Directory to serve (your static export)
const OGP_SCRIPT_PATH: string = "src/scripts/generate-ogp-screenshot.ts"; // Path to the screenshot script
const BASE_URL: string = `http://localhost:${PORT}`;
const OUT_DIR_PATH: string = path.resolve(process.cwd(), STATIC_DIR);
const KILL_TIMEOUT_MS = 300; // Time to wait after SIGTERM before potentially exiting script

async function run(): Promise<void> {
  let serverProcess: ChildProcess | null = null;
  let isCleaningUp: boolean = false; // Flag to signal intentional shutdown

  try {
    // 1. Check if 'out' directory exists
    console.log(`🚀 Checking for static export directory: ${OUT_DIR_PATH}...`);
    if (!fs.existsSync(OUT_DIR_PATH)) {
      console.error(`🚨 Error: Directory "${STATIC_DIR}" not found.`);
      console.error(
        `   Run 'next build' with 'output: "export"' in next.config.js first, or ensure your build populates './${STATIC_DIR}'`
      );
      throw new Error(`Directory "${STATIC_DIR}" not found.`);
    }
    console.log(`✅ Found directory: ${OUT_DIR_PATH}`);

    // 2. Start the static file server (using npx serve)
    console.log(
      `🚀 Starting static server for "${STATIC_DIR}" on port ${PORT}...`
    );
    // Using 'detached: true' creates a new process group.
    // We kill the group later using -pid.
    serverProcess = spawn(
      "npx",
      ["-y", "serve", STATIC_DIR, "-l", String(PORT), "--no-clipboard"], // Ensure port is string for args. Added -y to auto-confirm npx install.
      {
        stdio: "ignore", // Ignore server output unless debugging
        detached: true, // Allows killing the process group
      }
    );

    serverProcess.on("error", (err: Error) => {
      // This catches errors during the *spawn* process itself (e.g., command not found)
      console.error("🚨 Failed to start static server:", err);
      serverProcess = null; // Ensure process is nullified
      throw err; // Stop the script
    });

    serverProcess.on(
      "exit",
      (code: number | null, signal: NodeJS.Signals | null) => {
        // Check the flag to distinguish intentional vs unexpected exit
        if (isCleaningUp) {
          // If we initiated the cleanup, this exit is expected.
          console.log(
            `ℹ️ Static server process exited during cleanup (code: ${code}, signal: ${signal}).`
          );
        } else {
          // This is for unexpected exits *before* the finally block runs
          console.warn(
            `⚠️ Static server process exited unexpectedly *before* cleanup (code: ${code}, signal: ${signal})`
          );
        }
        // Important: Nullify serverProcess so the 'finally' block doesn't try to kill it again
        serverProcess = null;
      }
    );

    // Give the process a brief moment to potentially error out immediately
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!serverProcess || serverProcess.killed) {
      // Check if it errored/exited immediately
      throw new Error(
        "Server process failed to initialize or exited immediately."
      );
    }
    console.log(`   Server process started (PID: ${serverProcess.pid})`);

    // 3. Wait for the server to be ready
    console.log(`⏳ Waiting for server at ${BASE_URL}...`);
    await waitOn({
      resources: [BASE_URL],
      timeout: 30000, // Wait up to 30 seconds
      tcpTimeout: 1000,
      window: 500, // Stability check interval
      verbose: false, // Reduce wait-on logging noise
    });
    console.log("✅ Server is ready.");

    // 4. Run the OGP generation script using tsx
    console.log(
      `🚀 Running OGP screenshot generation script (${OGP_SCRIPT_PATH}) via tsx...`
    );
    // Execute the TypeScript script directly using tsx
    // Ensure stdio is inherited so we see the output/errors from the script
    execSync(`tsx ${OGP_SCRIPT_PATH}`, { stdio: "inherit" });
    console.log("✅ OGP generation script finished.");
  } catch (error: any) {
    console.error("\n🚨 An error occurred during the OGP generation process:");
    console.error(error?.message || error);
    process.exitCode = 1; // Indicate failure
  } finally {
    // 5. Stop the server
    console.log("\n🔧 Entering cleanup phase...");
    isCleaningUp = true; // Signal that we are now intentionally stopping the server

    // Check if serverProcess exists, has a PID, and hasn't already exited
    if (serverProcess && serverProcess.pid && !serverProcess.killed) {
      const pidToKill = -serverProcess.pid; // Target the entire process group
      console.log(
        `🛑 Stopping static server process group (PID: ${serverProcess.pid}, Target: ${pidToKill}) using process.kill...`
      );
      try {
        // Attempt graceful shutdown first using SIGTERM to the process group
        process.kill(pidToKill, "SIGTERM");
        console.log(`   Sent SIGTERM to process group ${pidToKill}.`);

        // Wait a brief moment to allow the process to exit gracefully
        await new Promise((resolve) => setTimeout(resolve, KILL_TIMEOUT_MS));
        console.log(`   Waited ${KILL_TIMEOUT_MS}ms for graceful exit.`);

        // Optional: Check if it's still alive and force kill (usually not needed for SIGTERM on group)
        // try {
        //     process.kill(pidToKill, 0); // Check if process group exists (throws if not)
        //     console.warn(`   Process group ${pidToKill} still alive after SIGTERM, attempting SIGKILL.`);
        //     process.kill(pidToKill, "SIGKILL"); // Force kill
        //     console.log(`   Sent SIGKILL to process group ${pidToKill}.`);
        // } catch (e: any) {
        //     if (e.code === 'ESRCH') {
        //         console.log(`   Process group ${pidToKill} confirmed stopped after SIGTERM.`);
        //     } else {
        //         // Unexpected error checking/killing process
        //         console.error(`   Error during SIGKILL attempt:`, e?.message);
        //     }
        // }

        console.log("✅ Server stop signal sent.");
        // Note: The 'exit' event handler will log the actual exit code/signal.
      } catch (e: any) {
        // Handle errors during the kill attempt
        if (e.code === "ESRCH") {
          // ESRCH: Error Searching Process - means the process group was already gone
          console.log(
            `   Process group ${pidToKill} already exited before kill attempt.`
          );
        } else {
          // Other errors (e.g., permissions)
          console.error(
            `   Failed to send signal to process group ${pidToKill}:`,
            e?.message
          );
        }
      }
      // Nullify serverProcess here AFTER attempting kill,
      // as the exit handler might fire concurrently.
      serverProcess = null;
    } else {
      // Log why no kill attempt was made
      if (serverProcess === null) {
        // This means the 'exit' event likely fired before the finally block ran
        console.log(
          "🤔 Static server process had already exited before cleanup logic ran."
        );
      } else if (!serverProcess.pid) {
        console.log("🤔 Static server process has no PID to kill.");
      } else if (serverProcess.killed) {
        console.log("🤔 Static server process was already marked as killed.");
      } else {
        console.log("🤔 Static server process not found or already stopped.");
      }
    }
    console.log("🔧 Cleanup phase finished.");
  }
}

// Execute the main function
run().catch((err) => {
  // Catch unhandled promise rejections from run() itself
  console.error("\n🚨 Unhandled error during script execution:", err);
  process.exit(1);
});
