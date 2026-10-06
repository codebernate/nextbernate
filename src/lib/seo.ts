import type { Metadata, MetadataRoute } from "next"

type SiteConfig = {
  name: string
  description: string
  locale: string
  url: string
  indexable: boolean
  socialImage: string
}

export function createPageMetadata(
  site: SiteConfig,
  {
    pathname,
    title,
    description = site.description,
  }: {
    pathname: `/${string}`
    title?: string
    description?: string
  }
): Metadata {
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

export function createRobots(site: SiteConfig): MetadataRoute.Robots {
  return {
    rules: site.indexable
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  }
}

export function createSitemap(site: SiteConfig): MetadataRoute.Sitemap {
  if (!site.indexable) return []

  return ["/"].map((pathname) => ({
    url: new URL(pathname, site.url).toString(),
  }))
}
