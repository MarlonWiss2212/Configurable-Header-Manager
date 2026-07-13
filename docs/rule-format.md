# Rule Format

Rules are stored and exchanged as a plain JSON object. No external libraries required.
The current format is schema version 2.

## Schema

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
          "headerValue": "Bearer token123",
          "name": "Staging auth",
          "comment": "Token for the staging API"
        }
      ]
    }
  ],
  "rules": [
    {
      "enabled": false,
      "urlPattern": "*",
      "type": "response",
      "operation": "remove",
      "headerName": "X-Frame-Options",
      "headerValue": ""
    }
  ]
}
```

`folders` and each `rules` array are ordered. Reordering in the popup changes array order.
Top-level `rules` are ungrouped rules. Rules inside folders do not include a `folder` field; their folder comes from the JSON tree.

## Rule Fields

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `enabled` | `boolean` | No | `true` | Whether the rule is active |
| `urlPattern` | `string` | No | `"*"` | URL filter. `*` matches all URLs |
| `type` | `"request"` \| `"response"` | **Yes** | — | Apply to outgoing request or incoming response |
| `operation` | `"set"` \| `"remove"` \| `"append"` | **Yes** | — | What to do with the header |
| `headerName` | `string` | **Yes** | — | HTTP header name (case-insensitive) |
| `headerValue` | `string` | For `set`/`append` | `""` | Header value (ignored for `remove`) |
| `name` | `string` | No | — | **Display only.** Shown in the list instead of the header name |
| `comment` | `string` | No | — | **Display only.** Free-text note shown in the list |

> **Note:** `append` is only supported for **response** headers. The UI disables it for request headers automatically.
>
> `name` and `comment` never affect matching and are never sent with requests.

## Folder Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | No | Stable folder id — derived from the folder name when missing |
| `name` | `string` | **Yes** | Folder label shown in the popup |
| `rules` | `Rule[]` | **Yes** | Ordered rules in this folder |
| `collapsed` | `boolean` | No | **Display only.** Whether the folder is collapsed in the list |

> Only `schemaVersion: 2` files are accepted — there is no legacy format support.
> Exports never contain rule `id`s; importers assign fresh ids and ignore any present.

## URL Pattern Syntax

`urlPattern` uses `*` as a wildcard matching any sequence of characters.

| Pattern | Matches |
|---|---|
| `*` or `""` | All URLs |
| `example.com` | example.com and its subdomains/paths — **not** `example.com.evil.net` |
| `*://example.com/*` | Any protocol + example.com + any path |
| `https://api.example.com/*` | HTTPS requests to api.example.com only |
| `*://*/api/*` | Any URL with `/api/` in the path |
| `http://localhost:*/*` | Localhost on any port |

Patterns without a wildcard are anchored automatically: a bare domain is matched
at the domain boundary and a full URL at the start of the address, so a
half-typed pattern like `example.c` will not silently match unrelated sites.

## Importing

The Import / Export view accepts pasted JSON, imported `.json` files, or a URL pointing to a hosted JSON file.
Hosted files must include CORS headers:

```
Access-Control-Allow-Origin: *
Content-Type: application/json
```

**Suitable hosts:** GitHub raw URLs, S3 public buckets, any CDN, or a simple static file server.

Example GitHub raw URL:
```
https://raw.githubusercontent.com/your-org/config/main/headers.json
```

Imports only populate the JSON editor first — you still review and save to apply the rules.

## See also

- [`docs/example-rules.json`](./example-rules.json) — ready-to-use example file
