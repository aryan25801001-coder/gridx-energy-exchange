"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { BiLeaf, BiPowerOff, BiGridAlt, BiHistory, BiTrophy, BiBarChartAlt2 } from "react-icons/bi";
import { FiTrendingUp, FiZap } from "react-icons/fi";

export default function Sidebar() {
  const { setDisasterMode, isDisasterMode, user, activeView, setActiveView, carbonWallet } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <aside className="w-68 bg-secondary border-r border-neon-green border-opacity-10 p-6 flex flex-col h-[calc(100vh-80px)] sticky top-20">
      <nav className="space-y-2 flex-1">
        <NavItem
          icon={<BiGridAlt />}
          label="Dashboard"
          active={activeView === 'dashboard'}
          onClick={() => setActiveView('dashboard')}
        />
        <NavItem
          icon={<FiZap />}
          label="Energy Market"
          active={activeView === 'market'}
          onClick={() => setActiveView('market')}
        />
        <NavItem
          icon={<BiHistory />}
          label="Trades History"
          active={activeView === 'history'}
          onClick={() => setActiveView('history')}
        />
        <NavItem
          icon={<BiTrophy />}
          label="Carbon Heroes"
          active={activeView === 'leaderboard'}
          onClick={() => setActiveView('leaderboard')}
        />
        <NavItem
          icon={<BiBarChartAlt2 />}
          label="Advanced Analytics"
          active={activeView === 'analytics'}
          onClick={() => setActiveView('analytics')}
        />
      </nav>

      <div className="space-y-4 pt-6 mt-6 border-t border-gray-800">
        {/* Disaster Mode Toggle */}
        <button
          onClick={() => setDisasterMode(!isDisasterMode)}
          className={`w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all relative overflow-hidden group ${isDisasterMode
            ? "bg-red-950 border border-neon-red text-neon-red shadow-glow-red"
            : "bg-gray-900 border border-gray-800 text-gray-400 hover:border-neon-yellow hover:text-neon-yellow"
            }`}
        >
          <div className="flex items-center gap-3 relative z-10">
            <BiPowerOff className={`w-5 h-5 ${isDisasterMode ? "animate-pulse" : ""}`} />
            <span className="text-xs font-black uppercase tracking-widest">
              {isDisasterMode ? "System Isolated" : "Disaster Protocol"}
            </span>
          </div>
          <div className={`w-2 h-2 rounded-full relative z-10 ${isDisasterMode ? "bg-neon-red shadow-glow-red" : "bg-gray-700"}`}></div>

          {isDisasterMode && (
            <div className="absolute inset-0 bg-neon-red opacity-10 animate-pulse"></div>
          )}
        </button>

        {/* User Mini Profile */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center text-black font-black text-xs shadow-glow">
            {user?.name?.charAt(0) || "G"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-gray-100 truncate">{user?.name || "Guest User"}</p>
            <p className="text-[10px] text-neon-green uppercase font-bold tracking-tighter">{user?.role || "Observer"}</p>
          </div>
        </div>

        {/* Carbon Wallet Quick View */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-neon-green border-opacity-20 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <BiLeaf className="w-12 h-12 text-neon-green" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <BiLeaf className="text-neon-green w-3 h-3" />
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Wallet Balance</p>
          </div>
          <p className="text-xl font-black text-neon-green neon-glow-green">
            {carbonWallet?.balance?.toLocaleString() || "0"}
          </p>
          <p className="text-[9px] text-gray-600 font-medium">Verified Carbon Credits</p>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative group truncate ${active
        ? "bg-neon-green bg-opacity-10 border border-neon-green border-opacity-30 text-neon-green shadow-glow"
        : "text-gray-500 hover:bg-gray-800 hover:text-gray-200"
        }`}
    >
      <span className={`text-xl transition-transform group-hover:scale-110 ${active ? "text-neon-green" : "text-gray-600"}`}>
        {icon}
      </span>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>

      {active && (
        <div className="absolute right-4 w-1.5 h-1.5 bg-neon-green rounded-full shadow-glow animate-pulse"></div>
      )}
    </button>
  );
}
