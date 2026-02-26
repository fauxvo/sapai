# Changesets

This folder is used by [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## Adding a changeset

When you make a change that should be noted in the changelog, run:

```bash
bunx changeset
```

This will prompt you to:
1. Select which packages are affected
2. Choose a bump type (patch / minor / major)
3. Write a summary of the change

A markdown file will be created in this directory — commit it with your PR.

## Releasing

To consume all pending changesets and bump versions:

```bash
bunx changeset version
```

This updates `package.json` versions and writes `CHANGELOG.md` files.
