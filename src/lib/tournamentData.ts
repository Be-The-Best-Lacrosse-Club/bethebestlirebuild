export interface Tournament {
  name: string
  date: string
  location?: string
}

export interface TeamTournaments {
  summer?: Tournament[]
  fall?: Tournament[]
  spring?: Tournament[]
}

export const TOURNAMENT_DATA: Record<string, TeamTournaments> = {
  // Boys Teams
  "2028 Black": {
    summer: [
      { name: "Platinum Cup", date: "June 6-7th" },
      { name: "Crabfeast", date: "June 20th-21st" },
      { name: "NAPTOWN", date: "June 29th - July 1st" },
      { name: "LI Summer Showdown", date: "July 14th & 15th" }
    ],
    fall: [
      { name: "Autumn & Gold", date: "Nov 8th" },
      { name: "Fall Classic", date: "Nov 15th" }
    ]
  },
  "2029 Chrome": {
    summer: [
      { name: "Primetime Shootout", date: "June 13 & 14" },
      { name: "Summer Lax Jam", date: "July 1st" },
      { name: "Hogans Hershey", date: "July 12" }
    ]
  },
  "2030 Rage": {
    spring: [
      { name: "Spring Jam", date: "May 10th" },
      { name: "Summer Faceoff", date: "May 30th" }
    ],
    summer: [
      { name: "Primetime Shootout UMASS", date: "June 13 & 14" },
      { name: "Lake Placid", date: "July 6th-8th" }
    ],
    fall: [
      { name: "Fall Jam", date: "Oct 18th" },
      { name: "Fall Classic", date: "Nov 15th" }
    ]
  },
  "2031 Carnage": {
    summer: [
      { name: "Summer Faceoff", date: "May 30" },
      { name: "Long Irelander", date: "June 14" },
      { name: "Team 91 Invitational Rutgers", date: "June 27-28" },
      { name: "Lake Placid", date: "July 6th-8th" }
    ],
    fall: [
      { name: "Fall Jam", date: "Oct 18th" },
      { name: "Fall Brawl", date: "Nov 11th" }
    ]
  },
  "2032 Cannons": {
    summer: [
      { name: "SUNY PURCHASE", date: "May 17" },
      { name: "Summer Faceoff", date: "May 30" },
      { name: "LONG IRELAND", date: "June 14" },
      { name: "Lake Placid", date: "July 6th-8th" }
    ],
    fall: [
      { name: "Fall Jam", date: "Oct 18th" },
      { name: "Fall Classic", date: "Nov 15th" }
    ]
  },
  "2032 Grizzlies": {
    summer: [
      { name: "Hudson Valley Showdown", date: "May 9th" },
      { name: "Apex Summer Kickoff", date: "June 6-7" },
      { name: "Bulldog Bash", date: "July 12" }
    ]
  },
  "2033 Renegades": {
    summer: [
      { name: "SUNY Purchase", date: "May 17th" },
      { name: "Tristar Lax Fest", date: "June 20th-21st" },
      { name: "NAPTOWN", date: "June 29th - July 1st" },
      { name: "Lake Placid", date: "July 6th-8th" }
    ],
    fall: [
      { name: "Columbus Day Invitational", date: "Oct 13th" },
      { name: "Fall Brawl", date: "Nov 11th" }
    ]
  },
  "2034 Venom": {
    summer: [
      { name: "Crabfeast (Waitlist)", date: "June 20th-21st" },
      { name: "The Gauntlet", date: "TBD" }
    ]
  },
  "2034 Snipers": {
    summer: [
      { name: "Spring Jam", date: "May 9" },
      { name: "Summer Faceoff", date: "May 30" },
      { name: "Long Irelander", date: "June 14" },
      { name: "Lake Placid", date: "July 6th-8th" }
    ],
    fall: [
      { name: "Octoberfest", date: "Oct 25th" },
      { name: "Fall Brawl", date: "Nov 11th" }
    ]
  },
  "2035 Bombers": {
    summer: [
      { name: "Spring Thaw (Edgewood, MD)", date: "March 8" },
      { name: "Spring Jam (Farmingdale, NY)", date: "May 9" },
      { name: "Summer Faceoff (Stony Brook, NY)", date: "May 30" },
      { name: "Long Ireland (LIU, NY)", date: "June 14" }
    ],
    fall: [
      { name: "Fall Jam", date: "Oct 18th" },
      { name: "North Shore Invitational", date: "Nov 8th" }
    ]
  },
  "2036 Dawgs": {
    summer: [
      { name: "Spring Lax Jam", date: "April 18" },
      { name: "Long Irelander", date: "June 14" },
      { name: "Summer Lax Jam", date: "July 1st" }
    ],
    fall: [
      { name: "Octoberfest", date: "Oct 25th" },
      { name: "Fall Brawl", date: "Nov 11th" }
    ]
  },

  // Girls Teams
  "2036 Avalanche": {
    fall: [
      { name: "Fall Classic", date: "Nov 15" }
    ],
    summer: [
      { name: "Queen of the Island", date: "May 16" },
      { name: "Long Ireland", date: "June 13" },
      { name: "LI Lax Fest", date: "June 20th-21st" }
    ]
  },
  "2035 Hurricanes": {
    fall: [
      { name: "Fall Classic", date: "Nov 15" },
      { name: "Queen of the Island", date: "Oct 18" }
    ],
    summer: [
      { name: "Spring Lax Jam", date: "April 18" },
      { name: "Queen of the Island", date: "May 16" },
      { name: "Lax By The Sea", date: "June 7" },
      { name: "Lax Blast", date: "July 8th" }
    ]
  },
  "2035 Tornado": {
    summer: [
      { name: "Tournament", date: "April 25" },
      { name: "War At The Shore", date: "May 30" },
      { name: "Long Ireland", date: "June 13" },
      { name: "LI Lax Fest", date: "June 20th-21st" }
    ]
  },
  "2034 Thunder": {
    fall: [
      { name: "Fall Classic", date: "Nov 15" },
      { name: "Fall Fray", date: "Oct 19" }
    ],
    summer: [
      { name: "War At The Shore", date: "May 30" },
      { name: "Lax By The Sea (NJ)", date: "June 7" },
      { name: "Apex Youth Championship (PA)", date: "June 20-21" },
      { name: "Apex Grind", date: "July 10-11" }
    ]
  },
  "2034 Tsunami": {
    fall: [
      { name: "Queen of the Island", date: "Oct 18" },
      { name: "Platinum Games", date: "Nov 8" }
    ],
    summer: [
      { name: "Igloo Challenge", date: "April 25" },
      { name: "Queen of the Island", date: "May 16" },
      { name: "Long Ireland", date: "June 13" },
      { name: "Lax Blast", date: "July 8" }
    ]
  },
  "2033 Storm": {
    fall: [
      { name: "Queen of the Island", date: "Oct 18" },
      { name: "Live Love Lax", date: "Nov 22" }
    ],
    summer: [
      { name: "War At The Shore", date: "May 30" },
      { name: "NXT All American (PA)", date: "June 13-14" },
      { name: "Apex Youth Championship (PA)", date: "June 20-23" },
      { name: "Apex Grind", date: "July 10-11" }
    ]
  },
  "2032 Riptide": {
    fall: [
      { name: "Fall Classic", date: "Nov 15" },
      { name: "Fall Fray", date: "Oct 19" }
    ],
    summer: [
      { name: "Spring Lax Jam - Champions", date: "April 18" },
      { name: "War At The Shore", date: "May 30" },
      { name: "Lax By The Sea", date: "June 7" },
      { name: "Morgans Jam", date: "June 27-28" }
    ]
  },
  "2031 Cyclones": {
    fall: [
      { name: "Queen of the Island", date: "Oct 18" },
      { name: "Live Love Lax", date: "Nov 22" }
    ],
    summer: [
      { name: "Queen of the Island", date: "May 16" },
      { name: "Lax By The Sea", date: "June 6" },
      { name: "MD Cup (Maryland)", date: "July 18th" },
      { name: "Apex Grind", date: "July 10-11" }
    ]
  },
  "2030 Tidal Wave": {
    fall: [
      { name: "Queen of the Island", date: "Oct 18" },
      { name: "Platinum Games", date: "Nov 8" }
    ],
    summer: [
      { name: "Queen of the Island", date: "May 16" },
      { name: "Lax By The Sea", date: "June 6" },
      { name: "Girls Elite Championships (APEX)", date: "June 20-21" },
      { name: "Apex Grind", date: "July 11-12" }
    ]
  },
  "2030 Reign": {
    summer: [
      { name: "War At The Shore", date: "May 30th" },
      { name: "Long Ireland", date: "June 13th" },
      { name: "Lax Blast", date: "July 8th" }
    ]
  }
}
