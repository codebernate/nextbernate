# Nextbernate Phase 1: Fondasi Boilerplate Next.js

Tanggal: 2026-10-06

Status: Desain hasil diskusi; menunggu review dokumen oleh pengguna.

Cakupan: Fondasi aplikasi, developer tooling, instruksi AI, dan knowledge project.

## 1. Tujuan

Nextbernate menjadi boilerplate pribadi untuk berbagai jenis project Next.js. Phase 1 menyediakan cara kerja yang konsisten agar hasil coding dengan AI mudah dipahami, diperiksa, dan dikembangkan. Boilerplate tidak membawa fitur bisnis sebelum dibutuhkan.

Keberhasilan dinilai dari kemudahan memulai project, konsistensi pemeriksaan lokal dan CI, serta tersedianya knowledge project yang mengikuti perubahan kode. Panduan penamaan dan pemecahan kode menjadi knowledge, bukan aturan mekanis yang memblokir commit.

## 2. Kondisi awal

Saat diperiksa, repository memiliki satu commit awal dan menggunakan Next.js 16.3.6, React 19.3.0, TypeScript, Tailwind CSS v4, shadcn/ui berbasis Base UI, Lucide, next-themes, dan pnpm. ESLint, Prettier, serta plugin Prettier Tailwind sudah terpasang. Aplikasi memiliki halaman awal, komponen Button, dan tema terang/gelap.

Versi ini adalah catatan kondisi awal, bukan instruksi upgrade. Implementasi harus membaca dokumentasi Next.js yang terpasang di `node_modules/next/dist/docs/` sebelum mengubah kode terkait.

## 3. Pendekatan yang dipilih

| Keputusan | Pilihan | Alasan dan konsekuensi |
| --- | --- | --- |
| Struktur kode | Hybrid | Routing terpusat, kode fitur terlokalisasi, shared code dibuat saat diperlukan |
| Pemeriksaan | Cepat saat commit, lengkap sebelum selesai dan di CI | Iterasi ringan; sebagian masalah baru ditemukan pada pemeriksaan lengkap |
| Linting | Oxlint lokal, ESLint pelengkap, keduanya di CI | Mendukung rule yang belum tercakup Oxlint dengan biaya memelihara dua konfigurasi |
| Knowledge | Vault khusus project di repo | Dokumentasi dan keputusan mengikuti versi kode |
| Distribusi skill | Skill dibundel di repo | Fresh clone membawa workflow; pembaruan skill perlu dilakukan secara sengaja |
| Pembaruan knowledge | Proaktif dan selektif | Catatan mengikuti keputusan/perubahan relevan tanpa log wajib setiap sesi |
| Release | semantic-release dengan commit versi dan changelog | Versi terlihat di package dan riwayat; bot membutuhkan izin menulis branch release |

Alternatif struktur berdasarkan jenis kode saja dan struktur fitur sejak awal tidak dipilih. Alternatif linting ESLint saja dan migrasi penuh ke Oxlint tidak dipilih. Skill global saja atau paket skill terpusat juga tidak dipilih untuk phase 1.

## 4. Struktur repository

```text
src/
  app/                  # Routing, layout, penyusunan halaman, metadata routes
  features/             # Kode yang dimiliki fitur tertentu
  components/
    ui/                 # Komponen UI lintas fitur
  hooks/                # Hooks lintas fitur
  lib/                  # Utilitas dan konfigurasi bersama
  env.ts                # Schema dan akses environment
knowledge/
  index.md              # Pintu masuk vault
  conventions/          # Panduan coding dan workflow
  architecture/         # Penjelasan arsitektur aktual
  decisions/            # Keputusan, alasan, dan konsekuensi
.agents/skills/          # Skill bersama yang dibundel
docs/superpowers/specs/  # Spesifikasi desain yang direview
AGENTS.md               # Instruksi AI utama
CLAUDE.md               # Pengarah ke instruksi utama
```

Folder kode dibuat saat diperlukan; tidak perlu placeholder untuk folder kosong. `app/` bertanggung jawab atas routing dan komposisi halaman. Kode spesifik fitur tetap berada di fitur tersebut. Komponen, hooks, dan utilitas dipindahkan ke shared ketika benar-benar digunakan lintas fitur.

Alias `@/*` menunjuk ke `src/*`. Contoh dan kode boilerplate menggunakan absolute import `@/` untuk modul aplikasi. Tidak ada lint rule khusus yang memaksa pola import, penamaan, jumlah baris, atau batas antar-folder dalam phase 1.

## 5. Tooling dan quality checks

### 5.1 Linting dan formatting

- Oxlint menjadi diagnostik utama di editor dan pemeriksaan lint pre-commit.
- Oxfmt menggantikan Prettier dan plugin Prettier Tailwind, termasuk sorting class Tailwind.
- ESLint dipertahankan untuk rule penting atau plugin yang belum tercakup oleh konfigurasi Oxlint. Tidak masuk pre-commit; tersedia melalui script lokal dan pemeriksaan CI.
- Rule yang aktif dipetakan secara eksplisit. `eslint-plugin-oxlint` dapat membantu deduplikasi, tetapi setiap rule yang dimatikan harus benar-benar memiliki pemeriksaan pengganti yang aktif.
- Pemilihan rule mencakup correctness dan kebutuhan Next.js, React, TypeScript, serta aksesibilitas. Kompleksitas rule tidak otomatis menentukan linter pemiliknya; dukungan dan perilaku aktual yang menentukan.
- Typecheck tetap menggunakan `tsc --noEmit`.
- Tidak ada target persentase cakupan Oxlint. Angka 80% dalam diskusi adalah ilustrasi feedback cepat, bukan acceptance criterion.
- File hasil generate, build, cache, serta konfigurasi pribadi diabaikan secara spesifik.

Oxfmt memformat kode, konfigurasi, dan Markdown biasa. Sebelum vault dimasukkan dalam format otomatis, verifikasi preservasi frontmatter, wikilinks, embeds, callouts, dan task syntax. File vault yang sintaksnya tidak dapat dipertahankan dikecualikan secara terarah, dengan alasan terdokumentasi. Skill pihak ketiga yang dibundel tidak diformat ulang tanpa kebutuhan.

### 5.2 Git hooks dan pesan commit

Lefthook menggantikan Husky. Pre-commit menjalankan Oxlint dan Oxfmt hanya pada file yang di-stage. Implementasi wajib menjaga staging parsial: tidak boleh memasukkan hunk yang belum di-stage atau merusak perubahan lokal. Jika auto-fix tidak dapat menjaga kondisi ini, hentikan dengan instruksi perbaikan manual yang jelas. Tidak diperlukan lint-staged apabila mekanisme Lefthook memenuhi perilaku tersebut.

Hook `commit-msg` menjalankan commitlint dengan Conventional Commits. Commitizen menyediakan wizard opsional melalui `pnpm commit`; AI dapat membuat pesan noninteraktif yang tetap melewati commitlint. Commitizen tidak dijalankan secara interaktif di hook atau CI.

### 5.3 Knip

Knip menjadi pemeriksaan wajib dalam `pnpm check` dan CI untuk file, export, dan dependency yang tidak digunakan. Konfigurasi mengenali entry point framework dan tooling. Temuan menggagalkan pemeriksaan. Pengecualian harus spesifik dan memiliki alasan, bukan blanket ignore seluruh aplikasi.

Komponen shadcn/ui ditambahkan saat digunakan. Boilerplate tidak menyimpan koleksi komponen tidak terpakai untuk kebutuhan hipotetis.

### 5.4 Script publik dan lingkungan developer

| Script | Kontrak |
| --- | --- |
| `pnpm dev` | Menjalankan development server |
| `pnpm build` | Build production, termasuk validasi environment |
| `pnpm start` | Menjalankan hasil build |
| `pnpm format` | Memformat file dalam cakupan yang didukung |
| `pnpm format:check` | Memeriksa format tanpa menulis |
| `pnpm lint` | Menjalankan Oxlint |
| `pnpm lint:eslint` | Menjalankan rule ESLint pelengkap |
| `pnpm typecheck` | Memeriksa tipe tanpa emit |
| `pnpm knip` | Memeriksa kode dan dependency tidak terpakai |
| `pnpm check` | Format check, Oxlint, ESLint, typecheck, Knip, dan build |
| `pnpm commit` | Wizard Commitizen |

Versi Node.js dan pnpm ditetapkan setelah memeriksa kompatibilitas seluruh dependency, lalu dipakai konsisten di lokal dan CI. `.editorconfig` dan rekomendasi editor mendukung konfigurasi repo. Tidak perlu menjalankan format atau linter kedua yang menghasilkan diagnostik duplikat di editor.

Instruksi AI mewajibkan `pnpm check` sebelum menyatakan implementasi selesai. Jika lingkungan menghalangi pemeriksaan, laporkan perintah yang belum berhasil dan penyebabnya; jangan mengklaim lolos.

## 6. CI, dependency updates, dan release

### 6.1 CI dan merge

GitHub Actions menjalankan install dengan frozen lockfile, format check, Oxlint, ESLint, typecheck, Knip, dan build. Pemeriksaan ulang di CI wajib karena hook lokal dapat dilewati. CI tidak menjalankan auto-fix.

Workflow default adalah pull request dengan squash merge ke `main`. Judul PR divalidasi menggunakan konvensi yang sama dengan commitlint dan dipakai sebagai pesan squash commit. Breaking change dapat ditandai dengan `!`, misalnya `feat!: change environment configuration`. Pemeriksaan judul harus dijalankan ulang ketika judul diedit. PR dari fork tidak memerlukan secret release untuk pemeriksaan kode.

Pengaturan hosting repository harus menjadikan pemeriksaan wajib sebelum merge dan mengatur default pesan squash dari judul PR. File konfigurasi saja tidak dianggap telah mengaktifkan pengaturan GitHub tersebut.

### 6.2 semantic-release

Setelah perubahan masuk `main` dan pemeriksaan commit tersebut lulus, semantic-release:

1. Menganalisis Conventional Commits sejak release terakhir.
2. Menentukan versi: `fix` untuk patch, `feat` untuk minor, breaking change untuk major. Perubahan seperti `docs`, `chore`, dan `ci` tidak menghasilkan release sendiri dengan aturan default.
3. Memperbarui versi `package.json`, `CHANGELOG.md`, dan lockfile apabila metadata yang tersimpan membutuhkannya.
4. Membuat commit `chore(release): <version> [skip ci]` yang hanya memuat artefak release.
5. Membuat Git tag dan GitHub Release dengan release notes.

Gunakan plugin commit analyzer, release notes generator, changelog, npm dengan `npmPublish: false`, git, dan GitHub sesuai tanggung jawabnya. Package tetap `private: true`. Tidak ada publikasi npm atau deployment aplikasi dalam scope ini.

Workflow mencegah release bersamaan, tidak menjalankan release pada PR, dan tidak memicu loop dari commit bot. Commit bot tidak boleh mengubah source aplikasi. Token atau identitas bot harus memiliki izin minimum yang diperlukan untuk menulis release, tag, dan commit ke branch yang dilindungi. Setup GitHub mencakup izin bot yang eksplisit; jangan membuka bypass untuk semua developer.

Validasi awal menggunakan dry run atau repository uji. Menyiapkan konfigurasi tidak sama dengan memublikasikan release nyata. README menjelaskan konfigurasi identitas bot, branch protection, dan inisialisasi riwayat release pada repository baru yang dibuat dari boilerplate.

### 6.3 Dependabot

Dependabot memeriksa package pnpm melalui ecosystem npm dan GitHub Actions setiap minggu. Pembaruan minor/patch dikelompokkan, sedangkan major direview tersendiri. Paket yang harus selaras, seperti Next.js dan eslint-config-next, diperbarui bersama. Judul PR mengikuti Conventional Commits.

Semua PR pembaruan melewati CI dan digabung manual; auto-merge tidak diaktifkan. Prefix default pembaruan adalah `chore(deps)` atau `ci(deps)` sesuai jenisnya. Pembaruan dependency saja tidak otomatis menghasilkan release kecuali maintainer mengklasifikasikannya sebagai perubahan yang layak dirilis.

## 7. Environment dan konfigurasi situs

T3 Env dengan Zod mendefinisikan environment di `src/env.ts`. Kode aplikasi mengakses environment melalui modul tersebut. Bedakan nilai server dan client; hanya nilai yang memang publik memakai prefix `NEXT_PUBLIC_`. Secret server tidak boleh masuk client bundle.

Validasi berjalan saat development dan build. Nilai tidak valid menghasilkan error yang menjelaskan variabel bermasalah tanpa mencetak secret. `.env.example` mendokumentasikan kebutuhan awal:

| Variable | Perilaku |
| --- | --- |
| `SITE_URL` | URL absolut HTTP(S); lokal menggunakan `http://localhost:3000`, deployment memakai domain project |
| `SITE_INDEXABLE` | Boolean eksplisit dari string `true`/`false`; default `false`; nilai lain ditolak |

Hanya deklarasikan variabel yang benar-benar digunakan. Parsing boolean harus membedakan string `false` dari nilai truthy. CI menggunakan URL uji yang valid dan indexing nonaktif tanpa memerlukan secret aplikasi.

Nama, deskripsi, bahasa, dan gambar sosial disimpan pada konfigurasi situs di kode. URL dasar dari environment dipakai bersama oleh metadata, JSON-LD, sitemap, dan robots. Jangan menyalin nilai identitas situs secara independen ke setiap file.

## 8. SEO dasar

Gunakan kemampuan bawaan Next.js App Router:

- Metadata API: default title, title template, description, dan metadataBase. Canonical mengikuti URL halaman, tidak mewariskan canonical homepage ke seluruh route.
- Open Graph: title, description, URL, dan gambar preview default yang dapat diganti.
- Twitter cards: `summary_large_image` dengan metadata yang konsisten.
- JSON-LD: schema `WebSite` pada homepage. Serialisasi aman untuk tag script, termasuk escaping karakter `<`. Schema tambahan mengikuti isi halaman nyata, tanpa organisasi atau klaim fiktif.
- `src/app/sitemap.ts`: menghasilkan `/sitemap.xml` dari daftar halaman publik; awalnya homepage. Route tidak otomatis ditemukan hanya karena file sitemap ada.
- `src/app/robots.ts`: menghasilkan `/robots.txt` dengan referensi sitemap.

Saat `SITE_INDEXABLE=false`, metadata mengeluarkan `noindex, nofollow`, robots melarang crawling, dan sitemap tidak berisi URL. Saat `true`, metadata mengizinkan indexing, robots mengizinkan crawling halaman publik, dan sitemap berisi daftar publik. Ini kebijakan indexing awal, bukan mekanisme autentikasi atau jaminan penghapusan URL yang sudah diindeks.

Preview production tidak otomatis indexable berdasarkan `NODE_ENV`. Pengguna harus mengaktifkan indexing secara eksplisit ketika situs siap. Knowledge menjelaskan cara mengganti identitas situs, menambah metadata per halaman, serta memilih schema JSON-LD.

## 9. Instruksi AI, skill, dan vault

### 9.1 Sumber aturan bersama

`AGENTS.md` menyimpan alur kerja utama. `CLAUDE.md` dan pengarah tool lain merujuk ke sumber yang sama, tanpa menduplikasi kebijakan. Target awal yang dipakai untuk verifikasi adalah Codex, Claude Code, dan pengarah Cursor. Klaim penemuan skill otomatis harus sesuai kemampuan tool yang diuji; pengarah eksplisit ke file skill tetap tersedia.

Pertahankan blok instruksi Next.js yang dikelola Next.js. Jangan membundel referensi absolut ke home directory pribadi ke boilerplate. Instruksi mesin pengguna saat ini tetap dipatuhi selama pengerjaan, tetapi portable repo hanya memakai path relatif atau konfigurasi yang terdokumentasi.

### 9.2 Skill yang dibundel

Phase 1 membundel skill `obsidian-second-brain` yang telah diperiksa dari `/home/acn/.codex/skills/obsidian-second-brain/SKILL.md`. Snapshot tersebut mandiri dan tidak merujuk engine wajib. Jangan menganggap seluruh katalog skill Obsidian telah termasuk.

Catat asal, versi atau checksum snapshot, lisensi yang berlaku, dan penyesuaian lokal. Sertakan file pendukung jika snapshot yang dipakai benar-benar merujuknya. Review lisensi sebelum menyalin untuk distribusi. Tidak ada auto-update skill atau kebutuhan API riset, Python toolkit, semantic index, dan layanan eksternal untuk workflow dasar vault.

Jika kelak mengadopsi command suite yang memerlukan obsidian-core, engine dan referensinya harus ikut tersedia; itu bukan dependency tersembunyi dari phase 1. Aturan project mengarahkan skill ke `knowledge/`, bukan menjadikan root repository sebagai vault.

### 9.3 Isi dan pemeliharaan vault

`knowledge/` dapat dibuka sebagai vault Obsidian tersendiri. AI membaca `knowledge/index.md`, lalu catatan yang relevan dengan tugas; tidak perlu memuat seluruh vault setiap sesi.

Knowledge awal mencakup:

- Penamaan file, folder, komponen, hooks, fungsi, dan tipe.
- Pemecahan file berdasarkan tanggung jawab dan alasan perubahan, tanpa batas baris mekanis.
- Penempatan kode fitur, shared code, utilitas, tipe, dan konfigurasi.
- Server Components, Client Components, serta batas akses environment.
- Workflow tooling, Conventional Commits, release, dependency updates, dan SEO.
- Arsitektur aktual dan keputusan project beserta alasan serta konsekuensinya.

Skill mengarahkan pembaruan catatan relevan sebelum membuat duplikasi, menjaga struktur Markdown dan provenance, serta memverifikasi frontmatter dan tautan. AI memperbarui knowledge ketika ada keputusan yang disepakati atau perubahan nyata yang memengaruhi dokumentasi. Tidak ada kewajiban log setiap sesi atau setiap edit kecil.

Panduan coding adalah knowledge kontekstual. Tidak ada CI yang memaksa pembaruan dokumentasi untuk setiap perubahan, menegakkan penamaan file, atau mengharuskan pemecahan komponen tertentu.

Spesifikasi ini tetap berada di `docs/superpowers/specs/`; vault mengarahkan pembaca ke dokumen tersebut bila relevan tanpa menggandakan seluruh isinya. Knowledge durable dirangkum dari keputusan, bukan menyalin transkrip percakapan.

Konfigurasi pribadi Obsidian, workspace state, cache, credential, dan pengetahuan pribadi lintas project tidak dibundel.

## 10. Penanganan kegagalan

- Hook gagal: hentikan commit dengan keluaran tool dan perintah perbaikan; pertahankan perubahan serta staging pengguna.
- Environment tidak valid: hentikan startup/build dengan nama variabel yang perlu diperbaiki.
- CI gagal: blok merge; gunakan script lokal yang sama untuk reproduksi.
- Knip false positive: verifikasi entry point atau konfigurasi sebelum menambah pengecualian spesifik.
- Release gagal: laporkan tahap yang gagal dan periksa commit/tag/release yang sudah ada sebelum mencoba kembali; jangan menghapus tag atau menulis ulang history otomatis.
- Knowledge tidak cocok dengan kode: gunakan bukti aktual dari kode dan keputusan pengguna untuk memperbarui catatan, bukan mempertahankan klaim yang kedaluwarsa.

## 11. Verifikasi dan acceptance criteria

1. Fresh clone dapat di-install, dikonfigurasi dari `.env.example`, dan dijalankan mengikuti README.
2. `pnpm check` lulus dengan konfigurasi baseline; CI memakai versi runtime dan pemeriksaan yang sama.
3. Oxlint menangkap contoh pelanggaran rule yang dimilikinya, dan ESLint menangkap contoh rule pelengkap yang benar-benar aktif.
4. Format dan lint pre-commit hanya menyasar file yang di-stage. Verifikasi staging parsial dengan perubahan berbeda pada satu file dan pastikan hunk unstaged tidak ikut masuk commit.
5. Pesan commit valid diterima, pesan tidak valid ditolak, dan Commitizen menghasilkan pesan kompatibel.
6. Judul PR divalidasi termasuk setelah edit; dokumentasikan pengaturan squash merge serta required checks GitHub.
7. Knip mendeteksi contoh file/dependency tak terpakai dan tidak melaporkan entry point framework yang sah.
8. Environment valid berhasil; URL salah, boolean salah, dan variabel wajib yang hilang ditolak. String `false` menghasilkan boolean false.
9. Metadata, canonical, OG, Twitter card, JSON-LD, sitemap, dan robots konsisten dengan konfigurasi situs serta kedua kondisi indexing.
10. JSON-LD dapat diparse dan payload yang mengandung `<` tidak memutus tag script.
11. Dry run atau repository uji memverifikasi klasifikasi release, artefak versi/changelog, dan pencegahan loop; tidak menerbitkan release nyata sebagai efek pemeriksaan biasa.
12. Dependabot mencakup package dan GitHub Actions dengan grouping serta prefix yang disepakati.
13. Tautan vault, frontmatter, path skill, provenance, dan pengarah AI valid; penggunaan tidak bergantung pada home directory developer asal.
14. README menjelaskan setup lokal, script, troubleshooting, vault, skill, CI, Dependabot, identitas situs, dan aktivasi release pada repository baru.

Gunakan pemeriksaan perilaku yang relevan, dry run, dan fixture sementara. Framework unit test/E2E bukan dependency baseline phase 1. Pemeriksaan sederhana yang tidak membutuhkan framework tetap dapat diotomasi. Hasil verifikasi membedakan konfigurasi yang sudah diuji lokal dari pengaturan GitHub yang belum diaktifkan.

## 12. Di luar cakupan

Auth, database, ORM, billing, dashboard, state management tambahan, library fetching/form, analytics, monitoring, deployment, framework unit test/E2E, seluruh suite command Obsidian, dan enforcement otomatis arsitektur/penamaan tidak termasuk phase 1.

## 13. Referensi untuk implementasi

- Panduan Next.js lokal: `node_modules/next/dist/docs/`.
- T3 Env: <https://env.t3.gg/docs/nextjs>.
- Oxlint plugins: <https://oxc.rs/docs/guide/usage/linter/plugins>.
- Oxlint bersama ESLint: <https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint>.
- Oxfmt: <https://oxc.rs/docs/guide/usage/formatter>.
- Lefthook: <https://lefthook.dev/>.
- commitlint: <https://commitlint.js.org/>.
- Commitizen: <https://github.com/commitizen/cz-cli>.
- Knip: <https://knip.dev/overview/getting-started>.
- semantic-release: <https://semantic-release.gitbook.io/semantic-release/>.
- Dependabot: <https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference>.

Dokumentasi eksternal merupakan referensi teknis; keputusan produk dan cakupan mengikuti spesifikasi ini serta koreksi pengguna berikutnya.
