import type { RuleState } from "@/src/domain/entities/rule";
import type { StateRepository } from "@/src/domain/repositories/state-repository";

/**
 * Persists the state without touching the browser's network layer.
 * For display-only changes (e.g. collapsing a folder) where the active
 * rules are unchanged and a DNR re-apply would be wasted work.
 */
export class SaveRuleStateUseCase {
  constructor(private readonly repository: StateRepository) {}

  execute(state: RuleState): Promise<void> {
    return this.repository.saveState(state);
  }
}
