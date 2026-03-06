"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface MatchDetail {
  position: number;
  name: string;
  league: string;
  home_team: string;
  away_team: string;
  start_date: string;
  prediction?: string;
  detail_json?: string;
  hkjc_json?: string;
}

export default function MatchDetail() {
  const router = typeof window !== "undefined" ? require("next/navigation").useRouter() : null;
  const searchParams = typeof window !== "undefined" ? require("next/navigation").useSearchParams() : null;
  
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get params from URL
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const position = params?.get("position");
  const matchName = params?.get("name");

  useEffect(() => {
    async function fetchMatch() {
      try {
        const res = await fetch("https://ballq.gonggu.app/db/matches", {
          signal: AbortSignal.timeout(8000)
        });
        if (res.ok) {
          const data = await res.json();
          const matches = data.data || [];
          
          // Find by name
          const found = matches.find((m: any) => m.name === matchName);
          
          if (found) {
            setMatch(found);
          } else {
            setError("找不到賽事");
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch match:", err);
        setError(`載入失敗: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    if (matchName) fetchMatch();
    else setLoading(false);
  }, [matchName]);

  // Parse HKJC data
  const hkjcData = match?.hkjc_json ? (() => {
    try {
      return JSON.parse(match.hkjc_json!);
    } catch {
      return null;
    }
  })() : null;
  
  const detailData = match?.detail_json ? (() => {
    try {
      return JSON.parse(match.detail_json!);
    } catch {
      return null;
    }
  })() : null;

  const poolNames: Record<string, string> = {
    HAD: "全場主客和",
    FHL: "半場大小",
    FHA: "半場讓球",
    HHA: "讓球主客和",
    HDC: "讓球",
    FHH: "全場大小",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <button onClick={() => window.history.back()} className="flex items-center gap-2">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-gray-600">返回</span>
            </button>
          </div>
        </header>
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">{error || "找不到賽事"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="flex items-center gap-2">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-green-500">BallQ</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Match Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6"
        >
          {/* League & Time */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <span className="text-gray-600 font-medium">{match.league}</span>
            <span className="text-gray-500">{match.start_date}</span>
          </div>

          {/* Teams */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              {/* Home */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-gray-700">{match.home_team?.charAt(0) || "?"}</span>
                </div>
                <span className="text-lg font-medium text-gray-800">{match.home_team}</span>
              </div>

              {/* VS */}
              <div className="px-6">
                <span className="text-2xl font-bold text-gray-300">VS</span>
              </div>

              {/* Away */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-gray-700">{match.away_team?.charAt(0) || "?"}</span>
                </div>
                <span className="text-lg font-medium text-gray-800">{match.away_team}</span>
              </div>
            </div>

            {/* Prediction */}
            {match.prediction && (
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <span className="text-green-800 font-medium">預測: {match.prediction}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* HKJC Odds */}
        {hkjcData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">HKJC 赔率</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(hkjcData).map(([poolKey, pool]: [string, any]) => {
                if (!pool?.selections?.length) return null;
                return (
                  <div key={poolKey} className="border border-gray-100 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 mb-3">{poolNames[poolKey] || poolKey}</div>
                    <div className="grid grid-cols-3 gap-2">
                      {pool.selections.slice(0, 3).map((sel: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-500 mb-1">{sel.name}</div>
                          <div className="font-bold text-lg text-gray-800">{sel.odds}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Detail Info */}
        {detailData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">數據分析</h3>
            
            {/* Team Form */}
            {detailData.team_form && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">球隊近況</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {detailData.team_form.home_team && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">{match.home_team}</div>
                      <div className="text-green-600 font-bold">{detailData.team_form.home_team.last_5_form || "-"}</div>
                    </div>
                  )}
                  {detailData.team_form.away_team && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">{match.away_team}</div>
                      <div className="text-green-600 font-bold">{detailData.team_form.away_team.last_5_form || "-"}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* H2H */}
            {detailData.h2h?.summary && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">對賽往績</h4>
                <div className="flex justify-center gap-8 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{detailData.h2h.home_wins || 0}</div>
                    <div className="text-xs text-gray-500">{match.home_team}贏</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{detailData.h2h.draws || 0}</div>
                    <div className="text-xs text-gray-500">和</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{detailData.h2h.away_wins || 0}</div>
                    <div className="text-xs text-gray-500">{match.away_team}贏</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
