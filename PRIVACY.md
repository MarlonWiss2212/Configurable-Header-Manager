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

*"Collects no user data" means the extension never transmits, shares, or phones home with anything — not that on-device data is encrypted. See below for how it is stored at rest.*

---

## Data at rest — read this if you store credentials

Header rules, **including header values, are stored unencrypted** in `browser.storage.local`. If you put a secret in a rule — a bearer token, a `Cookie`, an API key — that value is written to the browser profile on disk in plaintext.

**Threat model:** the stored values are readable by anyone with local access to your browser profile directory, or by malware running as your operating-system user. They are **not** exposed to web pages or page-level XSS — an extension's `storage.local` is isolated from a page's `window.localStorage` and (on MV3) is not shared with page content scripts.

**Why it isn't encrypted:** a browser extension has no secure place to keep an encryption key — the key would have to live next to the data, so encrypting would add false confidence rather than real protection. The browser's Declarative Net Request engine also holds the active header values in plaintext regardless of how the extension stores them, so encryption-at-rest would buy nothing. This matches how comparable extensions (e.g. ModHeader) behave; tools that advertise "encryption at rest" generally mean their cloud-synced account data, not the local copy.

**Guidance:** treat header values like any other secret on your machine. Avoid storing long-lived production credentials in rules if your device is shared or untrusted, and remove rules you no longer need.

---

## How header rules are applied

Rules are applied by the **browser's own Declarative Net Request engine**, not by extension JavaScript. The extension registers a rule set with the browser at startup; the browser then applies those rules internally. The extension code never intercepts, reads, or logs any network traffic.

---

## Zero external dependencies

The extension ships with no third-party libraries, no remote scripts, and no CDN references. Every line of code is bundled at build time and included in the extension package. There is nothing to supply-chain-attack.

---

## No network requests

The extension makes **no network requests of any kind**. Importing and exporting rules is entirely local — you drop or choose a `.json` file, paste JSON, or download the current configuration. Nothing is ever fetched or sent.

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
