# Privacy & Data Security

**This extension collects no user data — ever.**

---

## What stays on your device

| Data | Where it lives | Leaves your device? |
|---|---|---|
| Header rules you create | `browser.storage.local` | Never |
| URL patterns you configure | `browser.storage.local` | Never |
| Browsing history / visited URLs | Not stored at all | — |
| Request / response content | Never read by the extension | — |

---

## How header rules are applied

Rules are applied by the **browser's own Declarative Net Request engine**, not by extension JavaScript. The extension registers a rule set with the browser at startup; the browser then applies those rules internally. The extension code never intercepts, reads, or logs any network traffic.

---

## Zero external dependencies

The extension ships with no third-party libraries, no remote scripts, and no CDN references. Every line of code is bundled at build time and included in the extension package. There is nothing to supply-chain-attack.

---

## No autonomous network requests

The only outbound request the extension can make is an **opt-in, user-initiated** JSON fetch on the Import / Export screen — when the user explicitly pastes a URL and clicks Fetch. This feature is controlled entirely by the user. The extension never fetches anything on its own.

---

## Permissions explained

| Permission | Why it is needed |
|---|---|
| `storage` | Persist user-created header rules in `browser.storage.local` |
| `declarativeNetRequest` | Register rules with the browser engine so it can modify headers |
| `<all_urls>` (host permission) | Required so DNR rules can match whichever domains the user configures — the extension reads no content from those pages |

---

## Data collection declaration

No data is collected, transmitted, or shared with any third party.

- No analytics
- No telemetry
- No crash reporting
- No usage tracking
- No personal information of any kind

Declared explicitly in the Firefox manifest:

```json
"data_collection_permissions": {
  "required": ["none"],
  "optional": []
}
```

---

## Open source

All source code is in this repository. You can audit every file before installing. No obfuscation, no minification of logic — only standard build output.
