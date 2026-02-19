"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { BiLayer, BiShieldCheck, BiLink } from "react-icons/bi";
import { motion } from "framer-motion";

interface Trade {
  id: string;
  seller_id: string;
  buyer_id: string;
  energy_kwh: number;
  price_per_kwh: number;
  tx_hash: string;
  carbon_saved: number;
  created_at: string;
}

export default function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      const response = await api.getAllTrades();
      setTrades(response.data);
    } catch (error) {
      console.error("Failed to load trades:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Decrypting Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neon-green bg-opacity-10 rounded-lg">
            <BiLayer className="text-neon-green text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-100 uppercase tracking-widest">Transaction Records</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Immutable energy trade history on Polygon</p>
          </div>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="text-right">
            <p className="text-xs font-black text-neon-green">+{trades.reduce((acc, t) => acc + (Number(t.energy_kwh) || 0), 0).toFixed(1)} kWh</p>
            <p className="text-[9px] text-gray-600 font-bold uppercase">Total Volume</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-neon-cyan">{trades.length}</p>
            <p className="text-[9px] text-gray-600 font-bold uppercase">Settlements</p>
          </div>
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl py-24 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BiLayer className="text-gray-600 text-2xl" />
          </div>
          <p className="text-lg font-bold text-gray-400">No trades detected on-chain</p>
          <p className="text-xs text-gray-600 mt-1">Acquire renewable energy to populate this ledger</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black bg-opacity-50 border-b border-gray-800">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Unit Price</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Gross Value</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Verification</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Network</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {trades.map((trade, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={trade.id}
                    className="hover:bg-gray-800 hover:bg-opacity-30 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-gray-300">
                        {new Date(trade.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-[9px] text-gray-600 font-bold uppercase mt-0.5">
                        {new Date(trade.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-900 bg-opacity-20 flex items-center justify-center">
                          <BiLayer className="text-neon-green text-sm" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-100">{trade.energy_kwh} <span className="text-[10px] text-gray-500 font-bold uppercase">kWh Solar</span></p>
                          <p className="text-[9px] text-neon-green font-bold uppercase">Offset: {trade.carbon_saved} kg CO₂</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-gray-400">₹{parseFloat(trade.price_per_kwh as any).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-neon-yellow">₹{(trade.energy_kwh * trade.price_per_kwh).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-950 bg-opacity-30 border border-neon-green border-opacity-20">
                        <BiShieldCheck className="text-neon-green text-xs" />
                        <span className="text-[9px] font-black text-neon-green uppercase tracking-tighter">On-Chain Verified</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <a
                        href={`https://mumbai.polygonscan.com/tx/${trade.tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-[10px] font-black text-gray-600 hover:text-neon-cyan transition-colors"
                      >
                        {trade.tx_hash.substring(0, 8)}...
                        <BiLink />
                      </a>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
