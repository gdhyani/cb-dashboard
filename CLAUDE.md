# cb-dashboard — Admin & developer UI (Next.js)

Admin UI for orgs, projects, environments, resources, credential profiles, variables, grants,
members, sessions/devices, audit and kill switches; developer `/me` page; CLI device approval.

- PRD: `../product.md` (§11 is this repo; §12.7 envelope/errors; §7 journeys J1–J4, J7, J8).
- Decisions → PRD §20, open questions → PRD §19 (no separate files).

## Git & GitHub

- **Before any git or GitHub operation** (commit, branch, push, PR, merge), read `GITHUB.md`
  at this repo's root. It is local-only and gitignored. If it is missing, stop and ask the owner.
- Every change goes on a new branch → pull request → merge into `main`. Never commit to `main` directly.
- **Keep `../product.md` current:** any change to structure, tooling, contracts, defaults or behaviour is
  written into the PRD and logged in PRD §20 with a version bump, in the same change.
- **Docs stay local:** everything under `docs/` (plans, notes) is gitignored and never pushed.

## Hard rules for this repo

- **Never holds or displays a real secret.** Secret inputs are write-only; after save show only
  "•••• set, last rotated …" (FR-UI-001, L15). Never keep a secret in React state past submit, never in
  query caches, URLs, localStorage or logs.
- All API calls are **same-origin** (`/api/*` rewritten to `CB_API_URL`), cookie-authenticated, CSRF
  header on mutations. No backend URL or token in client code.
- Destructive actions need confirmation; kill switches need a typed reason (FR-UI-002).
- `visible` variables carry a persistent warning badge + explanation (FR-UI-003).
- Role gating: only `owner`/`admin` manage resources, variables, grants, members, kill switches;
  `developer` sees `/me` and read-only project info (FR-UI-004). Backend enforces it too.
- Empty states show copyable CLI commands (`npx cb login`, `npx cb init`) (FR-UI-005).
- Accessibility: keyboard navigable, labelled form fields, adequate contrast (PRD §14).

## Component reuse — never build the same component twice

- **Before creating any component, search `src/shared/` and `src/features/*/components/`.** If something
  close exists, extend it (props/variants) instead of writing a new one.
- Generic building blocks live only in `src/shared/ui/` (buttons, inputs, dialogs, tables, badges,
  skeletons). Cross-feature composites live only in `src/shared/components/` (DataTable, ConfirmDialog,
  TypedConfirmDialog, SecretInput, EmptyState, CopyCommand, Pagination, charts, GitGraph, …).
- A feature never imports another feature's internals. If two features need the same component,
  **move it to `shared/`** — don't copy it.
- One component per file, named export, file name = kebab-case of the component.

## Folder structure (feature-based)

```
cb-dashboard/
├─ src/
│  ├─ app/                         # Next.js App Router — routes/layouts ONLY; thin pages that compose features
│  │  ├─ (auth)/login/page.tsx  (auth)/signup/page.tsx  invite/[token]/page.tsx
│  │  ├─ device/page.tsx  me/page.tsx
│  │  └─ orgs/[orgId]/…            # members, sessions, audit, killswitch, projects/[projectId]/environments/[envId]/{resources,variables,access}
│  ├─ features/                    # one folder per domain; each is self-contained
│  │  └─ <feature>/                # auth, device, orgs, projects, environments, resources, variables,
│  │     │                         # access, members, sessions, audit, killswitch, me
│  │     ├─ api/                   # <feature>.api.ts (axios calls) + <feature>.keys.ts (query keys)
│  │     ├─ hooks/                 # use-<thing>.ts — TanStack Query hooks wrapping api/
│  │     ├─ components/            # feature-only UI
│  │     ├─ schemas/               # zod form schemas
│  │     ├─ types.ts
│  │     └─ index.ts               # public surface of the feature (what app/ may import)
│  ├─ shared/
│  │  ├─ api/
│  │  │  ├─ http.ts                # THE axios instance (baseURL /api, withCredentials, interceptors)
│  │  │  ├─ envelope.ts            # ApiSuccess<T>, ApiPaginated<T>, Pagination, ApiErrorBody types (PRD §12.7)
│  │  │  ├─ api-error.ts           # ApiError class (normalized from the backend error shape)
│  │  │  ├─ correlation.ts         # correlation id per user flow
│  │  │  └─ query-client.ts        # QueryClient defaults (retry rules, error handling)
│  │  ├─ ui/                       # shadcn/ui + primitives — the only generic components
│  │  ├─ components/               # reusable composites (see reuse rules)
│  │  ├─ hooks/  lib/              # generic hooks/helpers (no feature knowledge)
│  │  └─ providers/                # QueryClientProvider, theme
│  ├─ styles/globals.css           # design tokens
│  ├─ constants.ts                 # product names, CLI command strings — rename here
│  └─ proxy.ts                     # Next 16 name for middleware: redirect unauthenticated users to /login
├─ test/                           # unit (Vitest + Testing Library), e2e (Playwright)
├─ docs/                           # LOCAL ONLY (gitignored)
├─ next.config.ts                  # rewrites /api/* → CB_API_URL
└─ package.json
```

## Motion, loading and mobile (required on every page)

- **Slide-up entrance everywhere:** lists, cards, rows and sections enter with the same subtle motion used on the
  projects list (`y: 4 → 0`, small stagger, transform only so content is never invisible). Use one shared helper
  in `src/shared/components/`, never ad-hoc animations.
- **Skeleton loading everywhere:** every data view renders skeletons shaped like its content while loading
  (via `QueryState` / shared skeleton components). No spinners-only pages, no blank screens.
- **Mobile first:** every page must work at 375px wide — no text wrapping mid-word, tables collapse to stacked
  rows or scroll horizontally, forms stack, actions stay reachable. Check phone width in the browser for every change.
- **Destructive actions are never primary buttons on a page.** Delete project, suspend environment, remove member,
  revoke device… live in a row's "…" menu or a Settings section/tab, always behind a confirmation.
- Keep the design system simple; correctness and the npm package come first.

## Browser testing (required)

- Verify every page and flow in a real browser with the Claude in Chrome tools (`mcp__claude-in-chrome__*`):
  navigate to `http://localhost:4201`, perform the user journey (sign up, invite, grant access, revoke…), read the
  console (`read_console_messages`) and network requests (`read_network_requests`) for errors.
- Unit tests cover logic; the browser pass covers the real journey. A feature is done only after both pass.
- Requires cb-backend running on :4200 and the dashboard on :4201.

## Next.js 16 notes

- Next 16 has breaking changes vs older versions (e.g. `middleware.ts` → `proxy.ts`). Check the bundled
  docs in `node_modules/next/dist/docs/` before using an API you are unsure about.
- `agentRules: false` in `next.config.ts` stops `next dev` from writing its own block into this file.
- shadcn components are generated into `src/shared/ui/` (see `components.json`); check generated imports
  resolve to `@/shared/lib/utils` and keep tokens monochrome in `src/styles/globals.css`.

## Data fetching: TanStack Query + one axios instance

- **All HTTP goes through `shared/api/http.ts`.** Never call `fetch`/`axios` directly in components.
- Interceptors on the instance:
  - request: set `x-correlation-id` (see below) and the CSRF header on mutations;
  - response: unwrap the success envelope (`data`, plus `meta.pagination` for lists);
  - error: convert the backend error shape into `ApiError { code, message, statusCode, details?, correlationId }`.
    Network failures become `ApiError` with code `NETWORK_ERROR`.
- Feature `api/*.api.ts` functions return typed data; feature `hooks/` wrap them with `useQuery` /
  `useMutation` using keys from `<feature>.keys.ts`. Components only use hooks.
- Paginated lists use the shared `Pagination` type and the shared pagination component.
- **Correlation id:** one id per user flow (a page load, a form submit, a multi-step action). Hooks can
  pass an explicit id through the request config; otherwise the interceptor generates one per request.
  Show the correlation id in error toasts/details so a user can quote it and we can find it in server logs.

## Envelope & error (PRD §12.7 — identical to cb-backend)

```ts
type ApiSuccess<T> = { success: true; data: T; meta: { correlationId: string } };
type Pagination = { page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
type ApiPaginated<T> = { success: true; data: T[]; meta: { correlationId: string; pagination: Pagination } };
type ApiErrorBody = { success: false; error: { code: string; message: string; statusCode: number; details?: { path: string; message: string }[]; correlationId: string } };
```

## Design direction (detailed design comes later — keep it minimal now)

- Use the **`taste`** design skill for UI work when it is installed. Until then use
  `frontend-design:frontend-design` for layout/typography and `dataviz` for any chart.
- Elegant and simple: **typographic hierarchy** carries the design (size, weight, spacing), not colour.
- **Black background**, white/grey text, **no accent colour**. Only basic action colours on buttons
  (primary = white on black / inverted, destructive = red). No gradients, no decorative colour.
- Modern data visuals where they help: activity/audit timelines, **git-graph style** history views,
  sparklines — monochrome.
- Subtle, purposeful animation (enter/exit, layout transitions); respect `prefers-reduced-motion`.
- Don't spend effort on visual polish yet; structure, data flow and reuse come first.

## Configuration (env)

`CB_API_URL` (default `http://localhost:4200`) · `CB_CONTRACT_PATH` (default
`../cb-backend/contracts/openapi.yaml`). Dev server on port **4201**.

## Tools & packages

No restrictions — latest stable, most relevant, installed when a task needs it. Starting points:

| Package | Why |
|---|---|
| `next`, `react`, `react-dom` | App (Next 16, App Router) |
| `@tanstack/react-query` + `axios` | Server state + the single HTTP instance |
| `tailwindcss` + shadcn/ui | Styling + primitives in `shared/ui` |
| `react-hook-form` + `@hookform/resolvers` + `zod` | Forms |
| `motion` | Animations |
| `openapi-typescript` (dev) | `sync:contract` → generated API types |
| `vitest`, `@testing-library/react`, `@playwright/test`, `@biomejs/biome` (dev) | Tooling |

## Commands

```bash
npm run dev              # next dev -p 4201 (needs cb-backend on :4200)
npm run build
npm test                 # vitest
npm run test:e2e         # playwright
npm run lint             # biome check
npm run sync:contract    # regenerate API types from the backend contract
```
