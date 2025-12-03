#!/usr/bin/env node

/**
 * Clear build cache and temporary files
 */

import { rmSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");
const projectRoot = join(__dirname, "..");

const cacheDirs = ["node_modules/.vite", "dist", ".vite", "coverage"];

console.log("🧹 Clearing cache...");

cacheDirs.forEach((dir) => {
  const fullPath = join(projectRoot, dir);
  if (existsSync(fullPath)) {
    try {
      rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Cleared ${dir}`);
    } catch (error) {
      console.log(`⚠️  Could not clear ${dir}: ${error.message}`);
    }
  } else {
    console.log(`ℹ️  ${dir} does not exist`);
  }
});

console.log("✅ Cache clearing complete");
