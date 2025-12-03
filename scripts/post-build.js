#!/usr/bin/env node

/**
 * Post-build script to ensure favicon and static assets are properly configured
 * for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');

console.log('🔧 Running post-build configuration...');
console.log(`📁 Public directory: ${publicDir}`);
console.log(`📁 Dist directory: ${distDir}`);

// Primero, inyectar variables de entorno en index.html
console.log('🔄 Injecting environment variables into index.html...');

const indexHtmlPath = path.join(distDir, 'index.html');
const envPath = path.join(__dirname, '..', '.env');

// Leer variables del .env
let envVars = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=');
      }
    }
  });
  console.log(`✅ Loaded ${Object.keys(envVars).length} variables from .env`);
} else {
  console.warn('⚠️  No .env file found');
}

// Generar objeto de variables de entorno
const envObject = {
  NODE_ENV: 'production',
  VITE_SUPABASE_URL: envVars.VITE_SUPABASE_URL || '',
  VITE_SUPABASE_ANON_KEY: envVars.VITE_SUPABASE_ANON_KEY || '',
  VITE_AI_API_URL: envVars.VITE_AI_API_URL || '',
  VITE_BACKEND_TRAVIX: envVars.VITE_BACKEND_TRAVIX || '',
  VITE_AI_API_KEY: envVars.VITE_AI_API_KEY || '',
  VITE_MAPBOX_TOKEN: envVars.VITE_MAPBOX_TOKEN || '',
  VITE_GOOGLE_PLACES_API_KEY: envVars.VITE_GOOGLE_PLACES_API_KEY || '',
  VITE_GOOGLE_MAPS_API_KEY: envVars.VITE_GOOGLE_MAPS_API_KEY || '',
  VITE_API_TOKEN: envVars.VITE_API_TOKEN || '',
  VITE_REDIRECT_URL: envVars.VITE_REDIRECT_URL || ''
};

// Leer index.html
if (fs.existsSync(indexHtmlPath)) {
  let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Reemplazar el placeholder con las variables reales
  const envScript = `window.ENV = ${JSON.stringify(envObject, null, 2)};`;
  htmlContent = htmlContent.replace(
    /window\.ENV = \{[\s\S]*?\};/,
    envScript
  );
  
  // Escribir el archivo actualizado
  fs.writeFileSync(indexHtmlPath, htmlContent);
  console.log('✅ Environment variables injected into index.html');
  
  // Mostrar variables inyectadas
  const variableCount = Object.keys(envObject).filter(key => envObject[key] !== '').length;
  console.log(`📝 Injected ${variableCount} environment variables`);
} else {
  console.error('❌ index.html not found in dist directory');
}

// Resto de configuración estática
console.log('\n� Copying static configuration files...');

try {
  // Copiar archivos estáticos importantes
  const filesToCopy = [
    { src: 'health', dest: 'health' },
    { src: 'health.json', dest: 'health.json' },
    { src: '.htaccess', dest: '.htaccess' },
    { src: '_headers', dest: '_headers' },
    { src: '_redirects', dest: '_redirects' }
  ];

  filesToCopy.forEach(({src, dest}) => {
    const srcPath = path.join(publicDir, src);
    const destPath = path.join(distDir, dest);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ ${src} copied to dist`);
    }
  });

  // Copiar nginx.conf desde root
  const nginxSource = path.join(__dirname, '..', 'nginx.conf');
  const nginxDest = path.join(distDir, 'nginx.conf');
  
  if (fs.existsSync(nginxSource)) {
    fs.copyFileSync(nginxSource, nginxDest);
    console.log('✅ nginx.conf copied to dist');
  }

  console.log('\n🎉 Post-build configuration completed successfully!');

} catch (error) {
  console.error('❌ Error in post-build script:', error);
  process.exit(1);
}
