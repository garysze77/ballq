"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ballq.gonggu.app";
const PROXY_URL = "/api/ballq";

interface MatchDetail {
  position: number;
  name: string;
  league: string;
  home_team: string;
  away_team: string;
  start_date: string;
  prediction?: string;
  detail?: {
    h2h?: {
      summary?: string;
      home_wins?: number;
      away_wins?: number;
      draws?: number;
    };
    team_form?: {
      home_team?: {
        last_5_form?: string;
        form?: string;
        wins?: string;
        draws?: string;
        losses?: string;
      };
      away_team?: {
        last_5_form?: string;
        form?: string;
        wins?: string;
        draws?: string;
        losses?: string;
      };
    };
    analysis?: {
      article_text?: string[];
    };
  };
  hkjc?: {
    found: boolean;
    odds?: Record<string, any>;
  };
}

export default function MatchDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const position = searchParams.get("position");
  const matchName = searchParams.get("name");

  useEffect(() => {
    async function fetchMatch() {
      try {
        // Use database endpoint which has full detail (h2h, team_form, analysis)
        const res = await fetch(`https://ballq.gonggu.app/db/matches`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        const matches = data.data || [];
        
        // Parse JSON strings from database
        const parsedMatches = matches.map((m: any) => ({
          ...m,
          hkjc: m.hkjc_json ? JSON.parse(m.hkjc_json) : null,
          detail: m.detail_json ? JSON.parse(m.detail_json) : null,
          ai_analysis: m.ai_analysis_json ? JSON.parse(m.ai_analysis_json) : null,
        }));
        
        // Find match by name
        const found = parsedMatches.find((m: any) => m.name === matchName);
        
        if (found) {
          setMatch({
            position: found.position,
            name: found.name,
            league: found.league,
            home_team: found.home_team,
            away_team: found.away_team,
            start_date: found.start_date,
            prediction: found.prediction,
            detail: found.detail || {},
            hkjc: found.hkjc_json ? JSON.parse(found.hkjc_json) : null
          });
        }
      } catch (err: any) {
        console.error("Failed to fetch match:", err);
        setError(`載入失敗: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    }
    fetchMatch();
  }, [matchName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-500 p-4">{error}</div>
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

  // Pool name translations
  const poolNames: Record<string, string> = {
    HAD: "全場主客和",
    FHL: "半場大小",
    FHA: "半場讓球",
    HHA: "讓球主客和",
    HDC: "讓球",
    FHH: "全場大小",
    HIL: "半場入球大細",
    CHL: "角球大細",
    CRS: "波膽",
    FCS: "半場波膽",
    FTS: "全場總入球",
    TTG: "總入球",
    OOE: "單雙數",
    HFT: "半全場",
  };

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
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-600">{match.league}</span>
          </div>

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

            {match.prediction && (
              <div className="bg-green-50 rounded p-3">
                <span className="text-sm font-medium text-green-800">預測: {match.prediction}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Team Form */}
        {match.detail?.team_form && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-4 mb-3"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3">球隊近況</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-500 mb-1">{match.home_team}</div>
                <div className="font-bold text-green-600">{match.detail.team_form.home_team?.last_5_form || "-"}</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-xs text-gray-500 mb-1">{match.away_team}</div>
                <div className="font-bold text-green-600">{match.detail.team_form.away_team?.last_5_form || "-"}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* H2H */}
        {match.detail?.h2h?.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-lg shadow-sm p-4 mb-3"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3">對賽往績</h3>
            <div className="flex justify-center gap-4 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{match.detail.h2h.home_wins}</div>
                <div className="text-xs text-gray-500">{match.home_team}贏</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{match.detail.h2h.draws}</div>
                <div className="text-xs text-gray-500">和</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{match.detail.h2h.away_wins}</div>
                <div className="text-xs text-gray-500">{match.away_team}贏</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">{match.detail.h2h.summary}</p>
          </motion.div>
        )}

        {/* HKJC Odds - Multiple Pools */}
        {match.hkjc && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-4 mb-3"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3">HKJC 赔率</h3>
            <div className="space-y-3">
              {Object.entries(match.hkjc).map(([poolKey, pool]) => {
                if (!pool?.selections?.length) return null;
                return (
                  <div key={poolKey} className="border-b border-gray-100 pb-2 last:border-0">
                    <div className="text-xs font-medium text-gray-500 mb-1">{poolNames[poolKey] || poolKey}</div>
                    <div className="grid grid-cols-3 gap-1">
                      {pool.selections.slice(0, 3).map((sel: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded p-1 text-center">
                          <div className="text-xs text-gray-500">{sel.name}</div>
                          <div className="font-bold text-sm">{sel.odds}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Analysis */}
        {match.detail?.analysis?.article_text && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-lg shadow-sm p-4"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3">分析</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {match.detail.analysis.article_text.slice(0, 2).join("\n\n")}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
