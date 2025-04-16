// scripts/generate-ogp-with-static-server.ts
import { execSync, spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import waitOn from "wait-on";

const PORT: number = 3000;
const STATIC_DIR: string = "out";
const OGP_SCRIPT_PATH: string = "src/scripts/generate-ogp-screenshot.ts";
const BASE_URL: string = `http://localhost:${PORT}`;
const OUT_DIR_PATH: string = path.resolve(process.cwd(), STATIC_DIR);
const KILL_TIMEOUT_MS = 300;

async function run(): Promise<void> {
  let serverProcess: ChildProcess | null = null;
  let isCleaningUp: boolean = false;

  try {
    console.log(`🚀 Checking for static export directory: ${OUT_DIR_PATH}...`);
    if (!fs.existsSync(OUT_DIR_PATH)) {
      console.error(`🚨 Error: Directory "${STATIC_DIR}" not found.`);
      console.error(
        `   Run 'next build' with 'output: "export"' in next.config.js first, or ensure your build populates './${STATIC_DIR}'`
      );
      throw new Error(`Directory "${STATIC_DIR}" not found.`);
    }
    console.log(`✅ Found directory: ${OUT_DIR_PATH}`);

    console.log(
      `🚀 Starting static server for "${STATIC_DIR}" on port ${PORT}...`
    );

    serverProcess = spawn(
      "npx",
      ["-y", "serve", STATIC_DIR, "-l", String(PORT), "--no-clipboard"],
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
        if (isCleaningUp) {
          console.log(
            `ℹ️ Static server process exited during cleanup (code: ${code}, signal: ${signal}).`
          );
        } else {
          console.warn(
            `⚠️ Static server process exited unexpectedly *before* cleanup (code: ${code}, signal: ${signal})`
          );
        }
        serverProcess = null;
      }
    );

    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!serverProcess || serverProcess.killed) {
      throw new Error(
        "Server process failed to initialize or exited immediately."
      );
    }
    console.log(`   Server process started (PID: ${serverProcess.pid})`);

    console.log(`⏳ Waiting for server at ${BASE_URL}...`);
    await waitOn({
      resources: [BASE_URL],
      timeout: 30000,
      tcpTimeout: 1000,
      window: 500,
      verbose: false,
    });
    console.log("✅ Server is ready.");

    console.log(
      `🚀 Running OGP screenshot generation script (${OGP_SCRIPT_PATH}) via tsx...`
    );

    execSync(`tsx ${OGP_SCRIPT_PATH}`, { stdio: "inherit" });
    console.log("✅ OGP generation script finished.");
  } catch (error: any) {
    console.error("\n🚨 An error occurred during the OGP generation process:");
    console.error(error?.message || error);
    process.exitCode = 1;
  } finally {
    console.log("\n🔧 Entering cleanup phase...");
    isCleaningUp = true;

    if (serverProcess && serverProcess.pid && !serverProcess.killed) {
      const pidToKill = -serverProcess.pid;
      console.log(
        `🛑 Stopping static server process group (PID: ${serverProcess.pid}, Target: ${pidToKill}) using process.kill...`
      );
      try {
        process.kill(pidToKill, "SIGTERM");
        console.log(`   Sent SIGTERM to process group ${pidToKill}.`);

        await new Promise((resolve) => setTimeout(resolve, KILL_TIMEOUT_MS));
        console.log(`   Waited ${KILL_TIMEOUT_MS}ms for graceful exit.`);

        console.log("✅ Server stop signal sent.");
      } catch (e: any) {
        if (e.code === "ESRCH") {
          console.log(
            `   Process group ${pidToKill} already exited before kill attempt.`
          );
        } else {
          console.error(
            `   Failed to send signal to process group ${pidToKill}:`,
            e?.message
          );
        }
      }
      serverProcess = null;
    } else {
      if (serverProcess === null) {
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

run().catch((err) => {
  console.error("\n🚨 Unhandled error during script execution:", err);
  process.exit(1);
});
