#!/usr/bin/env node

/**
 * Verify deployment readiness
 */

import { spawn } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

console.log("🚀 Verificando preparación para deploy...\n");

// Run all verification steps
async function runVerifications() {
  const steps = [
    { name: "Linting", command: "npm run lint", required: true },
    {
      name: "Configuration Check",
      command: "npm run check-config",
      required: false,
    },
    { name: "Tests", command: "npm run test:run", required: false },
  ];

  let allRequiredPassed = true;
  let allPassed = true;

  for (const step of steps) {
    console.log(`📋 ${step.name}...`);

    try {
      const result = await runCommand(step.command);
      if (result === 0) {
        console.log(`  ✅ ${step.name} passed`);
      } else {
        console.log(`  ❌ ${step.name} failed`);
        if (step.required) {
          allRequiredPassed = false;
        }
        allPassed = false;
      }
    } catch (error) {
      console.log(`  ❌ ${step.name} failed: ${error.message}`);
      if (step.required) {
        allRequiredPassed = false;
      }
      allPassed = false;
    }

    console.log("");
  }

  if (allRequiredPassed) {
    console.log("🎉 ¡Todo listo para deploy!");
    console.log("📝 Recuerda configurar las variables de entorno en Coolify:");
    console.log("   - VITE_SUPABASE_URL");
    console.log("   - VITE_SUPABASE_ANON_KEY");
    console.log("   - VITE_MAPBOX_TOKEN");

    if (!allPassed) {
      console.log(
        "\n⚠️  Nota: Algunos tests opcionales fallaron, pero no afectan el deploy"
      );
    }
  } else {
    console.log(
      "❌ Hay problemas críticos que deben resolverse antes del deploy"
    );
    process.exit(1);
  }
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(" ");
    const process = spawn(cmd, args, {
      stdio: "pipe",
      cwd: join(__dirname, ".."),
    });

    let output = "";
    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      output += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    process.on("error", (error) => {
      reject(error);
    });
  });
}

runVerifications().catch((error) => {
  console.error("❌ Error during verification:", error.message);
  process.exit(1);
});
