/**
 * Script to initialize Google Sheet with headers
 * Run with: npx tsx scripts/init-google-sheet.ts
 */

import { initializeSheet } from "../lib/google-sheets";

async function main() {
  console.log("Initializing Google Sheet...");

  const result = await initializeSheet();

  if (result.success) {
    console.log("✅ Google Sheet initialized successfully!");
  } else {
    console.error("❌ Failed to initialize Google Sheet:", result.error);
    process.exit(1);
  }
}

main();
