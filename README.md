# Nextbernate

Nextbernate is a personal Next.js boilerplate with TypeScript, Tailwind, shadcn/ui, and a layered quality workflow.

Use the Node version from `.node-version` and pnpm version declared in `package.json`.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## Checks

- `pnpm format` applies Oxfmt.
- `pnpm lint` runs Oxlint for fast feedback.
- `pnpm lint:eslint` runs complementary ESLint rules.
- `pnpm typecheck` generates Next.js route types and runs TypeScript.
- `pnpm knip` finds unused files, exports, and dependencies.
- `pnpm check` runs every quality check and production build.

Use `pnpm commit` for the optional Commitizen wizard. Lefthook formats and lints staged files, and commitlint validates Conventional Commit messages. When a file is partially staged, verify the unstaged hunk stays in your working tree after committing.

Use `pnpm ui:add <component>` to add a shadcn component only when the application needs it.

## Releases and dependency updates

`pnpm release` is configured for semantic-release on `main`. It updates the package version and `CHANGELOG.md`, creates a Git tag and GitHub release, and never publishes to npm.

Release automation is disabled until a repository administrator completes the GitHub setup:

1. Create a GitHub App limited to this repository with **Contents: read and write**. Add other permissions only when an enabled GitHub release feature requires them.
2. Install the App only on this repository, then set the `RELEASE_APP_ID` repository variable and `RELEASE_APP_PRIVATE_KEY` secret.
3. Set `RELEASE_ENABLED=true` only after branch protection is configured. Allow only the App to bypass the narrow rule needed to commit release artifacts; developers continue through pull requests and required checks.
4. Enable squash merges and use the PR title as the squash subject. Require both `Quality checks` and `PR title`.

Repositories created from this template start without release tags. Semantic-release will create `1.0.0` for the first eligible release; create a baseline tag only when deliberately continuing an existing release history. If a release fails, inspect its commit, tag, and GitHub Release before retrying. Do not delete tags or force-push automatically.

Dependabot opens weekly grouped update pull requests for pnpm dependencies and GitHub Actions. It does not auto-merge changes.
