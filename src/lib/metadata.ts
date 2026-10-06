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
