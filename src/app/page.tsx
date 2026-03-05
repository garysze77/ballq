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
  home_score?: number;
  away_score?: number;
  half?: string;
}

export default function Home() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch(`${API_URL}/matches/integrated`);
        if (res.ok) {
          const data = await res.json();
          // Handle both array and object response
          const matchList = Array.isArray(data) ? data : data.matches || [];
          setMatches(matchList);
        } else {
          // Fallback to demo data if API not available
          setError("API未連接 - 顯示Demo數據");
          setMatches(getDemoMatches());
        }
      } catch (err) {
        setError("API未連接 - 顯示Demo數據");
        setMatches(getDemoMatches());
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  function getDemoMatches(): Match[] {
    return [
      {
        position: 624,
        league: "Premier League",
        league_color: "#3b82f6",
        home_team: "Aston Villa",
        away_team: "Chelsea",
        home_odds: 2.85,
        draw_odds: 3.45,
        away_odds: 2.45,
        status: "live",
        start_time: "03:30",
        home_score: 1,
        away_score: 1,
        half: "2nd Half",
      },
      {
        position: 625,
        league: "Premier League",
        league_color: "#3b82f6",
        home_team: "Brighton",
        away_team: "Arsenal",
        home_odds: 4.2,
        draw_odds: 3.8,
        away_odds: 1.82,
        status: "live",
        start_time: "03:30",
        home_score: 0,
        away_score: 2,
        half: "1st Half",
      },
      {
        position: 626,
        league: "Bundesliga",
        league_color: "#dc2626",
        home_team: "Hamburger SV",
        away_team: "Bayer Leverkusen",
        home_odds: 5.5,
        draw_odds: 4.2,
        away_odds: 1.62,
        status: "upcoming",
        start_time: "03:30",
      },
    ];
  }

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

      {error && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2">
          <p className="text-yellow-400 text-sm text-center">{error}</p>
        </div>
      )}

      <main className="max-w-md mx-auto px-4 py-4">
        <div className="mb-4">
          <h2 className="text-white font-semibold">今日賽事</h2>
          <p className="text-gray-500 text-sm">{matches.length} 場比賽</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : (
          matches.map((match) => (
            <MatchCard
              key={match.position}
              match={match}
              onClick={() => router.push(`/match/${match.position}`)}
            />
          ))
        )}
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
