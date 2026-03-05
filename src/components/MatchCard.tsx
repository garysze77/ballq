"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Team {
  name: string;
  logo?: string;
}

interface MatchCardProps {
  matchId: string;
  league: string;
  leagueColor?: string;
  homeTeam: Team;
  awayTeam: Team;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  status?: "live" | "finished" | "upcoming";
  startTime?: string;
  homeScore?: number;
  awayScore?: number;
  half?: string;
}

export default function MatchCard({
  matchId,
  league,
  leagueColor = "#3b82f6",
  homeTeam,
  awayTeam,
  homeOdds,
  drawOdds,
  awayOdds,
  status = "upcoming",
  startTime,
  homeScore,
  awayScore,
  half,
}: MatchCardProps) {
  const [selected, setSelected] = useState<"home" | "draw" | "away" | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 mb-4 relative"
    >
      {/* League Header */}
      <div className="px-4 py-2 bg-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-full" style={{ backgroundColor: leagueColor }} />
          <span className="text-gray-300 text-xs font-medium">{league}</span>
        </div>
        <div className="flex items-center gap-2">
          {status === "live" && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-500 text-xs font-bold">LIVE</span>
            </span>
          )}
          <span className="text-gray-400 text-xs">{matchId}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Teams & Score */}
        <div className="flex items-center justify-between mb-4">
          {/* Home Team */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-1">
              <span className="text-lg font-bold text-gray-300">{homeTeam.name.charAt(0)}</span>
            </div>
            <span className="text-white text-sm font-medium text-center leading-tight">{homeTeam.name}</span>
          </div>

          {/* Score / Time */}
          <div className="flex flex-col items-center px-4">
            {status === "live" || status === "finished" ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-yellow-400">{homeScore ?? 0}</span>
                <span className="text-gray-500 text-lg">-</span>
                <span className="text-2xl font-bold text-yellow-400">{awayScore ?? 0}</span>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">{startTime}</span>
            )}
            {half && <span className="text-yellow-400 text-xs mt-1">{half}</span>}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-1">
              <span className="text-lg font-bold text-gray-300">{awayTeam.name.charAt(0)}</span>
            </div>
            <span className="text-white text-sm font-medium text-center leading-tight">{awayTeam.name}</span>
          </div>
        </div>

        {/* Odds Grid */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelected(selected === "home" ? null : "home")}
            className={`py-3 px-2 rounded-lg transition-all duration-200 ${
              selected === "home" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <span className="text-xs block mb-1">主</span>
            <span className="text-lg font-bold">{homeOdds.toFixed(2)}</span>
          </button>
          <button
            onClick={() => setSelected(selected === "draw" ? null : "draw")}
            className={`py-3 px-2 rounded-lg transition-all duration-200 ${
              selected === "draw" ? "bg-yellow-400 text-black" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <span className="text-xs block mb-1">和</span>
            <span className="text-lg font-bold">{drawOdds.toFixed(2)}</span>
          </button>
          <button
            onClick={() => setSelected(selected === "away" ? null : "away")}
            className={`py-3 px-2 rounded-lg transition-all duration-200 ${
              selected === "away" ? "bg-red-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <span className="text-xs block mb-1">客</span>
            <span className="text-lg font-bold">{awayOdds.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
