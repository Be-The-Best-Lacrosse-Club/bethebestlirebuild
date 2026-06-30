export type ChampionTeam = {
  id: string
  team: string
  tournament: string
  result: string
  season: string
  image: string
  alt: string
  width: number
  height: number
}

export const championTeams: ChampionTeam[] = [
  {
    id: "2035-summer-faceoff",
    team: "2035 Be The Best",
    tournament: "Summer FaceOff",
    result: "Champions",
    season: "2025-26 Season",
    image: "/images/champions/BTB_2035_Be_The_Best_Summer_FaceOff_Champions.jpg",
    alt: "2035 Be The Best players posing with a MyLacrosse Tournaments banner after winning the Summer FaceOff championship.",
    width: 1048,
    height: 1280,
  },
  {
    id: "2031-summer-faceoff",
    team: "2031 BTB",
    tournament: "Summer FaceOff",
    result: "Champions",
    season: "2025-26 Season",
    image: "/images/champions/BTB_2031_BTB_Summer_FaceOff_Champions.jpg",
    alt: "2031 BTB players and coaches posing with a MyLacrosse Tournaments banner after winning the Summer FaceOff championship.",
    width: 1036,
    height: 1280,
  },
  {
    id: "2035-tornadoes-war-at-the-shore",
    team: "2035 Tornadoes",
    tournament: "War at the Shore",
    result: "Champions",
    season: "2025-26 Season",
    image: "/images/champions/BTB_2035_Tornadoes_War_At_The_Shore_Champions.jpg",
    alt: "2035 BTB Tornadoes players and coaches celebrating a War at the Shore championship.",
    width: 1011,
    height: 1280,
  },
]
