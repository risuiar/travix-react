#!/usr/bin/env node

/**
 * Generate dynamic env.js file for production with actual environment variables
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

const rootDir = join(__dirname, "..");
const envPath = join(rootDir, ".env");
const publicDir = join(rootDir, "public");
const distDir = join(rootDir, "dist");

console.log('🔧 Generating env.js with actual environment variables...');

// Read .env file
let envVars = {};
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join("=");
      }
    }
  });
  console.log(`✅ Loaded ${Object.keys(envVars).length} variables from .env`);
} else {
  console.warn("⚠️  No .env file found");
}

// Generate env.js content with actual values
const envJsContent = `// Configuration loaded at runtime
window.ENV = {
  NODE_ENV: 'production',
  VITE_SUPABASE_URL: '${envVars.VITE_SUPABASE_URL || ''}',
  VITE_SUPABASE_ANON_KEY: '${envVars.VITE_SUPABASE_ANON_KEY || ''}',
  VITE_AI_API_URL: '${envVars.VITE_AI_API_URL || ''}',
  VITE_BACKEND_TRAVIX: '${envVars.VITE_BACKEND_TRAVIX || ''}',
  VITE_AI_API_KEY: '${envVars.VITE_AI_API_KEY || ''}',
  VITE_MAPBOX_TOKEN: '${envVars.VITE_MAPBOX_TOKEN || ''}',
  VITE_GOOGLE_PLACES_API_KEY: '${envVars.VITE_GOOGLE_PLACES_API_KEY || ''}',
  VITE_GOOGLE_MAPS_API_KEY: '${envVars.VITE_GOOGLE_MAPS_API_KEY || ''}',
  VITE_API_TOKEN: '${envVars.VITE_API_TOKEN || ''}',
  VITE_REDIRECT_URL: '${envVars.VITE_REDIRECT_URL || ''}'
};

// Function to load environment configuration
(function loadEnvironmentConfig() {
  // Check if we're in development mode
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '0.0.0.0';
  
  if (isDevelopment) {
    // In development, Vite will handle environment variables
    console.log('Running in development mode');
  } else {
    // In production, use the variables defined above
    console.log('Running in production mode with environment configuration');
    console.log('Environment variables loaded:', Object.keys(window.ENV).length);
  }
})();
`;

// Write to public directory
const publicEnvPath = join(publicDir, "env.js");
writeFileSync(publicEnvPath, envJsContent);
console.log(`✅ Generated env.js in public directory`);

// Also write to dist directory if it exists
if (existsSync(distDir)) {
  const distEnvPath = join(distDir, "env.js");
  writeFileSync(distEnvPath, envJsContent);
  console.log(`✅ Generated env.js in dist directory`);
}

// Log which variables were included
const includeVars = Object.keys(envVars).filter(key => key.startsWith('VITE_'));
console.log(`📝 Included ${includeVars.length} VITE_ variables:`);
includeVars.forEach(key => {
  const value = envVars[key];
  const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
  console.log(`   - ${key}: ${displayValue}`);
});

console.log('🎉 env.js generation completed successfully!');
