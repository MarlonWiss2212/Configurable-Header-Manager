import { describe, expect, it, vi } from "vitest";
import { ApplyActiveRulesUseCase } from "@/src/domain/usecases/state/apply-active-rules";
import { mockStateRepository, rule, ruleState } from "@/tests/fixtures";

describe("ApplyActiveRulesUseCase", () => {
  it("passes only enabled rules to the repository", async () => {
    const repository = mockStateRepository(ruleState());
    await new ApplyActiveRulesUseCase(repository).execute(ruleState());

    const applied = vi.mocked(repository.applyRules).mock.calls[0][0];
    expect(applied.map((item) => item.id)).toEqual([1, 2]); // rule 3 is disabled
  });

  it("skips enabled rules with a blank header name", async () => {
    const state = ruleState();
    state.folders[0].rules[0] = rule({ id: 1, headerName: "   " });
    const repository = mockStateRepository(state);

    await new ApplyActiveRulesUseCase(repository).execute(state);

    const applied = vi.mocked(repository.applyRules).mock.calls[0][0];
    expect(applied.map((item) => item.id)).toEqual([2]);
  });
});
