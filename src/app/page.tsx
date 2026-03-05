import MatchCard from "../components/MatchCard";

const demoMatches = [
  {
    matchId: "624",
    league: "Premier League",
    leagueColor: "#3b82f6",
    homeTeam: { name: "Aston Villa" },
    awayTeam: { name: "Chelsea" },
    homeOdds: 2.85,
    drawOdds: 3.45,
    awayOdds: 2.45,
    status: "live" as const,
    startTime: "03:30",
    homeScore: 1,
    awayScore: 1,
    half: "2nd Half",
  },
  {
    matchId: "625",
    league: "Premier League",
    leagueColor: "#3b82f6",
    homeTeam: { name: "Brighton" },
    awayTeam: { name: "Arsenal" },
    homeOdds: 4.20,
    drawOdds: 3.80,
    awayOdds: 1.82,
    status: "live" as const,
    startTime: "03:30",
    homeScore: 0,
    awayScore: 2,
    half: "1st Half",
  },
  {
    matchId: "626",
    league: "Bundesliga",
    leagueColor: "#dc2626",
    homeTeam: { name: "Hamburger SV" },
    awayTeam: { name: "Bayer Leverkusen" },
    homeOdds: 5.50,
    drawOdds: 4.20,
    awayOdds: 1.62,
    status: "upcoming" as const,
    startTime: "03:30",
  },
  {
    matchId: "627",
    league: "Copa del Rey",
    leagueColor: "#f97316",
    homeTeam: { name: "Real Sociedad" },
    awayTeam: { name: "Athletic Club" },
    homeOdds: 2.65,
    drawOdds: 3.20,
    awayOdds: 2.75,
    status: "upcoming" as const,
    startTime: "04:00",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button className="p-2 text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-green-500">Ballq</h1>
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-medium">G</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4">
        <div className="mb-4">
          <h2 className="text-white font-semibold">Today&apos;s Matches</h2>
          <p className="text-gray-500 text-sm">{demoMatches.length} matches</p>
        </div>
        {demoMatches.map((match) => (
          <MatchCard key={match.matchId} {...match} />
        ))}
      </main>

      <nav className="bg-gray-800 border-t border-gray-700 fixed bottom-0 left-0 right-0">
        <div className="max-w-md mx-auto flex justify-around py-2">
          <button className="flex flex-col items-center p-2 text-green-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span className="text-xs mt-1">Football</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs mt-1">Results</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs mt-1">Betting</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </nav>
      <div className="h-20" />
    </div>
  );
}
