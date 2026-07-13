import { describe, expect, it } from "vitest";
import { slugifyFolderName, uniqueFolderId } from "@/src/domain/utils/folder-id";

describe("slugifyFolderName", () => {
  it("produces url-safe ids with a fallback", () => {
    expect(slugifyFolderName("My Folder!")).toBe("my-folder");
    expect(slugifyFolderName("  ??? ")).toBe("folder");
  });
});

describe("uniqueFolderId", () => {
  it("suffixes until the id is free", () => {
    expect(uniqueFolderId("a", new Set())).toBe("a");
    expect(uniqueFolderId("a", new Set(["a", "a-2"]))).toBe("a-3");
  });
});
