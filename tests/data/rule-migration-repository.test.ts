import { describe, expect, it } from "vitest";
import { DataError } from "@/src/data/errors/data-error";
import { RuleMigrationRepository } from "@/src/data/repositories/rule-migration-repository";

const repository = new RuleMigrationRepository();

describe("RuleMigrationRepository", () => {
  it("parses a schema v2 state and assigns fresh sequential ids", () => {
    const state = repository.migrateToCurrent({
      schemaVersion: 2,
      folders: [{ id: "staging", name: "Staging", rules: [{ headerName: "X-A" }] }],
      rules: [{ headerName: "X-B" }],
    });

    expect(state.folders[0]).toMatchObject({ id: "staging", name: "Staging" });
    expect(state.folders[0].rules[0]).toMatchObject({ id: 1, headerName: "X-A", enabled: true });
    expect(state.rules[0]).toMatchObject({ id: 2, headerName: "X-B" });
  });

  it("keeps the collapsed flag on folders", () => {
    const state = repository.migrateToCurrent({
      schemaVersion: 2,
      folders: [
        { id: "a", name: "A", rules: [], collapsed: true },
        { id: "b", name: "B", rules: [], collapsed: "yes" }, // non-boolean → dropped
      ],
      rules: [],
    });
    expect(state.folders[0].collapsed).toBe(true);
    expect(state.folders[1].collapsed).toBeUndefined();
  });

  it("derives missing folder ids from the name and deduplicates collisions", () => {
    const state = repository.migrateToCurrent({
      schemaVersion: 2,
      folders: [
        { name: "My Folder", rules: [] },
        { name: "My Folder!", rules: [] },
      ],
      rules: [],
    });
    expect(state.folders.map((folder) => folder.id)).toEqual(["my-folder", "my-folder-2"]);
  });

  it("drops folders without a name and rules without a header name", () => {
    const state = repository.migrateToCurrent({
      schemaVersion: 2,
      folders: [{ id: "x", rules: [] }, "not-a-folder"],
      rules: [{ headerName: "  " }, { headerName: "X-Kept" }, null],
    });
    expect(state.folders).toEqual([]);
    expect(state.rules.map((rule) => rule.headerName)).toEqual(["X-Kept"]);
  });

  it("rejects unknown schema versions and shapeless input", () => {
    expect(() =>
      repository.migrateToCurrent({ schemaVersion: 99, folders: [], rules: [] }),
    ).toThrow("Unsupported rule schema version");
    expect(() => repository.migrateToCurrent({ rules: [] })).toThrow(DataError);
    expect(() => repository.migrateToCurrent("text")).toThrow(DataError);
    expect(() => repository.migrateToCurrent({ schemaVersion: 2 })).toThrow(
      '"folders" and "rules"',
    );
  });
});
