# Nextbernate Environment and SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyediakan environment tervalidasi dan SEO dasar yang konsisten, dengan indexing nonaktif sampai diaktifkan eksplisit.

**Architecture:** `src/env.ts` memvalidasi input environment; konfigurasi situs dan helper metadata mengonsumsi nilai tersebut di server. Halaman dan metadata routes memakai sumber identitas yang sama. JSON-LD memiliki serializer tersendiri untuk menguji keamanan output script.

**Tech Stack:** T3 Env, Zod, Next.js Metadata API, ImageResponse, TypeScript, native Node assertions.

---

Prasyarat: checkpoint A pada [rencana induk](2026-10-06-nextbernate-phase-1.md). Baca dokumentasi lokal Next.js untuk `json-ld`, `generate-metadata`, `image-response`, `sitemap`, `robots`, dan `opengraph-image` sebelum membuat kode.

## Peta file

| File | Tanggung jawab |
| --- | --- |
| `src/env.ts` | Validasi environment |
| `.env.example`, `next.config.ts` | Setup environment dan validasi saat startup/build |
| `src/lib/site.ts` | Identitas situs dan URL dasar |
| `src/lib/metadata.ts` | Metadata default dan metadata per halaman |
| `src/lib/json-ld.ts` | Serialisasi JSON-LD yang aman untuk script |
| `src/components/json-ld.tsx` | Render structured data |
| `src/app/layout.tsx`, `src/app/page.tsx` | Konsumsi metadata dan JSON-LD |
| `src/app/opengraph-image.tsx` | Gambar sosial default berbasis identitas situs |
| `src/app/sitemap.ts`, `src/app/robots.ts` | Endpoint crawling/indexing |

## Task S1: Environment tervalidasi

**Files:** buat `src/env.ts`, `.env.example`; ubah `next.config.ts`, `package.json`, `pnpm-lock.yaml`, `.gitignore`.

- [ ] **Step 1: Install dependency runtime.**

```bash
pnpm add --save-exact @t3-oss/env-nextjs zod
```

Gunakan Zod major 4 untuk API `z.url` di bawah; pastikan versi actual dan engine kompatibel sebelum install.

- [ ] **Step 2: Tulis probe environment sementara sebelum implementasi.** Simpan kode berikut sebagai `scripts/probe-env.mjs` sementara:

```js
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"

const cases = [
  [{ SITE_URL: "http://localhost:3000", SITE_INDEXABLE: "false" }, 0, false],
  [{ SITE_URL: "https://example.com", SITE_INDEXABLE: "true" }, 0, true],
  [{ SITE_URL: "https://example.com" }, 0, false],
  [{ SITE_URL: "bad-url" }, 1],
  [{ SITE_URL: "ftp://example.com" }, 1],
  [{ SITE_URL: "https://example.com", SITE_INDEXABLE: "yes" }, 1],
  [{}, 1],
]
for (const [values, expectedStatus, indexable] of cases) {
  const environment = { ...process.env }
  delete environment.SITE_URL
  delete environment.SITE_INDEXABLE
  const result = spawnSync(process.execPath, [
    "--input-type=module", "-e",
    'const {env} = await import("./src/env.ts"); console.log(JSON.stringify({indexable:env.SITE_INDEXABLE}))',
  ], { env: { ...environment, ...values }, encoding: "utf8" })
  assert.equal(result.status, expectedStatus, result.stderr)
  if (expectedStatus === 0) assert.equal(JSON.parse(result.stdout).indexable, indexable)
  else assert.match(result.stderr, /Invalid environment/)
}
console.log("Environment cases passed")
```

Run `node scripts/probe-env.mjs`: expected gagal karena modul belum ada. Probe memakai proses baru setiap kasus agar cache module tidak menyembunyikan validasi.

- [ ] **Step 3: Implementasikan `src/env.ts`.**

```ts
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    SITE_URL: z.url().refine((value) => {
      const url = new URL(value)
      return (
        ["http:", "https:"].includes(url.protocol) &&
        url.pathname === "/" && !url.search && !url.hash &&
        !url.username && !url.password
      )
    }, "Use an HTTP(S) origin without a path, credentials, query, or fragment"),
    SITE_INDEXABLE: z.enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
  },
  client: {},
  runtimeEnv: {
    SITE_URL: process.env.SITE_URL,
    SITE_INDEXABLE: process.env.SITE_INDEXABLE,
  },
  onValidationError: (issues) => {
    const names = issues.map((issue) => issue.path?.map((segment) =>
      typeof segment === "object" ? segment.key : segment
    ).join(".")).filter(Boolean)
    throw new Error(`Invalid environment: ${names.join(", ")}. See .env.example.`)
  },
})
```

`SITE_URL` adalah origin; deployment pada subpath belum merupakan fitur baseline. Tidak memakai generic boolean coercion atau `skipValidation`. Tidak menambahkan `server-only` ke modul ini karena juga diimpor oleh Next config di luar React runtime; T3 Env memberi guard akses server/client.

- [ ] **Step 4: Hubungkan startup/build dan dokumentasikan contoh.** `next.config.ts`:

```ts
import "./src/env"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {}
export default nextConfig
```

`.env.example`:

```dotenv
# HTTP(S) origin. Replace with the deployment domain before publishing.
SITE_URL=http://localhost:3000
# Keep false for local development and preview deployments.
SITE_INDEXABLE=false
```

Pastikan `.gitignore` tetap mengabaikan `.env*`, lalu memiliki negation `!.env.example`. Buat `.env.local` hanya jika belum ada; jangan menimpa environment pengguna. README setup menggunakan `cp -n .env.example .env.local`.

- [ ] **Step 5: Jalankan positive/negative checks.**

```bash
node scripts/probe-env.mjs
pnpm typecheck
pnpm build
```

Expected semua kasus probe lulus, build lokal berhasil. Run build tambahan dengan `SITE_URL=bad-url` harus gagal pada validasi config sebelum rendering. Pastikan pesan error tidak mencetak nilai sensitif. Hapus probe sementara setelah hasilnya dicatat.

- [ ] **Step 6: Format dan commit.**

```bash
pnpm format
git add src/env.ts .env.example next.config.ts .gitignore package.json pnpm-lock.yaml
git commit -m 'feat: validate application environment with t3 env'
```

## Task S2: Konfigurasi situs, metadata, dan JSON-LD

**Files:** buat `src/lib/site.ts`, `src/lib/metadata.ts`, `src/lib/json-ld.ts`, `src/components/json-ld.tsx`; ubah `src/app/layout.tsx`, `src/app/page.tsx`.

- [ ] **Step 1: Buat serializer dengan test perilaku keamanan.** Tulis probe ini sebagai `scripts/probe-json-ld.mjs`, jalankan sebelum membuat modul dan pastikan gagal karena modul belum ada:

```js
import assert from "node:assert/strict"
import { serializeJsonLd } from "../src/lib/json-ld.ts"
const data = { name: '</script><script>alert("x")</script>', count: 2 }
const output = serializeJsonLd(data)
assert.equal(output.includes("<"), false)
assert.deepEqual(JSON.parse(output), data)
assert.match(output, /\\u003c/)
console.log("JSON-LD escaping passed")
```

`src/lib/json-ld.ts`:

```ts
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
```

Run `node scripts/probe-json-ld.mjs`, expected pass; hapus probe setelah dicatat. Fungsi hanya menerima object JSON yang disusun aplikasi, bukan arbitrary executable content.

- [ ] **Step 2: Buat identitas situs.** `src/lib/site.ts`:

```ts
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
```

Semua consumer adalah server modules. Jangan mengimpor konfigurasi server ini ke ThemeProvider atau komponen client.

- [ ] **Step 3: Buat helper metadata.** `src/lib/metadata.ts`:

```ts
import type { Metadata } from "next"
import { site } from "@/lib/site"

export const rootMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  robots: { index: site.indexable, follow: site.indexable },
}

export function pageMetadata({
  pathname,
  title,
  description = site.description,
}: {
  pathname: `/${string}`
  title?: string
  description?: string
}): Metadata {
  const canonical = new URL(pathname, site.url).toString()
  const socialTitle = title ? `${title} | ${site.name}` : site.name
  const image = {
    url: new URL(site.socialImage, site.url).toString(),
    width: 1200,
    height: 630,
    alt: site.name,
  }
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: site.locale,
      siteName: site.name,
      title: socialTitle,
      description,
      url: canonical,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image.url],
    },
  }
}
```

Root metadata sengaja tidak menetapkan canonical homepage untuk semua halaman. `pathname` adalah path internal yang ditulis developer, bukan input URL dari user. Setiap halaman publik memakai helper dengan path miliknya.

- [ ] **Step 4: Buat renderer JSON-LD.** `src/components/json-ld.tsx`:

```tsx
import { serializeJsonLd } from "@/lib/json-ld"

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
```

- [ ] **Step 5: Hubungkan layout tanpa mengganti tampilan.** Isi `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { rootMetadata } from "@/lib/metadata"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = rootMetadata

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.language} suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  )
}
```

- [ ] **Step 6: Hubungkan homepage.** Isi `src/app/page.tsx`:

```tsx
import { ArrowRight } from "lucide-react"
import { JsonLd } from "@/components/json-ld"
import { Button } from "@/components/ui/button"
import { pageMetadata } from "@/lib/metadata"
import { site } from "@/lib/site"

export const metadata = pageMetadata({ pathname: "/" })

export default function Page() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: site.name,
        description: site.description,
        url: new URL("/", site.url).toString(),
        inLanguage: site.language,
      }} />
      <div className="flex min-h-svh p-6">
        <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
          <div>
            <h1 className="font-medium">Project ready!</h1>
            <p>You may now add components and start building.</p>
            <p>We&apos;ve already added the button component for you.</p>
            <Button className="mt-2">
              Button <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            (Press <kbd>d</kbd> to toggle dark mode)
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 7: Verifikasi dan commit.**

```bash
pnpm format
pnpm lint
pnpm lint:eslint
pnpm typecheck
git add src/lib/site.ts src/lib/metadata.ts src/lib/json-ld.ts src/components/json-ld.tsx src/app/layout.tsx src/app/page.tsx
git commit -m 'feat: add shared metadata and safe structured data'
```

## Task S3: Gambar OG, sitemap, robots, dan smoke check

**Files:** buat `src/app/opengraph-image.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`.

- [ ] **Step 1: Buat gambar sosial default.** `src/app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og"
import { site } from "@/lib/site"

export const alt = site.name
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{
      display: "flex", flexDirection: "column", justifyContent: "center",
      width: "100%", height: "100%", padding: 80,
      background: "#171717", color: "#fafafa", fontFamily: "sans-serif",
    }}>
      <div style={{ fontSize: 80, fontWeight: 700 }}>{site.name}</div>
      <div style={{ marginTop: 24, fontSize: 32 }}>{site.description}</div>
    </div>,
    size,
  )
}
```

Gambar dasar mengikuti identitas config, tanpa layanan gambar eksternal atau asset branding palsu. Metadata file convention Next.js dapat memberi URL image dengan query; verifikasi bahwa Twitter dan OG sama-sama menunjuk response gambar valid.

- [ ] **Step 2: Buat sitemap.** `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next"
import { site } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.indexable) return []
  return ["/"].map((pathname) => ({
    url: new URL(pathname, site.url).toString(),
  }))
}
```

Jangan mengarang `lastModified` dengan waktu build; tambahkan hanya jika ada tanggal perubahan konten yang benar.

- [ ] **Step 3: Buat robots.** `src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next"
import { site } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: site.indexable
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  }
}
```

- [ ] **Step 4: Smoke check server production dengan indexing false.**

```bash
SITE_URL=https://example.com SITE_INDEXABLE=false pnpm build
SITE_URL=https://example.com SITE_INDEXABLE=false pnpm start --port 3100
```

Jalankan server dalam sesi terkelola agar bisa dihentikan. Dari sesi lain, gunakan Node script berikut:

```js
import assert from "node:assert/strict"
const base = "http://localhost:3100"
const home = await fetch(base).then((r) => r.text())
assert.match(home, /name="robots"[^>]*content="noindex, nofollow"/)
assert.match(home, /rel="canonical"[^>]*href="https:\/\/example.com\/"/)
assert.match(home, /property="og:title"/)
assert.match(home, /name="twitter:card"[^>]*summary_large_image/)
const jsonLd = home.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)
assert.ok(jsonLd)
assert.equal(JSON.parse(jsonLd[1])["@type"], "WebSite")
const robots = await fetch(`${base}/robots.txt`).then((r) => r.text())
assert.match(robots, /Disallow: \//)
assert.match(robots, /Sitemap: https:\/\/example.com\/sitemap.xml/)
const sitemap = await fetch(`${base}/sitemap.xml`).then((r) => r.text())
assert.equal(sitemap.includes("<loc>"), false)
const image = await fetch(`${base}/opengraph-image`)
assert.equal(image.status, 200)
assert.match(image.headers.get("content-type"), /image\/png/)
const png = Buffer.from(await image.arrayBuffer())
assert.equal(png.subarray(1, 4).toString(), "PNG")
assert.equal(png.readUInt32BE(16), 1200)
assert.equal(png.readUInt32BE(20), 630)
console.log("Non-indexable SEO smoke check passed")
```

Simpan sebagai file `.mjs` temporer di luar repo dan jalankan `node` untuk menghindari penambahan framework test. Jika urutan atribut berbeda, gunakan parser HTML dari tool inspeksi yang tersedia atau sesuaikan ekstraksi atribut; jangan mengubah aplikasi hanya untuk memenuhi regex test.

- [ ] **Step 5: Ulangi build/start untuk indexing true.** Hentikan server sebelumnya lalu build dan start dengan `SITE_INDEXABLE=true`. Ekspektasi: robots meta `index, follow`, robots.txt memiliki `Allow: /`, sitemap memiliki tepat satu `<loc>https://example.com/</loc>`, dan structured data serta gambar tetap valid. Jangan mengandalkan perubahan environment pada server dengan artefak build lama karena metadata dapat diprerender.

Untuk regression canonical, sebelum build kedua buat sementara `src/app/metadata-probe/page.tsx`:

```tsx
import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({ pathname: "/metadata-probe", title: "Probe" })

export default function MetadataProbePage() {
  return <p>Probe</p>
}
```

Run:

```bash
SITE_URL=https://example.com SITE_INDEXABLE=true pnpm build
SITE_URL=https://example.com SITE_INDEXABLE=true pnpm start --port 3100
```

Smoke check kedua:

```js
import assert from "node:assert/strict"
const base = "http://localhost:3100"
const home = await fetch(base).then((response) => response.text())
assert.match(home, /name="robots"[^>]*content="index, follow"/)
const robots = await fetch(`${base}/robots.txt`).then((response) => response.text())
assert.match(robots, /Allow: \//)
assert.equal(robots.includes("Disallow: /"), false)
const sitemap = await fetch(`${base}/sitemap.xml`).then((response) => response.text())
assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]), ["https://example.com/"])
const probe = await fetch(`${base}/metadata-probe`).then((response) => response.text())
assert.match(probe, /rel="canonical"[^>]*href="https:\/\/example.com\/metadata-probe"/)
assert.match(probe, /<title>Probe \| Nextbernate<\/title>/)
console.log("Indexable SEO and page-specific canonical passed")
```

Hapus route probe setelah pemeriksaan. Ia tidak ditambahkan ke sitemap; daftar sitemap memang eksplisit, bukan seluruh route yang ada.

- [ ] **Step 6: Final check dan commit.**

```bash
pnpm format
pnpm check
git diff --check
git add src/app/opengraph-image.tsx src/app/sitemap.ts src/app/robots.ts
git commit -m 'feat: add social image and explicit indexing controls'
```

Checkpoint B memerlukan hasil kedua kondisi indexing, probe environment, JSON-LD escaping, dan page-specific canonical. Catat hasilnya untuk knowledge K2.

## Referensi

- [T3 Env untuk Next.js](https://env.t3.gg/docs/nextjs)
- Dokumentasi Next.js lokal di `node_modules/next/dist/docs/01-app/` merupakan acuan implementasi utama.
