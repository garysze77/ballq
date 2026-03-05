"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.104.99.225:8000";

interface MatchDetail {
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
  // HKJC odds
  hkjc_odds?: {
    home?: number;
    draw?: number;
    away?: number;
    half_time_home?: number;
    half_time_away?: number;
    totalGoals?: number;
    handicap?: number;
  };
}

interface AIAnalysis {
  match_position: number;
  analysis: string;
  recommendation: string;
  confidence: number;
  risk_level: string;
}

export default function MatchDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function fetchMatch() {
      try {
        const res = await fetch(`${API_URL}/match/${params.id}/detail`);
        if (res.ok) {
          const data = await res.json();
          setMatch(data);
        }
      } catch (err) {
        console.error("Failed to fetch match:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatch();
  }, [params.id]);

  async function loadAIAnalysis() {
    setAiLoading(true);
    try {
      const res = await fetch(`${API_URL}/match/${params.id}/ai-analysis`);
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error("Failed to fetch AI analysis:", err);
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">找不到賽事</div>
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
            <span className="text-sm font-medium" style={{ color: match.league_color || "#666" }}>
              {match.league}
            </span>
            <span className="text-xs text-gray-500">
              {match.match_date} {match.start_time}
            </span>
          </div>

          {/* Teams & Score */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              {/* Home */}
              <div className="flex-1 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-gray-700">{match.home_team.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-gray-800">{match.home_team}</span>
              </div>

              {/* Score */}
              <div className="text-center px-4">
                {match.status === "live" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-gray-800">{match.home_score ?? 0}</span>
                    <span className="text-gray-400 text-xl">-</span>
                    <span className="text-3xl font-bold text-gray-800">{match.away_score ?? 0}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">VS</span>
                )}
                {match.half && (
                  <div className="text-xs text-orange-500 mt-1">{match.half}</div>
                )}
              </div>

              {/* Away */}
              <div className="flex-1 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-gray-700">{match.away_team.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-gray-800">{match.away_team}</span>
              </div>
            </div>

            {/* Main Odds */}
            <div className="grid grid-cols-3 gap-2">
              {match.home_odds && (
                <button className="py-3 bg-gray-100 rounded-lg text-center hover:bg-gray-200">
                  <div className="text-xs text-gray-500">主</div>
                  <div className="font-bold text-gray-800">{match.home_odds.toFixed(2)}</div>
                </button>
              )}
              {match.draw_odds && (
                <button className="py-3 bg-gray-100 rounded-lg text-center hover:bg-gray-200">
                  <div className="text-xs text-gray-500">和</div>
                  <div className="font-bold text-gray-800">{match.draw_odds.toFixed(2)}</div>
                </button>
              )}
              {match.away_odds && (
                <button className="py-3 bg-gray-100 rounded-lg text-center hover:bg-gray-200">
                  <div className="text-xs text-gray-500">客</div>
                  <div className="font-bold text-gray-800">{match.away_odds.toFixed(2)}</div>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* HKJC Odds */}
        {match.hkjc_odds && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-4 mb-3"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3">HKJC 赔率</h3>
            <div className="grid grid-cols-2 gap-2">
              {match.hkjc_odds.home && (
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-500">主</div>
                  <div className="font-bold text-green-600">{match.hkjc_odds.home.toFixed(2)}</div>
                </div>
              )}
              {match.hkjc_odds.away && (
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-500">客</div>
                  <div className="font-bold text-red-600">{match.hkjc_odds.away.toFixed(2)}</div>
                </div>
              )}
              {match.hkjc_odds.handicap && (
                <div className="bg-gray-50 rounded p-2 col-span-2">
                  <div className="text-xs text-gray-500">讓球</div>
                  <div className="font-bold text-orange-600">{match.hkjc_odds.handicap}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* AI Analysis Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={loadAIAnalysis}
          disabled={aiLoading}
          className="w-full text-white font-bold py-4 rounded-lg mb-3 transition-all disabled:opacity-50"
          style={{ backgroundColor: "#00994d" }}
        >
          {aiLoading ? "分析緊..." : "🤖 AI分析 + 投注策略"}
        </motion.button>

        {/* AI Analysis Result */}
        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">AI 分析</h3>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                aiAnalysis.confidence > 70 ? "bg-green-100 text-green-700" :
                aiAnalysis.confidence > 50 ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {aiAnalysis.confidence}% 信心度
              </span>
            </div>

            <div className="bg-gray-50 rounded p-3 mb-3">
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{aiAnalysis.analysis}</p>
            </div>

            <div className="rounded-lg p-3" style={{ backgroundColor: "#e8f5e9" }}>
              <div className="font-bold text-sm mb-1" style={{ color: "#00994d" }}>💡 投注建議</div>
              <p className="text-gray-800">{aiAnalysis.recommendation}</p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
