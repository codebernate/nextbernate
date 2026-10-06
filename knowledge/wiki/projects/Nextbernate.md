---
date: 2026-10-06
updated: 2026-10-06
type: project
status: active
tags: [project, nextbernate, boilerplate, nextjs]
related-people: []
related-projects: []
repo: /home/acn/nextbernate
ai-first: true
---

## For future agent

Nextbernate is an active personal general-purpose Next.js boilerplate as of 2026-10-06. Phase 1 established its source layout, quality gates, release automation, SEO foundations, and repository-local knowledge workflow; executable behavior remains authoritative in the repository configuration and source.

## Overview

- Purpose: reusable Next.js boilerplate before product-specific features.
- Phase 1 implementation entered `main` through merge commit `2182185d3945e5bd00d6cff24ee1d0dec011bcf7` (`chore: merge phase one boilerplate`) on 2026-10-06.
- The local default branch was renamed from `master` to `main` immediately after that merge on 2026-10-06.
- Source pointers: local Git commits `20d0d4375f8134a0bf2a12d6157cf2b40f403208` through `9b5ae0c364f8662716ed94e0aefb20abd9a2e358`; merge parents are `29bf30f90bfa391657743aa5fcf7263427ab6207` and `9b5ae0c364f8662716ed94e0aefb20abd9a2e358`.

## Current foundation

- `src/` source layout with `@/` absolute imports.
- Oxfmt and Oxlint for local feedback, complementary ESLint checks, Lefthook, Commitizen, commitlint, and Knip.
- T3 Env validation, site metadata, JSON-LD, Open Graph image generation, sitemap, and robots controls.
- GitHub CI, semantic-release configuration, and grouped Dependabot updates.
- Project-local vault and agent workflow documented in [[conventions/knowledge-workflow]], with technical guidance in [[architecture/overview]], [[conventions/development-workflow]], and [[decisions/phase-1-foundation]].

## Recent activity

- [[wiki/logs/2026-10-06 - Nextbernate]] records the Phase 1 implementation, review, merge, and verification details for 2026-10-06.

## Key decisions

- The accepted Phase 1 decisions are maintained in [[decisions/phase-1-foundation]].
