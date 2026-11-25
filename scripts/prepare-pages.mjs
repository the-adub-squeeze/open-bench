import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// GitHub Pages has no SPA rewrite rules. Serving the same shell as 404.html
// lets deep links and refreshes bootstrap the client router.
const outDir = resolve("dist/client");
const indexHtml = resolve(outDir, "index.html");
const notFoundHtml = resolve(outDir, "404.html");
const noJekyll = resolve(outDir, ".nojekyll");

if (!existsSync(indexHtml)) {
  console.error(`Expected SPA shell at ${indexHtml}. Did vite build succeed?`);
  process.exit(1);
}

copyFileSync(indexHtml, notFoundHtml);
// Disable Jekyll so asset paths like `_assets` / underscore files are served as-is.
writeFileSync(noJekyll, "");
console.log(`Prepared GitHub Pages fallback: ${notFoundHtml}`);
console.log(`Wrote ${noJekyll}`);
