import type { Rule, RuleState } from "@/src/domain/entities/rule";
import { normalizeRule } from "@/src/domain/utils/rule-validation";

export function updateRule(
  state: RuleState,
  ruleId: number,
  update: (rule: Rule) => Rule,
): RuleState {
  return {
    ...state,
    folders: state.folders.map((folder) => ({
      ...folder,
      rules: folder.rules.map((rule) => (rule.id === ruleId ? normalizeRule(update(rule)) : rule)),
    })),
    rules: state.rules.map((rule) => (rule.id === ruleId ? normalizeRule(update(rule)) : rule)),
  };
}
