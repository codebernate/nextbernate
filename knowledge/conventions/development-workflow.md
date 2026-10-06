---
type: convention
tags: [convention, tooling]
---

# Development workflow

Use the Node version in `.node-version` and pnpm version in `package.json`.

- Editor: Oxlint diagnostics and Oxfmt format-on-save.
- Pre-commit: Lefthook formats and lints staged files while preserving unstaged changes.
- Commit messages: commitlint validates Conventional Commits; `pnpm commit` opens Commitizen.
- `pnpm lint` runs Oxlint; `pnpm lint:eslint` runs complementary ESLint rules.
- `pnpm check` runs formatting, both linters, typecheck, Knip, and a production build.

Rule ownership: Oxlint enforces `no-debugger` and React hook rules quickly; ESLint supplies rules Oxlint does not cover, including `@typescript-eslint/no-explicit-any`.

PR titles become squash commit subjects. `fix` releases a patch, `feat` a minor, and `!` or a breaking-change footer a major. semantic-release updates package version and changelog after checked `main` commits; npm publishing is disabled. Dependabot opens weekly grouped PRs without auto-merge.

Reproduce CI failures locally. Do not disable checks to make a change pass. See [[conventions/knowledge-workflow]].
