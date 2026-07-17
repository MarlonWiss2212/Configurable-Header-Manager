import type { Rule, RuleContainerId, RuleState } from "@/src/domain/entities/rule";
import { slugifyFolderName, uniqueFolderId } from "@/src/domain/utils/folder-id";
import { findRule, nextRuleId } from "@/src/domain/utils/rule-state";
import { UpsertRuleUseCase } from "@/src/domain/usecases/rules/upsert-rule";

export type SaveRuleInput = Omit<Rule, "id" | "enabled"> & Partial<Pick<Rule, "id" | "enabled">>;

export class SaveRuleUseCase {
  private readonly upsertRule = new UpsertRuleUseCase();

  execute(state: RuleState, rule: SaveRuleInput, folderName: string | undefined): RuleState {
    const target = this.resolveTargetFolder(state, folderName);
    const existingId = rule.id ?? null;
    const existing = existingId === null ? null : findRule(state, existingId)?.rule;

    return this.upsertRule.execute(
      target.state,
      {
        id: existingId ?? nextRuleId(state),
        enabled: rule.enabled ?? existing?.enabled ?? true,
        urlPattern: rule.urlPattern,
        type: rule.type,
        operation: rule.operation,
        headerName: rule.headerName,
        headerValue: rule.headerValue,
        name: rule.name,
        comment: rule.comment,
        color: rule.color,
      },
      target.folderId,
    );
  }

  private resolveTargetFolder(
    state: RuleState,
    folderName: string | undefined,
  ): { state: RuleState; folderId: RuleContainerId } {
    if (!folderName?.trim()) return { state, folderId: null };

    const trimmed = folderName.trim();
    const existing = state.folders.find(
      (folder) => folder.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) return { state, folderId: existing.id };

    const usedIds = new Set(state.folders.map((folder) => folder.id));
    const folderId = uniqueFolderId(slugifyFolderName(trimmed), usedIds);
    return {
      state: {
        ...state,
        folders: [...state.folders, { id: folderId, name: trimmed, rules: [] }],
      },
      folderId,
    };
  }
}
