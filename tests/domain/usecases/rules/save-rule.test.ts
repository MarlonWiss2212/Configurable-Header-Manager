import { describe, expect, it } from "vitest";
import { SaveRuleUseCase } from "@/src/domain/usecases/rules/save-rule";
import { ruleState } from "@/tests/fixtures";

const useCase = new SaveRuleUseCase();
const input = {
  urlPattern: "example.com",
  type: "request",
  operation: "set",
  headerName: "X-New",
  headerValue: "v",
} as const;

describe("SaveRuleUseCase", () => {
  it("creates a new rule with the next id, enabled by default", () => {
    const next = useCase.execute(ruleState(), input, undefined);
    expect(next.rules.at(-1)).toMatchObject({ id: 4, enabled: true, headerName: "X-New" });
  });

  it("preserves the enabled flag when updating an existing rule", () => {
    const next = useCase.execute(
      ruleState(),
      { ...input, id: 3, headerName: "X-Changed" },
      undefined,
    );
    expect(next.rules[0]).toMatchObject({ id: 3, enabled: false, headerName: "X-Changed" });
  });

  it("moves an existing rule out of its folder when no folder is given", () => {
    const next = useCase.execute(ruleState(), { ...input, id: 1 }, undefined);
    expect(next.folders[0].rules.map((item) => item.id)).toEqual([2]);
    expect(next.rules.map((item) => item.id)).toEqual([3, 1]);
  });

  it("reuses an existing folder by case-insensitive name", () => {
    const next = useCase.execute(ruleState(), input, "  STAGING ");
    expect(next.folders).toHaveLength(1);
    expect(next.folders[0].rules.map((item) => item.id)).toEqual([1, 2, 4]);
  });

  it("creates a missing folder with a slug id", () => {
    const next = useCase.execute(ruleState(), input, "My Folder!");
    expect(next.folders.at(-1)).toMatchObject({ id: "my-folder", name: "My Folder!" });
    expect(next.folders.at(-1)?.rules[0].headerName).toBe("X-New");
  });

  it("suffixes the folder id when the slug is already taken", () => {
    const next = useCase.execute(ruleState(), input, "Staging?"); // slug "staging" collides
    expect(next.folders.at(-1)?.id).toBe("staging-2");
  });
});
