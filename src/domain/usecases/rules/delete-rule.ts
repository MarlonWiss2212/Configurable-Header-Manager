import type { RuleState } from "@/src/domain/entities/rule";
import { cloneRuleState } from "@/src/domain/utils/rule-state";
import { removeRuleFromCollections } from "@/src/domain/usecases/utils/remove-rule";

export class DeleteRuleUseCase {
  execute(state: RuleState, ruleId: number): RuleState {
    return removeRuleFromCollections(cloneRuleState(state), ruleId);
  }
}
