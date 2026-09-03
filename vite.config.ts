import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "node:path";

// Chrome Manifest V3 needs a few guarantees Vite doesn't give by default:
//  - the service worker must be emitted as a single, unhashed, top-level file
//    because manifest.json references it by exact path
//  - manifest.json itself has to land in dist/ untouched
//  - no code-splitting/dynamic remote chunks that MV3's CSP would reject
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [{ src: "manifest.json", dest: "." }],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: false,
    modulePreload: false,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        options: resolve(import.meta.dirname, "options.html"),
        profiles: resolve(import.meta.dirname, "profiles.html"),
        background: resolve(import.meta.dirname, "src/background/service-worker.ts"),
      },
      output: {
        // Keep the service worker path stable & unhashed so it matches manifest.json.
        entryFileNames: (chunk) =>
          chunk.name === "background" ? "background.js" : "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        // MV3 service workers can't be split into async chunks that fetch other
        // scripts; force everything the background needs into that one file.
        manualChunks: (id) => {
          if (id.includes("service-worker")) return undefined;
        },
      },
    },
  },
});
