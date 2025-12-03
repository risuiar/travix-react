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

// Función para incrementar la versión beta automáticamente
function incrementBetaVersion(version) {
  // Extraer solo la parte numérica antes del -beta
  const versionPart = version.split("-")[0];
  const [major, minor, patch] = versionPart.split(".").map(Number);

  // Para versión beta, incrementamos el patch
  const newPatch = patch + 1;

  return `${major}.${minor}.${newPatch}-beta`;
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
  // Actualizar archivo de configuración de versión
  const versionConfigPath = path.join(
    __dirname,
    "..",
    "src",
    "config",
    "version.ts"
  );
  let versionConfigContent = fs.readFileSync(versionConfigPath, "utf8");

  versionConfigContent = versionConfigContent.replace(
    /export const APP_VERSION = "\d+\.\d+\.\d+"/g,
    `export const APP_VERSION = "${newVersion.split("-")[0]}"`
  );

  fs.writeFileSync(versionConfigPath, versionConfigContent);
  console.log(
    `✅ Versión actualizada en config/version.ts: ${newVersion.split("-")[0]}`
  );

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
    /Versión \d+\.\d+\.\d+/g,
    `Versión ${newVersion.split("-")[0]}`
  );

  fs.writeFileSync(loginPath, loginContent);
  console.log(
    `✅ Versión actualizada en LoginPage: ${newVersion.split("-")[0]}`
  );

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
    /Versión \d+\.\d+\.\d+/g,
    `Versión ${newVersion.split("-")[0]}`
  );

  fs.writeFileSync(settingsPath, settingsContent);
  console.log(
    `✅ Versión actualizada en SettingsModal: ${newVersion.split("-")[0]}`
  );
}

// Función principal
function main() {
  try {
    const currentVersion = getCurrentVersion();
    console.log(`📦 Versión actual: ${currentVersion}`);

    // Solo incrementar si es una versión beta
    if (currentVersion.includes("-beta")) {
      const newVersion = incrementBetaVersion(currentVersion);
      console.log(`🚀 Nueva versión beta: ${newVersion}`);

      // Actualizar versiones
      updatePackageVersion(newVersion);
      updateComponentVersions(newVersion);

      console.log(`\n🎉 Versión actualizada automáticamente a ${newVersion}`);
      console.log(`💡 Esta versión se verá en login y settings!`);
    } else {
      console.log(`ℹ️  Versión actual no es beta: ${currentVersion}`);
      console.log(`💡 Para cambiar a 0.8.x, edita manualmente package.json`);
    }
  } catch (error) {
    console.error("❌ Error actualizando versión:", error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
main();
