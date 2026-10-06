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
