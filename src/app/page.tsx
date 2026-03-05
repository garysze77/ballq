"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MatchCard from "../components/MatchCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.104.99.225:8000";

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
        console.log("Fetching from:", API_URL);
        const res = await fetch(`${API_URL}/matches/integrated`, {
          signal: AbortSignal.timeout(10000)
        });
        console.log("Response status:", res.status);
        if (res.ok) {
          const data = await res.json();
          console.log("Data received:", data);
          const matchList: Match[] = Array.isArray(data) ? data : data.matches || [];
          
          // Group by date
          const groups = groupMatchesByDate(matchList);
          setMatchGroups(groups);
        } else {
          setError(`API錯誤 (${res.status}) - 顯示Demo數據`);
          setMatchGroups(getDemoMatchGroups());
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(`連接失敗: ${err.message} - 顯示Demo數據`);
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
          <h1 className="text-lg font-bold">Ballq</h1>
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


    </div>
  );
}
