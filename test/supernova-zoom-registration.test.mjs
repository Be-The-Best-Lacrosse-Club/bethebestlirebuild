import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")
const formName = "btb-2037-supernova-zoom-registration"

test("2037 Supernova registration is public and detectable by Netlify", async () => {
  const [app, page, index] = await Promise.all([
    read("src/App.tsx"),
    read("src/pages/SupernovaZoomRegistrationPage.tsx"),
    read("index.html"),
  ])

  assert.match(app, /path="\/2037-supernova" element={<SupernovaZoomRegistrationPage \/>}/)
  assert.match(page, new RegExp(`const FORM_NAME = "${formName}"`))
  assert.match(page, /data-netlify="true"/)
  assert.match(page, /Register & Get Zoom Link/)
  assert.match(page, /https:\/\/us06web\.zoom\.us\/j\/84173521590/)
  assert.match(index, new RegExp(`<form name="${formName}"[^>]*netlify`))

  for (const field of [
    "parent_first_name",
    "parent_last_name",
    "email",
    "phone",
    "player_first_name",
    "player_last_name",
    "school_town",
    "currentClub",
    "family_status",
    "attendance",
    "preferred_contact",
    "best_time_to_call",
    "contact_consent",
  ]) {
    assert.match(page, new RegExp(`name="${field}"`), `React form is missing ${field}`)
    assert.match(index, new RegExp(`name="${field}"`), `Netlify skeleton is missing ${field}`)
  }
})

test("2037 Supernova signups enter the recruiting and owner follow-up workflow", async () => {
  const [leads, relay, layout] = await Promise.all([
    read("src/pages/LeadsPage.tsx"),
    read("netlify/functions/brevo-relay.js"),
    read("src/layouts/PublicLayout.tsx"),
  ])

  assert.match(leads, new RegExp(`"${formName}": "2037 Supernova Zoom"`))
  assert.match(relay, new RegExp(`const SUPERNOVA_ZOOM_FORM_NAME = "${formName}"`))
  assert.match(relay, /\[SUPERNOVA_ZOOM_FORM_NAME\]: process\.env\.BREVO_LIST_TRYOUT/)
  assert.match(relay, /You're Registered — 2037 Supernova Zoom Tonight at 8:00 PM/)
  assert.match(relay, /https:\/\/www\.bethebestli\.com\/2037-supernova/)
  assert.match(layout, /suppressNewsletterPopup/)
})
