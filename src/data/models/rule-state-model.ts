/**
 * The shape of persisted / imported / exported rule JSON (schema v2).
 * These are unvalidated DTOs — the mapper turns them into domain entities.
 */

export interface RuleModel {
  enabled?: boolean;
  urlPattern?: string;
  type?: string;
  operation?: string;
  headerName?: string;
  headerValue?: string;
  name?: string;
  comment?: string;
}

export interface RuleFolderModel {
  id?: string;
  name?: string;
  collapsed?: boolean;
  rules?: RuleModel[];
}

export interface RuleStateModel {
  schemaVersion: number;
  folders: RuleFolderModel[];
  rules: RuleModel[];
}
