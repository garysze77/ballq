"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ballq.gonggu.app";

interface MatchData {
  position: number;
  name: string;
  league: string;
  home_team: string;
  away_team: string;
  start_date: string;
  prediction?: string;
  detail?: any;
  ai_analysis?: any;
  updated_at?: string;
}

export default function MatchDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const matchName = searchParams.get("name");
  const position = searchParams.get("position");

  useEffect(() => {
    async function fetchMatch() {
      try {
        // Get all matches from DB
        const res = await fetch(`${API_URL}/db/matches`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        const matches: MatchData[] = data.data || [];
        
        // Try to find by name first, then by position
        let foundMatch = null;
        
        if (matchName) {
          // Find by name - get the latest one
          foundMatch = matches
            .filter(m => m.name === matchName)
            .sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())[0];
        }
        
        // Fallback to position if name not found
        if (!foundMatch && position) {
          const pos = parseInt(position);
          foundMatch = matches
            .filter(m => m.position === pos)
            .sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())[0];
        }
        
        // Last fallback - just use the first match with this position
        if (!foundMatch) {
          foundMatch = matches.find(m => m.position === parseInt(position || "1"));
        }
        
        if (foundMatch) {
          setMatch(foundMatch);
        } else {
          setError("找不到賽事");
        }
      } catch (err) {
        console.error("Failed to fetch match:", err);
        setError("載入失敗");
      } finally {
        setLoading(false);
      }
    }
    fetchMatch();
  }, [matchName, position]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">{error || "找不到賽事"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-1 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold" style={{ color: "#00994d" }}>Ballq</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-2 py-2">
        {/* Match Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm mb-3"
        >
          {/* League & Time */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">
              {match.league}
            </span>
            <span className="text-xs text-gray-500">
              {match.start_date}
            </span>
          </div>

          {/* Teams */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-gray-700">{match.home_team?.charAt(0) || "?"}</span>
                </div>
                <span className="text-sm font-medium text-gray-800">{match.home_team}</span>
              </div>

              <div className="text-center px-4">
                <span className="text-gray-400 text-xl">VS</span>
              </div>

              <div className="flex-1 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-gray-700">{match.away_team?.charAt(0) || "?"}</span>
                </div>
                <span className="text-sm font-medium text-gray-800">{match.away_team}</span>
              </div>
            </div>

            {/* Prediction */}
            {match.prediction && (
              <div className="bg-gray-50 rounded p-3 text-sm text-gray-600">
                <span className="font-medium">預測: </span>
                {match.prediction}
              </div>
            )}
          </div>
        </motion.div>

        {/* Detail Info */}
        {match.detail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-4 mb-3"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3">詳細數據</h3>
            
            {/* Team Form */}
            {match.detail.team_form && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{match.home_team} 近績:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {match.detail.team_form.home_team?.last_5_form || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{match.away_team} 近績:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {match.detail.team_form.away_team?.last_5_form || "N/A"}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* AI Analysis */}
        {match.ai_analysis && Object.keys(match.ai_analysis).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-4"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3">AI 分析</h3>
            
            {match.ai_analysis.analysis && (
              <div className="bg-gray-50 rounded p-3 mb-3">
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{match.ai_analysis.analysis}</p>
              </div>
            )}
            
            {match.ai_analysis.recommendation && (
              <div className="rounded-lg p-3" style={{ backgroundColor: "#e8f5e9" }}>
                <div className="font-bold text-sm mb-1" style={{ color: "#00994d" }}>💡 投注建議</div>
                <p className="text-gray-800">{match.ai_analysis.recommendation}</p>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
