import type { Rule, RuleContainerId, RuleState } from "@/src/domain/entities/rule";
import { cloneRuleState, findRule, getRuleCollection } from "@/src/domain/utils/rule-state";
import { normalizeRule } from "@/src/domain/utils/rule-validation";
import { removeRuleFromCollections } from "@/src/domain/usecases/utils/remove-rule";
import { updateRule } from "@/src/domain/usecases/utils/update-rule";

export class UpsertRuleUseCase {
  execute(state: RuleState, rule: Rule, folderId: RuleContainerId): RuleState {
    const normalized = normalizeRule(rule);
    const existing = findRule(state, normalized.id);
    if (existing?.folderId === folderId) {
      return updateRule(state, normalized.id, () => normalized);
    }

    const next = removeRuleFromCollections(cloneRuleState(state), normalized.id);
    getRuleCollection(next, folderId).push(normalized);
    return next;
  }
}
