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
| `pnpm fmt` / `pnpm fmt:check` | Biome formatter |
| `pnpm check` | compile + lint + fmt:check |

---

## Project layout

```
src/
├── types.ts              Shared Rule interface
├── storage.ts            browser.storage.local helpers
├── dnr.ts                declarativeNetRequest sync
├── utils.ts              DOM helpers
├── app.ts                Event wiring + state management
└── views/
    ├── list.ts           Rule list renderer
    ├── form.ts           Add / edit form
    └── import-export.ts  JSON import, URL fetch, download

entrypoints/
├── background.ts         Service worker — syncs rules on install
└── popup/
    ├── index.html        Popup markup (all three views)
    ├── main.ts           Entry point — 3 lines
    └── style.css         Light + dark theme, no framework

docs/
├── rule-format.md        JSON schema reference
└── example-rules.json   Ready-to-use example

.github/workflows/
├── ci.yml                Type check + lint + build on every push/PR
└── release.yml           Publish to Chrome Web Store + Firefox AMO on tag
```

---

## Rule format

Rules are plain JSON — no custom syntax, no third-party parsers.

```json
{
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

## Importing rules from a URL

Open **Import / Export**, paste a URL, and click **Fetch**. The JSON is loaded into the editor for review before you apply it.

The URL must be reachable from the browser and the server must allow cross-origin requests:

```
Access-Control-Allow-Origin: *
Content-Type: application/json
```

Good hosts: GitHub raw URLs, S3 public buckets, any static CDN.

---

## Privacy & Data Security

This extension collects no user data. See [PRIVACY.md](PRIVACY.md) for the full breakdown — permissions justification, data storage, and the no-remote-code declaration.

---

## CI / CD

Every push and pull request runs:

1. `pnpm compile` — type check
2. `pnpm lint` — oxlint
3. `pnpm fmt:check` — Biome format check
4. `pnpm build` + `pnpm build:firefox` — both targets

Pushing a `v*` tag (e.g. `v2.1.0`) triggers the release workflow:

1. Builds and zips both extensions
2. Publishes to the Chrome Web Store (if `CHROME_PUBLISH=true` repo variable is set)
3. Signs and submits to Firefox AMO (if `FIREFOX_PUBLISH=true`)
4. Creates a GitHub Release with the zip files attached

**Required secrets** (add in *Settings → Secrets → Actions*):

| Secret | Purpose |
|---|---|
| `CHROME_EXTENSION_ID` | Chrome Web Store item ID |
| `CHROME_CLIENT_ID` | Google OAuth2 client ID |
| `CHROME_CLIENT_SECRET` | Google OAuth2 client secret |
| `CHROME_REFRESH_TOKEN` | Google OAuth2 refresh token |
| `FIREFOX_JWT_ISSUER` | Firefox AMO API key |
| `FIREFOX_JWT_SECRET` | Firefox AMO API secret |

How to get Chrome credentials: [Chrome Web Store API guide](https://developer.chrome.com/docs/webstore/using-api)  
How to get Firefox credentials: [AMO API keys](https://addons.mozilla.org/developers/addon/api/key/)
