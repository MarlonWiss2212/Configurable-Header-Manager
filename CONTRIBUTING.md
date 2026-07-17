# Contributing

Thanks for helping improve Configurable Header Manager.

## Architecture

This project follows a strict Clean Architecture (`presentation → domain ← data`). Before
writing code, read [`CLAUDE.md`](./CLAUDE.md) — it documents the layer rules, where each kind of
code belongs, the testing conventions, and the hard constraints (schema v2 only, no runtime
dependencies, Firefox specifics).

## Development

```bash
pnpm install
pnpm dev            # hot-reload development (Chrome)
pnpm test           # run the test suite
pnpm check          # compile + lint + fmt:check — must pass before a PR
```

`tests/` mirrors `src/` file-for-file — every use case, repository, mapper, datasource, and view
has its own test at the mirrored path.

## Pull requests

- **Small, per-directory commits** — one commit per layer/concern (`feat(domain): …`,
  `test: …`, `docs: …`). Don't bundle a whole feature into one commit.
- Run `pnpm check` and `pnpm test` locally before opening a PR.
- **Add a changeset** for any user-facing change: `pnpm changeset`, then commit the generated
  file. On merge to `main` this automatically bumps the version and updates `CHANGELOG.md`.
  Structure the body with `## Added` / `## Changed` / `## Removed` sections — see the Changesets
  section in [`CLAUDE.md`](./CLAUDE.md).
- Version numbers and tags are the maintainer's decision — don't bump the version or add tags.
