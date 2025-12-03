#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para obtener la versión actual del package.json
function getCurrentVersion() {
  const packagePath = path.join(__dirname, "..", "package.json");
  const packageContent = fs.readFileSync(packagePath, "utf8");
  const packageData = JSON.parse(packageContent);
  return packageData.version;
}

// Función para incrementar la versión beta
function incrementBetaVersion(version) {
  const [major, minor, patch] = version.split(".").map(Number);

  // Para versión beta, incrementamos el patch
  const newPatch = patch + 1;

  return `0.7.${newPatch}-beta`;
}

// Función para actualizar la versión en los archivos de traducción
function updateTranslationVersions(newVersion) {
  const localesDir = path.join(__dirname, "..", "src", "locales");
  const files = fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const filePath = path.join(localesDir, file);
    const content = fs.readFileSync(filePath, "utf8");

    // Buscar y reemplazar la versión en el footer
    const updatedContent = content.replace(
      /"version":\s*"[^"]*"/g,
      `"version": "${newVersion}"`
    );

    fs.writeFileSync(filePath, updatedContent);
    console.log(`✅ Actualizada versión en ${file}: ${newVersion}`);
  }
}

// Función para actualizar la versión en el package.json
function updatePackageVersion(newVersion) {
  const packagePath = path.join(__dirname, "..", "package.json");
  const packageContent = fs.readFileSync(packagePath, "utf8");
  const packageData = JSON.parse(packageContent);

  packageData.version = newVersion;

  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + "\n");
  console.log(`✅ Actualizada versión en package.json: ${newVersion}`);
}

// Función principal
function main() {
  try {
    const currentVersion = getCurrentVersion();
    console.log(`📦 Versión actual: ${currentVersion}`);

    const newVersion = incrementBetaVersion(currentVersion);
    console.log(`🚀 Nueva versión beta: ${newVersion}`);

    // Actualizar versiones
    updatePackageVersion(newVersion);
    updateTranslationVersions(newVersion);

    console.log(`\n🎉 Versión actualizada exitosamente a ${newVersion}`);
    console.log(`💡 Recuerda hacer commit de estos cambios!`);
  } catch (error) {
    console.error("❌ Error actualizando versión:", error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
main();
