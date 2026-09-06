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

test("header keeps its wordmark and controls readable on a light surface", async () => {
  const header = await readSource("src/components/Header.tsx")

  assert.match(header, /bg-white\/95 backdrop-blur-md/)
  assert.match(header, /hidden sm:block font-display text-lg md:text-2xl tracking-tight uppercase text-black/)
  assert.match(header, /text-black\/70 hover:text-black hover:bg-black\/5/)
  assert.match(header, /className="z-\[60\] p-1 text-black transition-colors"/)
  assert.doesNotMatch(header, /scrolled \? "text-black" : "text-white"/)
})

test("coach login and password-gated parent hub stay visible in desktop and mobile headers", async () => {
  const header = await readSource("src/components/Header.tsx")

  assert.match(header, /\{ id: "coach", label: "Coach Login", mobileLabel: "Coach", href: "\/coach-login" \}/)
  assert.match(header, /\{ id: "parent", label: "Parent Hub", mobileLabel: "Parent", href: "\/parent-training" \}/)
  assert.equal((header.match(/headerAccessLinks\.map/g) ?? []).length, 2)
  assert.match(header, /data-access-placement="desktop"/)
  assert.match(header, /data-access-placement="mobile"/)
  assert.match(header, /aria-label="Hub access"/)
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
