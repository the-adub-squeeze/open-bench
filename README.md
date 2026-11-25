# Open Bench

Crowd-sourced donations for a free makerspace. Every dollar is logged on a public ledger, and the community helps pick the building.

## Local development

Requires [Bun](https://bun.sh) (or Node.js 22+ with a compatible package manager).

```sh
cp .env.example .env   # fill in your Supabase project values
bun install
bun run dev
```

Open the URL Vite prints (default `http://localhost:3000/open-bench/`).

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `.env` / Actions secret | Supabase API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` / Actions secret | Public anon / publishable key |
| `VITE_SUPABASE_PROJECT_ID` | optional | Project ref |
| `PAGES_BASE` | build only | Override asset base (default `/open-bench/`) |

## GitHub Pages

Pushes to `main` build a static SPA and deploy via `.github/workflows/deploy-pages.yml`.

1. Add the `VITE_SUPABASE_*` values as **Settings → Secrets and variables → Actions → Variables**
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**
   - Branch: `gh-pages` / `/ (root)`
3. Run **Actions → Deploy to GitHub Pages → Run workflow** (or push to `main`)
4. After that workflow succeeds, the app is at `https://<user>.github.io/open-bench/`

If you see a markdown README instead of the makerspace UI, Pages is still serving
`main` via Jekyll. Point Source at the **`gh-pages`** branch and re-run the workflow.

> This workflow uses no third-party Actions (only shell steps), so it works with
> strict “owner-only actions” org/repo policies.

Local Pages-shaped build:

```sh
bun run build
bunx serve dist/client
```

## Scripts

| Script | What it does |
| --- | --- |
| `bun run dev` | Vite dev server |
| `bun run build` | Static SPA into `dist/client` (+ `404.html` for Pages) |
| `bun run preview` | Preview the production build |
| `bun test` / `bun run test` | Vitest |
| `bun run lint` | ESLint |
