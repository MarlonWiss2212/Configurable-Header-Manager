import { describe, expect, it } from "vitest";
import { UpsertRuleUseCase } from "@/src/domain/usecases/rules/upsert-rule";
import { rule, ruleState } from "@/tests/fixtures";

const useCase = new UpsertRuleUseCase();

describe("UpsertRuleUseCase", () => {
  it("keeps a rule in place when updating inside the same folder", () => {
    const next = useCase.execute(ruleState(), rule({ id: 1, headerName: "X-Changed" }), "staging");
    expect(next.folders[0].rules.map((item) => item.id)).toEqual([1, 2]);
    expect(next.folders[0].rules[0].headerName).toBe("X-Changed");
  });

  it("moves a rule between containers", () => {
    const next = useCase.execute(ruleState(), rule({ id: 1 }), null);
    expect(next.folders[0].rules.map((item) => item.id)).toEqual([2]);
    expect(next.rules.map((item) => item.id)).toEqual([3, 1]);
  });

  it("inserts a new rule at the end of the target container", () => {
    const next = useCase.execute(ruleState(), rule({ id: 9, headerName: "X-New" }), "staging");
    expect(next.folders[0].rules.map((item) => item.id)).toEqual([1, 2, 9]);
  });

  it("normalizes the rule on the way in", () => {
    const next = useCase.execute(
      ruleState(),
      rule({ id: 9, headerName: "  X-Trim  ", urlPattern: "  " }),
      null,
    );
    expect(next.rules.at(-1)).toMatchObject({ headerName: "X-Trim", urlPattern: "*" });
  });

  it("does not mutate the input state", () => {
    const source = ruleState();
    useCase.execute(source, rule({ id: 9 }), null);
    expect(source.rules).toHaveLength(1);
  });
});
