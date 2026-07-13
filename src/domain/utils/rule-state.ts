import {
  RULE_STATE_SCHEMA_VERSION,
  type Rule,
  type RuleContainerId,
  type RuleState,
} from "@/src/domain/entities/rule";

export const EMPTY_RULE_STATE: RuleState = {
  schemaVersion: RULE_STATE_SCHEMA_VERSION,
  folders: [],
  rules: [],
};

export interface RuleWithLocation {
  rule: Rule;
  folderId: RuleContainerId;
}

export function cloneRuleState(state: RuleState): RuleState {
  return {
    schemaVersion: RULE_STATE_SCHEMA_VERSION,
    folders: state.folders.map((folder) => ({
      ...folder,
      rules: folder.rules.map((rule) => ({ ...rule })),
    })),
    rules: state.rules.map((rule) => ({ ...rule })),
  };
}

export function flattenRules(state: RuleState): Rule[] {
  return [...state.folders.flatMap((folder) => folder.rules), ...state.rules];
}

export function enabledRules(state: RuleState): Rule[] {
  return flattenRules(state).filter((rule) => rule.enabled && rule.headerName.trim());
}

export function nextRuleId(state: RuleState): number {
  const rules = flattenRules(state);
  if (rules.length === 0) return 1;
  return Math.max(...rules.map((rule) => rule.id)) + 1;
}

export function findRule(state: RuleState, ruleId: number): RuleWithLocation | null {
  for (const folder of state.folders) {
    const rule = folder.rules.find((candidate) => candidate.id === ruleId);
    if (rule) return { rule, folderId: folder.id };
  }
  const rule = state.rules.find((candidate) => candidate.id === ruleId);
  return rule ? { rule, folderId: null } : null;
}

export function folderOptions(state: RuleState): { id: string; name: string }[] {
  return state.folders.map((folder) => ({ id: folder.id, name: folder.name }));
}

export function getRuleCollection(state: RuleState, folderId: RuleContainerId): Rule[] {
  if (folderId === null) return state.rules;
  const folder = state.folders.find((candidate) => candidate.id === folderId);
  if (!folder) throw new Error(`Folder ${folderId} not found`);
  return folder.rules;
}
