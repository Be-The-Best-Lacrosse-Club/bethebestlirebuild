import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = (path, encoding = "utf8") => readFile(new URL(`../${path}`, import.meta.url), encoding)

test("the approved logo library is routed and discoverable on desktop and mobile", async () => {
  const [app, header, page, newsletter] = await Promise.all([
    read("src/App.tsx"),
    read("src/components/Header.tsx"),
    read("src/pages/LogoLibraryPage.tsx"),
    read("public/fall-winter-newsletter.html"),
  ])

  assert.match(app, /path="\/logos" element=\{<LogoLibraryPage \/>\}/)
  assert.equal((header.match(/label: "Logos", href: "\/logos"/g) || []).length, 1)
  assert.match(header, /go\("\/logos"\)[\s\S]*Logos/)
  assert.match(page, /path="\/logos"/)
  assert.match(page, /Download 39 SVG Logos/)
  assert.match(newsletter, /href="\/logos"/)
  assert.doesNotMatch(newsletter, /I am putting a link on the website/)
})

test("the downloadable logo pack is the complete ZIP archive", async () => {
  const archive = await read("public/downloads/BTB-Approved-SVG-Logo-Pack.zip", null)

  assert.equal(archive.subarray(0, 2).toString("ascii"), "PK")
  assert.ok(archive.byteLength > 4_000_000, "approved SVG archive should contain the complete logo collection")
})
