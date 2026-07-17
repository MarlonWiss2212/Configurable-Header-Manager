# Changesets

This folder holds [changesets](https://github.com/changesets/changesets). For any user-facing
change, run `pnpm changeset` and commit the generated markdown file. On merge to `main`, the
changesets GitHub Action opens a "Version Packages" PR that bumps `package.json` and updates
`CHANGELOG.md`. Publishing to the stores still happens by pushing a `v*` tag (see
`.github/workflows/release.yml`) — the maintainer owns tagging.
