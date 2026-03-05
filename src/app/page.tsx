"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ballq.gonggu.app";

interface Match {
  position: number;
  name: string;
  league: string;
  home_team: string;
  away_team: string;
  start_date: string;
  hkjc?: {
    found: boolean;
    odds?: {
      HAD?: {
        selections?: {
          name: string;
          odds: string;
        }[];
      };
    };
  };
}

interface MatchGroup {
  date: string;
  matches: Match[];
}

function getOdds(match: Match) {
  if (!match.hkjc?.found || !match.hkjc.odds?.HAD?.selections) {
    return { home: null, draw: null, away: null };
  }
  
  const selections = match.hkjc.odds.HAD.selections;
  const home = selections.find((s) => s.name === "Home");
  const away = selections.find((s) => s.name === "Away");
  const draw = selections.find((s) => s.name === "Draw");
  
  return {
    home: home ? parseFloat(home.odds) : null,
    draw: draw ? parseFloat(draw.odds) : null,
    away: away ? parseFloat(away.odds) : null,
  };
}

function formatTime(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
}

export default function Home() {
  const router = useRouter();
  const [matchGroups, setMatchGroups] = useState<MatchGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch(`${API_URL}/matches/integrated`, {
          signal: AbortSignal.timeout(10000)
        });
        if (res.ok) {
          const data = await res.json();
          const matchList: Match[] = data.data || [];
          const groups = groupMatchesByDate(matchList);
          setMatchGroups(groups);
        } else {
          setError(`API錯誤 (${res.status})`);
        }
      } catch (err: any) {
        setError(`連接失敗: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  function groupMatchesByDate(matches: Match[]): MatchGroup[] {
    // Filter to only show matches with HKJC odds
    const matchesWithHKJC = matches.filter(m => m.hkjc?.found);
    
    const groups: Record<string, Match[]> = {};
    
    matchesWithHKJC.forEach((match) => {
      const date = match.start_date?.split("T")[0] || "Unknown";
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(match);
    });

    return Object.entries(groups).map(([date, matches]) => ({
      date,
      matches,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

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
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          matchGroups.map((group) => (
            <div key={group.date} className="mb-4">
              <div className="sticky top-[52px] z-10 bg-gray-100 py-2 px-2">
                <h2 className="text-sm font-semibold text-gray-700">
                  {formatDate(group.date)} 賽事
                </h2>
                <p className="text-xs text-gray-500">{group.matches.length} 場</p>
              </div>

              <div className="space-y-1">
                {group.matches.map((match) => {
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
                      {/* Header */}
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{formatTime(match.start_date)}</span>
                          <span className="text-xs text-gray-400">#{match.position}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-500">
                          {match.league}
                        </span>
                      </div>

                      {/* Main */}
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-800">{match.home_team}</span>
                          </div>
                          <div className="px-3 text-center">
                            <span className="text-xs text-gray-400">VS</span>
                          </div>
                          <div className="flex-1 flex justify-end">
                            <span className="text-sm font-medium text-gray-800">{match.away_team}</span>
                          </div>
                        </div>

                        {/* Odds */}
                        <div className="grid grid-cols-3 gap-2">
                          {odds.home ? (
                            <button className="py-2 px-1 rounded text-center bg-gray-100 hover:bg-gray-200">
                              <div className="text-xs text-gray-500">主</div>
                              <div className="font-bold text-gray-800">{odds.home.toFixed(2)}</div>
                            </button>
                          ) : (
                            <div className="py-2 px-1 rounded text-center bg-gray-50">
                              <div className="text-xs text-gray-400">-</div>
                            </div>
                          )}
                          {odds.draw ? (
                            <button className="py-2 px-1 rounded text-center bg-gray-100 hover:bg-gray-200">
                              <div className="text-xs text-gray-500">和</div>
                              <div className="font-bold text-gray-800">{odds.draw.toFixed(2)}</div>
                            </button>
                          ) : (
                            <div className="py-2 px-1 rounded text-center bg-gray-50">
                              <div className="text-xs text-gray-400">-</div>
                            </div>
                          )}
                          {odds.away ? (
                            <button className="py-2 px-1 rounded text-center bg-gray-100 hover:bg-gray-200">
                              <div className="text-xs text-gray-500">客</div>
                              <div className="font-bold text-gray-800">{odds.away.toFixed(2)}</div>
                            </button>
                          ) : (
                            <div className="py-2 px-1 rounded text-center bg-gray-50">
                              <div className="text-xs text-gray-400">-</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
