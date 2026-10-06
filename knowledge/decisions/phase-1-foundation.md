---
type: decision
status: accepted
tags: [decision, foundation]
reviewed: 2026-10-06
---

# Phase 1 foundation

Nextbernate is a personal general-purpose boilerplate. Phase 1 establishes reusable foundations before business features.

| Decision                                    | Rationale                                  | Consequence                         |
| ------------------------------------------- | ------------------------------------------ | ----------------------------------- |
| Hybrid source layout                        | Simple routes and cohesive features        | Shared code needs judgment          |
| Oxlint/Oxfmt locally, ESLint in full checks | Fast iteration with complementary coverage | Two configurations need maintenance |
| Lefthook and Conventional Commits           | Consistent commits and release input       | Hooks preserve partial staging      |
| Knip in full checks                         | Avoid unused code and packages             | Components are added when used      |
| Version and changelog release commits       | Visible version history                    | Release bot needs controlled access |
| Explicit indexing                           | Preview builds stay non-indexable          | Public deployment enables indexing  |
| Project vault and local skill               | Knowledge travels with code                | Skill updates are deliberate        |
| Naming and decomposition as knowledge       | Preserve contextual judgment               | Guidelines do not block commits     |

The reviewed design is at `docs/superpowers/specs/2026-10-06-nextbernate-phase-1-design.md`. See [[architecture/overview]].
