import { describe, expect, it } from "vitest";
import {
  isRuleOperation,
  isRuleType,
  normalizeRule,
  optionalText,
} from "@/src/domain/utils/rule-validation";

describe("isRuleType / isRuleOperation", () => {
  it("accepts the known enum values", () => {
    expect(isRuleType("request")).toBe(true);
    expect(isRuleType("response")).toBe(true);
    expect(isRuleOperation("set")).toBe(true);
    expect(isRuleOperation("remove")).toBe(true);
    expect(isRuleOperation("append")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isRuleType("bogus")).toBe(false);
    expect(isRuleType(1)).toBe(false);
    expect(isRuleOperation("bogus")).toBe(false);
    expect(isRuleOperation(null)).toBe(false);
  });
});

describe("optionalText", () => {
  it("trims and returns non-empty strings", () => {
    expect(optionalText("  hello ")).toBe("hello");
  });

  it("returns undefined for blank strings and non-strings", () => {
    expect(optionalText("   ")).toBeUndefined();
    expect(optionalText(42)).toBeUndefined();
    expect(optionalText(undefined)).toBeUndefined();
  });
});

describe("normalizeRule", () => {
  const base = {
    id: 1,
    enabled: true,
    urlPattern: " example.com ",
    type: "request",
    operation: "set",
    headerName: " X-Test ",
    headerValue: " v ",
    name: "  ",
    comment: " note ",
  } as const;

  it("trims fields and defaults a blank pattern to *", () => {
    const normalized = normalizeRule({ ...base });
    expect(normalized).toMatchObject({
      urlPattern: "example.com",
      headerName: "X-Test",
      headerValue: "v",
      comment: "note",
    });
    expect(normalized.name).toBeUndefined();
    expect(normalizeRule({ ...base, urlPattern: "  " }).urlPattern).toBe("*");
  });

  it("clears the header value for remove rules", () => {
    expect(normalizeRule({ ...base, operation: "remove" }).headerValue).toBe("");
  });
});
