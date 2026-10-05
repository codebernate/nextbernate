# Nextbernate Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menghasilkan boilerplate Next.js dengan pemeriksaan berlapis, environment tervalidasi, SEO dasar, release otomatis, dan knowledge project yang dapat digunakan lintas AI tool.

**Architecture:** Struktur aplikasi hybrid berada di `src/`. Pemeriksaan cepat menggunakan Oxlint/Oxfmt dan Lefthook, sedangkan pemeriksaan lengkap menambahkan ESLint, TypeScript, Knip, dan build. Vault project serta skill lokal menyediakan konteks dan panduan tanpa enforcement mekanis arsitektur.

**Tech Stack:** Next.js 16.3.6, React 19.3, TypeScript, pnpm, Tailwind v4, shadcn/Base UI, Oxc, ESLint, Lefthook, commitlint, Commitizen, Knip, T3 Env/Zod, GitHub Actions, semantic-release, Dependabot, Markdown/Obsidian.

---

## Status dan cara menggunakan rencana

Spesifikasi [phase 1](../specs/2026-10-06-nextbernate-phase-1-design.md) telah disetujui. Dokumen ini adalah rencana, bukan bukti implementasi atau pengujian kode. Tidak ada deployment, publikasi release, atau perubahan pengaturan GitHub yang dilakukan saat menyusun rencana.

Cakupan memiliki empat bagian yang dapat direview tersendiri. Jalankan berurutan untuk menghindari konflik pada `package.json` dan konfigurasi bersama:

| Urutan | Rencana | Hasil yang dapat diverifikasi |
| --- | --- | --- |
| 1 | [Fondasi dan tooling](2026-10-06-nextbernate-01-foundation.md) | Aplikasi di `src/`, runtime terkunci, lint/format/hooks/Knip bekerja |
| 2 | [Environment dan SEO](2026-10-06-nextbernate-02-environment-seo.md) | Environment tervalidasi dan endpoint SEO sesuai kebijakan indexing |
| 3 | [CI dan release](2026-10-06-nextbernate-03-automation.md) | Workflow checks, Dependabot, dan konfigurasi release yang tervalidasi |
| 4 | [Knowledge dan AI](2026-10-06-nextbernate-04-knowledge.md) | Vault, skill lokal, pengarah tool, README, dan verifikasi fresh clone |

Setiap rencana memiliki task dengan langkah kecil, file yang disentuh, kode konfigurasi, ekspektasi pemeriksaan, dan batas commit. Fondasi tidak bergantung pada fitur SEO. Environment/SEO dan otomasi menggunakan fondasi; knowledge mencatat hasil aktual seluruhnya.

## Aturan eksekusi

- Mulai pada branch kerja terisolasi menggunakan workflow worktree yang berlaku; jangan melakukan implementasi langsung pada branch utama. Simpan dokumen rencana ini agar dapat dibaca dari worktree.
- Baca `AGENTS.md`, instruksi lingkungan, dan dokumentasi Next.js lokal yang disebut di setiap rencana. Perintah shell yang dieksekusi oleh agen pada lingkungan saat ini harus diawali `rtk`; contoh perintah dalam dokumen sengaja memakai CLI standar agar boilerplate portable dan tidak mewajibkan RTK bagi semua pengguna.
- Pertahankan perubahan pengguna. Commit hanya file yang dimiliki task; jangan memakai `git add .`.
- Baseline yang diamati: Node `24.15.0`, pnpm `10.33.2`, lockfile sudah tracked. Gunakan versi itu sebagai target awal dan cek `engines` dependency baru sebelum install. Jika package baru tidak kompatibel, pilih release stabil yang kompatibel dan catat versi yang benar-benar terpasang.
- Jangan upgrade Next.js atau React sebagai efek samping. Install dependency baru dengan exact versions di manifest melalui `--save-exact`, kemudian commit lockfile.
- Tidak menambah framework test. Gunakan CLI tool, fixture temporer, native Node assertions, dan smoke check HTTP. Test perilaku staging, parsing environment, serialisasi JSON-LD, dan klasifikasi release karena kesalahan di area tersebut berdampak nyata.
- Untuk konfigurasi sederhana dan perubahan dokumen, gunakan parser/CLI dan inspeksi hasil; jangan menulis test yang sekadar menyalin isi konfigurasi.
- Perintah verifikasi yang gagal karena jaringan, credential, atau runtime tidak dihitung lulus. Catat keterbatasan dan lanjutkan pemeriksaan independen yang tersedia.
- Implementasi memverifikasi reference code terhadap package yang dipasang. Perubahan API yang terbukti harus diperbaiki dalam konfigurasi dan rencana sebelum melanjutkan, bukan ditutupi dengan disable pemeriksaan.

## Checkpoint

- [ ] **A:** Selesaikan task F1-F5; `pnpm check` lulus sebelum menambah fitur baru.
- [ ] **B:** Selesaikan task S1-S3; smoke check indexing aktif/nonaktif dan JSON-LD lulus.
- [ ] **C:** Selesaikan task A1-A4; workflow tervalidasi, release diuji tanpa publikasi produksi.
- [ ] **D:** Selesaikan task K1-K4; fresh clone lulus dan dokumentasi mengikuti keadaan sebenarnya.

## Pemetaan acceptance criteria

| Spesifikasi | Task |
| --- | --- |
| Fresh clone dan setup runtime | F1, K4 |
| Format, lint, typecheck, build | F2, F5, A1 |
| Pembagian rule Oxlint/ESLint | F2 |
| Staging parsial | F3 |
| Conventional Commits dan Commitizen | F3 |
| PR title, squash merge, required checks | A1, A4 |
| Knip dan komponen yang digunakan | F4 |
| Validasi environment | S1 |
| Metadata, canonical, OG, JSON-LD, sitemap, robots | S2, S3 |
| Release, versi package, changelog, loop prevention | A2, A3 |
| Dependabot | A4 |
| Vault, provenance skill, pengarah AI | K1-K3 |
| README dan workflow pengguna | K4 |

## Hasil akhir yang dilaporkan

Laporkan file penting, commit pekerjaan, hasil `pnpm check`, hasil smoke check, dan status fresh clone. Pisahkan konfigurasi GitHub yang ada dalam repo dari settings/secrets yang benar-benar sudah diaktifkan. Release nyata dan perubahan pengaturan remote hanya dilakukan dalam scope yang secara eksplisit diminta pengguna.
