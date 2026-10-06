import { env } from "@/env"

export const site = {
  name: "Nextbernate",
  description: "A Next.js starter for building your next project.",
  language: "en",
  locale: "en_US",
  url: new URL(env.SITE_URL).origin,
  indexable: env.SITE_INDEXABLE,
  socialImage: "/opengraph-image",
}
