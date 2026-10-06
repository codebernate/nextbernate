---
type: convention
tags: [convention, environment, seo]
---

# Environment and SEO

Copy `.env.example` to `.env.local` without overwriting existing values. Declare application environment in `src/env.ts` and consume the exported `env` object.

`SITE_URL` is an HTTP(S) origin without a path, query, fragment, or credentials. `SITE_INDEXABLE` accepts `true` and `false` and defaults to false. Rebuild when changing prerendered metadata.

For a public page, use `pageMetadata` with its actual pathname, add it to the explicit sitemap when discoverable, use page-specific canonicals, and add JSON-LD only for entities the page describes. Render JSON-LD through the existing serializer and component.

When indexing is off, pages emit noindex/nofollow, robots disallows crawling, and sitemap has no URLs. See [[architecture/overview]].
