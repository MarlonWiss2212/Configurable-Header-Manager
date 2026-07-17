import type { RuleState } from "@/src/domain/entities/rule";

/** Sets a folder's display colour. An empty colour clears it. Display only. */
export class SetFolderColorUseCase {
  execute(state: RuleState, folderId: string, color: string): RuleState {
    return {
      ...state,
      folders: state.folders.map((folder) =>
        folder.id === folderId ? { ...folder, color: color || undefined } : folder,
      ),
    };
  }
}
