"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { nextThemeForShortcut } from "@/lib/theme-keyboard"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const nextTheme = nextThemeForShortcut(
        event,
        document.documentElement.classList.contains("dark"),
        isTypingTarget(document.activeElement)
      )

      if (nextTheme) setTheme(nextTheme)
    }

    document.addEventListener("keydown", onKeyDown, true)

    return () => {
      document.removeEventListener("keydown", onKeyDown, true)
    }
  }, [setTheme])

  return null
}

export { ThemeProvider }
