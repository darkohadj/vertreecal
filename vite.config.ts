import { defineConfig } from "vite";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "sidepanel/index.html"),
        background: resolve(__dirname, "src/background/main.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === "background"
            ? "background.js"
            : "sidepanel/[name].js",
        chunkFileNames: "sidepanel/[name]-[hash].js",
        assetFileNames: "sidepanel/[name]-[hash][extname]",
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [{ src: "manifest.json", dest: "." }],
    }),
  ],
});
