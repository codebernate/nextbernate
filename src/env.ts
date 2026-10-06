import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const siteUrl = z.url().refine((value) => {
  try {
    const url = new URL(value)

    return (
      ["http:", "https:"].includes(url.protocol) &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}, "Use an HTTP(S) origin without a path, credentials, query, or fragment")

export const env = createEnv({
  server: {
    SITE_URL: siteUrl,
    SITE_INDEXABLE: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
  },
  client: {},
  runtimeEnv: {
    SITE_URL: process.env.SITE_URL,
    SITE_INDEXABLE: process.env.SITE_INDEXABLE,
  },
})
