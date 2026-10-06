# Nextbernate

Nextbernate is a personal Next.js boilerplate with TypeScript, Tailwind, shadcn/ui, and a layered quality workflow.

Use the Node version from `.node-version` and pnpm version declared in `package.json`.

## Setup

```bash
pnpm install --frozen-lockfile
cp -n .env.example .env.local
pnpm dev
```

Set `SITE_URL` to the HTTP(S) origin of the deployment. Keep `SITE_INDEXABLE=false` for local and preview deployments; enable it deliberately for the public site.

## Checks

| Script                              | Purpose                                         |
| ----------------------------------- | ----------------------------------------------- |
| `pnpm dev`                          | Start the development server.                   |
| `pnpm build` / `pnpm start`         | Produce and serve a production build.           |
| `pnpm format` / `pnpm format:check` | Apply or verify Oxfmt formatting.               |
| `pnpm lint`                         | Run fast Oxlint feedback.                       |
| `pnpm lint:eslint`                  | Run complementary ESLint rules.                 |
| `pnpm typecheck`                    | Generate Next route types and check TypeScript. |
| `pnpm knip`                         | Find unused files, exports, and dependencies.   |
| `pnpm check`                        | Run every quality check and a production build. |
| `pnpm commit`                       | Open the optional Commitizen wizard.            |
| `pnpm ui:add <component>`           | Add a needed shadcn component.                  |
| `pnpm release` / `pnpm release:dry` | Run semantic-release or its dry run.            |

Use `pnpm commit` for the optional Commitizen wizard. Lefthook formats and lints staged files, and commitlint validates Conventional Commit messages. When a file is partially staged, verify the unstaged hunk stays in your working tree after committing.

Use `pnpm ui:add <component>` to add a shadcn component only when the application needs it.

## Structure and site metadata

Application code lives under `src/`; `@/` resolves from `src/`. Routes and metadata endpoints live in `src/app`, reusable presentation in `src/components`, and shared server helpers in `src/lib`. Read [code organization guidance](knowledge/conventions/code-organization.md) before introducing a new boundary.

Customize site identity in `src/lib/site.ts`. Public pages use `pageMetadata` for canonical, Open Graph, and Twitter metadata. Add discoverable routes explicitly to `src/app/sitemap.ts`; JSON-LD must use `JsonLd` and its serializer. The default social image is `src/app/opengraph-image.tsx`.

## Project knowledge

Open `knowledge/` as an Obsidian vault and start at [its index](knowledge/index.md). Codex, Claude Code, and Cursor route through `AGENTS.md` to the same vault; the bundled skill is at `.agents/skills/obsidian-second-brain/SKILL.md`. The routing files are structurally verified here; automatic skill discovery behavior still depends on each installed tool.

## Releases and dependency updates

`pnpm release` is configured for semantic-release on `main`. It updates the package version and `CHANGELOG.md`, creates a Git tag and GitHub release, and never publishes to npm.

Release automation is disabled until a repository administrator completes the GitHub setup:

1. Create a GitHub App limited to this repository with **Contents: read and write**. Add other permissions only when an enabled GitHub release feature requires them.
2. Install the App only on this repository, then set the `RELEASE_APP_ID` repository variable and `RELEASE_APP_PRIVATE_KEY` secret.
3. Set `RELEASE_ENABLED=true` only after branch protection is configured. Allow only the App to bypass the narrow rule needed to commit release artifacts; developers continue through pull requests and required checks.
4. Enable squash merges and use the PR title as the squash subject. Require both `Quality checks` and `PR title`.

Repositories created from this template start without release tags. Semantic-release will create `1.0.0` for the first eligible release; create a baseline tag only when deliberately continuing an existing release history. If a release fails, inspect its commit, tag, and GitHub Release before retrying. Do not delete tags or force-push automatically.

Dependabot opens weekly grouped update pull requests for pnpm dependencies and GitHub Actions. It does not auto-merge changes.

## After using this template

- Rename the package and update site identity and deployment domain.
- Set the remote repository and decide whether a baseline release history is needed.
- Configure the GitHub App, branch protection, required checks, and release enablement.
- Enable indexing only for the public deployment.

## Troubleshooting

- Runtime or pnpm mismatch: use the versions declared by `.node-version` and `package.json`.
- Invalid environment: compare `.env.local` with `.env.example`; `SITE_URL` must be an origin.
- Font fetch fails during build: retry with working network access; Next fetches configured Google fonts at build time.
- Knip finding: remove stale code first; add a narrow configuration exception only when the usage is intentional.
- Hook restoration issue: preserve the working tree and staged state; do not discard changes automatically.
- CI-only ESLint failure: run `pnpm lint:eslint` locally because Oxlint intentionally covers a fast, overlapping subset.
