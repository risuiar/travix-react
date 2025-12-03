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

// Función para cambiar la versión minor
function changeMinorVersion(version, newMinor) {
  const [major, minor, patch] = version.split(".").map(Number);

  // Resetear patch a 0 y cambiar minor
  return `${major}.${newMinor}.0`;
}

// Función para actualizar la versión en el package.json
function updatePackageVersion(newVersion) {
  const packagePath = path.join(__dirname, "..", "package.json");
  const packageContent = fs.readFileSync(packagePath, "utf8");
  const packageData = JSON.parse(packageContent);

  packageData.version = newVersion;

  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + "\n");
  console.log(`✅ Versión actualizada en package.json: ${newVersion}`);
}

// Función para actualizar la versión en los componentes
function updateComponentVersions(newVersion) {
  const [major, minor] = newVersion.split(".");

  // Actualizar LoginPage.tsx
  const loginPath = path.join(
    __dirname,
    "..",
    "src",
    "components",
    "LoginPage.tsx"
  );
  let loginContent = fs.readFileSync(loginPath, "utf8");

  loginContent = loginContent.replace(
    /Versión 0\.7/g,
    `Versión ${major}.${minor}`
  );

  fs.writeFileSync(loginPath, loginContent);
  console.log(`✅ Versión actualizada en LoginPage: ${major}.${minor}`);

  // Actualizar SettingsModal.tsx
  const settingsPath = path.join(
    __dirname,
    "..",
    "src",
    "components",
    "Modal",
    "SettingsModal.tsx"
  );
  let settingsContent = fs.readFileSync(settingsPath, "utf8");

  settingsContent = settingsContent.replace(
    /Versión 0\.7/g,
    `Versión ${major}.${minor}`
  );

  fs.writeFileSync(settingsPath, settingsContent);
  console.log(`✅ Versión actualizada en SettingsModal: ${major}.${minor}`);
}

// Función para actualizar el script de pre-commit
function updatePreCommitScript(newMinor) {
  const scriptPath = path.join(__dirname, "pre-commit-version.js");
  let scriptContent = fs.readFileSync(scriptPath, "utf8");

  scriptContent = scriptContent.replace(
    /return `0\.7\.\${newPatch}-beta`;/g,
    `return \`0.${newMinor}.\${newPatch}-beta\`;`
  );

  fs.writeFileSync(scriptPath, scriptContent);
  console.log(
    `✅ Script de pre-commit actualizado para versión 0.${newMinor}.x`
  );
}

// Función principal
function main() {
  try {
    const currentVersion = getCurrentVersion();
    console.log(`📦 Versión actual: ${currentVersion}`);

    // Obtener nueva versión minor del argumento de línea de comandos
    const newMinor = process.argv[2];

    if (!newMinor || isNaN(newMinor)) {
      console.log("❌ Uso: npm run version:minor <número>");
      console.log("💡 Ejemplo: npm run version:minor 8 (para cambiar a 0.8.x)");
      process.exit(1);
    }

    const newVersion = changeMinorVersion(currentVersion, parseInt(newMinor));
    console.log(`🚀 Nueva versión: ${newVersion}`);

    // Actualizar versiones
    updatePackageVersion(newVersion);
    updateComponentVersions(newVersion);
    updatePreCommitScript(newMinor);

    console.log(`\n🎉 Versión cambiada exitosamente a ${newVersion}`);
    console.log(
      `💡 Ahora los commits incrementarán automáticamente a 0.${newMinor}.x-beta`
    );
  } catch (error) {
    console.error("❌ Error cambiando versión:", error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
main();
