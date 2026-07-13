import type { RuleState } from "@/src/domain/entities/rule";

export class ToggleFolderCollapseUseCase {
  execute(state: RuleState, folderId: string): RuleState {
    return {
      ...state,
      folders: state.folders.map((folder) =>
        folder.id === folderId ? { ...folder, collapsed: !folder.collapsed } : folder,
      ),
    };
  }
}
