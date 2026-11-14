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
- **Docs stay local:** everything under the root `docs/` (plans, notes) is gitignored and never pushed.
- **Keep the public docs current (FR-DOC-008):** every change merged into `main` that a user or contributor can
  see (pages, flows, labels, connectors, config, errors) updates the matching page in `content/docs/` and
  recaptures affected screenshots in `public/docs/images/`, together with `../product.md`. Changes in `cb-env` or
  `cb-backend` that are user-visible get their docs PR here, merged no later than the code PR. Otherwise the PR
  description says `Docs: not needed — <reason>`.
- **Docs paths:** only the root `docs/` is local; `content/docs/`, `public/docs/` and `src/app/docs/` are the
  public documentation site and are committed.

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
│  │  ├─ (landing)/                # `/`: public product page (own look, NOT the dashboard design system; PRD §11.6)
│  │  ├─ (studio)/                 # EVERY dashboard route (scopes the Supabase design system, see "Design system")
│  │  │  ├─ layout.tsx             # [data-studio] marker + dashboard fonts
│  │  │  ├─ dashboard              # entry: signed-in → their organization (`/` is the landing page for everyone)
│  │  │  ├─ (auth)/login  (auth)/signup  invite/[token]  device
│  │  │  └─ orgs/[orgId]/…         # home, projects, members, devices, audit, emergency, me, account,
│  │  │                            # projects/[projectId]/{access,settings,environments/[envId]/{access,webhooks,settings}}
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
│  ├─ proxy.ts                     # Next 16 middleware: app pages → /login when signed out; `/` is not matched (public)
│  ├─ app/docs/  app/docs-search/  # public documentation (Fumadocs): layout, [[...slug]] page, search index
│  ├─ features/landing/            # landing page: content.ts (all copy), components/, motion/ (GSAP + Lenis), landing.css
│  └─ features/docs/               # docs components (Frame, Callout, Fields, EnvTable, StatusBadge, diagrams), catalogs
├─ content/docs/                   # MDX documentation pages + meta.json (committed)
├─ public/docs/images/             # documentation screenshots, already framed on the gradient (committed)
├─ scripts/frame-images.mjs        # raw capture → framed PNG (npm run docs:images)
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
- Correctness and the npm package come first; the design system above is the only UI vocabulary.

## Browser testing (required)

- Verify every page and flow in a real browser using browser automation:
  navigate to `http://localhost:4201`, perform the user journey (sign up, invite, grant access, revoke…), read the
  browser console and network requests for errors.
- Unit tests cover logic; the browser pass covers the real journey. A feature is done only after both pass.
- Requires cb-backend running on :4200 and the dashboard on :4201.

## Next.js 16 notes

- Next 16 has breaking changes vs older versions (e.g. `middleware.ts` → `proxy.ts`). Check the bundled
  docs in `node_modules/next/dist/docs/` before using an API you are unsure about.
- `agentRules: false` in `next.config.ts` stops `next dev` from writing its own block into this file.
- shadcn components are generated into `src/shared/ui/` (see `components.json`); check generated imports
  resolve to `@/shared/lib/utils` and restyle them with the dashboard tokens (see "Design system").

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

## Design system — Supabase Studio (PRD §11.5, v1.59)

The dashboard is a port of the **Supabase design system** (supabase.com/design-system) with cb's own colours: a teal
accent and a deep slate background (PRD v1.62). It applies to dashboard routes only.

- **Landing page (`/`, PRD §11.6)** has its own look ("marked-up document": highlighter = placeholder key, black bar = real secret;
  Archivo + Fragment Mono; `lp-` classes in `features/landing/landing.css`) and its own motion (GSAP ticker drives Lenis and
  ScrollTrigger; the app-wide smooth scroll skips `/`). Never show a full credential-shaped string there (FR-LP-003).
- **Scope.** Dashboard routes live in `src/app/(studio)/`; its layout renders `[data-studio]`, and `src/styles/studio.css`
  applies the tokens to `:root` only while that marker is on the page (portals included). Docs (`src/app/docs*`), the blog
  and marketing pages must never render inside `(studio)` and keep their own look. A shared part that docs also use gets its
  dashboard skin through the `studio:` Tailwind variant (see `shared/lib/badge-tones.ts`), never by forking the component.
- **Tokens, never raw colours.** Surfaces `bg-background`, `bg-surface-75/100/200/300`, `bg-overlay`, `bg-dialog`, washes
  `bg-muted`/`bg-accent`/`bg-selection`, fields `bg-field`; text `text-foreground` › `-light` › `-lighter` › `-muted`;
  borders `border-border` (+ `-muted`, `-strong`, `-stronger`, `-control`). Colour carries meaning only: `primary`
  (cb teal — the one primary action per view, links, focus, switches, charts), `success` (green), `warning`
  (orange), `destructive`, `info`. No `white/[x]`,
  no hex, no Tailwind palette colours in dashboard code: the light theme must keep working.
- **Type roles:** `heading-title` (page), `heading-section`, `heading-default`, `heading-meta` (mono uppercase micro-label:
  table heads, card titles, menu groups). Body `text-sm` = 13 px. Inter / Manrope / Source Code Pro are loaded by the
  `(studio)` layout only.
- **Page anatomy:** `PageContainer` (`size="small"` for settings) › `PageHeader` (title, description fragment, actions,
  optional `nav`) › `Section`s (Cards, tables). Settings forms: `Card` + `FormItemLayout` rows + `CardFooter` with Cancel/Save
  (disabled until dirty). Callouts: `Admonition`. Tables: `Table` + `TableToolbar` + `useTableQuery`.
- **Navigation:** shell in `features/orgs/components/org-shell.tsx` (top bar switchers, icon rail with Sidebar control,
  account menu with Theme); project product menu `features/projects/components/project-layout.tsx` (`SideMenu`);
  environment sub-pages are routes with a `PageNav`.
- **Badges:** `BadgeLabel` / `Badge` from `shared/lib/badge-tones.ts` — Supabase pills on the dashboard, boxy in docs.
  Service logos use brand colours (`BRAND_COLORS` in `service-logo.tsx`).
- **Copy (Supabase):** Title Case page titles and nav; sentence case for buttons, labels, section titles; descriptions are
  fragments without a trailing period; buttons are verbs ("Delete project"); Sign in / Sign out; no "Oops", no exclamation marks.
- **Docs exception (PRD v1.36):** docs screenshots are framed on one gradient (`scripts/frame-images.mjs`) and docs diagrams use
  `--docs-frame-gradient`. Nowhere in the dashboard.
- Subtle, purposeful animation (`cb-enter`, `StaggerItem`, `cb-pop`); respect `prefers-reduced-motion`. Charts in
  `shared/components/charts` use the teal single-series ramp (`charts/shades.ts`); use `dataviz` for new charts.
- UI work: follow this section and the Supabase research in PRD §11.5; `frontend-design:frontend-design` for anything new.

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
