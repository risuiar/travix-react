#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para buscar todas las claves de traducción en el código
function findTranslationKeys() {
  const srcDir = path.join(__dirname, '..', 'src');
  const keys = new Set();
  
  function searchInFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    // Buscar patrones t("key") y t('key') más específicos
    const regex = /\bt\(\s*['"`]([a-zA-Z][a-zA-Z0-9._]*?)['"`]\s*[,)]/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      // Filtrar claves que no sean válidas
      const key = match[1];
      if (key.length > 1 && !key.includes('/') && !key.includes('..') && !key.includes('script')) {
        keys.add(key);
      }
    }
  }
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        searchInFile(filePath);
      }
    }
  }
  
  walkDir(srcDir);
  return Array.from(keys).sort();
}

// Función para verificar si una clave existe en las traducciones
function checkKeyExists(key, translations) {
  const parts = key.split('.');
  let current = translations;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }
  
  return typeof current === 'string';
}

// Función principal
function main() {
  console.log('🔍 Verificando claves de traducción...\n');
  
  // Buscar todas las claves en el código
  const usedKeys = findTranslationKeys();
  console.log(`📝 Encontradas ${usedKeys.length} claves de traducción en uso\n`);
  
  // Cargar traducción en español
  const translationsPath = path.join(__dirname, '..', 'src', 'locales', 'es.json');
  const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));
  
  // Verificar cada clave
  const missingKeys = [];
  
  for (const key of usedKeys) {
    if (!checkKeyExists(key, translations)) {
      missingKeys.push(key);
    }
  }
  
  if (missingKeys.length > 0) {
    console.log('❌ Claves faltantes en las traducciones:');
    for (const key of missingKeys) {
      console.log(`   - ${key}`);
    }
  } else {
    console.log('✅ Todas las claves de traducción existen en es.json');
  }
  
  console.log(`\n📊 Resumen: ${usedKeys.length - missingKeys.length}/${usedKeys.length} claves válidas`);
  
  // Mostrar algunas claves de ejemplo
  console.log('\n📋 Algunas claves encontradas:');
  usedKeys.slice(0, 10).forEach(key => {
    console.log(`   - ${key}`);
  });
  
  if (usedKeys.length > 10) {
    console.log(`   ... y ${usedKeys.length - 10} más`);
  }
}

main();
