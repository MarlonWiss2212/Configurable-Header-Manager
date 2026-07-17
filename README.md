# Configurable Header Manager

Modify HTTP request and response headers per URL pattern — for [Chrome](https://chromewebstore.google.com/detail/configurable-header-manag/ohiolpbohklmbigemlkoppafapnceoij?hl=en-GB&utm_source=ext_sidebar), Edge, and [Firefox](https://addons.mozilla.org/de/firefox/addon/configurable-header-manager/).  
No external runtime dependencies. Vanilla TypeScript + WXT.

**Features**

- Set, remove, or append headers on requests and responses, filtered by URL pattern
- Global on/off toggle, live search, and one-click rule duplication
- Group rules into folders — enable/disable, collapse, reorder, and colour them as a unit
- Optional colour accent, display name, and comment per rule (never sent with requests)
- Import / export as plain JSON: paste or drop a file, merge or replace
- Rules are applied by the browser's own declarativeNetRequest engine — the extension
  never reads your traffic and makes no network requests ([privacy](PRIVACY.md))

---

## Quick start

```bash
pnpm install        # install + generate types
pnpm dev            # Chrome (hot reload)
pnpm dev:edge       # Edge (hot reload)
pnpm dev:firefox    # Firefox (hot reload)
```

Load unpacked in your browser:

- **Chrome** → `chrome://extensions` → Enable Developer mode → *Load unpacked* → select `.output/chrome-mv3/`
- **Edge** → `edge://extensions` → Enable Developer mode → *Load unpacked* → select `.output/edge-mv3/`
- **Firefox** → `about:debugging` → *Load Temporary Add-on* → pick any file inside `.output/firefox-mv2/`

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm build` | Production build for Chrome |
| `pnpm build:edge` | Production build for Edge |
| `pnpm build:firefox` | Production build for Firefox |
| `pnpm zip` / `pnpm zip:edge` / `pnpm zip:firefox` | Build + zip for store upload |
| `pnpm compile` | TypeScript type check |
| `pnpm lint` / `pnpm lint:fix` | oxlint |
| `pnpm fmt` / `pnpm fmt:check` | oxfmt formatter |
| `pnpm test` / `pnpm test:watch` | Vitest unit tests |
| `pnpm check` | compile + lint + fmt:check |
| `pnpm taze:minor` | Bump dependencies to latest minor versions (writes `package.json`; run `pnpm install` after) |
| `pnpm taze:major` | Bump dependencies to latest major versions (writes `package.json`; run `pnpm install` after) |

---

## Architecture

Three layers. Dependencies point inward: **presentation → domain** and **data → domain**.
The domain layer never imports browser APIs, DOM APIs, storage, fetch, or WXT.

```
┌──────────────── presentation ────────────────┐
│  Popup views, components, DOM helpers, app    │
│  Calls domain use cases only                  │
├──────────────────── data ────────────────────┤
│  Storage, DNR, mappers, migrations            │
│  Implements the domain repository contracts   │
├─────────────────── domain ───────────────────┤
│  Entities (data + invariants), use cases,     │
│  repository + migration contracts             │
└────────────────────────────────────────────────┘
```

Rules of thumb when adding code:

- Business rules → a use case class with `execute()` in `domain/usecases/<aggregate>/`
- Data types of the app → `domain/entities/`; shared pure functions → `domain/utils/`
- Talking to a browser/network API → interface in `domain/repositories/`, repository
  implementation in `data/repositories/` over dumb `data/datasources/`
- Anything touching `document`, HTML, CSS-facing behavior → `presentation/`
- The composition root (`presentation/app/app.ts`, `entrypoints/background.ts`) is the only
  place allowed to instantiate `data/` classes.

## Project layout

```
src/
├── domain/               Pure app rules — fully unit-testable
│   ├── entities/         Data types only (Rule, RuleFolder, RuleState)
│   ├── utils/            Shared pure functions (validation, ids, state ops)
│   ├── repositories/     Contracts: StateRepository, MigrationRepository
│   └── usecases/         One class per app action, `execute()` each
│       ├── rules/        save, upsert, delete, duplicate, toggle, move
│       ├── folders/      toggle, move, toggle-collapse, set-colour
│       ├── state/        load, save, apply-active, global-enabled
│       ├── transfer/     import, export, merge
│       └── utils/        Helpers shared between use cases
├── data/                 Infrastructure — implements the domain contracts
│   ├── datasources/      Dumb I/O: browser.storage, DNR calls
│   ├── mappers/          Model ↔ entity, entity → DNR rule
│   ├── models/           DTOs: persisted rules JSON, DNR rule shape
│   ├── repositories/     BrowserStateRepository, RuleMigrationRepository
│   └── errors/           Data error types
└── presentation/         Popup UI, no framework
    ├── app/              Composition root — state + use case wiring
    ├── components/       Small HTML helpers
    ├── icons/            SVG asset helpers
    ├── types/            View contracts
    └── views/            List, form, import/export, folder-colour dialog

tests/                    Vitest suite, mirrors src/ layer by layer

entrypoints/
├── background.ts         Service worker — applies rules on install + startup
└── popup/
    ├── index.html        Popup markup (all views)
    ├── main.ts           Entry point — 3 lines
    └── style.css         Light + dark theme, no framework

docs/
├── rule-format.md        JSON schema reference
└── example-rules.json   Ready-to-use example

.github/workflows/
├── ci.yml                check + test on PRs / non-main pushes (skipped on the no-ci label)
├── changesets.yml        Versions + commits the bump straight to main on merge
└── release.yml           Check + test + zip + GitHub Release on a v* tag
```

---

## Rule format

Rules are plain JSON — no custom syntax, no third-party parsers.

```json
{
  "schemaVersion": 2,
  "folders": [
    {
      "id": "staging",
      "name": "Staging",
      "rules": [
        {
          "enabled": true,
          "urlPattern": "*://api.example.com/*",
          "type": "request",
          "operation": "set",
          "headerName": "Authorization",
          "headerValue": "Bearer token123"
        }
      ]
    }
  ],
  "rules": []
}
```

Full schema and examples: [`docs/rule-format.md`](docs/rule-format.md)

**URL pattern wildcards**

| Pattern | Matches |
|---|---|
| `*` (or empty) | Every URL |
| `*://example.com/*` | Any protocol, any path |
| `https://api.example.com/*` | Exact domain, HTTPS only |
| `http://localhost:*/*` | Localhost, any port |

**Operations**

| Operation | Request headers | Response headers |
|---|---|---|
| `set` | ✓ | ✓ |
| `remove` | ✓ | ✓ |
| `append` | — | ✓ |

---

## Importing rules

Open **Import / Export**. Choose a mode — **Merge** (add to your rules) or **Replace** (overwrite
everything) — then drop/choose a `.json` file or paste JSON into the editor and click **Import**.
Use **Download** to export your current configuration. Everything is local; the extension makes no
network requests.

---

## Privacy & Data Security

This extension collects no user data. Note that header rules — including any secrets you put in header values — are stored **unencrypted on your device**; see [PRIVACY.md](PRIVACY.md) for the full breakdown, including the at-rest threat model, permissions justification, and the no-remote-code declaration.

---

## CI / CD

There is a single workflow, triggered by pushing a version tag. Run the quality gates locally before
tagging:

```bash
pnpm check   # compile + lint + fmt:check
pnpm test    # Vitest
```

The store version comes from `package.json` — bump it (above the currently published version) before
tagging. Then:

```bash
git tag v2.0.1
git push --tags
```

The release workflow (`.github/workflows/release.yml`) runs `pnpm check` and `pnpm test`, zips all
three targets, and creates a GitHub Release with the zips attached and the latest `CHANGELOG.md`
section as the release notes. Automatic store submission via
WXT-native `pnpm wxt submit` is scaffolded but currently disabled (commented out with a TODO); when
enabled it will need the secrets below.

**Store-submission secrets** (needed only once submission is enabled; add in *Settings → Secrets → Actions*):

| Secret | Purpose |
|---|---|
| `CHROME_EXTENSION_ID` | Chrome Web Store item ID |
| `CHROME_CLIENT_ID` | Google OAuth2 client ID |
| `CHROME_CLIENT_SECRET` | Google OAuth2 client secret |
| `CHROME_REFRESH_TOKEN` | Google OAuth2 refresh token |
| `EDGE_PRODUCT_ID` | Edge Add-ons product ID |
| `EDGE_CLIENT_ID` | Edge Partner Center API client ID |
| `EDGE_API_KEY` | Edge Partner Center API key |
| `FIREFOX_EXTENSION_ID` | Firefox add-on ID (must equal the published `header-manager@local`) |
| `FIREFOX_JWT_ISSUER` | Firefox AMO API key |
| `FIREFOX_JWT_SECRET` | Firefox AMO API secret |

How to get Chrome credentials: [Chrome Web Store API guide](https://developer.chrome.com/docs/webstore/using-api)  
How to get Edge credentials: [Edge Add-ons API guide](https://learn.microsoft.com/microsoft-edge/extensions-chromium/publish/api/using-addons-api)  
How to get Firefox credentials: [AMO API keys](https://addons.mozilla.org/developers/addon/api/key/)
