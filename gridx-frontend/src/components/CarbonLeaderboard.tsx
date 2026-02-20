"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { BiTrophy, BiMedal, BiLeaf, BiTrendingUp } from "react-icons/bi";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  balance: number;
  total_earned: number;
}

export default function CarbonLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await api.getCarbonLeaderboard();
      // Add fake ranks if API doesn't provide them
      const data = response.data.map((item: any, idx: number) => ({
        ...item,
        rank: idx + 1
      }));
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
      // Fallback mock data if API fails or is empty
      setLeaderboard([
        { rank: 1, user_id: "1", name: "Green Energy Hub", balance: 4500, total_earned: 4500 },
        { rank: 2, user_id: "2", name: "Apex Solaris", balance: 3200, total_earned: 3200 },
        { rank: 3, user_id: "3", name: "Rohan's Eco Smart", balance: 2850, total_earned: 2850 },
        { rank: 4, user_id: "4", name: "Ananya Iyer", balance: 1420, total_earned: 1420 },
        { rank: 5, user_id: "5", name: "Gurugram Micro-Farm", balance: 980, total_earned: 980 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-neon-yellow border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Calibrating Heroes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neon-yellow bg-opacity-10 rounded-lg">
            <BiTrophy className="text-neon-yellow text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-100 uppercase tracking-widest">Sustainability Champions</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Top contributors to grid decarbonization</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 flex items-center gap-3">
          <BiLeaf className="text-neon-green" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Updated Real-Time</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaderboard.slice(0, 3).map((hero, idx) => (
          <motion.div
            key={hero.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative p-6 rounded-2xl border ${idx === 0 ? "bg-gradient-to-br from-yellow-950 to-black border-neon-yellow shadow-glow-yellow" :
                idx === 1 ? "bg-gradient-to-br from-gray-800 to-black border-gray-400" :
                  "bg-gradient-to-br from-orange-950 to-black border-orange-600"
              } overflow-hidden group`}
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-5 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>

            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center border border-white border-opacity-10">
                <span className="text-xl">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
              </div>
              <BiMedal className={`text-2xl ${idx === 0 ? "text-neon-yellow" : idx === 1 ? "text-gray-400" : "text-orange-500"}`} />
            </div>

            <h4 className="text-lg font-black text-gray-100 mb-1 truncate">{hero.name}</h4>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4">Rank #{hero.rank} Contributor</p>

            <div className="pt-4 border-t border-white border-opacity-10">
              <p className="text-2xl font-black text-neon-green neon-glow-green">{Number(hero.balance).toLocaleString()}</p>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Carbon Tokens Earned</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl mt-8">
        <div className="px-8 py-4 bg-black bg-opacity-50 border-b border-gray-800 flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Ranking</span>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Impact Factor</span>
        </div>
        <div className="divide-y divide-gray-800">
          {leaderboard.slice(3).concat(leaderboard.length < 5 ? [] : []).map((entry, idx) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-8 py-5 flex items-center justify-between hover:bg-gray-800 hover:bg-opacity-20 transition-all group"
            >
              <div className="flex items-center gap-6">
                <span className="text-sm font-black text-gray-600 w-4 group-hover:text-neon-cyan transition-colors">#{entry.rank}</span>
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-black text-gray-400 text-xs border border-gray-700">
                  {entry.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-gray-100 group-hover:text-neon-cyan transition-colors">{entry.name}</p>
                  <p className="text-[9px] text-gray-600 font-bold uppercase">Grid Network Participant</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-black text-neon-green">{Number(entry.balance).toLocaleString()}</p>
                <div className="flex items-center gap-1 justify-end">
                  <BiTrendingUp className="text-[10px] text-neon-cyan" />
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Net Positive</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
