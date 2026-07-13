import type { MoveDirection, RuleState } from "@/src/domain/entities/rule";
import { moveItem } from "@/src/domain/usecases/utils/reorder";

export class MoveFolderUseCase {
  execute(state: RuleState, folderId: string, direction: MoveDirection): RuleState {
    const index = state.folders.findIndex((folder) => folder.id === folderId);
    const moved = moveItem(state.folders, index, direction);
    return moved === state.folders ? state : { ...state, folders: moved };
  }
}
