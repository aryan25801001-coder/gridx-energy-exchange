"use client";

import React, { useState } from "react";
import { FiZap, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

export default function BuySell() {
  const [amount, setAmount] = useState(5);
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const price = 5.20;
  const total = amount * price;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* BUY Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-950 to-black border-2 border-neon-green rounded-2xl p-8 shadow-glow-green relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green opacity-5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-neon-green bg-opacity-20 rounded-xl">
              <FiZap className="text-neon-green text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-neon-green uppercase tracking-tight">BUY Energy</h3>
              <p className="text-xs text-gray-400 font-bold">Get clean solar power</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-black bg-opacity-50 rounded-xl p-4 border border-neon-green border-opacity-20">
              <p className="text-xs font-black text-gray-500 uppercase mb-2">Amount (kWh)</p>
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.5"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-green"
              />
              <p className="text-2xl font-black text-neon-green mt-3">{amount} kWh</p>
            </div>

            <div className="bg-black bg-opacity-50 rounded-xl p-4 border border-neon-green border-opacity-20">
              <p className="text-xs font-black text-gray-500 uppercase mb-2">Price per kWh</p>
              <p className="text-2xl font-black text-neon-yellow">₹{price.toFixed(2)}</p>
            </div>

            <div className="bg-black bg-opacity-50 rounded-xl p-4 border border-neon-green border-opacity-20">
              <p className="text-xs font-black text-gray-500 uppercase mb-2">Total Cost</p>
              <p className="text-3xl font-black text-neon-green">₹{total.toFixed(2)}</p>
            </div>

            <button className="w-full bg-neon-green text-black font-black py-4 rounded-xl hover:shadow-glow-green transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2 group">
              Complete Purchase
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* SELL Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-yellow-950 to-black border-2 border-neon-yellow rounded-2xl p-8 shadow-glow-yellow relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-yellow opacity-5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-neon-yellow bg-opacity-20 rounded-xl">
              <FiZap className="text-neon-yellow text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-neon-yellow uppercase tracking-tight">SELL Energy</h3>
              <p className="text-xs text-gray-400 font-bold">Earn from your surplus</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-black bg-opacity-50 rounded-xl p-4 border border-neon-yellow border-opacity-20">
              <p className="text-xs font-black text-gray-500 uppercase mb-2">Surplus Available</p>
              <p className="text-2xl font-black text-neon-yellow">8.5 kWh</p>
              <p className="text-xs text-gray-500 mt-2">From your solar panels</p>
            </div>

            <div className="bg-black bg-opacity-50 rounded-xl p-4 border border-neon-yellow border-opacity-20">
              <p className="text-xs font-black text-gray-500 uppercase mb-2">Sell Amount</p>
              <input
                type="range"
                min="0.5"
                max="8.5"
                step="0.5"
                defaultValue="5"
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-yellow"
              />
              <p className="text-2xl font-black text-neon-yellow mt-3">5 kWh</p>
            </div>

            <div className="bg-black bg-opacity-50 rounded-xl p-4 border border-neon-yellow border-opacity-20">
              <p className="text-xs font-black text-gray-500 uppercase mb-2">Earning</p>
              <p className="text-3xl font-black text-neon-green">₹26.00</p>
              <p className="text-xs text-gray-500 mt-2">+ 4 Carbon Credits</p>
            </div>

            <button className="w-full bg-neon-yellow text-black font-black py-4 rounded-xl hover:shadow-glow-yellow transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2 group">
              List for Sale
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
