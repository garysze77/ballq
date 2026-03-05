"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Match {
  position: number;
  name: string;
  league: string;
  home_team: string;
  away_team: string;
  start_date: string;
  hkjc_json?: string;
}

function getOdds(match: Match) {
  try {
    const hkjc = match.hkjc_json ? JSON.parse(match.hkjc_json) : null;
    if (!hkjc?.pools?.HAD?.selections) return { home: null, draw: null, away: null };
    
    const selections = hkjc.pools.HAD.selections;
    const home = selections.find((s: any) => s.name === "Home");
    const away = selections.find((s: any) => s.name === "Away");
    const draw = selections.find((s: any) => s.name === "Draw");
    
    return {
      home: home ? parseFloat(home.odds) : null,
      draw: draw ? parseFloat(draw.odds) : null,
      away: away ? parseFloat(away.odds) : null,
    };
  } catch {
    return { home: null, draw: null, away: null };
  }
}

function formatTime(isoDate: string) {
  try {
    const date = new Date(isoDate);
    return date.toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return isoDate;
  }
}

// Demo data for testing
const demoMatches = [
  { position: 1, name: "Tottenham vs Crystal Palace", league: "Premier League", home_team: "Tottenham", away_team: "Crystal Palace", start_date: "2026-03-05T12:00:00", hkjc_json: '{"pools":{"HAD":{"selections":[{"name":"Home","odds":"1.85"},{"name":"Draw","odds":"3.40"},{"name":"Away","odds":"3.95"}]}}' },
  { position: 2, name: "Arsenal vs Liverpool", league: "Premier League", home_team: "Arsenal", away_team: "Liverpool", start_date: "2026-03-05T14:00:00", hkjc_json: '{"pools":{"HAD":{"selections":[{"name":"Home","odds":"2.45"},{"name":"Draw","odds":"3.50"},{"name":"Away","odds":"2.65"}]}}' },
  { position: 3, name: "Bayern vs Dortmund", league: "Bundesliga", home_team: "Bayern", away_team: "Dortmund", start_date: "2026-03-05T22:30:00", hkjc_json: '{"pools":{"HAD":{"selections":[{"name":"Home","odds":"1.55"},{"name":"Draw","odds":"4.20"},{"name":"Away","odds":"5.50"}]}}' },
];

export default function Home() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to fetch from backend, fallback to demo
    async function fetchMatches() {
      try {
        const res = await fetch("https://ballq.gonggu.app/db/matches", {
          signal: AbortSignal.timeout(8000)
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.data || [];
          // Filter matches with HKJC
          const withHKJC = list.filter((m: any) => m.hkjc_json);
          if (withHKJC.length > 0) {
            setMatches(withHKJC);
            setError(null);
          } else {
            setMatches(demoMatches);
            setError("No HKJC matches - showing demo");
          }
        } else {
          setMatches(demoMatches);
          setError("API error - showing demo");
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setMatches(demoMatches);
        setError(`Connection failed - showing demo: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold" style={{ color: "#00994d" }}>Ballq</h1>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm">G</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <p className="text-yellow-700 text-sm text-center">{error}</p>
        </div>
      )}

      <main className="max-w-md mx-auto px-2 py-2">
        <div className="mb-4">
          <h2 className="text-white font-semibold">今日賽事</h2>
          <p className="text-gray-500 text-sm">{matches.length} 場 (HKJC)</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          matches.map((match) => {
            const odds = getOdds(match);
            return (
              <motion.div
                key={match.position}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => router.push(`/match/${match.position}?name=${encodeURIComponent(match.name)}`)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-2"
              >
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">{formatTime(match.start_date)}</span>
                  <span className="text-xs font-medium text-gray-500">{match.league}</span>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-800">{match.home_team}</span>
                    <span className="text-gray-400 mx-2">VS</span>
                    <span className="text-sm font-medium text-gray-800">{match.away_team}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {odds.home ? (
                      <button className="py-2 bg-gray-100 rounded text-center">
                        <div className="text-xs text-gray-500">主</div>
                        <div className="font-bold">{odds.home.toFixed(2)}</div>
                      </button>
                    ) : <div />}
                    {odds.draw ? (
                      <button className="py-2 bg-gray-100 rounded text-center">
                        <div className="text-xs text-gray-500">和</div>
                        <div className="font-bold">{odds.draw.toFixed(2)}</div>
                      </button>
                    ) : <div />}
                    {odds.away ? (
                      <button className="py-2 bg-gray-100 rounded text-center">
                        <div className="text-xs text-gray-500">客</div>
                        <div className="font-bold">{odds.away.toFixed(2)}</div>
                      </button>
                    ) : <div />}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </main>
    </div>
  );
}
