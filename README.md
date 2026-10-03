# cb-dashboard

Admin and developer UI for cb. Structure, conventions and rules: see the repo guide (`CLAUDE.md`).

## Run

```bash
npm install
npm run dev        # http://localhost:4201 — /api/* is proxied to CB_API_URL (default http://localhost:4200)
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` / `npm run build` / `npm start` | Next.js dev server, production build, production server (port 4201) |
| `npm test` | Vitest + Testing Library |
| `npm run typecheck` / `npm run lint` | TypeScript / Biome |

## Conventions

- Feature-based folders under `src/features/`; shared building blocks under `src/shared/` — reuse, never duplicate.
- All HTTP goes through `src/shared/api/http.ts` (axios) and TanStack Query hooks.
- API envelope and error shape are shared with the backend; errors surface `code` and `correlationId`.
