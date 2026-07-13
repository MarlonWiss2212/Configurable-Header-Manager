# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Browser extension (Chrome MV3 + Firefox MV2) that modifies HTTP headers per URL pattern via
declarativeNetRequest. Vanilla TypeScript + WXT. **No runtime dependencies — keep it that way.**

## Commands

```bash
pnpm check          # compile + lint + fmt:check — run before considering anything done
pnpm test           # all tests (Vitest, happy-dom + wxt/testing fake browser)
pnpm vitest run tests/domain/usecases/rules/save-rule.test.ts   # a single test file
pnpm test:watch     # watch mode
pnpm fmt            # auto-format (oxfmt) — run after edits, CI checks formatting
pnpm build          # Chrome MV3 build
pnpm zip:firefox    # Firefox zip (verify with: pnpm dlx addons-linter .output/*-firefox.zip)
pnpm dev            # hot-reload development
pnpm taze:minor     # bump deps to latest minors (writes package.json, then pnpm install)
```

## Architecture (Clean Architecture, Flutter-style — do not deviate)

Dependencies point inward: `presentation → domain ← data`. The rules:

- **Business rules** → one use case class with `execute()` in `domain/usecases/<aggregate>/`
  (aggregates: `rules/`, `folders/`, `state/`, `transfer/`).
- **`domain/entities/`** → data types ONLY, no functions. Shared pure functions live in
  `domain/utils/`; use-case-private helpers in `domain/usecases/utils/`.
- **`domain/repositories/`** → exactly two contracts: `StateRepository` (all I/O) and
  `MigrationRepository`. Do not add gateway/datasource interfaces to domain.
- **`data/`** → repositories implement the domain contracts and orchestrate dumb
  `datasources/` (raw browser/network calls only, zero logic). `mappers/` are classes
  converting `models/` (JSON DTOs) ↔ entities.
- **Composition root** (`presentation/app/app.ts`, `entrypoints/background.ts`) is the ONLY
  place allowed to instantiate `data/` classes.

## Testing convention

- `tests/` mirrors `src/` **file for file** — every use case, repository, mapper, datasource,
  and view gets its own test file at the mirrored path (e.g.
  `src/domain/usecases/rules/save-rule.ts` → `tests/domain/usecases/rules/save-rule.test.ts`).
  No summary files that bundle several classes.
- Each test file covers all important cases: happy path, boundaries (unknown ids, out-of-range
  moves), immutability (use cases never mutate their input state), and error paths.
- Shared fixtures (`rule()`, `ruleState()`, `mockStateRepository()`) live in
  `tests/fixtures.ts` — extend that instead of redefining builders per file.
- `tests/presentation/app.test.ts` is the integration test: it loads the real
  `entrypoints/popup/index.html` (script tags stripped — happy-dom cannot load them) into
  happy-dom with the fake browser. Assertions after user actions must go inside `vi.waitFor`
  because the commit chain (save → apply → render) is async.

## Hard constraints

- **Schema v2 only** (`{ schemaVersion: 2, folders: [], rules: [] }`). v1 (flat rule list with
  a `folder` string field) was deliberately dropped — do not re-add migration for it.
- `folder.collapsed` is part of the rule state (persisted, display-only). Collapse toggles go
  through `SaveRuleStateUseCase` (persist only), NOT the full commit — re-applying DNR rules
  for a display change is wasted work.
- **Firefox gecko ID `header-manager@local` must never change** — it is the identity of the
  published AMO listing. `strict_min_version` is 140 (desktop) / 142 (Android) because of
  `data_collection_permissions`.
- **Firefox popup cannot host a file picker** (Bugzilla #1292701 — the popup closes when the
  picker opens). The JSON file-import section is therefore hidden on Firefox
  (`import.meta.env.FIREFOX` in `import-json-file.ts`); paste + URL fetch remain. Do not
  re-enable the dropzone there or "fix" it by opening tabs — the user rejected that.
- No direct `.innerHTML =` assignments in `src/` — use `setHtml()` from `presentation/dom.ts`
  (addons-linter flags innerHTML sinks). Always escape user content with `escapeHtml()`.
- Rule/folder display fields (`name`, `comment`, `collapsed`) never affect matching and are
  never sent with requests — keep it that way and keep the docs saying so.

## Git conventions

- **Small, per-directory commits** — one commit per layer/concern (e.g. `feat(domain): …`,
  `test: …`, `docs: …`). Never bundle a whole feature into one commit.
- Version numbers and tags are the user's decision — never bump or tag without being asked.

## Release

Bump `package.json` version (single source of truth — the manifest inherits it), then push a
`v*` tag. `.github/workflows/release.yml` runs check + test, zips both targets, submits via
`pnpm wxt submit`, and creates a GitHub Release.
