import { createEnv } from "@t3-oss/env-nextjs"
import {
  siteIndexableSchema,
  siteUrlSchema,
} from "./lib/environment-validation"

export const env = createEnv({
  server: {
    SITE_URL: siteUrlSchema,
    SITE_INDEXABLE: siteIndexableSchema,
  },
  client: {},
  runtimeEnv: {
    SITE_URL: process.env.SITE_URL,
    SITE_INDEXABLE: process.env.SITE_INDEXABLE,
  },
})
