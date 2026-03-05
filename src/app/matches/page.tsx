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
    let hkjc = null;
    if (match.hkjc_json) {
      hkjc = JSON.parse(match.hkjc_json);
    }
    if (hkjc && hkjc.pools) {
      hkjc = hkjc.pools;
    }
    
    if (!hkjc?.HAD?.selections) return { home: null, draw: null, away: null };
    
    const selections = hkjc.HAD.selections;
    const home = selections.find((s: any) => s.name === "Home");
    const away = selections.find((s: any) => s.name === "Away");
    const draw = selections.find((s: any) => s.name === "Draw");
    
    return {
      home: home ? parseFloat(home.odds) : null,
      draw: draw ? parseFloat(draw.odds) : null,
      away: away ? parseFloat(away.odds) : null,
    };
  } catch (e) {
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

const demoMatches = [
  { position: 1, name: "Tottenham vs Crystal Palace", league: "Premier League", home_team: "Tottenham", away_team: "Crystal Palace", start_date: "2026-03-05T19:00:00", hkjc_json: '{"pools":{"HAD":{"selections":[{"name":"Home","odds":"1.85"},{"name":"Draw","odds":"3.40"},{"name":"Away","odds":"3.95"}]}}' },
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
          
          const today = new Date();
          const todayStr = today.toISOString().split("T")[0];
          
          const withHKJC = allMatches.filter(m => {
            if (!m.hkjc_json) return false;
            try {
              const parsed = JSON.parse(m.hkjc_json);
              return parsed && Object.keys(parsed).length > 0;
            } catch {
              return false;
            }
          });
          
          const upcoming = withHKJC.filter(m => {
            const matchDate = m.start_date?.split("T")[0];
            return matchDate && matchDate >= todayStr;
          });
          
          upcoming.sort((a, b) => 
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
          );
          
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
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xl font-bold text-gray-800">BallQ</span>
          </Link>
          <h1 className="text-lg font-bold text-green-500">賽事</h1>
          <div className="w-6" />
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2">
          <p className="text-yellow-700 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">今日賽事</h2>
          <p className="text-gray-500">{matches.length} 場 有HKJC赔率</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">今日冇 upcoming 賽事</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {matches.map((match) => {
              const odds = getOdds(match);
              return (
                <motion.div
                  key={match.position}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => window.location.href = `/match/${match.position}?name=${encodeURIComponent(match.name)}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow"
                >
                  {/* League & Time */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">{formatTime(match.start_date)}</span>
                    <span className="text-sm font-medium text-green-600">{match.league}</span>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl font-bold text-gray-700">{match.home_team.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800 text-center block">{match.home_team}</span>
                    </div>
                    
                    <div className="px-4">
                      <span className="text-gray-400 font-bold">VS</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl font-bold text-gray-700">{match.away_team.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800 text-center block">{match.away_team}</span>
                    </div>
                  </div>

                  {/* Odds */}
                  <div className="grid grid-cols-3 gap-2">
                    {odds.home ? (
                      <div className="py-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-xs text-gray-500 mb-1">主</div>
                        <div className="font-bold text-lg text-gray-800">{odds.home.toFixed(2)}</div>
                      </div>
                    ) : <div />}
                    {odds.draw ? (
                      <div className="py-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-xs text-gray-500 mb-1">和</div>
                        <div className="font-bold text-lg text-gray-800">{odds.draw.toFixed(2)}</div>
                      </div>
                    ) : <div />}
                    {odds.away ? (
                      <div className="py-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-xs text-gray-500 mb-1">客</div>
                        <div className="font-bold text-lg text-gray-800">{odds.away.toFixed(2)}</div>
                      </div>
                    ) : <div />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
