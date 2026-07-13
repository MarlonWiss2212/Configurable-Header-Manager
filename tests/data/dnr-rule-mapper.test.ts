import { describe, expect, it } from "vitest";
import type { Rule } from "@/src/domain/entities/rule";
import { DnrRuleMapper } from "@/src/data/mappers/dnr-rule-mapper";

const mapper = new DnrRuleMapper();

const base: Rule = {
  id: 1,
  enabled: true,
  urlPattern: "*",
  type: "request",
  operation: "set",
  headerName: "X-Test",
  headerValue: "abc",
};

describe("DnrRuleMapper", () => {
  it("anchors plain URL patterns", () => {
    expect(mapper.toUrlFilter("*")).toBeUndefined();
    expect(mapper.toUrlFilter("example.com")).toBe("||example.com^");
    expect(mapper.toUrlFilter("example.com/api")).toBe("||example.com/api^");
    expect(mapper.toUrlFilter("https://example.com")).toBe("|https://example.com^");
    expect(mapper.toUrlFilter("*://example.com/*")).toBe("*://example.com/*");
    expect(mapper.toUrlFilter("||already-anchored^")).toBe("||already-anchored^");
  });

  it("maps request and response header operations", () => {
    expect(mapper.toDynamicRule(base).action.requestHeaders).toEqual([
      { header: "X-Test", operation: "set", value: "abc" },
    ]);
    expect(
      mapper.toDynamicRule({ ...base, type: "response", operation: "append" }).action
        .responseHeaders,
    ).toEqual([{ header: "X-Test", operation: "append", value: "abc" }]);
    expect(mapper.toDynamicRule({ ...base, operation: "remove" }).action.requestHeaders).toEqual([
      { header: "X-Test", operation: "remove" },
    ]);
  });

  it("sets the urlFilter from the pattern", () => {
    expect(mapper.toDynamicRule(base).condition.urlFilter).toBeUndefined();
    expect(mapper.toDynamicRule({ ...base, urlPattern: "example.com" }).condition.urlFilter).toBe(
      "||example.com^",
    );
  });
});
