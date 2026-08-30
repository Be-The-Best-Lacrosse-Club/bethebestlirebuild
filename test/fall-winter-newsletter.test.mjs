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

test("newsletter mirrors every tournament on the master calendar", () => {
  const eventBlock = extractBlock(calendarHtml, "var DEFAULT_EVENTS = [", "\n      ];")
  const events = [...eventBlock.matchAll(/\{ id: "([^"]+)", team: "([^"]+)", title: "([^"]+)"/g)].map((match) => ({
    id: match[1],
    team: match[2],
    title: match[3],
  }))
  const newsletterEventIds = [...newsletterHtml.matchAll(/data-event-id="([^"]+)"/g)].map((match) => match[1])

  assert.equal(events.length, 37)
  assert.equal(newsletterEventIds.length, events.length)
  assert.equal(new Set(newsletterEventIds).size, events.length)

  for (const event of events) {
    const entry = newsletterEvent(event.id)
    assert.ok(entry.includes(event.title), `${event.team} is missing the title ${event.title}`)
  }

  assert.match(newsletterHtml, /aria-label="Boys tournament schedule"/)
  assert.match(newsletterHtml, /aria-label="Girls tournament schedule"/)
  assert.match(newsletterHtml, /\* Tournament is off Long Island/)
})

test("every active non-2028 team has an optional-third designation", () => {
  const teamBlock = extractBlock(calendarHtml, "var TEAM_META = {", "\n      };\n\n      var TEAM_NAME_ALIASES")
  const activeTeams = [...teamBlock.matchAll(/^        "([^"]+)": \{/gm)].map((match) => match[1])

  assert.equal(activeTeams.length, 18)
  for (const team of activeTeams) {
    const row = newsletterTeam(team)
    if (team === "2028 Black") {
      assert.doesNotMatch(row, /optional-badge/)
    } else {
      assert.match(row, /optional-badge/, `${team} needs an optional-third designation`)
    }
  }

  assert.equal((newsletterHtml.match(/Tournament details TBD/g) || []).length, 10)
  assert.match(newsletterHtml, /Every boys and girls team except <strong>2028 Black<\/strong> may elect an optional third tournament/)

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
})

test("newsletter includes all three BTB team stores", () => {
  for (const url of [
    "https://www.unltdteam.com/BeTheBestGirlsUni80007/shop/home",
    "https://www.unltdteam.com/BeTheBestBoysUni80006/shop/home",
    "https://www.unltdteam.com/BeTheBestEquip70070/shop/home",
  ]) {
    assert.match(newsletterHtml, new RegExp(`href="${url}"[^>]*target="_blank"[^>]*rel="noopener"`))
  }
})
