import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const calendarHtml = readFileSync(new URL("../public/dan-tournament-calendar.html", import.meta.url), "utf8")
const newsletterHtml = readFileSync(new URL("../public/fall-winter-newsletter.html", import.meta.url), "utf8")

function extractBlock(source, start, end) {
  const startIndex = source.indexOf(start)
  const endIndex = source.indexOf(end, startIndex + start.length)

  assert.notEqual(startIndex, -1, `Missing block start: ${start}`)
  assert.notEqual(endIndex, -1, `Missing block end: ${end}`)
  return source.slice(startIndex + start.length, endIndex)
}

function newsletterEvent(eventId) {
  const marker = `data-event-id="${eventId}"`
  const startIndex = newsletterHtml.indexOf(marker)
  const endIndex = newsletterHtml.indexOf("</div>", startIndex)

  assert.notEqual(startIndex, -1, `Newsletter is missing ${eventId}`)
  assert.notEqual(endIndex, -1, `Newsletter event ${eventId} is not closed`)
  return newsletterHtml.slice(startIndex, endIndex + 6)
}

function newsletterTeam(team) {
  const marker = `<tr data-team="${team}">`
  const startIndex = newsletterHtml.indexOf(marker)
  const endIndex = newsletterHtml.indexOf("</tr>", startIndex)

  assert.notEqual(startIndex, -1, `Newsletter is missing team ${team}`)
  assert.notEqual(endIndex, -1, `Newsletter team ${team} is not closed`)
  return newsletterHtml.slice(startIndex, endIndex + 5)
}

test("newsletter lists only fall tournaments entered on the master calendar", () => {
  const eventBlock = extractBlock(calendarHtml, "var DEFAULT_EVENTS = [", "\n      ];")
  const events = [...eventBlock.matchAll(/\{ id: "([^"]+)", team: "([^"]+)", title: "([^"]+)"/g)].map((match) => ({
    id: match[1],
    team: match[2],
    title: match[3],
  }))
  const nonFallEventIds = new Set([
    "b28-crabfeast",
    "b28-naptown",
    "b28-showdown",
    "b28-primetime-invite",
  ])
  const fallEvents = events.filter((event) => !nonFallEventIds.has(event.id))
  const newsletterEventIds = [...newsletterHtml.matchAll(/data-event-id="([^"]+)"/g)].map((match) => match[1])

  assert.equal(events.length, 37)
  assert.equal(fallEvents.length, 33)
  assert.equal(newsletterEventIds.length, fallEvents.length)
  assert.equal(new Set(newsletterEventIds).size, fallEvents.length)

  for (const event of fallEvents) {
    const entry = newsletterEvent(event.id)
    assert.ok(entry.includes(event.title), `${event.team} is missing the title ${event.title}`)
  }
  for (const eventId of nonFallEventIds) assert.ok(!newsletterEventIds.includes(eventId))

  assert.match(newsletterHtml, /aria-label="Boys tournament schedule"/)
  assert.match(newsletterHtml, /aria-label="Girls tournament schedule"/)
  assert.match(newsletterHtml, /\* Tournament is off Long Island/)
})

test("optional-third labels never create tournaments outside the actual calendar", () => {
  const black2028 = newsletterTeam("2028 Black")
  const black2028EventIds = [...black2028.matchAll(/data-event-id="([^"]+)"/g)].map((match) => match[1])

  assert.deepEqual(black2028EventIds, ["b28-igloo", "b28-baltimore"])
  assert.doesNotMatch(black2028, /optional-badge/)
  assert.doesNotMatch(newsletterHtml, /Tournament details TBD/)
  for (const team of ["2036 Fury", "2037 Wolves", "2035 Tornadoes", "2037 Supernova"]) {
    assert.ok(!newsletterHtml.includes(`<tr data-team="${team}">`), `${team} should stay off the newsletter until an event is on the calendar`)
  }
  assert.match(newsletterHtml, /Every boys and girls team except <strong>2028 Black<\/strong> may elect an optional third tournament/)
  assert.match(newsletterHtml, /Only fall tournaments already entered on the actual master calendar are shown below/)

  for (const eventId of [
    "b33-fall-classic",
    "g31-queen-fall",
    "g32-fall-classic",
    "g33-fall-classic",
    "g34-fall-classic",
    "g35-fall-classic",
    "g36-fall-classic",
  ]) {
    assert.match(newsletterEvent(eventId), /optional-badge/, `${eventId} should be marked as the optional third event`)
  }
  assert.equal((newsletterHtml.match(/class="optional-badge"/g) || []).length, 7)
})

test("newsletter includes all three BTB team stores", () => {
  for (const url of [
    "https://www.unltdteam.com/BeTheBestGirlsUni80007/shop/home",
    "https://www.unltdteam.com/BeTheBestBoysUni80006/shop/home",
    "https://www.unltdteam.com/BeTheBestEquip70070/shop/home",
  ]) {
    const linkStart = newsletterHtml.indexOf(`href="${url}"`)
    const linkEnd = newsletterHtml.indexOf(">", linkStart)

    assert.notEqual(linkStart, -1, `Newsletter is missing store link ${url}`)
    assert.notEqual(linkEnd, -1, `Store link ${url} is not closed`)
    const link = newsletterHtml.slice(linkStart, linkEnd + 1)
    assert.ok(link.includes('target="_blank"'))
    assert.ok(link.includes('rel="noopener"'))
  }
})

test("newsletter directs boys-program questions to both Boys Directors", () => {
  assert.match(newsletterHtml, /Sean Reynolds and Taylor Horan are BTB's Boys Directors/)
  assert.match(newsletterHtml, /For all boys-program questions or concerns/)
  assert.match(newsletterHtml, /href="mailto:btb\.director\.reynolds@gmail\.com"/)
  assert.match(newsletterHtml, /href="mailto:coachtbtb@gmail\.com"/)
})
