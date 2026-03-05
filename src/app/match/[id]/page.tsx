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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Match not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-green-500">Ballq</h1>
          <div className="w-8" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4">
        {/* Match Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-4 mb-4"
        >
          <div className="text-center mb-4">
            <span className="text-gray-400 text-sm">{match.league}</span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-white">{match.home_team.charAt(0)}</span>
              </div>
              <span className="text-white font-medium">{match.home_team}</span>
            </div>

            <div className="text-center px-4">
              {match.status === "live" ? (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-yellow-400">{match.home_score ?? 0}</span>
                  <span className="text-gray-500 text-2xl">-</span>
                  <span className="text-3xl font-bold text-yellow-400">{match.away_score ?? 0}</span>
                </div>
              ) : (
                <span className="text-gray-400">{match.start_time}</span>
              )}
              {match.half && <div className="text-yellow-400 text-sm mt-1">{match.half}</div>}
            </div>

            <div className="flex-1 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-white">{match.away_team.charAt(0)}</span>
              </div>
              <span className="text-white font-medium">{match.away_team}</span>
            </div>
          </div>

          {/* Odds */}
          <div className="grid grid-cols-3 gap-2">
            {match.home_odds && (
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">主</div>
                <div className="text-white font-bold text-lg">{match.home_odds.toFixed(2)}</div>
              </div>
            )}
            {match.draw_odds && (
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">和</div>
                <div className="text-white font-bold text-lg">{match.draw_odds.toFixed(2)}</div>
              </div>
            )}
            {match.away_odds && (
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">客</div>
                <div className="text-white font-bold text-lg">{match.away_odds.toFixed(2)}</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* HKJC Odds */}
        {match.hkjc_odds && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-4 mb-4"
          >
            <h3 className="text-white font-semibold mb-3">HKJC 赔率</h3>
            <div className="grid grid-cols-2 gap-2">
              {match.hkjc_odds.home && (
                <div className="bg-gray-700 rounded-lg p-2">
                  <div className="text-gray-400 text-xs">主</div>
                  <div className="text-green-400 font-bold">{match.hkjc_odds.home.toFixed(2)}</div>
                </div>
              )}
              {match.hkjc_odds.away && (
                <div className="bg-gray-700 rounded-lg p-2">
                  <div className="text-gray-400 text-xs">客</div>
                  <div className="text-red-400 font-bold">{match.hkjc_odds.away.toFixed(2)}</div>
                </div>
              )}
              {match.hkjc_odds.handicap && (
                <div className="bg-gray-700 rounded-lg p-2 col-span-2">
                  <div className="text-gray-400 text-xs">讓球</div>
                  <div className="text-yellow-400 font-bold">{match.hkjc_odds.handicap}</div>
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
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl mb-4 hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50"
        >
          {aiLoading ? "分析緊..." : "🤖 AI分析 + 投注策略"}
        </motion.button>

        {/* AI Analysis Result */}
        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">AI 分析</h3>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                aiAnalysis.confidence > 70 ? "bg-green-500/20 text-green-400" :
                aiAnalysis.confidence > 50 ? "bg-yellow-500/20 text-yellow-400" :
                "bg-red-500/20 text-red-400"
              }`}>
                {aiAnalysis.confidence}% 信心度
              </span>
            </div>

            <div className="bg-gray-700 rounded-lg p-3 mb-3">
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{aiAnalysis.analysis}</p>
            </div>

            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3">
              <div className="text-green-400 font-bold text-sm mb-1">💡 投注建議</div>
              <p className="text-white">{aiAnalysis.recommendation}</p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
