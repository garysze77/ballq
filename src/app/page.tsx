"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MatchCard from "../components/MatchCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ballq.gonggu.app:8000";

interface Match {
  position: number;
  league: string;
  league_color?: string;
  home_team: string;
  away_team: string;
  home_odds?: number;
  draw_odds?: number;
  away_odds?: number;
  status?: string;
  start_time?: string;
  match_date?: string;
  home_score?: number;
  away_score?: number;
  half?: string;
}

interface MatchGroup {
  date: string;
  matches: Match[];
}

export default function Home() {
  const router = useRouter();
  const [matchGroups, setMatchGroups] = useState<MatchGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch(`${API_URL}/matches/integrated`);
        if (res.ok) {
          const data = await res.json();
          const matchList: Match[] = Array.isArray(data) ? data : data.matches || [];
          
          // Group by date
          const groups = groupMatchesByDate(matchList);
          setMatchGroups(groups);
        } else {
          setError("API未連接 - 顯示Demo數據");
          setMatchGroups(getDemoMatchGroups());
        }
      } catch (err) {
        setError("API未連接 - 顯示Demo數據");
        setMatchGroups(getDemoMatchGroups());
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  function groupMatchesByDate(matches: Match[]): MatchGroup[] {
    const groups: Record<string, Match[]> = {};
    
    matches.forEach((match) => {
      const date = match.match_date || new Date().toISOString().split("T")[0];
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

  function getDemoMatchGroups(): MatchGroup[] {
    return [
      {
        date: "2026-03-05",
        matches: [
          {
            position: 624,
            league: "英超",
            league_color: "#3b82f6",
            home_team: "熱刺",
            away_team: "水晶宮",
            home_odds: 2.16,
            draw_odds: 3.20,
            away_odds: 2.84,
            status: "upcoming",
            start_time: "04:00",
            match_date: "2026-03-05",
          },
          {
            position: 625,
            league: "英超",
            league_color: "#3b82f6",
            home_team: "曼聯",
            away_team: "阿仙奴",
            home_odds: 3.10,
            draw_odds: 3.40,
            away_odds: 2.05,
            status: "upcoming",
            start_time: "04:15",
            match_date: "2026-03-05",
          },
        ],
      },
      {
        date: "2026-03-06",
        matches: [
          {
            position: 626,
            league: "西甲",
            league_color: "#f97316",
            home_team: "巴塞",
            away_team: "皇馬",
            home_odds: 2.45,
            draw_odds: 3.50,
            away_odds: 2.60,
            status: "upcoming",
            start_time: "04:00",
            match_date: "2026-03-06",
          },
        ],
      },
    ];
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["日", "一", "二", "三", "四", "五", "六"];
    return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - HKJC Green */}
      <header className="bg-[#0x9d4edd] text-white sticky top-0 z-50" style={{ backgroundColor: "#00994d" }}>
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">Ballq 足智彩</h1>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm">G</span>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <p className="text-yellow-700 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-md mx-auto px-2 py-2">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          matchGroups.map((group) => (
            <div key={group.date} className="mb-4">
              {/* Date Header */}
              <div className="sticky top-[52px] z-10 bg-gray-100 py-2 px-2">
                <h2 className="text-sm font-semibold text-gray-700">
                  {formatDate(group.date)} 賽事
                </h2>
                <p className="text-xs text-gray-500">{group.matches.length} 場</p>
              </div>

              {/* Match Cards */}
              <div className="space-y-1">
                {group.matches.map((match) => (
                  <MatchCard
                    key={match.position}
                    match={match}
                    onClick={() => router.push(`/match/${match.position}`)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0">
        <div className="max-w-md mx-auto flex justify-around py-2">
          <button className="flex flex-col items-center" style={{ color: "#00994d" }}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span className="text-xs mt-1">賽事</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs mt-1">賽果</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs mt-1">投注</span>
          </button>
          <button className="flex flex-col items-center text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs mt-1">更多</span>
          </button>
        </div>
      </nav>
      <div className="h-16" />
    </div>
  );
}
