import assert from "node:assert/strict"
import { readdir, readFile } from "node:fs/promises"
import test from "node:test"

const projectUrl = new URL("../", import.meta.url)

test("logo library is routed and linked in desktop and mobile navigation", async () => {
  const app = await readFile(new URL("src/App.tsx", projectUrl), "utf8")
  const header = await readFile(new URL("src/components/Header.tsx", projectUrl), "utf8")

  assert.match(app, /path="\/logos" element=\{<LogosPage \/>\}/)
  assert.match(header, /go\("\/logos"\)/)
  assert.match(header, /\{ label: "Logos", href: "\/logos" \}/)
})

test("logo library uses the requested shared password and session-only access", async () => {
  const page = await readFile(new URL("src/pages/LogosPage.tsx", projectUrl), "utf8")

  assert.match(page, /const LOGO_LIBRARY_PASSWORD = "BTBVECTOR"/)
  assert.match(page, /window\.sessionStorage\.setItem\(LOGO_LIBRARY_ACCESS_KEY, "granted"\)/)
  assert.match(page, /type="password"/)
})

test("logo library ships every approved asset and no CO-LAB files", async () => {
  const pngFiles = await readdir(new URL("public/assets/brand/logos/png/", projectUrl))
  const svgFiles = await readdir(new URL("public/assets/brand/logos/svg/", projectUrl))
  const previewFiles = await readdir(new URL("public/assets/brand/logos/previews/", projectUrl))
  const allFiles = [...pngFiles, ...svgFiles, ...previewFiles]

  assert.equal(pngFiles.length, 51)
  assert.equal(svgFiles.length, 24)
  assert.equal(previewFiles.length, 51)
  assert.ok(pngFiles.every((file) => /^BTB_Logo_(?:0[5-9]|[1-4]\d|5[0-5])_Higgsfield_4K_Preserved\.png$/.test(file)))
  assert.ok(svgFiles.every((file) => file.endsWith(".svg")))
  assert.ok(previewFiles.every((file) => file.endsWith(".jpg")))
  assert.ok(allFiles.every((file) => !/co[-_ ]?lab/i.test(file)))
  assert.ok(allFiles.every((file) => !/^BTB_Logo_0[1-4]_Higgsfield/i.test(file)))
})
