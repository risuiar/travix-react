#!/usr/bin/env node

import { execSync } from "child_process";
import { exit } from "process";
import fs from "fs";
import path from "path";

console.log("🔍 Running pre-commit checks...");

// Simple recursive scan to detect if there are any test files
const TEST_REGEX = /\.(test|spec)\.(?:c|m)?(?:[jt]s)(?:x)?$/i;
const EXCLUDED_DIRS = new Set([
  "node_modules",
  "dist",
  "cypress",
  ".git",
  ".idea",
  ".cache",
  ".output",
  ".temp",
  "build",
]);

function hasTests(rootDir) {
  /** @type {string[]} */
  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      const base = path.basename(current);
      if (EXCLUDED_DIRS.has(base)) continue;
      const entries = fs.readdirSync(current);
      for (const entry of entries) {
        stack.push(path.join(current, entry));
      }
    } else if (stat.isFile()) {
      const rel = path.relative(rootDir, current);
      // quick exclude on path fragments
      const parts = rel.split(path.sep);
      if (parts.some((p) => EXCLUDED_DIRS.has(p))) continue;
      if (TEST_REGEX.test(rel)) return true;
    }
  }
  return false;
}

try {
  // Removido: Auto-incremento de versión beta (ahora solo en merge a main)
  console.log("ℹ️  Version increment only happens on merge to main");

  // Run ESLint
  console.log("📝 Running ESLint...");
  execSync("npm run lint", { stdio: "inherit" });

  // Conditionally run tests only if there are any
  if (hasTests(process.cwd())) {
    console.log("🧪 Running tests...");
    execSync("npm run test:run", { stdio: "inherit" });
  } else {
    console.log("🧪 Skipping tests (no test files found)...");
  }

  console.log("✅ All pre-commit checks passed!");
} catch (error) {
  console.error("❌ Pre-commit checks failed!");
  console.error("Please fix the issues above before committing.");
  exit(1);
}
