"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Team {
  name: string;
  logo?: string;
}

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

interface MatchCardProps {
  match: Match;
  onClick: () => void;
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const [selected, setSelected] = useState<"home" | "draw" | "away" | null>(null);

  const isLive = match.status === "live";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isLive ? "bg-red-500 animate-pulse" : "bg-gray-300"}`} />
          <span className="text-xs text-gray-500">{match.start_time}</span>
          <span className="text-xs text-gray-400">#{match.position}</span>
        </div>
        <span className="text-xs font-medium" style={{ color: match.league_color || "#666" }}>
          {match.league}
        </span>
      </div>

      {/* Main Content */}
      <div className="p-3">
        {/* Teams & Score */}
        <div className="flex items-center justify-between mb-3">
          {/* Home Team */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isLive && match.home_score !== undefined ? (
                <span className="text-lg font-bold text-gray-800">{match.home_score}</span>
              ) : null}
              <span className="text-sm font-medium text-gray-800">{match.home_team}</span>
            </div>
          </div>

          {/* VS or Score */}
          <div className="px-3 text-center">
            {isLive ? (
              <span className="text-xs text-gray-400">{match.half || "LIVE"}</span>
            ) : (
              <span className="text-xs text-gray-400">VS</span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800">{match.away_team}</span>
              {isLive && match.away_score !== undefined ? (
                <span className="text-lg font-bold text-gray-800">{match.away_score}</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Odds */}
        <div className="grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
          {match.home_odds && (
            <button
              onClick={() => setSelected(selected === "home" ? null : "home")}
              className={`py-2 px-1 rounded text-center transition-all ${
                selected === "home"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="text-xs opacity-70">主</div>
              <div className="font-bold">{match.home_odds.toFixed(2)}</div>
            </button>
          )}
          {match.draw_odds && (
            <button
              onClick={() => setSelected(selected === "draw" ? null : "draw")}
              className={`py-2 px-1 rounded text-center transition-all ${
                selected === "draw"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="text-xs opacity-70">和</div>
              <div className="font-bold">{match.draw_odds.toFixed(2)}</div>
            </button>
          )}
          {match.away_odds && (
            <button
              onClick={() => setSelected(selected === "away" ? null : "away")}
              className={`py-2 px-1 rounded text-center transition-all ${
                selected === "away"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="text-xs opacity-70">客</div>
              <div className="font-bold">{match.away_odds.toFixed(2)}</div>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
