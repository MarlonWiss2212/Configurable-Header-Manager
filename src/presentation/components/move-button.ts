import type { MoveDirection } from "@/src/domain/entities/rule";
import { icon } from "@/src/presentation/icons/icons";

export function moveButton(
  kind: "folder" | "rule",
  direction: MoveDirection,
  disabled: boolean,
  attrs: string,
): string {
  const label = direction === "up" ? "Move up" : "Move down";
  return `
    <button class="icon-btn move-${kind}-btn" data-dir="${direction}" ${attrs}
        title="${label}" aria-label="${label}"${disabled ? " disabled" : ""}>
      ${icon(direction === "up" ? "arrow-up" : "arrow-down")}
    </button>`;
}
