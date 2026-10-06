export function nextThemeForShortcut(
  event: Pick<
    KeyboardEvent,
    "key" | "defaultPrevented" | "repeat" | "metaKey" | "ctrlKey" | "altKey"
  >,
  isDark: boolean,
  isTyping: boolean
): "light" | "dark" | null {
  if (
    event.defaultPrevented ||
    event.repeat ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    event.key.toLowerCase() !== "d" ||
    isTyping
  ) {
    return null
  }

  return isDark ? "light" : "dark"
}
