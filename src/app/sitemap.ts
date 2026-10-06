import type { MetadataRoute } from "next"
import { site } from "@/lib/site"
import { createSitemap } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  return createSitemap(site)
}
