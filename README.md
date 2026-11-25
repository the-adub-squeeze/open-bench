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

1. Repo **Settings → Pages → Source: GitHub Actions**
2. Add repository secrets for the `VITE_SUPABASE_*` variables above
3. After the workflow succeeds, the site is at `https://<user>.github.io/open-bench/`

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
