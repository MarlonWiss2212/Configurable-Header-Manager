import type { Rule, RuleFolder, RuleState } from "@/src/domain/entities/rule";
import { slugifyFolderName, uniqueFolderId } from "@/src/domain/utils/folder-id";
import { nextRuleId } from "@/src/domain/utils/rule-state";

/** Appends an incoming rule state onto the current one. Incoming folders are matched to
 *  existing folders by name (case-insensitively); unmatched folders are added. Incoming
 *  rules get fresh ids so they never collide with the current state. Never mutates inputs. */
export class MergeRuleStatesUseCase {
  execute(current: RuleState, incoming: RuleState): RuleState {
    let id = nextRuleId(current);
    const reid = (rule: Rule): Rule => ({ ...rule, id: id++ });

    const folders: RuleFolder[] = current.folders.map((folder) => ({
      ...folder,
      rules: folder.rules.map((rule) => ({ ...rule })),
    }));
    const usedFolderIds = new Set(folders.map((folder) => folder.id));

    for (const folder of incoming.folders) {
      const match = folders.find(
        (candidate) => candidate.name.toLowerCase() === folder.name.toLowerCase(),
      );
      if (match) {
        match.rules = [...match.rules, ...folder.rules.map(reid)];
      } else {
        const folderId = uniqueFolderId(slugifyFolderName(folder.name), usedFolderIds);
        usedFolderIds.add(folderId);
        folders.push({ ...folder, id: folderId, rules: folder.rules.map(reid) });
      }
    }

    return {
      schemaVersion: current.schemaVersion,
      folders,
      rules: [...current.rules.map((rule) => ({ ...rule })), ...incoming.rules.map(reid)],
    };
  }
}
