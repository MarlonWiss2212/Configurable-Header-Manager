import type { RuleState } from "@/src/domain/entities/rule";
import type { StateRepository } from "@/src/domain/repositories/state-repository";
import type { ApplyActiveRulesUseCase } from "@/src/domain/usecases/state/apply-active-rules";

/** Persists a new rule state and applies it to the browser in one step */
export class CommitRuleStateUseCase {
  constructor(
    private readonly repository: StateRepository,
    private readonly applyActiveRules: ApplyActiveRulesUseCase,
  ) {}

  async execute(state: RuleState): Promise<void> {
    await this.repository.saveState(state);
    await this.applyActiveRules.execute(state);
  }
}
