---
"configurable-header-manager": minor
---

## Added
- Global enable/disable toggle, a rule search bar, and rule duplication.
- Colour accents for rules and folders. A rule with no colour of its own inherits its folder's
  colour; folder colour is set from a dialog with a Remove-colour option, rules from the form.
- JSON import with a **Merge** / **Replace** switch above the editor — drop/choose a `.json` file
  or paste. In Merge the editor starts empty (paste what to add); in Replace it shows the full
  current config to edit. Download exports the current configuration.
- Project scaffolding: MIT `LICENSE`, `package.json` metadata, `CONTRIBUTING.md`, GitHub
  issue/PR templates, changesets-based versioning, and a CI workflow (check + test on all
  branches/PRs, skipped on a `no-ci` label).

## Changed
- Cleaner list UI: flat rule form grouped sensibly, muted badges, a single blue accent, folders
  render as rounded cards, coloured rows show a left bar + background tint, and the search bar and
  list are width-aligned.
- Deleting the last rule in a folder now removes the folder.
- Accessibility: labelled colour swatches, invalid-field semantics on the required header name,
  and live regions.

## Removed
- Import Rules via Network Requests due to security concerns
