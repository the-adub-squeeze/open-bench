import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub Pages serves this repo at https://<user>.github.io/open-bench/
const base = process.env["PAGES_BASE"] ?? "/open-bench/";

export default defineConfig({
  base,
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/react-router"],
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      // Local/dev server entry; Pages deploy uses the SPA shell only.
      server: { entry: "server" },
      spa: {
        enabled: true,
        prerender: {
          outputPath: "/index.html",
          crawlLinks: false,
        },
      },
    }),
    viteReact(),
  ],
});
