import type { Rule } from "./types";

const RESOURCE_TYPES = [
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

export async function applyRulesToDNR(rules: Rule[]): Promise<void> {
  const existing = await browser.declarativeNetRequest.getDynamicRules();

  const addRules = rules
    .filter((r) => r.enabled && r.headerName.trim())
    .map((r) => {
      const headerEntry: Record<string, string> = {
        header: r.headerName.trim(),
        operation: r.operation,
      };
      if (r.operation !== "remove") headerEntry.value = r.headerValue;

      const condition: { resourceTypes: readonly string[]; urlFilter?: string } = {
        resourceTypes: RESOURCE_TYPES,
      };

      // Pass pattern directly — never strip wildcards. Omit urlFilter to match all URLs.
      const pattern = r.urlPattern.trim();
      if (pattern && pattern !== "*") condition.urlFilter = pattern;

      return {
        id: r.id,
        priority: 1,
        action: {
          type: "modifyHeaders" as const,
          [r.type === "response" ? "responseHeaders" : "requestHeaders"]: [headerEntry],
        },
        condition,
      };
    });

  // oxlint-disable-next-line no-explicit-any -- WXT's polyfill lacks updateDynamicRules typing
  await (browser.declarativeNetRequest as any).updateDynamicRules({
    removeRuleIds: existing.map((r: { id: number }) => r.id),
    addRules,
  });
}
