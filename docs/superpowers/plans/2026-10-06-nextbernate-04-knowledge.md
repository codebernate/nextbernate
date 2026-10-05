# Nextbernate Knowledge and AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membundel vault project dan workflow second-brain yang portable, dengan panduan coding serta instruksi bersama lintas AI tool.

**Architecture:** `AGENTS.md` mengarahkan AI ke `knowledge/index.md` dan skill lokal. Catatan conventions menjelaskan pertimbangan coding, architecture mencerminkan implementasi aktual, dan decisions mempertahankan alasan. Pengarah Claude Code/Cursor tidak menggandakan aturan.

**Tech Stack:** Markdown, Obsidian wikilinks/frontmatter, obsidian-second-brain, AGENTS.md, CLAUDE.md, Cursor rules.

---

Prasyarat: checkpoint A-C pada [rencana induk](2026-10-06-nextbernate-phase-1.md). Konten di bawah menjadi baseline; sesuaikan pernyataan faktual dengan hasil implementasi dan verifikasi yang benar-benar terjadi.

## Peta file

| File | Tanggung jawab |
| --- | --- |
| `.agents/skills/obsidian-second-brain/SKILL.md` | Snapshot workflow vault |
| `.agents/skills/obsidian-second-brain/agents/openai.yaml` | Metadata pendukung Codex |
| `.agents/skills/obsidian-second-brain/SOURCE.md` | Provenance, checksum, dan catatan lisensi |
| `knowledge/index.md` | Pintu masuk vault |
| `knowledge/conventions/code-organization.md` | Struktur, penamaan, dan pemecahan file |
| `knowledge/conventions/development-workflow.md` | Tooling, commit, CI, release |
| `knowledge/conventions/environment-and-seo.md` | Penggunaan environment dan metadata |
| `knowledge/conventions/knowledge-workflow.md` | Cara membaca dan memperbarui vault |
| `knowledge/architecture/overview.md` | Peta implementasi aktual |
| `knowledge/decisions/phase-1-foundation.md` | Keputusan dan konsekuensinya |
| `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/project.mdc` | Routing instruksi antar-tool |
| `README.md` | Onboarding developer dan aktivasi GitHub |

## Task K1: Bundel snapshot skill mandiri

**Files:** buat seluruh file di `.agents/skills/obsidian-second-brain/` yang disebut di atas.

- [ ] **Step 1: Baca sumber dan verifikasi kebutuhan pendukung.** Sumber yang dipilih pengguna pada lingkungan asal:

```bash
cat /home/acn/.codex/skills/obsidian-second-brain/SKILL.md
cat /home/acn/.codex/skills/obsidian-second-brain/agents/openai.yaml
```

Snapshot yang diperiksa saat planning tidak merujuk obsidian-core atau runtime Python. Ada dua file: SKILL.md dan agents/openai.yaml. Tidak ditemukan pernyataan lisensi pada kedua file tersebut; catat fakta itu, jangan mengarang upstream URL atau lisensi. Bundling lokal yang diminta pengguna tidak berarti provenance atau hak distribusi publik telah diverifikasi. Jika pemilik menyediakan lisensi, sertakan teks aslinya.

- [ ] **Step 2: Salin file beserta checksum sumber.** Jalankan script berikut dari root repo; source absolute hanya digunakan untuk import satu kali, tidak menjadi runtime dependency boilerplate:

```bash
node --input-type=module <<'JS'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
const source = '/home/acn/.codex/skills/obsidian-second-brain'
const destination = '.agents/skills/obsidian-second-brain'
mkdirSync(join(destination, 'agents'), { recursive: true })
const records = []
for (const file of ['SKILL.md', 'agents/openai.yaml']) {
  const data = readFileSync(join(source, file))
  writeFileSync(join(destination, file), data)
  records.push(`- ${file}: sha256 ${createHash('sha256').update(data).digest('hex')}`)
}
const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
writeFileSync(join(destination, 'SOURCE.md'), [
  '# Skill provenance',
  '',
  'Origin: user-managed Codex skill snapshot named obsidian-second-brain.',
  `Imported: ${date}.`,
  'Upstream URL and license: not declared in the supplied snapshot.',
  'No public redistribution license has been inferred.',
  'Local modifications: none. Project routing is maintained in AGENTS.md.',
  'Update policy: deliberate review and re-import; never update automatically.',
  '',
  '## Source checksums',
  '',
  ...records,
  '',
].join('\n'))
JS
```

Pada lingkungan lain, sumber import harus disediakan secara eksplisit sebelum menyalin; jangan mencari dan mengganti dengan skill bernama mirip yang workflow-nya berbeda.

- [ ] **Step 3: Verifikasi portability.** Bandingkan hash file tersalin dengan SOURCE.md. Pastikan tidak ada path `/home/acn` di file runtime yang dibundel, tidak ada file referensi yang hilang, dan tidak ada secret. Oxfmt mengabaikan snapshot agar tidak membuat perubahan upstream yang tidak diperlukan.

- [ ] **Step 4: Commit.**

```bash
git add .agents/skills/obsidian-second-brain
git commit -m 'docs: bundle the project second-brain workflow'
```

Jika sandbox melindungi `.agents`, gunakan jalur approval yang berlaku untuk menulis target yang secara eksplisit diminta ini. Jangan memindahkan skill ke lokasi lain diam-diam.

## Task K2: Buat vault project dan panduan yang dapat digunakan

**Files:** buat tujuh file knowledge pada peta file.

- [ ] **Step 1: Buat index.** `knowledge/index.md`:

```markdown
# Project knowledge

This directory is the project-specific Obsidian vault. Open this folder as a vault.
Start with the relevant note instead of loading every note for each task.

- [[conventions/code-organization]] - Naming, boundaries, and file decomposition.
- [[conventions/development-workflow]] - Checks, commits, dependencies, and releases.
- [[conventions/environment-and-seo]] - Environment validation and public metadata.
- [[conventions/knowledge-workflow]] - Reading and updating project knowledge.
- [[architecture/overview]] - Current implementation and module responsibilities.
- [[decisions/phase-1-foundation]] - Accepted decisions and trade-offs.

The reviewed design and implementation plans live in `../docs/superpowers/`.
Configuration files and source code are authoritative for executable behavior.
```

- [ ] **Step 2: Buat panduan organisasi kode.** `knowledge/conventions/code-organization.md`:

```markdown
---
type: convention
tags: [convention, architecture]
---

# Code organization

These are contextual design guidelines, not additional commit-blocking rules.

## Placement

- `src/app` owns routing, layouts, metadata routes, and page composition.
- Keep feature-specific UI and logic together under `src/features/<feature>` when the feature needs several related files.
- Use `src/components`, `src/hooks`, and `src/lib` for code shared across real consumers.
- Do not create empty feature folders or speculative abstractions.
- Prefer `@/` imports for application modules; do not encode folder boundaries as lint policy in phase 1.

## Names

- Prefer kebab-case filenames such as `profile-form.tsx` and `use-profile.ts`.
- Use PascalCase component/type names and camelCase functions/variables.
- Name hooks with `use`; name other functions by behavior, such as `serializeJsonLd`.
- Keep Next.js file conventions such as `page.tsx` and `robots.ts` intact.
- Avoid vague files such as `helpers.ts` when a responsibility-specific name fits.

## Splitting code

- Split when responsibilities, dependencies, or reasons for change differ.
- A page combining routing, profile validation, and an interactive form can delegate the form to its feature while keeping route metadata in app.
- Keep a small helper local when only one component uses it.
- Promote a helper to shared code when several real features use the same behavior.
- File length is a review signal, not a numeric limit. Splitting into tiny files without clear boundaries adds navigation cost.

## Server and client

- Start with Server Components. Add a client boundary for state, effects, or browser APIs.
- Keep the client boundary narrow; do not pull server environment into it.
- Keep props and data crossing the boundary serializable.
- Colocate types with their owner; create shared types only for shared contracts.

See [[architecture/overview]] for the actual implementation and [[decisions/phase-1-foundation]] for rationale.
```

- [ ] **Step 3: Buat panduan tooling.** `knowledge/conventions/development-workflow.md`:

```markdown
---
type: convention
tags: [convention, tooling]
---

# Development workflow

Use the Node version in `.node-version` and pnpm version in `package.json`.

- Editor: Oxlint diagnostics and Oxfmt format-on-save.
- Pre-commit: Lefthook checks staged files; it must preserve unstaged changes.
- Commit message: commitlint validates Conventional Commits.
- `pnpm commit`: optional Commitizen wizard; noninteractive commits remain supported.
- `pnpm lint`: Oxlint. `pnpm lint:eslint`: complementary ESLint rules.
- `pnpm check`: format check, both linters, typecheck, Knip, and build.
- Run the full check before declaring a coding task complete. Report blocked checks honestly.
- Add shadcn components with `pnpm ui:add <component>` only when they are needed.

## Pull requests and release

PR titles follow Conventional Commits and become squash commit subjects.
`fix` releases a patch, `feat` a minor, and `!` or a breaking-change footer a major.
semantic-release updates package version and changelog, commits release assets, tags, and creates a GitHub Release after main passes checks.
Publishing to npm is disabled. GitHub App settings must be configured before release activation.

## Dependency updates

Dependabot opens weekly PRs for packages and GitHub Actions. Related framework packages stay together. Major upgrades receive separate review from ordinary minor/patch updates.
Auto-merge is disabled. Dependency chores do not produce releases by default.

## Failure handling

Reproduce CI failures with the local script. Do not disable checks to make a change pass.
Inspect Knip findings before adding a narrowly justified exception.
If a staging restoration fails, stop and preserve the working tree and recovery data; never discard changes automatically.

See [[conventions/knowledge-workflow]] for documentation updates.
```

Append an actual rule ownership table from F2 and any justified Knip exceptions from F4. Record exact active rule names and reasons from tool output, not a guessed list. If the hook fallback was required, update pre-commit description to check-only rather than claiming auto-format.

- [ ] **Step 4: Buat panduan environment/SEO.** `knowledge/conventions/environment-and-seo.md`:

```markdown
---
type: convention
tags: [convention, environment, seo]
---

# Environment and SEO

Copy `.env.example` to `.env.local` for development without overwriting existing values.
Declare application environment in `src/env.ts`; consume the exported `env` object.
Server variables are not client data. Only intentionally public variables receive `NEXT_PUBLIC_` names.

`SITE_URL` is an HTTP(S) origin without path, query, fragment, or credentials.
`SITE_INDEXABLE` accepts the strings `true` and `false`; it defaults to false.
Changing prerendered metadata requires rebuilding with the intended environment.

## Adding a public page

- Use `pageMetadata` with the page's actual pathname and title.
- Add its path to the public sitemap list when the page should be discoverable.
- Keep canonical URLs page-specific.
- Add JSON-LD only for entities actually described by the page.
- Render JSON-LD with the existing component and serializer; do not inject raw JSON strings.
- Customize name, description, language, locale, and social image through site configuration.

When indexing is off, pages emit noindex/nofollow, robots disallows crawling, and the sitemap has no URLs.
Enable indexing explicitly for the public deployment. Robots is not access control or a guaranteed deindexing mechanism.

See [[architecture/overview]] for source paths.
```

- [ ] **Step 5: Buat workflow knowledge.** `knowledge/conventions/knowledge-workflow.md`:

```markdown
---
type: convention
tags: [convention, knowledge]
---

# Knowledge workflow

The vault root is `knowledge/`. Use the bundled skill at `.agents/skills/obsidian-second-brain/SKILL.md`, resolving that path from the repository root.

1. Read the vault index and the notes relevant to the current task.
2. Search existing notes before creating a new one.
3. Update knowledge when an accepted decision or a real code change affects it.
4. Prefer updating the existing note; keep facts, rationale, and source pointers together.
5. Preserve frontmatter, headings, wikilinks, task syntax, and provenance.
6. Verify changed links and claims against the code or source.

Small edits do not require a session log. Do not generate a daily note for every coding task.
Do not promote an unaccepted idea to an accepted decision.
Date facts that depend on a particular version or state. For volatile facts, prefer a link to the source of truth.
Record external sources with URLs and the verification date. Never invent an upstream source or license.

Note metadata uses `type` and `tags`; add an actual review date for version-sensitive architecture or decisions.
Use descriptive lowercase kebab-case filenames by convention. This is not an automated naming gate.

See [[conventions/code-organization]] and [[conventions/development-workflow]] for coding guidance.
```

- [ ] **Step 6: Buat architecture dan decisions dengan fakta implementasi.** `knowledge/architecture/overview.md`:

```markdown
---
type: architecture
tags: [architecture]
---

# Architecture overview

This is a Next.js App Router starter using React, TypeScript, Tailwind v4, shadcn/Base UI, and next-themes.

| Module | Responsibility | Dependencies |
| --- | --- | --- |
| `src/app` | Routes, layout, homepage, metadata routes | Shared components and site metadata |
| `src/components` | Reusable rendering and theme provider | React, Base UI, next-themes |
| `src/env.ts` | Validated application environment | T3 Env, Zod |
| `src/lib/site.ts` | Site identity and indexing setting | Environment |
| `src/lib/metadata.ts` | Root and page metadata | Site identity, Next metadata types |
| `src/lib/json-ld.ts` | Safe JSON serialization | JavaScript JSON implementation |
| `knowledge` | Project conventions and decisions | Markdown and bundled skill |

Flow: environment validation -> site configuration -> page metadata and public metadata endpoints.
The theme provider is a client boundary. Metadata and server configuration remain on the server.
Features, hooks, auth, and persistence modules are introduced only when required.

See [[conventions/environment-and-seo]] and [[decisions/phase-1-foundation]].
```

`knowledge/decisions/phase-1-foundation.md`:

```markdown
---
type: decision
status: accepted
tags: [decision, foundation]
---

# Phase 1 foundation

Nextbernate is a general-purpose personal boilerplate. Phase 1 establishes development practices and reusable foundations before business features.

| Decision | Rationale | Consequence |
| --- | --- | --- |
| Hybrid source layout | Simple routes and cohesive features | Shared code requires judgment |
| Oxlint/Oxfmt locally, ESLint in full checks | Fast iteration with complementary coverage | Some issues appear later; two configs need maintenance |
| Lefthook and Conventional Commits | Consistent commits and release input | Hooks must preserve partial staging |
| Knip in full checks | Avoid unused code and packages | Components are added when used |
| Version and changelog release commits | Repository contains visible version history | Release bot needs controlled branch access |
| Explicit indexing | Preview builds remain non-indexable | Public deployment must enable indexing |
| Project vault and local skill | Knowledge travels with the code | Skill updates are reviewed deliberately |
| Naming and decomposition as knowledge | Preserve context-sensitive judgment | These guidelines do not block commits |

Alternatives considered included flat type-only folders, feature-only folders, one linter, globally installed skills, and tag-only releases.

The reviewed design is stored at `docs/superpowers/specs/2026-10-06-nextbernate-phase-1-design.md` from the repository root.
See [[architecture/overview]] and [[conventions/code-organization]].
```

Add `reviewed: YYYY-MM-DD` using the actual execution date to architecture and decision frontmatter; the date above in the spec path is a filename, not a claim about when implementation was completed. Record `scanned-commit` only if it corresponds to the code actually inspected.

- [ ] **Step 7: Verifikasi format Obsidian sebelum format otomatis.** Buat `knowledge/format-probe.md` sementara:

```markdown
---
type: convention
tags: [probe]
---

# Format probe

[[conventions/code-organization|Code organization]]
![[architecture/overview]]

> [!note]
> Preserve the callout and the wikilink [[conventions/knowledge-workflow]].

- [ ] Open task
- [x] Completed task
```

Jalankan `pnpm exec oxfmt --write knowledge/format-probe.md`. Pastikan frontmatter, wikilinks/alias, embed, callout marker, dan task states tidak berubah makna. Hapus probe. Jika sintaks tertentu rusak, dokumentasikan contoh dan pengecualian terarah pada Oxfmt serta hook; jangan menghapus atau mengonversi wikilinks agar formatter lolos.

- [ ] **Step 8: Verifikasi graph dan commit.** Gunakan script read-only pada K3 untuk memeriksa link, lalu:

```bash
pnpm format
git add knowledge
git commit -m 'docs: establish project knowledge and conventions'
```

## Task K3: Pengarah AI lintas tool

**Files:** ubah `AGENTS.md`, `CLAUDE.md`; buat `.cursor/rules/project.mdc`; ubah `.gitignore` jika konfigurasi personal tambahan perlu dikecualikan.

- [ ] **Step 1: Tambahkan instruksi proyek sebelum blok Next.js yang dikelola.** Jangan menghapus atau mengganti teks di antara `BEGIN:nextjs-agent-rules` dan `END:nextjs-agent-rules`. Teks project yang ditambahkan:

```markdown
# Project workflow

Use the runtime and package manager declared in `.node-version` and `package.json`.

Before changing code, read `knowledge/index.md` and the notes relevant to the task.
Follow the installed Next.js documentation as required by the managed block below.

Run `pnpm check` before reporting an implementation complete. Report any failed or blocked check with its cause.
Use Conventional Commits. PR titles become squash commit subjects.
Preserve user changes and partial staging. Do not disable checks to conceal failures.

For knowledge work, read `.agents/skills/obsidian-second-brain/SKILL.md` and use `knowledge/` as the vault root.
Update relevant existing notes when accepted decisions or actual code changes affect them.
Do not create a session log for every small change.

Naming and decomposition guidance lives in `knowledge/conventions/code-organization.md`.
These are contextual guidelines; phase 1 does not add mechanical architecture or naming gates.
```

Tidak menyalin path home pribadi, RTK global, atau secret ke instruksi portable. Instruksi mesin yang berlaku selama eksekusi tetap ditaati oleh agen.

- [ ] **Step 2: Buat pengarah Claude Code.** `CLAUDE.md`:

```markdown
@AGENTS.md
```

Import menunjuk ke sumber yang sama. Tidak mengimpor semua catatan vault saat startup. Jika Claude Code versi yang dipakai juga membaca AGENTS.md otomatis, periksa konteks aktual agar tidak menggandakan isi; pengarah ini dapat tetap berfungsi pada versi yang belum mendukung AGENTS.md langsung.

- [ ] **Step 3: Buat pengarah Cursor.** `.cursor/rules/project.mdc`:

```markdown
---
description: Shared project workflow and knowledge entry point
alwaysApply: true
---

Read and follow [AGENTS.md](../../AGENTS.md) from the repository root.
Project conventions and skill routing are defined there; do not duplicate them here.
```

Path link `.cursor/rules/../../AGENTS.md` resolve ke root. Verifikasi interpretasi link pada versi Cursor aktual; fallback yang harus tetap tersedia adalah membaca file root secara eksplisit.

- [ ] **Step 4: Validasi file dan wikilinks.** Jalankan script read-only:

```bash
node --input-type=module <<'JS'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const path = join(dir, entry.name)
  return entry.isDirectory() ? walk(path) : [path]
})
for (const file of walk('knowledge').filter((path) => path.endsWith('.md'))) {
  const text = readFileSync(file, 'utf8')
  for (const match of text.matchAll(/\[\[([^\]|#]+)(?:[^\]]*)\]\]/g)) {
    assert.ok(existsSync(join('knowledge', match[1] + '.md')), `${file}: ${match[1]}`)
  }
}
for (const file of ['AGENTS.md', 'CLAUDE.md', '.cursor/rules/project.mdc', '.agents/skills/obsidian-second-brain/SKILL.md']) {
  assert.ok(existsSync(file), file)
  assert.equal(readFileSync(file, 'utf8').includes('/home/acn/'), false, file)
}
const agents = readFileSync('AGENTS.md', 'utf8')
assert.ok(agents.includes('BEGIN:nextjs-agent-rules'))
assert.ok(agents.includes('END:nextjs-agent-rules'))
console.log('Knowledge links and routing checks passed')
JS
```

Periksa frontmatter dengan Obsidian atau parser YAML yang tersedia. Tidak perlu memasukkan checker dokumentasi ini ke CI sebagai gate baru.

- [ ] **Step 5: Uji akses per tool jika tersedia.** Pada sesi kosong masing-masing tool, minta tool menyebut lokasi instruksi, vault root, dan workflow update note sebelum mengubah file. Expected: AGENTS.md, knowledge/, dan skill lokal. Catat versi tool dan hasil. Jika sebuah tool tidak tersedia, laporkan pengarahnya tervalidasi secara struktural tetapi perilaku discovery belum diuji. Jangan mengklaim `.agents/skills` otomatis ditemukan semua tool.

- [ ] **Step 6: Commit.**

```bash
pnpm format
git add AGENTS.md CLAUDE.md .cursor/rules/project.mdc .gitignore
git commit -m 'docs: route coding agents through shared project knowledge'
```

## Task K4: README final dan verifikasi fresh clone

**Files:** ubah `README.md`; perbaiki hanya konfigurasi/dokumen yang terbukti bermasalah selama pemeriksaan.

- [ ] **Step 1: Susun README dengan langkah onboarding konkret.** Konten wajib:

1. Prasyarat Node/pnpm yang merujuk file versi, tanpa versi salinan yang mudah kedaluwarsa.
2. Setup: `pnpm install --frozen-lockfile`, salin `.env.example` bila `.env.local` belum ada, jalankan `pnpm dev`.
3. Tabel seluruh script dari `package.json`, termasuk perbedaan pemeriksaan cepat dan lengkap.
4. Struktur hybrid, alias `@/`, dan tautan ke panduan penamaan/pemecahan file.
5. Commitizen opsional, commitlint, Lefthook, dan bagaimana menangani partial staging.
6. Penggantian identitas situs, `SITE_URL`, indexing, metadata per halaman, sitemap, JSON-LD, dan social image.
7. Buka `knowledge/` sebagai vault Obsidian; cara menggunakan skill bersama dari Codex/Claude Code/Cursor, beserta batas pengujian yang aktual.
8. GitHub setup/release dari A3, required checks, squash subject, versi awal, dan pemulihan release yang gagal.
9. Dependabot, major grouping, dan tidak adanya auto-merge.
10. Checklist setelah menggunakan template: nama package, identitas/domain situs, remote repository, riwayat release, GitHub App, dan indexing.
11. Troubleshooting: runtime mismatch, env invalid, gagal fetch font saat build, Knip false positive, hook restoration, dan CI-only ESLint failures.

Gunakan konfigurasi sebagai sumber kebenaran; README menjelaskan cara menggunakannya. Jangan mengklaim pengaturan GitHub telah aktif jika hanya file workflow yang tersedia.

- [ ] **Step 2: Jalankan pemeriksaan lengkap pada worktree implementasi.**

```bash
pnpm format
pnpm check
git diff --check
```

Pastikan tidak ada fixture probe, `.env.local`, secret, cache Obsidian, node_modules, atau hasil build yang ikut staged.

- [ ] **Step 3: Commit README sebelum fresh clone.**

```bash
git add README.md
git commit -m 'docs: document boilerplate setup and operating workflow'
```

- [ ] **Step 4: Fresh clone di direktori temp.** Gunakan `mktemp -d` untuk path unik, clone branch implementasi lokal ke path tersebut, lalu dari root clone:

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm check
pnpm dev --port 3101
```

Jangan menyalin node_modules atau `.env.local` dari worktree asal. Verifikasi homepage dan theme toggle lalu hentikan server. Hash lockfile sebelum/sesudah install harus sama. `git status --short` harus bersih selain perubahan yang dapat dijelaskan; generated Next agent instructions tidak boleh terus membuat dirty tree.

- [ ] **Step 5: Review batas hasil dan selesaikan checkpoint D.** Laporkan:

- Pemeriksaan lokal yang benar-benar lulus, termasuk build fresh clone.
- Smoke check environment, indexing, canonical, JSON-LD, staging, dan release fixture.
- Tool AI yang benar-benar diuji versus hanya pengarah file.
- Status lisensi snapshot skill sebagaimana tersedia.
- Settings/secrets GitHub yang masih perlu diaktifkan, tanpa meminta atau mencetak nilai secret.

Jika verifikasi menemukan bug, perbaiki pada task pemiliknya, ulangi pemeriksaan terkait, dan commit perbaikan terpisah. Tidak perlu mengulang seluruh pemeriksaan mahal tanpa perubahan atau kekhawatiran baru.

## Referensi

- [Claude Code project memory/imports](https://code.claude.com/docs/en/memory)
- [Cursor rules](https://cursor.com/docs/rules)
- Snapshot skill pengguna yang didokumentasikan pada K1.
