import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// GitHub Pages has no SPA rewrite rules. Serving the same shell as 404.html
// lets deep links and refreshes bootstrap the client router.
const outDir = resolve("dist/client");
const indexHtml = resolve(outDir, "index.html");
const notFoundHtml = resolve(outDir, "404.html");

if (!existsSync(indexHtml)) {
  console.error(`Expected SPA shell at ${indexHtml}. Did vite build succeed?`);
  process.exit(1);
}

copyFileSync(indexHtml, notFoundHtml);
console.log(`Prepared GitHub Pages fallback: ${notFoundHtml}`);
