---
type: architecture
tags: [architecture]
reviewed: 2026-10-06
---

# Architecture overview

Nextbernate is a Next.js App Router starter using React, TypeScript, Tailwind v4, shadcn/Base UI, and next-themes.

| Module                              | Responsibility                                      |
| ----------------------------------- | --------------------------------------------------- |
| `src/app`                           | Routes, layout, homepage, and metadata routes       |
| `src/components`                    | Reusable rendering and theme provider               |
| `src/env.ts`                        | Validated application environment wiring            |
| `src/lib/environment-validation.ts` | Reusable environment schemas                        |
| `src/lib/site.ts`                   | Site identity and indexing state                    |
| `src/lib/metadata.ts`               | Root and page metadata                              |
| `src/lib/seo.ts`                    | Testable page metadata, robots, and sitemap helpers |
| `src/lib/theme-keyboard.ts`         | Pure theme shortcut decision logic                  |
| `src/lib/json-ld.ts`                | Safe JSON-LD serialization                          |
| `knowledge`                         | Project conventions and decisions                   |

Flow: environment validation -> site configuration -> page metadata and public metadata endpoints. The theme provider is a client boundary; metadata and server configuration remain server-side.

See [[conventions/environment-and-seo]] and [[decisions/phase-1-foundation]].
