import type { MoveDirection, RuleContainerId, RuleState } from "@/src/domain/entities/rule";
import { moveItem } from "@/src/domain/usecases/utils/reorder";

export class MoveRuleUseCase {
  execute(
    state: RuleState,
    folderId: RuleContainerId,
    ruleId: number,
    direction: MoveDirection,
  ): RuleState {
    if (folderId === null) {
      const index = state.rules.findIndex((rule) => rule.id === ruleId);
      const moved = moveItem(state.rules, index, direction);
      return moved === state.rules ? state : { ...state, rules: moved };
    }

    return {
      ...state,
      folders: state.folders.map((folder) => {
        if (folder.id !== folderId) return folder;
        const index = folder.rules.findIndex((rule) => rule.id === ruleId);
        const moved = moveItem(folder.rules, index, direction);
        return moved === folder.rules ? folder : { ...folder, rules: moved };
      }),
    };
  }
}
