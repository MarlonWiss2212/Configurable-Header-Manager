# Rule Format

Rules are stored and exchanged as a plain JSON object. No external libraries required.

## Schema

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

## Fields

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `enabled` | `boolean` | No | `true` | Whether the rule is active |
| `urlPattern` | `string` | No | `"*"` | URL filter. `*` matches all URLs |
| `type` | `"request"` \| `"response"` | **Yes** | — | Apply to outgoing request or incoming response |
| `operation` | `"set"` \| `"remove"` \| `"append"` | **Yes** | — | What to do with the header |
| `headerName` | `string` | **Yes** | — | HTTP header name (case-insensitive) |
| `headerValue` | `string` | For `set`/`append` | `""` | Header value (ignored for `remove`) |

> **Note:** `append` is only supported for **response** headers. The UI disables it for request headers automatically.

## URL Pattern Syntax

`urlPattern` uses `*` as a wildcard matching any sequence of characters.

| Pattern | Matches |
|---|---|
| `*` or `""` | All URLs |
| `*://example.com/*` | Any protocol + example.com + any path |
| `https://api.example.com/*` | HTTPS requests to api.example.com only |
| `*://*/api/*` | Any URL with `/api/` in the path |
| `http://localhost:*/*` | Localhost on any port |

## Importing from a URL

The Import / Export view accepts a URL pointing to a hosted JSON file. The server must include CORS headers:

```
Access-Control-Allow-Origin: *
Content-Type: application/json
```

**Suitable hosts:** GitHub raw URLs, S3 public buckets, any CDN, or a simple static file server.

Example GitHub raw URL:
```
https://raw.githubusercontent.com/your-org/config/main/headers.json
```

The URL import only fetches and populates the JSON editor — you still review and click **Import JSON** to apply the rules.

## See also

- [`docs/example-rules.json`](./example-rules.json) — ready-to-use example file
