import assert from "node:assert/strict"
import test from "node:test"

import {
  siteIndexableSchema,
  siteUrlSchema,
} from "../src/lib/environment-validation.ts"

test("site URL accepts only an HTTP(S) origin", () => {
  for (const value of ["http://localhost:3000", "https://example.com"]) {
    assert.equal(siteUrlSchema.safeParse(value).success, true)
  }

  for (const value of [
    "not-a-url",
    "ftp://example.com",
    "https://example.com/path",
    "https://example.com?preview=true",
    "https://user:pass@example.com",
  ]) {
    assert.equal(siteUrlSchema.safeParse(value).success, false, value)
  }
})

test("indexing accepts explicit strings and defaults to false", () => {
  assert.equal(siteIndexableSchema.parse(undefined), false)
  assert.equal(siteIndexableSchema.parse("true"), true)
  assert.equal(siteIndexableSchema.parse("false"), false)
  assert.equal(siteIndexableSchema.safeParse("yes").success, false)
})
