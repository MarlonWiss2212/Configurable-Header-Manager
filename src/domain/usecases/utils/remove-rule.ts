import type { RuleState } from "@/src/domain/entities/rule";

export function removeRuleFromCollections(state: RuleState, ruleId: number): RuleState {
  return {
    ...state,
    folders: state.folders.map((folder) => ({
      ...folder,
      rules: folder.rules.filter((rule) => rule.id !== ruleId),
    })),
    rules: state.rules.filter((rule) => rule.id !== ruleId),
  };
}
