import { describe, expect, it, vi } from "vitest";
import { ApplyActiveRulesUseCase } from "@/src/domain/usecases/state/apply-active-rules";
import { CommitRuleStateUseCase } from "@/src/domain/usecases/state/commit-rule-state";
import { mockStateRepository, ruleState } from "@/tests/fixtures";

describe("CommitRuleStateUseCase", () => {
  it("persists the state and then applies the active rules", async () => {
    const stored = ruleState();
    const repository = mockStateRepository(stored);

    await new CommitRuleStateUseCase(repository, new ApplyActiveRulesUseCase(repository)).execute(
      stored,
    );

    expect(repository.saveState).toHaveBeenCalledWith(stored);
    expect(repository.applyRules).toHaveBeenCalledOnce();
    expect(vi.mocked(repository.saveState).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(repository.applyRules).mock.invocationCallOrder[0],
    );
  });
});
