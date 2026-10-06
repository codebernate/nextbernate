import type { MetadataRoute } from "next"
import { site } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.indexable) return []

  return ["/"].map((pathname) => ({
    url: new URL(pathname, site.url).toString(),
  }))
}
