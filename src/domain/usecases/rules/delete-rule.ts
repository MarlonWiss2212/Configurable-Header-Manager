import type { RuleState } from "@/src/domain/entities/rule";
import { cloneRuleState } from "@/src/domain/utils/rule-state";
import { removeRuleFromCollections } from "@/src/domain/usecases/utils/remove-rule";

export class DeleteRuleUseCase {
  execute(state: RuleState, ruleId: number): RuleState {
    const next = removeRuleFromCollections(cloneRuleState(state), ruleId);
    // Deleting the last rule in a folder removes the (now-empty) folder.
    return { ...next, folders: next.folders.filter((folder) => folder.rules.length > 0) };
  }
}
