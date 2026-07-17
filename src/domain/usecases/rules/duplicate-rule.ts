import type { RuleState } from "@/src/domain/entities/rule";
import {
  cloneRuleState,
  findRule,
  getRuleCollection,
  nextRuleId,
} from "@/src/domain/utils/rule-state";

/** Inserts a copy of a rule (with a fresh id) directly after the original */
export class DuplicateRuleUseCase {
  execute(state: RuleState, ruleId: number): RuleState {
    const located = findRule(state, ruleId);
    if (!located) return state;

    const next = cloneRuleState(state);
    const collection = getRuleCollection(next, located.folderId);
    const index = collection.findIndex((rule) => rule.id === ruleId);
    collection.splice(index + 1, 0, { ...collection[index], id: nextRuleId(state) });
    return next;
  }
}
