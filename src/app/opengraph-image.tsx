import { ImageResponse } from "next/og"
import { site } from "@/lib/site"

export const alt = site.name
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: 80,
        background: "#171717",
        color: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 80, fontWeight: 700 }}>{site.name}</div>
      <div style={{ marginTop: 24, fontSize: 32 }}>{site.description}</div>
    </div>,
    size
  )
}
