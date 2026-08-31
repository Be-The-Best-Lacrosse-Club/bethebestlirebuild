import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")

test("header switches between desktop navigation and the menu at one breakpoint", async () => {
  const header = await readSource("src/components/Header.tsx")

  assert.match(header, /<nav className="hidden min-\[1380px\]:flex items-center gap-1"/)
  assert.match(header, /<div className="min-\[1380px\]:hidden flex items-center gap-3">/)
  assert.doesNotMatch(header, /<nav className="hidden min-\[1100px\]:flex/)
  assert.match(header, /aria-label=\{mobileOpen \? "Close menu" : "Open menu"\}/)
  assert.match(header, /aria-expanded=\{mobileOpen\}/)
  assert.match(header, /role="dialog"/)
})

test("homepage mounts both cinematic Filmroom development stories", async () => {
  const homepage = await readSource("src/pages/HomePage.tsx")
  const filmroom = await readSource("src/components/CinematicFilmRoom.tsx")

  assert.match(homepage, /import \{ CinematicFilmRoom \}/)
  assert.match(homepage, /<CinematicFilmRoom \/>/)
  assert.match(filmroom, /Filmroom with Coach Dan/)
  assert.match(filmroom, /id="boys-film"/)
  assert.match(filmroom, /id="girls-film"/)
  assert.match(filmroom, /See it\. Fix it\. Own it\./)
  assert.match(filmroom, /Same film\. Same standard\./)
})
