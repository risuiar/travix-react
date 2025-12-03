#!/usr/bin/env node

/**
 * Setup environment variables for build process
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

// Default environment variables for build (only used if not found elsewhere)
const defaultEnvVars = {
  VITE_MAPBOX_TOKEN: "",
  VITE_AI_API_URL: "https://api.openai.com/v1/chat/completions",
  VITE_AI_API_KEY: "",
  VITE_SUPABASE_URL: "",
  VITE_SUPABASE_ANON_KEY: "",
  NODE_ENV: "production",
};

// Read .env file if it exists
const envPath = join(__dirname, "..", ".env");
let envContent = "";

try {
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, "utf8");
    console.log("✅ Environment file loaded");
  } else {
    console.log("⚠️  No .env file found, using defaults");
  }
} catch (error) {
  console.log("⚠️  Error reading .env file, using defaults");
}

// Parse existing environment variables from .env
const existingVars = {};
if (envContent) {
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        existingVars[key] = valueParts.join("=");
      }
    }
  });
}

// Merge with defaults and current environment, prioritizing .env values
const finalEnvVars = { ...defaultEnvVars, ...existingVars, ...process.env };

// Check if this is a production build
// This script is called as prebuild, so it's always a production build
const isProductionBuild = true; // Since this is called from npm run build

if (isProductionBuild) {
  const envLocalPath = join(__dirname, "..", ".env.local");
  try {
    const envLocalContent = Object.entries(finalEnvVars)
      .filter(([key]) => key.startsWith("VITE_"))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    writeFileSync(envLocalPath, envLocalContent);
    console.log("✅ Environment setup complete for production build");
    console.log(
      `📝 Created .env.local with ${
        Object.keys(finalEnvVars).filter((key) => key.startsWith("VITE_"))
          .length
      } VITE_ variables`
    );
  } catch (error) {
    console.error("❌ Error setting up environment:", error.message);
    process.exit(1);
  }
} else {
  console.log(
    "✅ Environment setup complete (using .env file for development)"
  );
  console.log(
    `📝 Using ${
      Object.keys(existingVars).filter((key) => key.startsWith("VITE_")).length
    } VITE_ variables from .env`
  );
}
