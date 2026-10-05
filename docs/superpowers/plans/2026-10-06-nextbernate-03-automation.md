# Nextbernate Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyediakan CI wajib, pembaruan dependency, dan release berbasis Conventional Commits yang memperbarui package serta changelog.

**Architecture:** Satu workflow CI menjalankan checks pada PR dan push main; job release bergantung pada checks di commit push yang sama. PR hanya memperoleh akses baca. GitHub App digunakan hanya pada job release yang diaktifkan eksplisit. Dependabot membuka PR dan tidak melakukan auto-merge.

**Tech Stack:** GitHub Actions, commitlint, semantic-release, conventional-changelog-conventionalcommits, Dependabot, pnpm.

---

Prasyarat: checkpoint A dan B pada [rencana induk](2026-10-06-nextbernate-phase-1.md). Implementasi file tidak mengaktifkan settings atau secret remote secara otomatis.

## Peta file

| File | Tanggung jawab |
| --- | --- |
| `.github/workflows/ci.yml` | Quality checks, validasi judul PR, release setelah checks |
| `release.config.mjs` | Branch, parser, plugin, dan artefak release |
| `CHANGELOG.md` | Riwayat rilis yang dikelola plugin |
| `.github/dependabot.yml` | Jadwal dan kelompok pembaruan |
| `.github/PULL_REQUEST_TEMPLATE.md` | Konteks perubahan dan validasi |
| `README.md` | Aktivasi GitHub settings dan release |

## Task A1: CI checks dan validasi judul PR

**Files:** buat `.github/workflows/ci.yml`, `.github/PULL_REQUEST_TEMPLATE.md`.

- [ ] **Step 1: Verifikasi tag action resmi sebelum membuat workflow.** Gunakan repository action resmi untuk memastikan tag `actions/checkout@v7`, `actions/setup-node@v7`, dan `pnpm/action-setup@v6` tersedia dan compatible dengan runner GitHub-hosted. Versi ini berasal dari dokumentasi yang diperiksa saat planning; jika tag stabil berbeda saat eksekusi, gunakan tag resmi yang tersedia dan catat perubahan. Tidak ada alasan meng-upgrade pnpm aplikasi ke major baru hanya untuk menggunakan action.

- [ ] **Step 2: Buat workflow checks.** `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    types: [opened, synchronize, reopened, edited, ready_for_review]
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ci-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: false

env:
  CI: 'true'
  LEFTHOOK: '0'
  SITE_URL: https://example.com
  SITE_INDEXABLE: 'false'

jobs:
  quality:
    name: Quality checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v7
        with:
          node-version-file: .node-version
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm check

  pr-title:
    name: PR title
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v7
        with:
          node-version-file: .node-version
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Validate squash commit subject
        env:
          PR_TITLE: ${{ github.event.pull_request.title }}
        run: |
          node --input-type=module <<'JS'
          import { spawnSync } from 'node:child_process'
          const result = spawnSync('pnpm', ['exec', 'commitlint'], {
            input: process.env.PR_TITLE,
            encoding: 'utf8',
          })
          process.stdout.write(result.stdout ?? '')
          process.stderr.write(result.stderr ?? '')
          process.exit(result.status ?? 1)
          JS
```

PR title diperlakukan sebagai data stdin, bukan interpolasi ke shell. Event `edited` memvalidasi ulang judul. Tidak memakai `pull_request_target` untuk checkout dan menjalankan kode PR.

- [ ] **Step 3: Buat template PR singkat.** `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Change

Describe the problem and the resulting behavior.

## Validation

- [ ] `pnpm check` passed, or limitations are explained below.
- [ ] PR title follows Conventional Commits and describes the squash commit.

Record relevant checks and any remaining limitations.
```

Tidak menambahkan checklist wajib update knowledge pada setiap PR.

- [ ] **Step 4: Validasi workflow lokal.** Jalankan `actionlint .github/workflows/ci.yml` jika tersedia. Jika belum, gunakan distribusi resmi actionlint yang dipin untuk mesin saat ini di direktori temp; jangan menambah dependency runtime aplikasi. `actionlint` harus exit 0. Jalankan `pnpm check` dengan env CI di atas.

Uji input judul `feat: add setup`, `feat!: change setup`, `update`, serta judul dengan karakter shell. Valid/invalid status harus sesuai commitlint dan tidak mengeksekusi isi judul. Pengujian branch protection pada GitHub dicatat terpisah dari validasi YAML.

- [ ] **Step 5: Commit.**

```bash
pnpm format
git add .github/workflows/ci.yml .github/PULL_REQUEST_TEMPLATE.md
git commit -m 'ci: check pull requests and conventional titles'
```

## Task A2: Konfigurasi semantic-release

**Files:** buat `release.config.mjs`, `CHANGELOG.md`; ubah `package.json`, `pnpm-lock.yaml`.

- [ ] **Step 1: Install plugin eksplisit dengan versi kompatibel.**

```bash
pnpm view semantic-release engines
pnpm add -D --save-exact semantic-release @semantic-release/commit-analyzer @semantic-release/release-notes-generator @semantic-release/changelog @semantic-release/npm @semantic-release/git @semantic-release/github conventional-changelog-conventionalcommits
```

Plugin bawaan semantic-release tidak perlu dependency ganda bila resolusi package sudah mencukupi, tetapi direct dependencies di atas membuat import probe dan konfigurasi pnpm eksplisit. Periksa tidak ada major plugin yang bertentangan dengan versi semantic-release. Jalankan Knip dan pastikan plugin yang diacu config dikenali.

- [ ] **Step 2: Tulis release config.** `release.config.mjs`:

```js
export default {
  branches: ["main"],
  tagFormat: "v${version}",
  plugins: [
    ["@semantic-release/commit-analyzer", { preset: "conventionalcommits" }],
    ["@semantic-release/release-notes-generator", { preset: "conventionalcommits" }],
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
    ["@semantic-release/npm", { npmPublish: false }],
    ["@semantic-release/git", {
      assets: ["package.json", "pnpm-lock.yaml", "CHANGELOG.md"],
      message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
    }],
    ["@semantic-release/github", {
      successComment: false,
      failComment: false,
      releasedLabels: false,
    }],
  ],
}
```

Preset `conventionalcommits` wajib pada analyzer dan generator agar penanda `!` sesuai commitlint/squash workflow. Commit hanya artefak release dalam allowlist. Package tetap `private: true`. Tidak memerlukan `NPM_TOKEN` karena publikasi npm dimatikan.

`CHANGELOG.md` awal:

```markdown
# Changelog

Release notes are maintained automatically by semantic-release.
```

Tambahkan script manifest:

```json
{
  "release": "semantic-release",
  "release:dry": "semantic-release --dry-run"
}
```

- [ ] **Step 3: Uji klasifikasi commit secara lokal.** Simpan sementara `scripts/probe-release.mjs`:

```js
import assert from "node:assert/strict"
import { analyzeCommits } from "@semantic-release/commit-analyzer"

const logger = { log() {}, error() {}, success() {} }
for (const [message, expected] of [
  ["fix: correct canonical", "patch"],
  ["feat: add metadata", "minor"],
  ["feat!: change environment", "major"],
  ["chore(deps): update tooling", null],
  ["chore(release): 1.2.0 [skip ci]", null],
]) {
  const result = await analyzeCommits({ preset: "conventionalcommits" }, {
    cwd: process.cwd(),
    env: process.env,
    commits: [{ hash: "0123456789abcdef", message }],
    logger,
  })
  assert.equal(result, expected, message)
}
console.log("Release classification passed")
```

Jalankan `node scripts/probe-release.mjs`; expected seluruh kasus pass. Hapus probe setelah dicatat.

- [ ] **Step 4: Uji tahap prepare/commit/tag pada bare remote temporer.** Dry run tidak menjalankan prepare/publish, sehingga tidak membuktikan package/changelog berubah. Buat `scripts/probe-release-artifacts.mjs` sementara:

```js
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, symlinkSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { execFileSync } from "node:child_process"
import semanticRelease from "semantic-release"

const temporary = mkdtempSync(join(tmpdir(), "nextbernate-release-"))
const remote = join(temporary, "remote.git")
const remoteUrl = pathToFileURL(remote).href
const work = join(temporary, "work")
const git = (args, cwd = work) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim()
const plugin = (name) => fileURLToPath(import.meta.resolve(name))
const fixtureEnv = {
  ...process.env,
  LEFTHOOK: "0",
  npm_config_ignore_scripts: "true",
  GIT_AUTHOR_NAME: "Release Fixture",
  GIT_AUTHOR_EMAIL: "fixture@example.invalid",
  GIT_COMMITTER_NAME: "Release Fixture",
  GIT_COMMITTER_EMAIL: "fixture@example.invalid",
}
for (const key of ["GITHUB_TOKEN", "GH_TOKEN", "NPM_TOKEN", "GITHUB_ACTIONS", "CI"]) delete fixtureEnv[key]

try {
  mkdirSync(work)
  symlinkSync(join(process.cwd(), "node_modules"), join(work, "node_modules"), "junction")
  writeFileSync(join(work, ".gitignore"), "node_modules/\n")
  git(["init", "--bare", remote], temporary)
  git(["init", "-b", "main"])
  git(["config", "user.name", "Release Fixture"])
  git(["config", "user.email", "fixture@example.invalid"])
  git(["config", "commit.gpgsign", "false"])
  git(["remote", "add", "origin", remoteUrl])
  writeFileSync(join(work, "package.json"), JSON.stringify({ name: "release-fixture", version: "1.0.0", private: true }, null, 2) + "\n")
  writeFileSync(join(work, "CHANGELOG.md"), "# Changelog\n")
  git(["add", "package.json", "CHANGELOG.md", ".gitignore"])
  git(["commit", "-m", "chore: initialize fixture"])
  git(["tag", "v1.0.0"])
  writeFileSync(join(work, "change.txt"), "fix\n")
  git(["add", "change.txt"])
  git(["commit", "-m", "fix: verify release artifacts"])
  git(["push", "-u", "origin", "main", "--tags"])
  const result = await semanticRelease({
    ci: false,
    branches: ["main"],
    repositoryUrl: remoteUrl,
    plugins: [
      [plugin("@semantic-release/commit-analyzer"), { preset: "conventionalcommits" }],
      [plugin("@semantic-release/release-notes-generator"), {
        preset: "conventionalcommits",
        linkCompare: false,
        linkReferences: false,
      }],
      [plugin("@semantic-release/changelog"), { changelogFile: "CHANGELOG.md" }],
      [plugin("@semantic-release/npm"), { npmPublish: false }],
      [plugin("@semantic-release/git"), {
        assets: ["package.json", "CHANGELOG.md"],
        message: "chore(release): ${nextRelease.version} [skip ci]",
      }],
    ],
  }, { cwd: work, env: fixtureEnv })
  assert.ok(result)
  assert.equal(result.nextRelease.version, "1.0.1")
  assert.equal(JSON.parse(readFileSync(join(work, "package.json"), "utf8")).version, "1.0.1")
  assert.match(readFileSync(join(work, "CHANGELOG.md"), "utf8"), /1\.0\.1/)
  assert.match(git(["log", "-1", "--format=%s"]), /^chore\(release\): 1\.0\.1 \[skip ci\]$/)
  assert.equal(git(["tag", "--list", "v1.0.1"]), "v1.0.1")
  assert.equal(existsSync(join(work, "package-lock.json")), false)
  assert.match(git(["ls-remote", "--tags", "origin"]), /refs\/tags\/v1\.0\.1/)
  console.log("Local-only release artifacts passed")
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
```

Probe memakai URL `file://` untuk remote filesystem lokal agar parser repository URL tetap menerima URL valid. Symlink node_modules membuat preset Conventional Commits tersedia dari cwd fixture. Plugin GitHub tidak disertakan, dan credential publikasi dihapus dari environment fixture. Jangan mengarahkan probe ke remote asli. Perbaiki probe jika versi API yang dipasang berbeda sebelum menganggap task selesai.

Jalankan `node scripts/probe-release-artifacts.mjs`. Expected package/changelog/commit/tag berhasil pada fixture; tidak ada release npm/GitHub. Hapus probe setelah mencatat hasil.

- [ ] **Step 5: Periksa konsistensi lockfile dan format artefak.** Lockfile pnpm saat ini tidak menyimpan versi root sehingga bump package tidak semestinya mengubah dependency resolution. Jalankan `pnpm install --lockfile-only --ignore-scripts` pada disposable copy setelah bump dan pastikan tidak menciptakan lockfile npm atau mengubah dependency tanpa kebutuhan. Format generated changelog diperiksa menggunakan Oxfmt; jika output plugin tidak stabil, buat pengecualian formatter spesifik untuk `CHANGELOG.md` dengan alasan bahwa file dikelola generator.

- [ ] **Step 6: Commit konfigurasi yang sudah diverifikasi.**

```bash
pnpm format
pnpm knip
git add release.config.mjs CHANGELOG.md package.json pnpm-lock.yaml
git commit -m 'ci: configure versioned releases and changelog generation'
```

## Task A3: Hubungkan release setelah quality checks

**Files:** ubah `.github/workflows/ci.yml`, `README.md`.

- [ ] **Step 1: Tambahkan job release berikut pada workflow CI.**

```yaml
  release:
    name: Release
    needs: quality
    if: github.event_name == 'push' && github.ref == 'refs/heads/main' && vars.RELEASE_ENABLED == 'true'
    runs-on: ubuntu-latest
    concurrency:
      group: nextbernate-release-main
      cancel-in-progress: false
    steps:
      - uses: actions/create-github-app-token@v3
        id: app-token
        with:
          app-id: ${{ vars.RELEASE_APP_ID }}
          private-key: ${{ secrets.RELEASE_APP_PRIVATE_KEY }}
      - uses: actions/checkout@v7
        with:
          ref: ${{ github.sha }}
          fetch-depth: 0
          token: ${{ steps.app-token.outputs.token }}
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v7
        with:
          node-version-file: .node-version
          package-manager-cache: false
      - run: pnpm install --frozen-lockfile
      - name: Verify checked commit is still main
        run: |
          git fetch origin main
          test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"
      - name: Publish release
        run: pnpm release
        env:
          GITHUB_TOKEN: ${{ steps.app-token.outputs.token }}
          GIT_AUTHOR_NAME: nextbernate-release-bot
          GIT_AUTHOR_EMAIL: release-bot@users.noreply.github.com
          GIT_COMMITTER_NAME: nextbernate-release-bot
          GIT_COMMITTER_EMAIL: release-bot@users.noreply.github.com
```

Bot identity adalah konfigurasi boilerplate yang harus disesuaikan ke identitas App pada repository tujuan. Verifikasi tag resmi App-token action sebelum penggunaan. Workflow hanya mengakses secret pada push main, setelah quality lulus. Check `main` terbaru mencegah job lama merilis source yang tidak sama dengan commit yang diperiksa; job push terbaru akan memproses perubahan tersebut.

`RELEASE_ENABLED` default unset berarti job release tidak berjalan. README harus menjelaskan bahwa tag/release otomatis baru aktif setelah setup App dan branch protection selesai. Ini membuat repository hasil template tidak gagal karena secret yang belum tersedia.

- [ ] **Step 2: Verifikasi pencegahan loop dan batas artefak.** Commit release membawa `[skip ci]` dan tipe `chore(release)` tidak memicu bump baru. Quality job tetap wajib bagi perubahan aplikasi. Pastikan `@semantic-release/git` hanya stage tiga file allowlist dan bukan `src/`.

Uji workflow dengan actionlint. Jangan menjalankan `pnpm release` pada repo asli sebagai smoke test. `pnpm release:dry` terhadap repo asli hanya boleh digunakan ketika remote/credential memang tersedia dan tidak menampilkan secret; ia tidak menggantikan fixture prepare pada A2.

- [ ] **Step 3: Tulis petunjuk aktivasi GitHub di README.** Instruksi harus mencakup:

1. Buat GitHub App khusus repository dengan permission Contents write, dan permission lain hanya bila fitur plugin GitHub yang diaktifkan memerlukannya.
2. Install App hanya pada repository yang dimaksud.
3. Isi `RELEASE_APP_ID`, secret `RELEASE_APP_PRIVATE_KEY`, dan kemudian `RELEASE_ENABLED=true`.
4. Tambahkan App sebagai aktor bypass terbatas pada aturan branch/ruleset yang menghalangi commit artefak release. Developer biasa tetap melalui PR/checks.
5. Aktifkan squash merge dan gunakan judul PR sebagai default squash subject.
6. Jadikan `Quality checks` dan `PR title` required checks; branch release memerlukan pengecualian bot yang eksplisit.
7. Repo baru dari template tidak membawa release tags. semantic-release default memulai release pertama di `1.0.0` ketika belum ada release terdahulu; versi package awal tidak menjadi histori release. Jelaskan opsi membuat baseline tag hanya jika sengaja melanjutkan versi yang sudah pernah dirilis.
8. Pemulihan kegagalan release: inspeksi commit, tag, GitHub Release yang sudah terbentuk sebelum retry; jangan otomatis menghapus tag atau force-push.

- [ ] **Step 4: Commit.**

```bash
pnpm format
git add .github/workflows/ci.yml README.md
git commit -m 'ci: release checked main commits with a dedicated bot'
```

Aktivasi setting/secrets remote adalah langkah operasional terpisah, bukan prasyarat untuk menulis dan menguji konfigurasi lokal.

## Task A4: Dependabot dan checkpoint otomasi

**Files:** buat `.github/dependabot.yml`; ubah README bila diperlukan.

- [ ] **Step 1: Tulis konfigurasi Dependabot.**

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
      time: '09:00'
      timezone: Asia/Jakarta
    open-pull-requests-limit: 5
    commit-message:
      prefix: chore
      include: scope
    groups:
      nextjs:
        patterns: [next, eslint-config-next]
      react:
        patterns: [react, react-dom, '@types/react', '@types/react-dom']
      minor-patch:
        patterns: ['*']
        exclude-patterns: [next, eslint-config-next, react, react-dom, '@types/react', '@types/react-dom']
        update-types: [minor, patch]
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
      day: monday
      time: '09:00'
      timezone: Asia/Jakarta
    open-pull-requests-limit: 5
    commit-message:
      prefix: ci
      include: scope
    groups:
      minor-patch:
        patterns: ['*']
        update-types: [minor, patch]
```

Kelompok Next.js dan React adalah pengecualian grouping major yang disengaja: paket terkait harus tetap selaras dan direview sebagai satu perubahan keluarga. Major dependency lain tetap PR tersendiri. Tidak ada workflow auto-merge. Jangan menganggap jadwal version updates otomatis membuktikan security update settings akun sudah aktif.

- [ ] **Step 2: Verifikasi konfigurasi.** Parse YAML dengan validator/editor schema GitHub yang tersedia, jalankan Oxfmt check, dan cocokkan ecosystem npm dengan pnpm lockfile. Periksa grouping Next.js tidak terpecah oleh kelompok catch-all. Judul Dependabot dengan prefix chore/ci harus diterima commitlint.

- [ ] **Step 3: Checkpoint C dan commit.**

```bash
pnpm format
pnpm check
git diff --check
git add .github/dependabot.yml README.md
git commit -m 'ci: schedule grouped dependency updates'
```

Laporkan terpisah: workflow valid lokal, fixture release lulus, dan settings GitHub belum diaktifkan bila memang belum diminta. Jangan menyatakan release otomatis aktif hanya karena file YAML sudah dibuat.

## Referensi

- [GitHub Actions setup-node](https://github.com/actions/setup-node)
- [pnpm action-setup](https://github.com/pnpm/action-setup)
- [Commit analyzer presets](https://github.com/semantic-release/commit-analyzer)
- [Release asset commit](https://github.com/semantic-release/git)
- [Version without npm publishing](https://github.com/semantic-release/npm)
- [Dependabot options](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference)
