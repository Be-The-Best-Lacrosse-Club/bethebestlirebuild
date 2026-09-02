import test from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")

test("expired Futures camp registrations cannot reach a checkout", async () => {
  const [header, camps, redirects] = await Promise.all([
    read("src/components/Header.tsx"),
    read("src/pages/CampsPage.tsx"),
    read("netlify.toml"),
  ])

  assert.doesNotMatch(header, /Aug 18|register-futures/)
  assert.match(header, /actionLabel: "View schedule"/)
  assert.match(header, /ariaAction: "View"/)
  assert.doesNotMatch(camps, /August 18|Aug 18|register-futures|\$125/)

  for (const path of ["/register-futures", "/register-futures.html"]) {
    const block = redirects.match(
      new RegExp(`from = "${path.replace(".", "\\.")}"[\\s\\S]*?(?=\\n\\[\\[redirects\\]\\]|$)`),
    )?.[0]
    assert.ok(block, `${path} redirect exists`)
    assert.match(block, /to = "\/camps"/)
    assert.match(block, /status = 302/)
    assert.match(block, /force = true/)
  }
})

test("SEO points search engines at the production www host and current public routes", async () => {
  const [seo, index, sitemap, robots, terms, sms] = await Promise.all([
    read("src/components/shared/SEO.tsx"),
    read("index.html"),
    read("public/sitemap.xml"),
    read("public/robots.txt"),
    read("src/pages/TermsAndConditionsPage.tsx"),
    read("src/pages/SmsPolicyPage.tsx"),
  ])

  assert.match(seo, /https:\/\/www\.bethebestli\.com/)
  assert.match(index, /rel="canonical" href="https:\/\/www\.bethebestli\.com\/"/)
  assert.match(robots, /https:\/\/www\.bethebestli\.com\/sitemap\.xml/)
  assert.doesNotMatch(sitemap, /register-(?:futures|boys-mini-camp|girls-mini-camp)/)
  for (const path of ["/boys", "/girls", "/futures", "/camps", "/players-wanted", "/academy", "/recruiting", "/logos", "/contact", "/interest"]) {
    assert.match(sitemap, new RegExp(`<loc>https://www\\.bethebestli\\.com${path.replace("/", "\\/")}<\\/loc>`))
  }
  assert.match(terms, /<SEO/)
  assert.match(terms, /path="\/terms-and-conditions"/)
  assert.match(sms, /path="\/sms-policy"/)
})

test("public React pages expose a main landmark, skip path, and associated form labels", async () => {
  const [layout, players, login, contact, interest] = await Promise.all([
    read("src/layouts/PublicLayout.tsx"),
    read("src/pages/PlayersWantedPage.tsx"),
    read("src/pages/LoginPage.tsx"),
    read("src/pages/ContactPage.tsx"),
    read("src/pages/InterestFormPage.tsx"),
  ])

  assert.match(layout, /href="#main-content"/)
  assert.match(layout, /<main id="main-content" tabIndex=\{-1\}>/)
  assert.match(players, /<main id="main-content" tabIndex=\{-1\}/)
  assert.match(login, /<main id="main-content"/)
  assert.match(login, /<h1 className=/)

  for (const id of ["contact-name", "contact-email", "contact-phone", "contact-subject", "contact-message"]) {
    assert.match(contact, new RegExp(`htmlFor="${id}"`))
    assert.match(contact, new RegExp(`id="${id}"`))
  }

  for (const id of ["interest-name", "interest-phone", "interest-email", "interest-address", "interest-team", "interest-grad-year", "interest-notes"]) {
    assert.match(interest, new RegExp(`htmlFor="${id}"`))
    assert.match(interest, new RegExp(`id="${id}"`))
  }

  for (const id of ["login-email", "login-password", "new-password", "confirm-password", "signup-name", "signup-email", "signup-password", "signup-grad-year", "recovery-email"]) {
    assert.match(login, new RegExp(`htmlFor="${id}"`))
    assert.match(login, new RegExp(`id="${id}"`))
  }
})

test("the visual system documents the BTB 60-30-10 hierarchy", async () => {
  const css = await read("src/index.css")
  assert.match(css, /--btb-foundation-60: #000000/)
  assert.match(css, /--btb-content-30: #ffffff/)
  assert.match(css, /--btb-action-10: var\(--btb-red\)/)
})

test("girls program age pills stay unique when a grad year has multiple teams", async () => {
  const programPage = await read("src/pages/ProgramPage.tsx")
  assert.match(programPage, /new Set\(data\.teams\.map\(\(t\) => t\.gradYear\)\)/)
})
