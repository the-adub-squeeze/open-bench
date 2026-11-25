# Open Bench — agent notes

## Stack

- TanStack Start (SPA mode) + React + Vite + Tailwind v4
- Supabase (browser client via `VITE_SUPABASE_*`)
- Deployed as a static site to GitHub Pages

## Do

- Keep the app client-side deployable: no server-only runtime for the Pages build
- Put secrets in GitHub Actions secrets / local `.env` — never commit `.env`
- Prefer `@/` imports and file-based routes under `src/routes/`

## Don't

- Reintroduce Lovable packages, `.lovable/`, or Cloudflare Worker-only deploy paths unless asked
- Force-push or rewrite published history on the default branch
