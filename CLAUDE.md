# KFZ Werk

Werkstatt-Verwaltung (auto shop management) for a German Kfz-Werkstatt.

Backend: the sibling **`kfzwerk-mvp-backend`** repo (NestJS + Prisma +
PostgreSQL), which has its own CLAUDE.md. This app talks to it over HTTP and
holds no data of its own.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- React Router v6
- Zod (schemas / validation)
- date-fns (locale switches with UI language: `de` / `enUS`)
- lucide-react (icons)
- Custom lightweight i18n (JSON files per namespace, DE + EN) — see below
- axios (the ONLY place it appears is `src/lib/api/client.ts`)
- crypto-js (AES for the login form body only)
- JetBrains Mono for **all numeric contexts** (money, dates, times, IDs, quantities)
- Inter for body/UI text

## Modules

Live under `src/modules/<name>/`. Each module owns: `types.ts`, `schema.ts` (Zod), `store.ts` (backend-backed), `List.tsx`, `Detail.tsx`, `Form.tsx`, `index.ts` (routes).

`data.ts` is still there but **is no longer loaded by the app** — it is the
source the backend's demo dataset was extracted from (see the header comment in
any of those files).

| Route | Module | Purpose |
|---|---|---|
| `/bestellungen` | Bestellungen | Kundenaufträge: Kunde, Fahrzeug, Positionen (Teile + Arbeit), Status |
| `/rechnungen` | Rechnungen | Rechnungen aus Bestellungen: Nr., Datum, Betrag, Status |
| `/termine` | Termine | Kunden-Termine: Liste + Monatskalender |
| `/mahnungen` | Mahnungen | Überfällige Rechnungen: Mahnstufen 1–3, Mahngebühr, Frist |
| `/teile` | Teile Katalog | Artikel: Nr., Bezeichnung, Bestand, EK/VK, Lieferant |

## Data layer

- **PostgreSQL is the source of truth**, reached through the API. Nothing is
  persisted in the browser any more — a local copy would resurrect deleted rows
  and hide another user's edits.
- HTTP lives ONLY in `src/lib/api/`. Stores import `api` from `@/lib/api`;
  no component, store or hook touches axios.
- App-wide state is still Zustand, one store per module, still exposing
  `items` / `add` / `update` / `remove` — so List/Detail/Form components did
  not change. What changed: the mutators are **async and optimistic**. They
  apply the change immediately, send the request, and on failure **roll back
  and rethrow**.
- **Therefore every call site `await`s a mutator inside try/catch**, toasts
  success only after it resolves, and shows `serverError(err, fallback)` when
  it rejects. Toasting success before the server agrees is a bug: the row
  reappears on the next load.
- `items` starts empty. `hydrateAll()` (`src/store/data-stores.ts`) loads
  every store once, right after sign-in; `resetAll()` clears them on sign-out
  and before a new sign-in, so one account never sees another's rows.
- IDs are ULIDs generated here (`src/lib/id.ts`) and sent to the API as the
  row's primary key, so an optimistic row and the stored row are the same row.
- Business logic over shared numbers belongs to the backend. Part stock used to
  be adjusted in the bestellungen store; the API owns it now, and that store
  just re-hydrates `teile` afterwards.

## Auth

- Ported from `amazon-subs-fe`'s login module: `src/features/auth/`
  (`login-form`, `register-form`, `require-auth`, `context/`) plus
  `src/pages/login.tsx`. Users can create their own account — the same page
  toggles between sign-in and registration.
- The session is a 30-day JWT in `localStorage['kfz.token']`, attached as a
  Bearer header by the axios request interceptor.
- The login/registration body is AES-encrypted with
  `VITE_FORM_ENCRYPTION_KEY`, which MUST equal the backend's
  `FORM_ENCRYPTION_KEY`. Vite inlines `VITE_*` into the public bundle, so it
  obfuscates the form body — it is not a secret.
- `/login` is the only public route; everything else sits inside
  `<RequireAuth />`, which redirects to `/login` and preserves the attempted
  URL in router state.
- A 401 on any request clears the token and dispatches
  `auth:unauthorized`; the provider drops its state and the guard redirects
  through the router — never a full-page reload.
- The login page mounts its OWN `<Toaster />`: the shared one lives in
  AppShell, which an unauthenticated visitor never renders.

## Hard rules (do not violate)

1. **Numbers right-aligned** in table columns — currency, percentages, quantities, dates, times. `<DataTable>` handles this via `align: 'right'` on column defs; use it.
2. **European number format** — thousands separator `NBSP` (non-breaking space), decimal `,`. Values with units render as `"1 200 €"`, `"12,5 %"`. Numbers ≥ 1 000 in dense contexts (KPI cards, table cells) compact to `k / m / b / t` via `formatCompact`.
3. **Currency** rendered by `<Money>` — always EUR, always right-aligned, always JetBrains Mono.
4. **Dates/times** rendered by `<DateCell>` / `<TimeCell>` — `dd.MM.yyyy` and `HH:mm`, JetBrains Mono.
5. **Modals** fit content, capped at viewport (`max-h-[90vh]`), scroll **vertically** internally, never horizontally. Enforced by the `<Modal>` primitive — do not roll your own.
6. **Forms** use `react-hook-form` + Zod resolver. Never build a form without a schema.
7. **UI language: DE + EN via `useT(namespace)`.** Never hardcode user-visible strings. Add to the matching JSON file, use `t('key')`. Code (identifiers, comments) stays English.
8. **Theme**: light + dark, toggle in topbar, persisted to `localStorage`. Colors via CSS variables — never hardcode hex.

## i18n

- Files live under `src/i18n/locales/{de,en}/{common,dashboard,bestellungen,rechnungen,termine,mahnungen,teile}.json`. One namespace per module + `common.json` for shared UI (nav, actions, statuses, kategorie, grund, einheit, filters, form terms, errors).
- Hook: `const { t } = useT('bestellungen')` — key path scoped to that namespace, falls back to `common.json`. Interpolation via `{name}` placeholders.
- Switcher: `<LanguageToggle>` in topbar. Persisted to `localStorage['kfz.locale']`. Default from browser (`de` if `navigator.language.startsWith('de')`, else `en`).
- **Formatting is always European** (`1 200,00 €`, `dd.MM.yyyy`, JetBrains Mono) — even in EN. Rationale: KFZ Werk is a German business; only UI copy switches.
- **Enum storage keys stay in German** (`Motor`, `Reifenwechsel`, `Stk`). Display uses lookup: `t('kategorie.Motor')` → "Motor" / "Engine". Migrating keys would break persisted `localStorage`; not worth it for a prototype.
- **Zod validation**: schemas emit error KEYS like `'errors.customerRequired'`. `<FormField>` translates any message starting with `errors.`. Provider also registers a `z.setErrorMap` for generic Zod errors (invalid_type, too_small).
- **Seed data is NOT translated** — customer names, article descriptions, VINs, notes are user data.

## Conventions

- Path alias: `@/*` → `src/*`.
- One component per file. Barrel-export via `index.ts` only at module boundaries.
- No inline `style={}` unless a computed value forces it — Tailwind classes only.
- Icons: lucide-react at `size={16}` in tables, `size={18}` in buttons, `size={20}` in nav.
- Empty states use `<EmptyState>` with icon + title + description + optional CTA.

## Out of scope

- Tests and deployment config. `pnpm build` (tsc + vite) is the verification
  step. `pnpm lint` is currently broken repo-wide — ESLint 9 needs an
  `eslint.config.js` and there is none.
- Password reset, email verification, roles/permissions. Registration creates a
  `member` account with an empty workspace.

## Commands

```bash
pnpm install
cp .env.example .env.local   # then set VITE_API_URL + VITE_FORM_ENCRYPTION_KEY
pnpm dev       # http://localhost:5173
pnpm build
pnpm preview
```

The backend must be running too — `npm run start:dev` in
`../kfzwerk-mvp-backend` (default <http://localhost:3002/api>). Without it the
login page renders but every sign-in fails.
