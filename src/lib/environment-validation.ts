import { z } from "zod"

export const siteUrlSchema = z.url().refine((value) => {
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

export const siteIndexableSchema = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true")
