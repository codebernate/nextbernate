import { JsonLd } from "@/components/json-ld"
import { Button } from "@/components/ui/button"
import { pageMetadata } from "@/lib/metadata"
import { site } from "@/lib/site"
import { ArrowRight } from "lucide-react"

export const metadata = pageMetadata({ pathname: "/" })

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          description: site.description,
          url: new URL("/", site.url).toString(),
          inLanguage: site.language,
        }}
      />
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
