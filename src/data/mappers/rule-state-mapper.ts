/** Maps between the persisted JSON models and the domain entities. */
import {
  RULE_STATE_SCHEMA_VERSION,
  type Rule,
  type RuleFolder,
  type RuleState,
} from "@/src/domain/entities/rule";
import { slugifyFolderName, uniqueFolderId } from "@/src/domain/utils/folder-id";
import {
  isRuleOperation,
  isRuleType,
  normalizeRule,
  optionalText,
} from "@/src/domain/utils/rule-validation";
import { DataError } from "@/src/data/errors/data-error";
import type {
  RuleFolderModel,
  RuleModel,
  RuleStateModel,
} from "@/src/data/models/rule-state-model";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export class RuleStateMapper {
  /** Model → entity. Validates every field; drops unusable folders and rules. */
  toRuleState(model: RuleStateModel): RuleState {
    if (!Array.isArray(model.folders) || !Array.isArray(model.rules)) {
      throw new DataError('Schema v2 requires "folders" and "rules" arrays.');
    }

    let nextId = 1;
    return {
      schemaVersion: RULE_STATE_SCHEMA_VERSION,
      folders: this.toFolders(model.folders, () => nextId++),
      rules: this.toRules(model.rules, () => nextId++),
    };
  }

  /** Entity → model, for serialization. Omits empty optional fields. */
  toRuleStateModel(state: RuleState): RuleStateModel {
    return {
      schemaVersion: state.schemaVersion,
      folders: state.folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        ...(folder.collapsed ? { collapsed: true } : {}),
        rules: folder.rules.map((rule) => this.toRuleModel(rule)),
      })),
      rules: state.rules.map((rule) => this.toRuleModel(rule)),
    };
  }

  /** Model → entity for a single rule, or null when it has no usable header name */
  private toRule(model: RuleModel, id: number): Rule | null {
    if (!isRecord(model)) return null;
    const headerName = typeof model.headerName === "string" ? model.headerName.trim() : "";
    if (!headerName) return null;

    return normalizeRule({
      id,
      enabled: model.enabled !== false,
      urlPattern: String(model.urlPattern ?? "*"),
      type: isRuleType(model.type) ? model.type : "request",
      operation: isRuleOperation(model.operation) ? model.operation : "set",
      headerName,
      headerValue: String(model.headerValue ?? ""),
      name: optionalText(model.name),
      comment: optionalText(model.comment),
    });
  }

  private toRuleModel(rule: Rule): RuleModel {
    return {
      enabled: rule.enabled,
      urlPattern: rule.urlPattern,
      type: rule.type,
      operation: rule.operation,
      headerName: rule.headerName,
      headerValue: rule.headerValue,
      ...(rule.name ? { name: rule.name } : {}),
      ...(rule.comment ? { comment: rule.comment } : {}),
    };
  }

  private toFolders(models: RuleFolderModel[], nextId: () => number): RuleFolder[] {
    const usedFolderIds = new Set<string>();
    const folders: RuleFolder[] = [];

    for (const model of models) {
      if (!isRecord(model)) continue;
      const name = optionalText(model.name);
      if (!name) continue;

      const rawId = optionalText(model.id) ?? slugifyFolderName(name);
      const id = uniqueFolderId(rawId, usedFolderIds);
      usedFolderIds.add(id);

      folders.push({
        id,
        name,
        rules: this.toRules(Array.isArray(model.rules) ? model.rules : [], nextId),
        collapsed: model.collapsed === true || undefined,
      });
    }

    return folders;
  }

  private toRules(models: RuleModel[], nextId: () => number): Rule[] {
    const rules: Rule[] = [];
    for (const model of models) {
      const rule = this.toRule(model, nextId());
      if (rule) rules.push(rule);
    }
    return rules;
  }
}
