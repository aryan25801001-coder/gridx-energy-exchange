"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { FiSun, FiZap, FiSettings, FiBell, FiShield } from "react-icons/fi";
import { BiLeaf, BiNetworkChart, BiChevronDown } from "react-icons/bi";
import { motion } from "framer-motion";

export default function Header() {
  const { user, isDisasterMode } = useStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`h-20 sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-black bg-opacity-80 backdrop-blur-lg border-b border-gray-800" : "bg-primary border-b border-gray-900"
        }`}
    >
      <div className="max-w-[1600px] mx-auto px-8 h-full flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className={`text-4xl transition-all duration-500 transform group-hover:rotate-180 ${isDisasterMode ? "text-neon-red" : "text-neon-green"}`}>
              <FiSun className={isDisasterMode ? "animate-pulse" : ""} />
            </div>
            <div>
              <h1 className={`text-2xl font-black tracking-tighter transition-colors ${isDisasterMode ? "text-neon-red" : "text-white"}`}>
                GRID<span className={isDisasterMode ? "text-gray-100" : "text-neon-green"}>X</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isDisasterMode ? "bg-neon-red animate-ping" : "bg-neon-green"}`}></div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  {isDisasterMode ? "Protocol Delta Active" : "Network v1.02 Secure"}
                </p>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-gray-900 bg-opacity-50 p-1 rounded-xl border border-gray-800">
            <HeaderTab label="Mainnet" active />
            <HeaderTab label="Mumbai" />
            <HeaderTab label="AI Node" />
          </nav>
        </div>

        {/* Global Stats bar (Middle) - Optional but looks cool */}
        <div className="hidden xl:flex items-center gap-12 border-x border-gray-800 px-12 h-10">
          <div className="text-center">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none">Global Vol.</p>
            <p className="text-xs font-black text-gray-300">14.8 GWh</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none">Nodes Act.</p>
            <p className="text-xs font-black text-neon-cyan">1,248</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none">Grid Health</p>
            <p className="text-xs font-black text-neon-green">99.9%</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
            <HeaderActionButton icon={<FiBell />} badgeCount={3} />
            <HeaderActionButton icon={<FiSettings />} />
          </div>

          <div className="h-10 w-[1px] bg-gray-800 mx-2"></div>

          {/* Profile Dropdown */}
          <button className="flex items-center gap-3 pl-4 pr-2 py-1.5 rounded-2xl hover:bg-gray-900 transition-all border border-transparent hover:border-gray-800 group">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-gray-100 group-hover:text-neon-green transition-colors">{user?.name || "Anonymous"}</p>
              <div className="flex items-center justify-end gap-1">
                <FiShield className="text-[10px] text-neon-cyan" />
                <p className="text-[9px] text-gray-500 font-bold uppercase">{user?.role || "Operator"}</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-black border border-gray-700 flex items-center justify-center text-neon-green font-black text-sm relative">
              {user?.name?.charAt(0) || "U"}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gray-950 flex items-center justify-center border border-gray-800">
                <BiChevronDown className="text-gray-500 group-hover:text-neon-green transition-colors" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

function HeaderTab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${active ? "bg-gray-800 text-neon-green shadow-sm" : "text-gray-600 hover:text-gray-300"
      }`}>
      {label}
    </button>
  );
}

function HeaderActionButton({ icon, badgeCount }: { icon: React.ReactNode; badgeCount?: number }) {
  return (
    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-neon-green transition-all relative group">
      <span className="text-lg transition-transform group-hover:scale-110">{icon}</span>
      {badgeCount && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-red text-[8px] font-black text-white rounded-full flex items-center justify-center border-2 border-primary">
          {badgeCount}
        </span>
      )}
    </button>
  );
}
