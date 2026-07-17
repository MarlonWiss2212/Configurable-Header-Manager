import { describe, expect, it } from "vitest";
import { updateRule } from "@/src/domain/usecases/utils/update-rule";
import { findRule } from "@/src/domain/utils/rule-state";
import { ruleState } from "@/tests/fixtures";

describe("updateRule", () => {
  it("applies the update to the matching rule in a folder", () => {
    const next = updateRule(ruleState(), 1, (r) => ({ ...r, headerName: "X-Changed" }));
    expect(findRule(next, 1)?.rule.headerName).toBe("X-Changed");
  });

  it("normalizes the updated rule (trims, drops value for remove)", () => {
    const next = updateRule(ruleState(), 3, (r) => ({
      ...r,
      operation: "remove",
      headerValue: "ignored",
    }));
    expect(findRule(next, 3)?.rule.headerValue).toBe("");
  });

  it("does not mutate the input state", () => {
    const source = ruleState();
    updateRule(source, 1, (r) => ({ ...r, headerName: "X-Changed" }));
    expect(findRule(source, 1)?.rule.headerName).toBe("X-Test");
  });
});
