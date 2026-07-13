import type { RuleState } from "@/src/domain/entities/rule";

export class ToggleFolderUseCase {
  execute(state: RuleState, folderId: string, enabled: boolean): RuleState {
    return {
      ...state,
      folders: state.folders.map((folder) =>
        folder.id === folderId
          ? { ...folder, rules: folder.rules.map((rule) => ({ ...rule, enabled })) }
          : folder,
      ),
    };
  }
}
