#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Claves que deben estar en el nivel raíz para compatibilidad
const rootKeys = {
  loading: "Loading...",
  success: "Success",
  error: "Error",
  appName: "Travix",
};

// Función para restaurar claves faltantes
function restoreMissingKeys(data) {
  const restored = { ...data };

  // Restaurar claves del nivel raíz
  for (const [key, value] of Object.entries(rootKeys)) {
    if (!restored[key]) {
      console.log(`   ➕ Restaurando clave raíz: "${key}"`);
      restored[key] = value;
    }
  }

  // Asegurar que common tenga las claves básicas
  if (!restored.common) {
    restored.common = {};
  }

  // Restaurar claves básicas en common si no existen
  const commonBasicKeys = {
    loading: "Loading...",
    success: "Success",
    error: "Error",
  };

  for (const [key, value] of Object.entries(commonBasicKeys)) {
    if (!restored.common[key] || typeof restored.common[key] === "object") {
      console.log(`   🔧 Restaurando clave common: "${key}"`);
      restored.common[key] = value;
    }
  }

  return restored;
}

// Función principal
function main() {
  const localesDir = __dirname;
  const files = fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"));

  console.log("🔧 Restaurando claves faltantes...\n");

  for (const file of files) {
    if (
      file === "restore-missing-keys.js" ||
      file === "fix-duplicates.js" ||
      file === "reorganize-translations.js"
    )
      continue;

    console.log(`📁 Procesando: ${file}`);
    const filePath = path.join(localesDir, file);

    try {
      // Leer archivo
      const content = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(content);

      // Crear backup
      const backupPath = filePath + ".backup3";
      fs.writeFileSync(backupPath, content);
      console.log(`   💾 Backup creado: ${path.basename(backupPath)}`);

      // Restaurar claves faltantes
      const restored = restoreMissingKeys(data);

      // Escribir archivo restaurado
      const restoredContent = JSON.stringify(restored, null, 2);
      fs.writeFileSync(filePath, restoredContent);
      console.log(`   ✅ Archivo restaurado: ${file}`);
    } catch (error) {
      console.error(`   ❌ Error procesando ${file}:`, error.message);
    }

    console.log("");
  }

  console.log("🎉 Restauración completada!");
  console.log("📝 Revisa los archivos .backup3 si necesitas restaurar algo.");
  console.log(
    "🔍 Las claves faltantes han sido restauradas para compatibilidad."
  );
}

// Ejecutar
main();
