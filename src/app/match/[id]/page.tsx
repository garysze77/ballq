"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ballq.gonggu.app";

interface Match {
  position: number;
  name: string;
  league: string;
  home_team: string;
  away_team: string;
  start_date: string;
  prediction?: string;
  hkjc?: {
    found: boolean;
    match_id?: string;
    odds?: any;
  };
}

export default function MatchDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  const matchName = searchParams.get("name");
  const matchData = searchParams.get("data");

  useEffect(() => {
    async function fetchMatch() {
      try {
        // First try to get match data from URL params
        if (matchData) {
          const decoded = JSON.parse(decodeURIComponent(matchData));
          setMatch(decoded);
          setLoading(false);
          return;
        }
        
        // Fallback: fetch from API by name
        const res = await fetch(`${API_URL}/matches/integrated`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        const matches: Match[] = data.data || [];
        
        const found = matches.find(m => m.name === matchName);
        if (found) {
          setMatch(found);
        }
      } catch (err) {
        console.error("Failed to fetch match:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatch();
  }, [matchName, matchData]);

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

        {/* HKJC Odds */}
        {match.hkjc && match.hkjc.found && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-4 mb-3"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-3">HKJC 赔率</h3>
            <div className="space-y-2">
              {match.hkjc.odds?.HAD?.selections?.map((sel: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 rounded p-2">
                  <span className="text-sm text-gray-600">{sel.name}</span>
                  <span className="font-bold text-lg">{sel.odds}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* No HKJC match info */}
        {(!match.hkjc || !match.hkjc.found) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-4"
          >
            <p className="text-gray-500 text-sm">呢場比賽暫時未有HKJC配對</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
