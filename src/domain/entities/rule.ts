export const RULE_TYPES = ["request", "response"] as const;
export const RULE_OPERATIONS = ["set", "remove", "append"] as const;
export const RULE_STATE_SCHEMA_VERSION = 2 as const;

export type RuleType = (typeof RULE_TYPES)[number];
export type RuleOperation = (typeof RULE_OPERATIONS)[number];
export type RuleStateSchemaVersion = typeof RULE_STATE_SCHEMA_VERSION;

export interface Rule {
  id: number;
  enabled: boolean;
  urlPattern: string;
  type: RuleType;
  operation: RuleOperation;
  headerName: string;
  headerValue: string;
  name?: string;
  comment?: string;
  /** Colour accent shown in the list. Display only — never affects matching. */
  color?: string;
}

export interface RuleFolder {
  id: string;
  name: string;
  rules: Rule[];
  /** Collapsed in the list view. Display only — part of the state so it persists. */
  collapsed?: boolean;
  /** Colour accent shown in the list. Display only — never affects matching. */
  color?: string;
}

export interface RuleState {
  schemaVersion: RuleStateSchemaVersion;
  folders: RuleFolder[];
  rules: Rule[];
}

export type RuleFolderId = string;
export type RuleContainerId = RuleFolderId | null;
export type MoveDirection = "up" | "down";
