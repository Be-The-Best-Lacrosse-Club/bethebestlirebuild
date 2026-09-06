import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const calendarHtml = readFileSync(new URL("../public/dan-tournament-calendar.html", import.meta.url), "utf8")
const newsletterHtml = readFileSync(new URL("../public/fall-winter-newsletter.html", import.meta.url), "utf8")
const parentTrainingHtml = readFileSync(new URL("../public/parent-training.html", import.meta.url), "utf8")

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
  const newsletterExcludedEventIds = new Set(["b36-fury-fall-classic"])
  const newsletterFallEvents = fallEvents.filter((event) => !newsletterExcludedEventIds.has(event.id))
  const newsletterTitleOverrides = new Map([
    ["b28-igloo", "BLUE CHIP INVITATIONAL"],
    ["b31-igloo", "BLUE CHIP INVITATIONAL"],
    ["b33-igloo", "BLUE CHIP INVITATIONAL"],
    ["b34-igloo", "BLUE CHIP INVITATIONAL"],
    ["b36-igloo", "BLUE CHIP INVITATIONAL"],
  ])
  const newsletterEventIds = [...newsletterHtml.matchAll(/data-event-id="([^"]+)"/g)].map((match) => match[1])

  assert.equal(events.length, 43)
  assert.equal(fallEvents.length, 39)
  assert.equal(newsletterEventIds.length, newsletterFallEvents.length)
  assert.equal(new Set(newsletterEventIds).size, newsletterFallEvents.length)

  for (const event of newsletterFallEvents) {
    const entry = newsletterEvent(event.id)
    const expectedTitle = newsletterTitleOverrides.get(event.id) || event.title
    assert.ok(entry.includes(expectedTitle), `${event.team} is missing the title ${expectedTitle}`)
  }
  for (const eventId of nonFallEventIds) assert.ok(!newsletterEventIds.includes(eventId))
  for (const eventId of newsletterExcludedEventIds) assert.ok(!newsletterEventIds.includes(eventId))
  assert.doesNotMatch(newsletterHtml, /Igloo Elite Invitational/)

  assert.match(newsletterHtml, /aria-label="Boys tournament schedule"/)
  assert.match(newsletterHtml, /aria-label="Girls tournament schedule"/)
  assert.match(newsletterHtml, /\* Tournament is off Long Island/)
})

test("newsletter presents listed Fall Classic events without optional labels", () => {
  const tournamentSection = extractBlock(
    newsletterHtml,
    '<div class="section" id="tournaments">',
    '<div class="section" id="walkthroughs">',
  )
  const black2028 = newsletterTeam("2028 Black")
  const black2028EventIds = [...black2028.matchAll(/data-event-id="([^"]+)"/g)].map((match) => match[1])
  const wolves2037 = newsletterTeam("2037 Wolves")
  const wolves2037EventIds = [...wolves2037.matchAll(/data-event-id="([^"]+)"/g)].map((match) => match[1])

  assert.deepEqual(black2028EventIds, ["b28-igloo", "b28-baltimore"])
  assert.deepEqual(wolves2037EventIds, ["b37-fall-classic"])
  assert.doesNotMatch(black2028, /optional-badge/)
  assert.doesNotMatch(newsletterHtml, /Tournament details TBD/)
  assert.ok(!newsletterHtml.includes('<tr data-team="2036 Fury">'), "2036 Fury should be removed from the newsletter")
  for (const team of ["2035 Tornadoes", "2037 Supernova"]) {
    assert.ok(!newsletterHtml.includes(`<tr data-team="${team}">`), `${team} should stay off the newsletter until an event is on the calendar`)
  }
  assert.match(newsletterHtml, /The 2028s remain BLUE CHIP INVITATIONAL and Baltimore only/)
  assert.match(newsletterHtml, /the Wolves' only fall tournament/)
  assert.match(newsletterHtml, /Only fall tournaments entered on the actual master calendar are shown/)

  for (const eventId of [
    "b30-fall-classic",
    "b31-fall-classic",
    "b32-fall-classic",
    "b33-fall-classic",
    "b34-fall-classic",
    "b35-fall-classic",
    "g31-fall-classic",
    "g32-fall-classic",
    "g33-fall-classic",
    "g34-fall-classic",
    "g35-fall-classic",
    "g36-fall-classic",
  ]) {
    assert.match(newsletterEvent(eventId), /<strong>Fall Classic<\/strong>/)
    assert.doesNotMatch(newsletterEvent(eventId), /optional-badge/)
  }
  assert.doesNotMatch(newsletterEvent("b36-dawgs-fall-classic"), /optional-badge/)
  assert.doesNotMatch(newsletterEvent("b37-fall-classic"), /optional-badge/)
  assert.doesNotMatch(newsletterEvent("g31-queen-fall"), /optional-badge/)
  assert.doesNotMatch(tournamentSection, /\boptional\b/i)
  assert.equal((newsletterHtml.match(/class="optional-badge"/g) || []).length, 0)
})

test("requested tournament corrections stay aligned across newsletter and master calendar", () => {
  assert.ok(!newsletterHtml.includes('<tr data-team="2036 Fury">'))
  assert.doesNotMatch(newsletterHtml, /2035 Tornado(?:es)?/i)
  assert.doesNotMatch(calendarHtml, /2036 Fury|2035 Tornado(?:es)?/i)
  assert.ok(!newsletterHtml.includes('data-event-id="b36-fury-fall-classic"'))
  assert.doesNotMatch(calendarHtml, /id: "b36-fury-fall-classic"/)

  for (const eventId of ["b28-igloo", "b31-igloo", "b33-igloo", "b34-igloo", "b36-igloo"]) {
    assert.match(newsletterEvent(eventId), /<strong>BLUE CHIP INVITATIONAL<\/strong>/)
    assert.match(calendarHtml, new RegExp(`id: "${eventId}"[^\n]+title: "BLUE CHIP INVITATIONAL"`))
  }
  assert.doesNotMatch(newsletterHtml, /Igloo Elite/i)

  assert.doesNotMatch(newsletterEvent("g31-queen-fall"), /optional-badge/)
  assert.doesNotMatch(newsletterEvent("g31-fall-classic"), /optional-badge/)
  assert.match(calendarHtml, /id: "g31-queen-fall"[^\n]+status: "confirmed"/)
  assert.match(calendarHtml, /id: "g31-fall-classic"[^\n]+status: "optional"/)
  assert.match(calendarHtml, /id: "b36-dawgs-fall-classic"[^\n]+status: "confirmed"/)
  assert.match(calendarHtml, /id: "b37-fall-classic"[^\n]+status: "confirmed"/)
})

test("newsletter omits generic tournament pending placeholders", () => {
  assert.doesNotMatch(newsletterHtml, /tournament-pending/)
  assert.doesNotMatch(newsletterHtml, /One more tournament pending/)
  assert.doesNotMatch(newsletterHtml, /The additional event will be posted once selected/)
  assert.doesNotMatch(newsletterHtml, /additional tournament selection pending/)
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

test("The Lab details stay aligned across the newsletter and parent hub", () => {
  const sharedDetails = [
    "Led by owner Quintin Germain. Open to BTB teams 2033 and older.",
    "Teams train together as a full roster &mdash; functional, athletic movement built to develop power, force, and motor control, so we come out of the winter as more resilient, more explosive athletes.",
    "<strong>BTB teams 2033 and older</strong> (6th grade and up), boys and girls.",
    "<strong>16 sessions &mdash; $500 per player.</strong> Need more or fewer sessions? Quintin will adjust the plan and the cost to fit the team.",
    "<strong>10 players per team.</strong> Under 10 and the price goes up, so commit early.",
    "Slots directly before or after your team's practice hour. Practice at 9:00 AM? Lift at 8:00 or 10:00, then you're done for the day.",
    "<strong>Private access</strong> &mdash; each team has the floor to themselves. No sharing, no distractions.",
    "Momentum Sports &middot; 10 Dunton Ave, Deer Park, NY 11729",
  ]

  for (const detail of sharedDetails) {
    assert.ok(newsletterHtml.includes(detail), `newsletter is missing: ${detail}`)
    assert.ok(parentTrainingHtml.includes(detail), `parent hub is missing: ${detail}`)
  }
  assert.doesNotMatch(newsletterHtml, /2033 and older(?:<\/strong>)? \(5th grade and up\)/)
  assert.doesNotMatch(parentTrainingHtml, /2033 and older(?:<\/strong>)? \(5th grade and up\)/)
  assert.ok(parentTrainingHtml.includes("<strong>The program begins in November and ends in March.</strong>"))
})
