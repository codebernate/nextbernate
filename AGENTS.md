# Project workflow

Use the runtime and package manager declared in `.node-version` and `package.json`.

Before changing code, read `knowledge/index.md` and the notes relevant to the task.
Run `pnpm check` before reporting an implementation complete. Report any failed or blocked check with its cause.
Use Conventional Commits. PR titles become squash commit subjects.
Preserve user changes and partial staging. Do not disable checks to conceal failures.

For knowledge work, read `.agents/skills/obsidian-second-brain/SKILL.md` and use `knowledge/` as the vault root.
Update relevant existing notes when accepted decisions or actual code changes affect them.
Do not create a session log for every small change.

Naming and decomposition guidance lives in `knowledge/conventions/code-organization.md`.
These are contextual guidelines; phase 1 does not add mechanical architecture or naming gates.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
