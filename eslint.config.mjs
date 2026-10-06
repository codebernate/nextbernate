import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import oxlint from "eslint-plugin-oxlint"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    ".agents/skills/**",
  ]),
  ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
])

export default eslintConfig
