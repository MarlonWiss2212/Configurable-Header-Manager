# Configurable Header Manager

Modify HTTP request and response headers per URL pattern — for Chrome and Firefox.  
No external runtime dependencies. Vanilla TypeScript + WXT.

---

## Quick start

```bash
pnpm install        # install + generate types
pnpm dev            # Chrome (hot reload)
pnpm dev:firefox    # Firefox (hot reload)
```

Load unpacked in your browser:

- **Chrome** → `chrome://extensions` → Enable Developer mode → *Load unpacked* → select `.output/chrome-mv3/`
- **Firefox** → `about:debugging` → *Load Temporary Add-on* → pick any file inside `.output/firefox-mv2/`

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm build` | Production build for Chrome |
| `pnpm build:firefox` | Production build for Firefox |
| `pnpm zip` / `pnpm zip:firefox` | Build + zip for store upload |
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
│  Calls domain use cases                       │
├──────────────────── data ────────────────────┤
│  Storage, fetch, DNR, JSON models, migrations │
│  Implements domain repository interfaces      │
├─────────────────── domain ───────────────────┤
│  Entities, use cases, repository contracts,   │
│  validation, ordering, DNR mapping            │
└────────────────────────────────────────────────┘
```

Rules of thumb when adding code:

- Business rules, entities, use cases, validation, ordering → `domain/`
- Browser storage, fetch, JSON persistence, migrations, DNR adapters → `data/`
- Anything touching `document`, HTML, CSS-facing behavior → `presentation/`

## Project layout

```
src/
├── domain/               Pure app rules — fully unit-testable
│   ├── entities/         Rule, RuleFolder, RuleState, DNR types
│   ├── repositories/     Repository interfaces
│   ├── utils/            Shared pure helpers used by use cases/data adapters
│   ├── usecases/         App actions such as save/toggle/move rules
│   └── errors/           Domain error types
├── data/                 Infrastructure and persistence
│   ├── datasources/      browser.storage, fetch, DNR, JSON parser
│   ├── migrations/       Legacy flat rules → schema v2
│   ├── models/           Stored/imported JSON models
│   ├── repositories/     Browser repository implementation
│   └── errors/           Data error types
└── presentation/         Popup UI, no framework
    ├── app/              Composition root — state + use case wiring
    ├── components/       Small HTML helpers
    ├── icons/            SVG asset helpers
    ├── types/            View contracts
    └── views/            List, form, import/export views

tests/                    Vitest suite, mirrors src/ layer by layer

entrypoints/
├── background.ts         Service worker — applies rules on install
└── popup/
    ├── index.html        Popup markup (all three views)
    ├── main.ts           Entry point — 3 lines
    └── style.css         Light + dark theme, no framework

docs/
├── rule-format.md        JSON schema reference
└── example-rules.json   Ready-to-use example

.github/workflows/
└── release.yml           Check + test + publish to both stores on a v* tag
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

Open **Import / Export** to paste JSON, import from a `.json` file, or fetch a hosted JSON file.
All import paths load JSON into the editor for review before you apply it.

The URL must be reachable from the browser and the server must allow cross-origin requests:

```
Access-Control-Allow-Origin: *
Content-Type: application/json
```

Good hosts: GitHub raw URLs, S3 public buckets, any static CDN.

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

The release workflow (`.github/workflows/release.yml`) runs `pnpm check` and `pnpm test`, zips both
targets, submits to both stores via WXT-native `pnpm wxt submit`, and creates a GitHub Release with
the zips attached.

**Required secrets** (add in *Settings → Secrets → Actions*):

| Secret | Purpose |
|---|---|
| `CHROME_EXTENSION_ID` | Chrome Web Store item ID |
| `CHROME_CLIENT_ID` | Google OAuth2 client ID |
| `CHROME_CLIENT_SECRET` | Google OAuth2 client secret |
| `CHROME_REFRESH_TOKEN` | Google OAuth2 refresh token |
| `FIREFOX_EXTENSION_ID` | Firefox add-on ID (must equal the published `header-manager@local`) |
| `FIREFOX_JWT_ISSUER` | Firefox AMO API key |
| `FIREFOX_JWT_SECRET` | Firefox AMO API secret |

How to get Chrome credentials: [Chrome Web Store API guide](https://developer.chrome.com/docs/webstore/using-api)  
How to get Firefox credentials: [AMO API keys](https://addons.mozilla.org/developers/addon/api/key/)
