import { describe, expect, it } from "vitest";
import { LoadRuleStateUseCase } from "@/src/domain/usecases/state/load-rule-state";
import { mockStateRepository, ruleState } from "@/tests/fixtures";

describe("LoadRuleStateUseCase", () => {
  it("returns the state from the repository", async () => {
    const stored = ruleState();
    const repository = mockStateRepository(stored);

    await expect(new LoadRuleStateUseCase(repository).execute()).resolves.toBe(stored);
    expect(repository.loadState).toHaveBeenCalledOnce();
  });
});
