import { spawnSync } from "node:child_process"

const files = process.argv.slice(2).filter((file) => {
  if (file === "pnpm-lock.yaml") return false
  if (file.startsWith(".agents/skills/")) return false
  if (file.includes("/.obsidian/")) return false
  return /\.(?:[cm]?[jt]sx?|jsonc?|ya?ml|css|mdx?)$/.test(file)
})

if (files.length === 0) process.exit(0)

const result = spawnSync("pnpm", ["exec", "oxfmt", "--write", ...files], {
  stdio: "inherit",
})

process.exit(result.status ?? 1)
