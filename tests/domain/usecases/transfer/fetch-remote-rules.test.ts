import { describe, expect, it } from "vitest";
import { FetchRemoteRulesUseCase } from "@/src/domain/usecases/transfer/fetch-remote-rules";
import { mockStateRepository, ruleState } from "@/tests/fixtures";

describe("FetchRemoteRulesUseCase", () => {
  it("loads a rule state from a URL through the repository", async () => {
    const stored = ruleState();
    const repository = mockStateRepository(stored);

    await expect(
      new FetchRemoteRulesUseCase(repository).execute("https://x.test/rules.json"),
    ).resolves.toBe(stored);
    expect(repository.fetchRules).toHaveBeenCalledWith("https://x.test/rules.json");
  });
});
