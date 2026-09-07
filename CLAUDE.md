# KFZ Werk

Werkstatt-Verwaltung (auto shop management) — Frontend-only prototype. No backend yet.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- React Router v6
- Zod (schemas / validation)
- date-fns (locale switches with UI language: `de` / `enUS`)
- lucide-react (icons)
- Custom lightweight i18n (JSON files per namespace, DE + EN) — see below
- JetBrains Mono for **all numeric contexts** (money, dates, times, IDs, quantities)
- Inter for body/UI text

## Modules

Live under `src/modules/<name>/`. Each module owns: `types.ts`, `data.ts` (seed), `schema.ts` (Zod), `List.tsx`, `Detail.tsx`, `Form.tsx`, `index.ts` (routes).

| Route | Module | Purpose |
|---|---|---|
| `/bestellungen` | Bestellungen | Kundenaufträge: Kunde, Fahrzeug, Positionen (Teile + Arbeit), Status |
| `/rechnungen` | Rechnungen | Rechnungen aus Bestellungen: Nr., Datum, Betrag, Status |
| `/termine` | Termine | Kunden-Termine: Liste + Monatskalender |
| `/mahnungen` | Mahnungen | Überfällige Rechnungen: Mahnstufen 1–3, Mahngebühr, Frist |
| `/teile` | Teile Katalog | Artikel: Nr., Bezeichnung, Bestand, EK/VK, Lieferant |

## Data layer

- Mock data in `src/modules/<name>/data.ts`, validated by Zod on load.
- App-wide state via `src/store/` (Zustand): each module has a store with `list`, `create`, `update`, `remove`. Persisted to `localStorage` so edits survive reload.
- Never import mock data outside its module — go through the store.
- IDs are ULIDs (`src/lib/id.ts`).

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

- Backend, auth, real persistence beyond `localStorage`.
- i18n toggle (German only for now).
- Tests, deployment config.

## Commands

```bash
pnpm install
pnpm dev       # http://localhost:5173
pnpm build
pnpm preview
```
