import type { RuleState } from "@/src/domain/entities/rule";
import { updateRule } from "@/src/domain/usecases/utils/update-rule";

export class ToggleRuleUseCase {
  execute(state: RuleState, ruleId: number, enabled: boolean): RuleState {
    return updateRule(state, ruleId, (rule) => ({ ...rule, enabled }));
  }
}
