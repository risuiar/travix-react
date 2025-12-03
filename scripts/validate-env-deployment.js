#!/usr/bin/env node

/**
 * Validate env.js deployment and functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const envJsPath = path.join(distDir, 'env.js');
const indexHtmlPath = path.join(distDir, 'index.html');

console.log('🔍 Validating env.js deployment...');

// Check if env.js exists
if (!fs.existsSync(envJsPath)) {
  console.error('❌ env.js not found in dist directory');
  process.exit(1);
}

// Check env.js content
const envContent = fs.readFileSync(envJsPath, 'utf8');
console.log(`✅ env.js found (${envContent.length} characters)`);

// Validate JavaScript syntax
try {
  // Simple validation - check if it's valid-looking JavaScript
  if (!envContent.includes('window.ENV')) {
    throw new Error('window.ENV not found');
  }
  if (!envContent.includes('VITE_SUPABASE_URL')) {
    throw new Error('VITE_SUPABASE_URL not found');
  }
  if (!envContent.includes('VITE_AI_API_URL')) {
    throw new Error('VITE_AI_API_URL not found');
  }
  console.log('✅ env.js contains required variables');
} catch (error) {
  console.error('❌ env.js validation failed:', error.message);
  process.exit(1);
}

// Check if index.html references env.js
const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
if (!htmlContent.includes('src="/env.js"')) {
  console.error('❌ index.html does not reference env.js');
  process.exit(1);
}
console.log('✅ index.html correctly references env.js');

// Check if fallback script exists
if (!htmlContent.includes('window.ENV === \'undefined\'')) {
  console.warn('⚠️  Fallback script not found in index.html');
} else {
  console.log('✅ Fallback script found in index.html');
}

// Validate specific configuration values
const envVariables = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_AI_API_URL',
  'VITE_BACKEND_TRAVIX',
  'VITE_AI_API_KEY',
  'VITE_MAPBOX_TOKEN',
  'VITE_GOOGLE_PLACES_API_KEY',
  'VITE_GOOGLE_MAPS_API_KEY',
  'VITE_API_TOKEN',
  'VITE_REDIRECT_URL'
];

console.log('\n📋 Environment variables validation:');
envVariables.forEach(varName => {
  if (envContent.includes(`${varName}: ''`) || envContent.includes(`${varName}: ""`)) {
    console.warn(`⚠️  ${varName} appears to be empty`);
  } else if (envContent.includes(varName)) {
    console.log(`✅ ${varName} configured`);
  } else {
    console.error(`❌ ${varName} not found`);
  }
});

// Check headers files
const headersPath = path.join(distDir, '_headers');
const htaccessPath = path.join(distDir, '.htaccess');

if (fs.existsSync(headersPath)) {
  const headersContent = fs.readFileSync(headersPath, 'utf8');
  if (headersContent.includes('/env.js')) {
    console.log('✅ _headers file configured for env.js');
  } else {
    console.warn('⚠️  _headers file missing env.js configuration');
  }
} else {
  console.warn('⚠️  _headers file not found');
}

if (fs.existsSync(htaccessPath)) {
  const htaccessContent = fs.readFileSync(htaccessPath, 'utf8');
  if (htaccessContent.includes('env.js')) {
    console.log('✅ .htaccess file configured for env.js');
  } else {
    console.warn('⚠️  .htaccess file missing env.js configuration');
  }
} else {
  console.warn('⚠️  .htaccess file not found');
}

console.log('\n🎉 env.js validation completed successfully!');
console.log('\n📝 Next steps:');
console.log('1. Deploy the dist/ directory to your hosting provider');
console.log('2. Verify https://go.travix.app/env.js returns JavaScript content');
console.log('3. Check browser console for any env.js loading errors');
console.log('4. Test application functionality');

console.log('\n🔧 Troubleshooting:');
console.log('- If env.js returns HTML, check server MIME type configuration');
console.log('- Ensure .htaccess or _headers files are processed by your hosting provider');
console.log('- The fallback script in index.html will activate if env.js fails to load');
