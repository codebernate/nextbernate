---
type: convention
tags: [convention, architecture]
---

# Code organization

These are contextual design guidelines, not additional commit-blocking rules.

## Placement

- `src/app` owns routing, layouts, metadata routes, and page composition.
- Keep feature-specific UI and logic together under `src/features/<feature>` when a feature needs several related files.
- Use `src/components`, `src/hooks`, and `src/lib` for code shared across real consumers.
- Do not create empty feature folders or speculative abstractions.
- Prefer `@/` imports for application modules; phase 1 does not encode folder boundaries as lint policy.

## Names and splitting

- Prefer kebab-case filenames, PascalCase component/type names, and camelCase functions and variables.
- Name hooks with `use`; name functions by behavior, such as `serializeJsonLd`.
- Keep Next.js conventions such as `page.tsx` and `robots.ts` intact.
- Split when responsibilities, dependencies, or reasons for change differ. File length alone is a review signal, not a limit.
- Start with Server Components and keep client boundaries narrow, serializable, and free of server environment.

See [[architecture/overview]] and [[decisions/phase-1-foundation]].
