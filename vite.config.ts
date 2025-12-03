import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // exclude: ["lucide-react"], // Removed to allow Vite to pre-bundle lucide-react
  },
  // @ts-expect-error - vitest configuration
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./setupTests.ts",
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  // Configuración para desarrollo
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: true,
    },
  },
  // Configuración para build
  build: {
    outDir: "dist",
    sourcemap: false,
    // Configuración para cache busting
    rollupOptions: {
      output: {
        // Generar nombres de archivo con hash para cache busting
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          // No aplicar hash a favicons y archivos de manifest
          if (
            assetInfo.name &&
            (assetInfo.name.includes("favicon") ||
              assetInfo.name.includes("manifest") ||
              assetInfo.name.includes("apple-touch") ||
              assetInfo.name.includes("browserconfig") ||
              assetInfo.name.includes("site.webmanifest"))
          ) {
            return "[name].[ext]";
          }
          return "assets/[name]-[hash].[ext]";
        },
      },
    },
    // Limpiar el directorio de salida antes de cada build
    emptyOutDir: true,
    // Asegurar que archivos públicos se copien correctamente
    copyPublicDir: true,
    // Configuración específica para archivos estáticos
    assetsInlineLimit: 0, // No inline any assets
  },
  // Configuración para archivos públicos
  publicDir: 'public',
  // Configuración para cache
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
