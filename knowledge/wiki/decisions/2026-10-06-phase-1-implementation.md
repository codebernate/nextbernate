---
date: 2026-10-06
type: decision
tags: [decision, phase-1, tooling, architecture, seo, release, knowledge]
related-projects: ["[[wiki/projects/Nextbernate]]"]
confidence: stated
sources:
  - "docs/superpowers/specs/2026-10-06-nextbernate-phase-1-design.md"
  - "docs/superpowers/plans/2026-10-06-nextbernate-phase-1.md"
  - "20d0d4375f8134a0bf2a12d6157cf2b40f403208"
  - "2d1509d1870004ebe26500b3b0986825210f4554"
  - "2b90680bfcb0d99bc734149d8bdbc693d9dd192e"
  - "7ec89ad82c478defc60f0e7622a0aff02e62a1d4"
  - "81839dc8f9b957ae1c1cb9b58a45e4e8e2765a87"
  - "ba51c6130f0314449e16813cd72ac681536a95b7"
  - "e8693983c867c6bbbf8bfda714ee82546fa98682"
  - "b672fffe09675ecba7f2da4067ef7b8ef2e20e18"
  - "62899b320dde14ee18767fd60119947acf136703"
ai-first: true
---

## For future agent

This decision records the Phase 1 implementation choices accepted for [[wiki/projects/Nextbernate]] on 2026-10-06. It links the durable project policy to the commits that implemented it; executable configuration and source remain authoritative. The local default branch was renamed to `main` on the same date, while remote hosting settings remain outside this repository state.

# Phase 1 implementation decisions

## Context

[[wiki/projects/Nextbernate]] is a personal Next.js boilerplate. Phase 1 established its source layout, quality workflow, public-site configuration, release workflow, and repository-local knowledge system before business features are added.

## Decisions

| Decision                  | Accepted implementation                                                                                                                                                                                                 | Rationale and consequence                                                                                                                                         | Provenance                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Source layout             | Use the hybrid, `src/`-based layout: routes remain in `src/app`; feature code stays local; shared modules move to `src/components`, `src/hooks`, or `src/lib` when genuinely shared; `@/` resolves to `src/*`.          | Keeps routing legible without creating speculative feature abstractions. Naming and file-splitting guidance stays contextual knowledge rather than a commit gate. | `20d0d4375f8134a0bf2a12d6157cf2b40f403208`; [[conventions/code-organization]]                                                |
| Local and full linting    | Run Oxc tools locally: Oxlint supplies editor and pre-commit feedback, Oxfmt owns formatting, and ESLint runs as a complementary full check.                                                                            | Fast feedback remains available while ESLint retains rules or plugin behavior that Oxlint does not cover. The two configurations need maintenance.                | `2d1509d1870004ebe26500b3b0986825210f4554`; [[conventions/development-workflow]]                                             |
| Commit workflow           | Replace Husky with Lefthook. Use commitlint for Conventional Commit validation and Commitizen through `pnpm commit`.                                                                                                    | Pre-commit checks target staged files and preserve partial staging; valid commit semantics feed CI and release automation.                                        | `2b90680bfcb0d99bc734149d8bdbc693d9dd192e`; [[conventions/development-workflow]]                                             |
| Unused-code checks        | Include Knip in the full project check.                                                                                                                                                                                 | Unused files, exports, and dependencies are treated as project-quality findings; exclusions must stay specific to real runtime configuration.                     | `7ec89ad82c478defc60f0e7622a0aff02e62a1d4`; [[conventions/development-workflow]]                                             |
| Environment configuration | Use T3 Env and Zod in `src/env.ts` for application environment, with `SITE_URL` as a validated HTTP(S) origin and explicit `SITE_INDEXABLE` parsing.                                                                    | Build and development fail on invalid required configuration instead of allowing inconsistent public metadata.                                                    | `81839dc8f9b957ae1c1cb9b58a45e4e8e2765a87`; [[conventions/environment-and-seo]]                                              |
| Indexing policy           | Treat indexing as an explicit deployment setting. A false `SITE_INDEXABLE` emits noindex/nofollow, disallows crawling, and serves an empty sitemap; true enables public metadata, crawl access, and listed public URLs. | Preview deployments remain non-indexable until intentionally enabled. This is an indexing policy, not authentication.                                             | `ba51c6130f0314449e16813cd72ac681536a95b7`; [[conventions/environment-and-seo]]                                              |
| Release workflow          | Use semantic-release after checked `main` commits to create version and changelog artifacts, tags, and GitHub releases. Keep the package private and set npm publishing to false.                                       | Version history remains visible without publishing the boilerplate to npm. Release automation requires the configured bot permissions in the hosting repository.  | `e8693983c867c6bbbf8bfda714ee82546fa98682`; `b672fffe09675ecba7f2da4067ef7b8ef2e20e18`; [[conventions/development-workflow]] |
| Knowledge workflow        | Keep the project vault in `knowledge/`; bundle the project skill; update relevant knowledge for accepted decisions and actual code changes.                                                                             | Knowledge travels with the codebase while naming and decomposition remain guidance, not mechanical lint or CI rules.                                              | `62899b320dde14ee18767fd60119947acf136703`; [[conventions/knowledge-workflow]]                                               |
| Local default branch      | Rename the local integration branch from `master` to `main`.                                                                                                                                                            | Local branch naming now matches the CI and semantic-release target. Remote default-branch changes require a hosting-repository action.                            | Repository state observed on 2026-10-06: `git branch --show-current` returned `main`.                                        |

## Consequences

- Use the scripts and checks documented in [[conventions/development-workflow]] before claiming implementation completion.
- Read [[conventions/environment-and-seo]] before changing public metadata, environment variables, or indexing behavior.
- Apply [[conventions/code-organization]] as review guidance; do not introduce a mechanical naming or architecture gate solely because this decision exists.
- Treat the reviewed design and implementation plans as design provenance, not executable configuration: `docs/superpowers/specs/2026-10-06-nextbernate-phase-1-design.md` and `docs/superpowers/plans/2026-10-06-nextbernate-phase-1.md`.

## Evidence

- Source-layout implementation: commit `20d0d4375f8134a0bf2a12d6157cf2b40f403208` (`refactor: establish src-based project structure`).
- Tooling implementation: commits `2d1509d1870004ebe26500b3b0986825210f4554`, `2b90680bfcb0d99bc734149d8bdbc693d9dd192e`, and `7ec89ad82c478defc60f0e7622a0aff02e62a1d4`.
- Environment and indexing implementation: commits `81839dc8f9b957ae1c1cb9b58a45e4e8e2765a87` and `ba51c6130f0314449e16813cd72ac681536a95b7`.
- Release and operating-workflow implementation: commits `e8693983c867c6bbbf8bfda714ee82546fa98682`, `b672fffe09675ecba7f2da4067ef7b8ef2e20e18`, and `62899b320dde14ee18767fd60119947acf136703`.
