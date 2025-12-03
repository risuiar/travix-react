#!/usr/bin/env node

/**
 * Check configuration and environment variables
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

console.log("🔍 Checking configuration...\n");

// Check environment variables
const requiredEnvVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_MAPBOX_TOKEN",
];

const optionalEnvVars = ["VITE_AI_API_URL", "VITE_AI_API_KEY"];

console.log("📋 Required Environment Variables:");
let missingRequired = 0;
requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${varName}: MISSING`);
    missingRequired++;
  }
});

console.log("\n📋 Optional Environment Variables:");
optionalEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ⚠️  ${varName}: Not set`);
  }
});

// Check .env file
const envPath = join(__dirname, "..", ".env");
console.log(`\n📁 Environment Files:`);
if (existsSync(envPath)) {
  console.log(`  ✅ .env file exists`);
  try {
    const envContent = readFileSync(envPath, "utf8");
    const lines = envContent
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"));
    console.log(`  📝 Contains ${lines.length} environment variables`);
  } catch (error) {
    console.log(`  ❌ Error reading .env file: ${error.message}`);
  }
} else {
  console.log(`  ⚠️  .env file not found`);
}

// Check .env.local file
const envLocalPath = join(__dirname, "..", ".env.local");
if (existsSync(envLocalPath)) {
  console.log(`  ✅ .env.local file exists`);
  try {
    const envContent = readFileSync(envLocalPath, "utf8");
    const lines = envContent
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"));
    console.log(`  📝 Contains ${lines.length} environment variables`);
  } catch (error) {
    console.log(`  ❌ Error reading .env.local file: ${error.message}`);
  }
} else {
  console.log(`  ⚠️  .env.local file not found`);
}

// Check package.json
const packagePath = join(__dirname, "..", "package.json");
if (existsSync(packagePath)) {
  console.log(`\n📦 Package Configuration:`);
  try {
    const packageContent = JSON.parse(readFileSync(packagePath, "utf8"));
    console.log(`  ✅ Package name: ${packageContent.name}`);
    console.log(`  📝 Version: ${packageContent.version}`);
    console.log(
      `  🔧 Node engines: ${packageContent.engines?.node || "Not specified"}`
    );
    console.log(
      `  📜 Build script: ${packageContent.scripts?.build || "Not found"}`
    );
  } catch (error) {
    console.log(`  ❌ Error reading package.json: ${error.message}`);
  }
}

// Check Vite config
const vitePath = join(__dirname, "..", "vite.config.ts");
if (existsSync(vitePath)) {
  console.log(`\n⚡ Vite Configuration:`);
  console.log(`  ✅ vite.config.ts exists`);
} else {
  console.log(`\n⚡ Vite Configuration:`);
  console.log(`  ❌ vite.config.ts not found`);
}

// Summary
console.log(`\n📊 Summary:`);
if (missingRequired === 0) {
  console.log(`  ✅ All required environment variables are set`);
} else {
  console.log(
    `  ❌ ${missingRequired} required environment variables are missing`
  );
}

console.log(`\n🚀 Ready for deployment!`);
if (missingRequired > 0) {
  console.log(
    `⚠️  Please set the missing environment variables before deploying.`
  );
  process.exit(1);
}
