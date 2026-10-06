import assert from "node:assert/strict"
import test from "node:test"

import { nextThemeForShortcut } from "../src/lib/theme-keyboard.ts"

function keyEvent(overrides = {}) {
  return {
    key: "d",
    defaultPrevented: false,
    repeat: false,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    ...overrides,
  }
}

test("the d shortcut toggles from the currently applied theme", () => {
  assert.equal(nextThemeForShortcut(keyEvent(), false, false), "dark")
  assert.equal(nextThemeForShortcut(keyEvent(), true, false), "light")
})

test("the shortcut is ignored for modified keys, repeats, and text entry", () => {
  for (const event of [
    keyEvent({ key: "x" }),
    keyEvent({ ctrlKey: true }),
    keyEvent({ metaKey: true }),
    keyEvent({ altKey: true }),
    keyEvent({ repeat: true }),
    keyEvent({ defaultPrevented: true }),
  ]) {
    assert.equal(nextThemeForShortcut(event, false, false), null)
  }

  assert.equal(nextThemeForShortcut(keyEvent(), false, true), null)
})
