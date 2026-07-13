import { describe, expect, it } from "vitest";
import { canMove, moveItem } from "@/src/domain/usecases/utils/reorder";

describe("canMove", () => {
  it("allows moves that stay inside the list", () => {
    expect(canMove(1, 3, "up")).toBe(true);
    expect(canMove(1, 3, "down")).toBe(true);
  });

  it("blocks moves past the edges and unknown indexes", () => {
    expect(canMove(0, 3, "up")).toBe(false);
    expect(canMove(2, 3, "down")).toBe(false);
    expect(canMove(-1, 3, "up")).toBe(false);
  });
});

describe("moveItem", () => {
  it("swaps with the neighbour in the given direction", () => {
    expect(moveItem(["a", "b", "c"], 1, "up")).toEqual(["b", "a", "c"]);
    expect(moveItem(["a", "b", "c"], 1, "down")).toEqual(["a", "c", "b"]);
  });

  it("returns the same array reference when the move is blocked", () => {
    const items = ["a", "b"];
    expect(moveItem(items, 0, "up")).toBe(items);
    expect(moveItem(items, 1, "down")).toBe(items);
  });

  it("does not mutate the input array", () => {
    const items = ["a", "b"];
    moveItem(items, 0, "down");
    expect(items).toEqual(["a", "b"]);
  });
});
