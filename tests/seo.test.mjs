import assert from "node:assert/strict"
import test from "node:test"

import {
  createPageMetadata,
  createRobots,
  createSitemap,
} from "../src/lib/seo.ts"

const site = {
  name: "Example",
  description: "Example site",
  locale: "en_US",
  url: "https://example.com",
  indexable: false,
  socialImage: "/opengraph-image",
}

test("page metadata has canonical, Open Graph, and Twitter URLs", () => {
  const metadata = createPageMetadata(site, {
    pathname: "/about",
    title: "About",
  })

  assert.equal(metadata.alternates.canonical, "https://example.com/about")
  assert.equal(metadata.openGraph.url, "https://example.com/about")
  assert.equal(metadata.openGraph.title, "About | Example")
  assert.equal(
    metadata.openGraph.images[0].url,
    "https://example.com/opengraph-image"
  )
  assert.equal(metadata.twitter.images[0], metadata.openGraph.images[0].url)
})

test("non-indexable sites block crawlers and expose an empty sitemap", () => {
  assert.deepEqual(createRobots(site), {
    rules: { userAgent: "*", disallow: "/" },
    sitemap: "https://example.com/sitemap.xml",
  })
  assert.deepEqual(createSitemap(site), [])
})

test("indexable sites allow crawling and list their homepage", () => {
  const publicSite = { ...site, indexable: true }

  assert.deepEqual(createRobots(publicSite), {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://example.com/sitemap.xml",
  })
  assert.deepEqual(createSitemap(publicSite), [{ url: "https://example.com/" }])
})
