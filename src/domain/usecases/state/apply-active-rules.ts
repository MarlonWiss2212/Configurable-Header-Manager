import type { RuleState } from "@/src/domain/entities/rule";
import { enabledRules } from "@/src/domain/utils/rule-state";
import type { StateRepository } from "@/src/domain/repositories/state-repository";

/** Pushes the currently active rules to the browser's network layer. Applies nothing when the
 *  extension is globally disabled. */
export class ApplyActiveRulesUseCase {
  constructor(private readonly repository: StateRepository) {}

  async execute(state: RuleState): Promise<void> {
    const globalEnabled = await this.repository.loadGlobalEnabled();
    await this.repository.applyRules(globalEnabled ? enabledRules(state) : []);
  }
}
