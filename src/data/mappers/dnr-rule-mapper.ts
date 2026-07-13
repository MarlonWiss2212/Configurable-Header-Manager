/** Maps domain rules to declarativeNetRequest dynamic rules. */
import type { Rule } from "@/src/domain/entities/rule";
import type { DynamicRule, DynamicRuleHeader } from "@/src/data/models/dynamic-rule-model";

const ALL_RESOURCE_TYPES = [
  "main_frame",
  "sub_frame",
  "stylesheet",
  "script",
  "image",
  "font",
  "object",
  "xmlhttprequest",
  "ping",
  "media",
  "websocket",
  "other",
] as const;

export class DnrRuleMapper {
  /**
   * Convert a user URL pattern to a DNR `urlFilter`.
   *
   * A raw pattern is matched as a substring anywhere in the URL, so a half-typed
   * "example.c" would match "sample.contoso.dev". To prevent that, plain
   * patterns are anchored:
   *
   * - `*` / empty        → undefined (match every URL)
   * - contains `*`/`|`   → passed through unchanged (explicit wildcard/anchor)
   * - contains `://`     → `|pattern^` (anchored to the start of the URL)
   * - anything else      → `||pattern^` (anchored to the domain boundary)
   *
   * The trailing `^` requires a separator or the end of the URL after the
   * pattern, so "example.com" matches example.com and its subpaths but not
   * "example.com.evil.net" or "example.company.com".
   */
  toUrlFilter(pattern: string): string | undefined {
    const trimmed = pattern.trim();
    if (!trimmed || trimmed === "*") return undefined;
    if (trimmed.includes("*") || trimmed.startsWith("|")) return trimmed;
    if (trimmed.includes("://")) return `|${trimmed}^`;
    return `||${trimmed}^`;
  }

  toDynamicRule(rule: Rule): DynamicRule {
    const header: DynamicRuleHeader = {
      header: rule.headerName.trim(),
      operation: rule.operation,
    };
    if (rule.operation !== "remove") header.value = rule.headerValue;

    const condition: DynamicRule["condition"] = { resourceTypes: ALL_RESOURCE_TYPES };
    const urlFilter = this.toUrlFilter(rule.urlPattern);
    if (urlFilter) condition.urlFilter = urlFilter;

    const action: DynamicRule["action"] =
      rule.type === "response"
        ? { type: "modifyHeaders", responseHeaders: [header] }
        : { type: "modifyHeaders", requestHeaders: [header] };

    return { id: rule.id, priority: 1, action, condition };
  }
}
