"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

function formatDate(isoDate: string) {
  try {
    const date = new Date(isoDate);
    const days = ["日", "一", "二", "三", "四", "五", "六"];
    return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
  } catch {
    return isoDate;
  }
}

// Demo data
const demoMatches = [
  { position: 1, name: "Tottenham vs Crystal Palace", league: "Premier League", home_team: "Tottenham", away_team: "Crystal Palace", start_date: "2026-03-05T19:00:00", hkjc_json: '{"pools":{"HAD":{"selections":[{"name":"Home","odds":"1.85"},{"name":"Draw","odds":"3.40"},{"name":"Away","odds":"3.95"}]}}' },
  { position: 2, name: "Arsenal vs Liverpool", league: "Premier League", home_team: "Arsenal", away_team: "Liverpool", start_date: "2026-03-05T20:00:00", hkjc_json: '{"pools":{"HAD":{"selections":[{"name":"Home","odds":"2.45"},{"name":"Draw","odds":"3.50"},{"name":"Away","odds":"2.65"}]}}' },
  { position: 3, name: "Bayern vs Dortmund", league: "Bundesliga", home_team: "Bayern", away_team: "Dortmund", start_date: "2026-03-05T22:30:00", hkjc_json: '{"pools":{"HAD":{"selections":[{"name":"Home","odds":"1.55"},{"name":"Draw","odds":"4.20"},{"name":"Away","odds":"5.50"}]}}' },
];

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch("https://ballq.gonggu.app/db/matches", {
          signal: AbortSignal.timeout(8000)
        });
        if (res.ok) {
          const data = await res.json();
          const allMatches: Match[] = data.data || [];
          
          // Filter: only TODAY's upcoming matches with HKJC odds
          const today = new Date();
          const todayStr = today.toISOString().split("T")[0];
          
          // First filter: only matches with VALID HKJC data (not empty)
          const withHKJC = allMatches.filter(m => {
            if (!m.hkjc_json) return false;
            try {
              const parsed = JSON.parse(m.hkjc_json);
              return parsed && Object.keys(parsed).length > 0;
            } catch {
              return false;
            }
          });
          console.log('Matches with valid HKJC:', withHKJC.length);
          
          // Second filter: only today or future
          const upcoming = withHKJC.filter(m => {
            const matchDate = m.start_date?.split("T")[0];
            return matchDate && matchDate >= todayStr;
          });
          
          // Sort by start time
          upcoming.sort((a, b) => 
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
          );
          
          // Remove duplicates by match name
          const seen = new Set();
          const unique = upcoming.filter(m => {
            if (seen.has(m.name)) return false;
            seen.add(m.name);
            return true;
          });
          
          if (unique.length > 0) {
            setMatches(unique);
          } else {
            setMatches(demoMatches);
            setError("No today's matches - showing demo");
          }
        } else {
          setMatches(demoMatches);
          setError("API error - showing demo");
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setMatches(demoMatches);
        setError("Connection failed - showing demo");
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="p-1">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-green-500">BallQ 賽事</h1>
          <div className="w-6" />
        </div>
      </header>

      {error && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <p className="text-yellow-700 text-sm text-center">{error}</p>
        </div>
      )}

      <main className="max-w-md mx-auto px-2 py-4">
        <div className="mb-4">
          <h2 className="text-gray-800 font-semibold">今日賽事</h2>
          <p className="text-gray-500 text-sm">{matches.length} 場</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">今日冇 upcoming 賽事</p>
          </div>
        ) : (
          matches.map((match) => {
            const odds = getOdds(match);
            return (
              <motion.div
                key={match.position}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => window.location.href = `/match/${match.position}?name=${encodeURIComponent(match.name)}`}
                className="bg-white rounded-lg shadow-sm border border-gray-100 mb-3 cursor-pointer"
              >
                {/* League & Time */}
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">{formatTime(match.start_date)}</span>
                  <span className="text-xs font-medium text-green-600">{match.league}</span>
                </div>

                {/* Teams */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-800">{match.home_team}</span>
                    <span className="text-gray-400 mx-2">VS</span>
                    <span className="text-sm font-medium text-gray-800">{match.away_team}</span>
                  </div>

                  {/* Odds */}
                  <div className="grid grid-cols-3 gap-2">
                    {odds.home ? (
                      <div className="py-2 bg-gray-50 rounded text-center">
                        <div className="text-xs text-gray-500">主</div>
                        <div className="font-bold text-gray-800">{odds.home.toFixed(2)}</div>
                      </div>
                    ) : <div />}
                    {odds.draw ? (
                      <div className="py-2 bg-gray-50 rounded text-center">
                        <div className="text-xs text-gray-500">和</div>
                        <div className="font-bold text-gray-800">{odds.draw.toFixed(2)}</div>
                      </div>
                    ) : <div />}
                    {odds.away ? (
                      <div className="py-2 bg-gray-50 rounded text-center">
                        <div className="text-xs text-gray-500">客</div>
                        <div className="font-bold text-gray-800">{odds.away.toFixed(2)}</div>
                      </div>
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
