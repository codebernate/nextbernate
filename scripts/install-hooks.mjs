import { spawnSync } from "node:child_process"

if (process.env.CI || process.env.LEFTHOOK === "0") process.exit(0)

const git = spawnSync("git", ["rev-parse", "--git-dir"], { stdio: "ignore" })

if (git.status !== 0) process.exit(0)

const executable = process.platform === "win32" ? "lefthook.cmd" : "lefthook"
const result = spawnSync(executable, ["install"], {
  stdio: "inherit",
  shell: process.platform === "win32",
})

if (result.error) console.error(result.error.message)

process.exit(result.status ?? 1)
