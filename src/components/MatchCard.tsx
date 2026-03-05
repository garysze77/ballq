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

  const leagueColor = match.league_color || "#3b82f6";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 mb-4 cursor-pointer"
    >
      {/* League Header */}
      <div className="px-4 py-2 bg-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-full" style={{ backgroundColor: leagueColor }} />
          <span className="text-gray-300 text-xs font-medium">{match.league}</span>
        </div>
        <div className="flex items-center gap-2">
          {match.status === "live" && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-500 text-xs font-bold">LIVE</span>
            </span>
          )}
          <span className="text-gray-400 text-xs">#{match.position}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Teams & Score */}
        <div className="flex items-center justify-between mb-4">
          {/* Home Team */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-1">
              <span className="text-lg font-bold text-gray-300">{match.home_team.charAt(0)}</span>
            </div>
            <span className="text-white text-sm font-medium text-center leading-tight">{match.home_team}</span>
          </div>

          {/* Score / Time */}
          <div className="flex flex-col items-center px-4">
            {match.status === "live" || match.status === "finished" ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-yellow-400">{match.home_score ?? 0}</span>
                <span className="text-gray-500 text-lg">-</span>
                <span className="text-2xl font-bold text-yellow-400">{match.away_score ?? 0}</span>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">{match.start_time}</span>
            )}
            {match.half && <span className="text-yellow-400 text-xs mt-1">{match.half}</span>}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-1">
              <span className="text-lg font-bold text-gray-300">{match.away_team.charAt(0)}</span>
            </div>
            <span className="text-white text-sm font-medium text-center leading-tight">{match.away_team}</span>
          </div>
        </div>

        {/* Odds Grid */}
        <div className="grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
          {match.home_odds && (
            <button
              onClick={() => setSelected(selected === "home" ? null : "home")}
              className={`py-3 px-2 rounded-lg transition-all duration-200 ${
                selected === "home" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <span className="text-xs block mb-1">主</span>
              <span className="text-lg font-bold">{match.home_odds.toFixed(2)}</span>
            </button>
          )}
          {match.draw_odds && (
            <button
              onClick={() => setSelected(selected === "draw" ? null : "draw")}
              className={`py-3 px-2 rounded-lg transition-all duration-200 ${
                selected === "draw" ? "bg-yellow-400 text-black" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <span className="text-xs block mb-1">和</span>
              <span className="text-lg font-bold">{match.draw_odds.toFixed(2)}</span>
            </button>
          )}
          {match.away_odds && (
            <button
              onClick={() => setSelected(selected === "away" ? null : "away")}
              className={`py-3 px-2 rounded-lg transition-all duration-200 ${
                selected === "away" ? "bg-red-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <span className="text-xs block mb-1">客</span>
              <span className="text-lg font-bold">{match.away_odds.toFixed(2)}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
