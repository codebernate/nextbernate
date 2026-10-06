import type { MetadataRoute } from "next"
import { site } from "@/lib/site"
import { createRobots } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return createRobots(site)
}
