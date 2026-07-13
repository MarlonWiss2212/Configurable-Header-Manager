/** How folder ids are formed — an entity invariant shared by domain and data. */

export function slugifyFolderName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "folder";
}

export function uniqueFolderId(baseId: string, usedIds: ReadonlySet<string>): string {
  let id = baseId;
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }
  return id;
}
