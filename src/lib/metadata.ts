import type { Metadata } from "next"
import { site } from "@/lib/site"
import { createPageMetadata } from "@/lib/seo"

export const rootMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  robots: { index: site.indexable, follow: site.indexable },
}

export function pageMetadata({
  pathname,
  title,
  description = site.description,
}: {
  pathname: `/${string}`
  title?: string
  description?: string
}): Metadata {
  return createPageMetadata(site, { pathname, title, description })
}
