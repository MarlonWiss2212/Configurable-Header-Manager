import type { RuleState } from "@/src/domain/entities/rule";
import { enabledRules } from "@/src/domain/utils/rule-state";
import type { StateRepository } from "@/src/domain/repositories/state-repository";

/** Pushes the currently active rules to the browser's network layer */
export class ApplyActiveRulesUseCase {
  constructor(private readonly repository: StateRepository) {}

  execute(state: RuleState): Promise<void> {
    return this.repository.applyRules(enabledRules(state));
  }
}
