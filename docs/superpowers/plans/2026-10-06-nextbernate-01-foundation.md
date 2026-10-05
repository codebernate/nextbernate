# Nextbernate Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memindahkan aplikasi ke `src/` dan menyediakan pemeriksaan lokal yang cepat serta pemeriksaan lengkap yang konsisten.

**Architecture:** Pertahankan UI starter dan stack terpasang. Oxlint/Oxfmt menangani iterasi cepat, ESLint menjalankan rule pelengkap, dan Knip memeriksa penggunaan kode. Lefthook menjalankan hook tanpa proses interaktif tersembunyi.

**Tech Stack:** Node 24.15.0, pnpm 10.33.2, Next.js, Oxlint, Oxfmt, ESLint, Lefthook, commitlint, Commitizen, Knip.

---

Prasyarat: baca [rencana induk](2026-10-06-nextbernate-phase-1.md). Dokumentasi Next.js: `01-app/03-api-reference/03-file-conventions/src-folder.md` dan `01-app/03-api-reference/05-config/03-eslint.md`, relatif terhadap `node_modules/next/dist/docs/`.

## Peta file

| File | Tanggung jawab |
| --- | --- |
| `src/app/`, `src/components/`, `src/lib/` | Source aplikasi yang dipindahkan |
| `tsconfig.json`, `components.json` | Alias dan lokasi stylesheet shadcn |
| `.node-version`, `.npmrc`, `package.json`, `pnpm-lock.yaml` | Runtime, package manager, dan dependency |
| `.oxlintrc.json`, `.oxfmtrc.json`, `eslint.config.mjs` | Pembagian rule dan formatter |
| `.editorconfig`, `.vscode/settings.json`, `.vscode/extensions.json` | Perilaku editor |
| `lefthook.yml`, `commitlint.config.mjs` | Hook dan validasi commit |
| `knip.json` | Analisis penggunaan kode |
| `scripts/install-hooks.mjs` | Install hook dengan guard CI dan non-Git archive |

## Task F1: Runtime dan migrasi source

**Files:** pindahkan `app/` ke `src/app/`, `components/` ke `src/components/`, dan `lib/` ke `src/lib/`; ubah `tsconfig.json`, `components.json`, `package.json`, `.gitignore`; buat `.node-version`, `.npmrc`.

- [ ] **Step 1: Rekam baseline sebelum edit.**

```bash
git status --short
node --version
pnpm --version
pnpm typecheck
pnpm lint
pnpm build
```

Catat error yang sudah ada, termasuk import `Geist` tidak terpakai dan potensi kegagalan fetch Google Fonts di jaringan terbatas. Jangan menganggap baseline gagal akibat perubahan task.

- [ ] **Step 2: Tetapkan runtime yang teramati.** Buat `.node-version` berisi `24.15.0` dan `.npmrc` berisi `engine-strict=true`. Ubah field manifest berikut, mempertahankan field lain:

```json
{
  "packageManager": "pnpm@10.33.2",
  "engines": { "node": ">=24.15.0 <25", "pnpm": "10.33.2" }
}
```

Jalankan `pnpm add -D --save-exact @types/node@24` untuk menyelaraskan tipe Node. Lockfile mencatat exact resolution.

- [ ] **Step 3: Pindahkan source dan hapus placeholder folder kosong.**

```bash
mkdir -p src
git mv app src/app
git mv components src/components
git mv lib src/lib
git rm src/components/.gitkeep src/lib/.gitkeep hooks/.gitkeep
```

Jangan pindahkan `public/`, file konfigurasi root, atau `.env`. Jangan buat `features/` dan `hooks/` kosong.

- [ ] **Step 4: Perbarui konfigurasi melalui transform terarah.**

```bash
node --input-type=module <<'JS'
import { readFileSync, writeFileSync } from 'node:fs'
const ts = JSON.parse(readFileSync('tsconfig.json', 'utf8'))
ts.compilerOptions.paths = { '@/*': ['./src/*'] }
writeFileSync('tsconfig.json', JSON.stringify(ts, null, 2) + '\n')
const ui = JSON.parse(readFileSync('components.json', 'utf8'))
ui.tailwind.css = 'src/app/globals.css'
writeFileSync('components.json', JSON.stringify(ui, null, 2) + '\n')
JS
```

Di `src/app/layout.tsx`, hapus `Geist` dari import font yang tidak dipakai. Pertahankan `Inter`, `Geist_Mono`, ThemeProvider, dan perilaku tema. Tambahkan pengecualian `.env.example`, ignore `knowledge/.obsidian/`, `.pnpm-store/`, dan `lefthook-local.yml` pada `.gitignore` tanpa menghapus pola existing.

- [ ] **Step 5: Verifikasi migrasi lalu commit.**

```bash
pnpm typecheck
pnpm build
git diff --check
git add src tsconfig.json components.json package.json pnpm-lock.yaml .node-version .npmrc .gitignore
git commit -m 'refactor: establish src-based project structure'
```

`git mv` dan `git rm` sudah men-stage rename/penghapusan source lama. Hasil: source hanya di `src/`, alias resolve, dan homepage tetap berfungsi.

## Task F2: Oxfmt dan pembagian lint

**Files:** buat `.oxlintrc.json`, `.oxfmtrc.json`, `.editorconfig`, `.vscode/settings.json`, `.vscode/extensions.json`; ubah `eslint.config.mjs`, `package.json`, `pnpm-lock.yaml`; hapus `.prettierrc`, `.prettierignore` setelah konfigurasi pengganti bekerja.

- [ ] **Step 1: Install tool dan periksa versi/engines.**

```bash
pnpm view oxlint engines
pnpm view oxfmt engines
pnpm add -D --save-exact oxlint oxfmt eslint-plugin-oxlint
```

Jangan mengubah `eslint-config-next` di luar versi yang selaras dengan Next.js. Periksa `pnpm exec oxlint --help` dan schema package untuk opsi di bawah.

- [ ] **Step 2: Tulis konfigurasi Oxlint.** `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "react", "nextjs", "jsx-a11y", "import"],
  "categories": { "correctness": "error" },
  "rules": {
    "no-debugger": "error",
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "warn",
    "typescript/no-explicit-any": "off"
  },
  "ignorePatterns": [".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts", ".agents/skills/**"]
}
```

`no-explicit-any` tetap dimiliki preset ESLint TypeScript; ia tidak termasuk pemeriksaan correctness cepat yang dipilih. Jangan mengklaim rule ini tidak didukung Oxlint. Pembagian ditentukan konfigurasi aktif, bukan angka cakupan atau dugaan dukungan plugin.

- [ ] **Step 3: Tulis ESLint pelengkap.** Ganti `eslint.config.mjs`:

```js
import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import oxlint from "eslint-plugin-oxlint"

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**", "out/**", "build/**", "coverage/**",
    "next-env.d.ts", ".agents/skills/**",
  ]),
  ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
])
```

Jalankan `pnpm exec eslint --print-config src/app/page.tsx` dan inspeksi rule aktif. Pastikan `@typescript-eslint/no-explicit-any` aktif, dan `no-debugger` dinonaktifkan hanya di ESLint. Jika mapping package berbeda, sesuaikan deduplikasi berdasarkan actual config, tanpa memakai preset yang mematikan semua rule yang sekadar tersedia di Oxlint.

- [ ] **Step 4: Tulis formatter dan editor.** `.oxfmtrc.json`:

```json
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "semi": false,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "endOfLine": "lf",
  "proseWrap": "preserve",
  "sortImports": false,
  "sortTailwindcss": {
    "stylesheet": "./src/app/globals.css",
    "functions": ["cn", "cva"]
  },
  "ignorePatterns": [
    "node_modules/**", ".next/**", "out/**", "build/**", "coverage/**",
    "pnpm-lock.yaml", "next-env.d.ts", ".agents/skills/**",
    "knowledge/.obsidian/**"
  ]
}
```

`.editorconfig`:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

`.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "oxc.oxc-vscode",
  "editor.formatOnSave": true,
  "eslint.enable": false,
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "javascript.preferences.importModuleSpecifier": "non-relative"
}
```

`.vscode/extensions.json`:

```json
{ "recommendations": ["oxc.oxc-vscode", "EditorConfig.EditorConfig"] }
```

- [ ] **Step 5: Update script dan hapus formatter lama.** Field scripts sementara:

```json
{
  "lint": "oxlint --max-warnings=0 .",
  "lint:eslint": "eslint --max-warnings=0 .",
  "format": "oxfmt --write .",
  "format:check": "oxfmt --check .",
  "typecheck": "next typegen && tsc --noEmit"
}
```

`next typegen` menghasilkan tipe route untuk fresh clone sebelum `tsc`; tidak menggantikan typecheck. Konfirmasi CLI lokal dengan `pnpm exec next typegen --help`.

```bash
pnpm remove prettier prettier-plugin-tailwindcss
git rm .prettierrc .prettierignore
pnpm format
pnpm format:check
pnpm lint
pnpm lint:eslint
```

- [ ] **Step 6: Verifikasi ownership rule dengan fixture temporer di `src/`.** File `src/lint-probe.ts` pertama:

```ts
export function probe() {
  debugger
  return 1
}
```

`pnpm exec oxlint src/lint-probe.ts` harus gagal untuk `no-debugger`. Ganti isi dengan:

```ts
export function probe(value: any) {
  return value
}
```

Oxlint harus lolos untuk fixture kedua, ESLint harus gagal untuk `@typescript-eslint/no-explicit-any`. Hapus fixture tersebut. Periksa React Hooks dan Next.js rules dari resolved config; modern Oxlint juga mendukung banyak rule React Compiler, jadi jangan menggandakan rule atas asumsi lama.

- [ ] **Step 7: Commit konfigurasi dan perubahan format yang direview.**

```bash
git diff --check
git add .oxlintrc.json .oxfmtrc.json .editorconfig .vscode eslint.config.mjs package.json pnpm-lock.yaml src tsconfig.json components.json next.config.ts postcss.config.mjs
git commit -m 'chore: configure oxc and complementary eslint checks'
```

Sertakan penghapusan file Prettier dan file lain yang benar-benar berubah akibat formatter setelah inspeksi; jangan memasukkan perubahan pengguna yang tidak terkait.

## Task F3: Lefthook, commitlint, dan Commitizen

**Files:** buat `lefthook.yml`, `commitlint.config.mjs`, `scripts/install-hooks.mjs`; ubah `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` bila build script dependency perlu diizinkan.

- [ ] **Step 1: Install dependency.**

```bash
pnpm add -D --save-exact lefthook @commitlint/cli @commitlint/config-conventional commitizen cz-conventional-changelog
```

Periksa output pnpm untuk lifecycle yang diblokir. Jika Lefthook memerlukan lifecycle package agar binary tersedia, izinkan hanya `lefthook` pada `allowBuilds` setelah memeriksa script package. Pertahankan allowlist existing, jangan mengaktifkan semua build script.

- [ ] **Step 2: Buat konfigurasi commitlint.** `commitlint.config.mjs`:

```js
export default {
  extends: ["@commitlint/config-conventional"],
}
```

Tambahkan field manifest:

```json
{
  "scripts": {
    "prepare": "node scripts/install-hooks.mjs",
    "commit": "cz"
  },
  "config": {
    "commitizen": { "path": "cz-conventional-changelog" }
  }
}
```

- [ ] **Step 3: Buat installer hook.** `scripts/install-hooks.mjs`:

```js
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
```

- [ ] **Step 4: Buat hook sequential.** `lefthook.yml`:

```yaml
pre-commit:
  parallel: false
  commands:
    format:
      priority: 1
      glob: '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts,json,jsonc,yml,yaml,css,md,mdx}'
      exclude: '(^|/)(node_modules|\.next|\.obsidian)/|^\.agents/skills/|^pnpm-lock\.yaml$'
      run: pnpm exec oxfmt --write {staged_files}
      stage_fixed: true
    lint:
      priority: 2
      glob: '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'
      exclude: '^\.agents/skills/'
      run: pnpm exec oxlint --max-warnings=0 {staged_files}

commit-msg:
  commands:
    conventional:
      run: pnpm exec commitlint --edit {1}
```

Use native Lefthook handling, bukan script `git add` seluruh working tree. Verifikasi perilaku versi yang dipin sebelum menerima konfigurasi.

- [ ] **Step 5: Uji valid/invalid message tanpa membuat commit project.**

```bash
node --input-type=module <<'JS'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
for (const [message, valid] of [['feat: add setup', true], ['feat!: change setup', true], ['update stuff', false]]) {
  const result = spawnSync('pnpm', ['exec', 'commitlint'], { input: message, encoding: 'utf8' })
  assert.equal(result.status === 0, valid, result.stdout + result.stderr)
}
JS
```

Jalankan `pnpm commit` di disposable checkout dan verifikasi wizard menghasilkan pesan yang diterima commitlint. Cancel wizard tidak boleh membuat commit.

- [ ] **Step 6: Uji staging pada disposable repository.** Buat direktori temp melalui `mktemp -d`, `git init`, atur identitas Git lokal test, salin konfigurasi hook/formatter/linter serta stylesheet, dan hubungkan `node_modules` project. Install Lefthook di repo test tersebut. Jangan lakukan fixture staging pada source pengguna.

Mulai dengan probe native Node berikut sebagai `scripts/probe-staging.mjs` sementara. Probe membuat Git repository independen di direktori temp dan tidak mengubah index repository project:

```js
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, symlinkSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { spawnSync } from "node:child_process"

const source = process.cwd()
const temporary = mkdtempSync(join(tmpdir(), "nextbernate-staging-"))
const environment = { ...process.env }
delete environment.LEFTHOOK
delete environment.CI
const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: temporary, env: environment, encoding: "utf8" })
  assert.equal(result.status, 0, result.stdout + result.stderr)
  return result.stdout
}
try {
  mkdirSync(join(temporary, "src/app"), { recursive: true })
  for (const name of ["lefthook.yml", "commitlint.config.mjs", ".oxlintrc.json", ".oxfmtrc.json"]) {
    copyFileSync(join(source, name), join(temporary, name))
  }
  copyFileSync(join(source, "src/app/globals.css"), join(temporary, "src/app/globals.css"))
  symlinkSync(join(source, "node_modules"), join(temporary, "node_modules"), "junction")
  writeFileSync(join(temporary, ".gitignore"), "node_modules/\n")
  writeFileSync(join(temporary, "package.json"), JSON.stringify({ private: true, type: "module", packageManager: "pnpm@10.33.2" }) + "\n")
  const base = "export const first = 1\n\n" +
    Array.from({ length: 30 }, (_, index) => `// spacer ${index}\n`).join("") +
    "\nexport const second = 1\n"
  writeFileSync(join(temporary, "src/probe.js"), base)
  writeFileSync(join(temporary, "unrelated.txt"), "base\n")
  run("git", ["init", "-b", "main"])
  run("git", ["config", "user.name", "Staging Fixture"])
  run("git", ["config", "user.email", "fixture@example.invalid"])
  run("git", ["config", "commit.gpgsign", "false"])
  run("git", ["add", "."])
  run("git", ["commit", "-m", "chore: initialize staging fixture"])
  run("pnpm", ["exec", "lefthook", "install"])
  writeFileSync(join(temporary, "src/probe.js"), base.replace("first = 1", "first=2"))
  run("git", ["add", "src/probe.js"])
  writeFileSync(join(temporary, "src/probe.js"), base.replace("first = 1", "first=2").replace("second = 1", "second = 2"))
  writeFileSync(join(temporary, "unrelated.txt"), "local-only\n")
  run("git", ["commit", "-m", "fix: verify partial staging"])
  const committed = run("git", ["show", "HEAD:src/probe.js"])
  const current = readFileSync(join(temporary, "src/probe.js"), "utf8")
  assert.match(committed, /first = 2/)
  assert.match(committed, /second = 1/)
  assert.match(current, /second = 2/)
  assert.equal(run("git", ["show", "HEAD:unrelated.txt"]), "base\n")
  assert.equal(readFileSync(join(temporary, "unrelated.txt"), "utf8"), "local-only\n")
  assert.equal(run("git", ["diff", "--cached", "--name-only"]), "")
  console.log("Partial staging and unrelated edits preserved")
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
```

Jalankan `node scripts/probe-staging.mjs`, lalu hapus probe. Tabel berikut melengkapi pemeriksaan manual pada repository disposable; simpan isi worktree dan `git diff` sebelum/sesudah:

| Kasus | Input | Ekspektasi |
| --- | --- | --- |
| Fully staged | File JS tidak rapi seluruhnya di-stage | Commit berisi hasil format |
| Partial non-overlap | Dua blok pada satu file, hanya blok pertama di-stage | Commit hanya memuat perubahan blok pertama; blok kedua tetap unstaged |
| Partial overlap | Perubahan unstaged bertabrakan dengan area yang diformat | Commit berhenti atau restorasi aman; tidak ada perubahan pengguna hilang |
| Unrelated unstaged | File kedua berubah tetapi tidak di-stage | File kedua dan index-nya tidak berubah |
| Rename/spaces | Nama file mengandung spasi dan file di-rename | Tidak ada argumen terpecah atau file salah di-stage |
| Deletion/binary | File dihapus atau binary di-stage | Formatter tidak menerima path yang sudah hilang/binary |

Jika versi Lefthook tidak mempertahankan staging pada fixture, jangan meneruskan auto-fix tersebut atau menganggap task selesai. Simpan reproduksi, periksa fix upstream pada versi yang kompatibel, dan verifikasi ulang. Kegagalan restorasi harus menghentikan commit dengan data recovery tetap tersedia; tidak boleh disembunyikan lewat `--no-verify` atau reset working tree pengguna. Perubahan desain hook baru diperlukan bila pengujian benar-benar membuktikan implementasi native tidak memenuhi kontrak.

- [ ] **Step 7: Aktifkan hook lokal dan commit.**

```bash
pnpm run prepare
pnpm format
git add lefthook.yml commitlint.config.mjs scripts/install-hooks.mjs package.json pnpm-lock.yaml pnpm-workspace.yaml
git commit -m 'chore: add lefthook and conventional commit workflow'
```

Commit ini juga menguji hook pada perubahan nyata. Hindari workaround `--no-verify` untuk melewati bug hook.

## Task F4: Knip tanpa mengabaikan kode yang tidak digunakan

**Files:** buat `knip.json`; ubah `package.json`, `pnpm-lock.yaml`, `src/components/ui/button.tsx`, `src/app/page.tsx`.

- [ ] **Step 1: Install dan mulai dengan plugin framework otomatis.**

```bash
pnpm add -D --save-exact knip
```

`knip.json`:

```json
{
  "$schema": "https://unpkg.com/knip/schema.json",
  "entry": ["scripts/*.mjs"],
  "project": ["src/**/*.{ts,tsx}", "scripts/**/*.mjs", "*.{ts,mjs}"]
}
```

Tambahkan script `"knip": "knip"`. Entry `scripts/*.mjs` adalah CLI Node pada root scripts, bukan pola `src/**/*` yang menyembunyikan unused files. Plugin Next.js tetap memakai default entry-nya, termasuk metadata routes.

- [ ] **Step 2: Jalankan dan selesaikan temuan existing.**

```bash
pnpm knip
```

Di `src/components/ui/button.tsx`, ubah `export { Button, buttonVariants }` menjadi `export { Button }`; variants tetap lokal dan digunakan Button. Di `src/app/page.tsx`, tambahkan import `ArrowRight` dari `lucide-react` dan ubah Button menjadi:

```tsx
<Button className="mt-2">
  Button <ArrowRight data-icon="inline-end" aria-hidden="true" />
</Button>
```

Ini mempertahankan stack ikon yang sudah dipilih dengan contoh nyata. `shadcn` dipakai oleh import CSS, bukan dependency mati. Tambahkan script `"ui:add": "shadcn add"` untuk workflow penambahan komponen, dan pastikan Knip mengenali pemakaian CSS/CLI.

- [ ] **Step 3: Uji deteksi file tidak digunakan.** Buat sementara `src/unused-probe.ts`:

```ts
export const unusedProbe = 1
```

`pnpm knip` harus nonzero dan menyebut file tersebut. Hapus fixture lalu pastikan pemeriksaan lulus. Di disposable checkout, tambahkan dependency `is-number` tanpa import dan pastikan Knip mendeteksinya; jangan mengubah manifest asli untuk test negatif ini.

- [ ] **Step 4: Review exceptions dan commit.** Jika adapter Commitizen atau formatter membutuhkan pengecualian karena hanya dipanggil lewat konfigurasi, pertama aktifkan dukungan plugin/config Knip yang sesuai. Tambahkan `ignoreDependencies` hanya untuk nama package yang terbukti tidak terdeteksi dan tulis alasan di knowledge saat K2. Tidak ada pengecualian blanket untuk `src/` atau semua devDependencies.

```bash
pnpm format
pnpm knip
git add knip.json package.json pnpm-lock.yaml src/components/ui/button.tsx src/app/page.tsx
git commit -m 'chore: enforce unused code and dependency checks'
```

## Task F5: Satu perintah pemeriksaan lengkap

**Files:** ubah `package.json`, `README.md`.

- [ ] **Step 1: Tambahkan script orkestrasi.**

```json
{
  "check": "pnpm format:check && pnpm lint && pnpm lint:eslint && pnpm typecheck && pnpm knip && pnpm build"
}
```

Urutan lint cepat mendahului lint pelengkap dan build. Tidak ada ESLint di pre-commit.

- [ ] **Step 2: Tambahkan petunjuk sementara README.** Jelaskan Node/pnpm, install, `pnpm dev`, `pnpm check`, `pnpm commit`, serta sifat partial staging. README lengkap dibuat pada K4 setelah semua fitur tersedia.

- [ ] **Step 3: Jalankan pemeriksaan checkpoint A.**

```bash
pnpm format
pnpm check
git diff --check
git add package.json README.md
git commit -m 'chore: provide a unified project check command'
```

Checkpoint A selesai hanya setelah output sukses. Build yang membutuhkan akses Google Fonts harus mendapat akses jaringan yang sesuai atau dilaporkan terhalang; jangan mengubah font diam-diam untuk menyembunyikan error lingkungan.

## Referensi

- [Oxlint + ESLint](https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint)
- [Config-derived deduplication](https://github.com/oxc-project/eslint-plugin-oxlint)
- [Oxfmt configuration](https://oxc.rs/docs/guide/usage/formatter/config-file-reference)
- [Lefthook stage_fixed](https://github.com/evilmartians/lefthook/blob/master/docs/configuration/stage_fixed.md)
- [Knip Next.js entries](https://knip.dev/reference/plugins/next)
