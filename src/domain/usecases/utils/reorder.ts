import type { MoveDirection } from "@/src/domain/entities/rule";

export function canMove(index: number, length: number, direction: MoveDirection): boolean {
  if (index < 0) return false;
  return direction === "up" ? index > 0 : index < length - 1;
}

export function moveItem<TItem>(items: TItem[], index: number, direction: MoveDirection): TItem[] {
  if (!canMove(index, items.length, direction)) return items;
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  const next = [...items];
  const item = next[index];
  next[index] = next[targetIndex];
  next[targetIndex] = item;
  return next;
}
