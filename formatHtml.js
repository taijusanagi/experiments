#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function formatHtml(filePath) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  let html = fs.readFileSync(fullPath, "utf-8");
  const original = html;
  const now = new Date().toISOString();

  const hasCreated = /<meta\s+name=["']created["']/i.test(html);
  const hasUpdated = /<meta\s+name=["']updated["']/i.test(html);

  // Detect indent used after <head>
  const headMatch = html.match(/<head>(\s*\n)([ \t]*)/i);
  const defaultIndent = headMatch ? headMatch[2] : "  ";

  const createdTag = `${defaultIndent}<meta name="created" content="${now}" />`;
  const updatedTag = `${defaultIndent}<meta name="updated" content="${now}" />`;

  // Replace updated with preserved indentation
  if (hasUpdated) {
    html = html.replace(
      /^([ \t]*)<meta\s+name=["']updated["']\s+content=["'][^"']*["']\s*\/?>/im,
      (_, indent) => `${indent}<meta name="updated" content="${now}" />`
    );
  } else {
    html = html.replace(/<head>(\s*\n)/i, `<head>$1${updatedTag}\n`);
  }

  // Add created if missing (after updated)
  if (!hasCreated) {
    // Capture updated again to insert created below it
    const updatedLineRegex =
      /^([ \t]*)<meta\s+name=["']updated["']\s+content=["'][^"']*["']\s*\/?>/im;
    html = html.replace(updatedLineRegex, (match) => `${match}\n${createdTag}`);
  }

  if (html !== original) {
    fs.writeFileSync(fullPath, html, "utf-8");
    try {
      execSync(`git add "${fullPath}"`);
      console.log(`✅ Updated and staged: ${filePath}`);
    } catch {
      console.warn(`⚠️ Git add failed: ${filePath}`);
    }
  } else {
    console.log(`ℹ️ No changes needed: ${filePath}`);
  }
}

// --- CLI ---
const files = process.argv.slice(2);
if (!files.length) {
  console.error("Usage: formatHtml.js file1.html [file2.html ...]");
  process.exit(1);
}

files.forEach(formatHtml);
