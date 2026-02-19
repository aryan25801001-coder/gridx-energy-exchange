"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { BiLeaf, BiTrendingUp } from "react-icons/bi";
import { motion, useSpring, useMotionValueEvent } from "framer-motion";

export default function CarbonCounter() {
  const { carbonWallet } = useStore();
  const [targetValue, setTargetValue] = useState(0);

  useEffect(() => {
    setTargetValue(carbonWallet?.balance || 0);
  }, [carbonWallet?.balance]);

  // Use framer-motion's spring for super smooth counting
  const springConfig = { damping: 20, stiffness: 100 };
  const count = useSpring(0, springConfig);

  useEffect(() => {
    count.set(targetValue);
  }, [targetValue, count]);

  const [displayValue, setDisplayValue] = useState(0);

  useMotionValueEvent(count, "change", (latest) => {
    setDisplayValue(Math.floor(latest));
  });

  return (
    <div className="bg-secondary border border-neon-green border-opacity-10 rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
      {/* Dynamic Glow Background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-neon-green via-transparent to-transparent opacity-5 group-hover:opacity-10 transition-opacity blur-2xl"></div>

      {/* Animated Scan Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent opacity-20 animate-pulse"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-neon-green bg-opacity-10 rounded-lg">
              <BiLeaf className="text-neon-green w-4 h-4" />
            </div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Net Carbon Offset</h3>
          </div>
          <div className="flex items-center gap-1">
            <BiTrendingUp className="text-neon-green text-xs" />
            <span className="text-[9px] font-black text-neon-green uppercase tracking-tighter">Live</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <motion.div
            className="text-4xl font-black text-neon-green tracking-tighter neon-glow-green"
          >
            {displayValue.toLocaleString()}
          </motion.div>
          <span className="text-sm font-black text-gray-600 uppercase">kg</span>
        </div>

        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-4">CO₂ mitigated by GridX trades</p>

        <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
          <div>
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">30-Day Velocity</p>
            <p className="text-lg font-black text-neon-yellow tracking-tighter">+245.8</p>
          </div>
          <div className="h-8 w-24">
            {/* Sparkline simulation */}
            <div className="flex items-end gap-[2px] h-full">
              {[4, 7, 3, 6, 9, 5, 8, 4, 6].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h * 10}%` }}
                  className="flex-1 bg-neon-green bg-opacity-20 rounded-t-sm"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
