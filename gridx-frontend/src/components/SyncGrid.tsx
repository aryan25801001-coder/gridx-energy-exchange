"use client";

import { useState, useEffect } from "react";
import { BiRefresh, BiNetworkChart } from "react-icons/bi";
import { motion } from "framer-motion";

export default function SyncGrid() {
  const [syncing, setSyncing] = useState(false);
  const [production, setProduction] = useState(42.5);
  const [consumption, setConsumption] = useState(48.2);
  const [balance, setBalance] = useState(-5.7);

  // Static data - no auto-updates

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-100 uppercase tracking-widest flex items-center gap-3">
          <BiNetworkChart className="text-neon-cyan" />
          Sync Grid - Network Synchronization
        </h2>
        <motion.button
          onClick={handleSync}
          disabled={syncing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan bg-opacity-10 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:bg-opacity-20 transition-all disabled:opacity-50 font-black text-sm uppercase"
        >
          <BiRefresh className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing..." : "Sync Now"}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Production</p>
          <p className="text-3xl font-black text-neon-green">{production} <span className="text-sm text-gray-400">kW</span></p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Consumption</p>
          <p className="text-3xl font-black text-neon-cyan">{consumption} <span className="text-sm text-gray-400">kW</span></p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Balance</p>
          <p className={`text-3xl font-black ${balance > 0 ? 'text-neon-green' : 'text-neon-yellow'}`}>{balance > 0 ? '+' : ''}{balance} <span className="text-sm text-gray-400">kW</span></p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-4">Network Nodes</h3>
        <div className="space-y-3">
          <div className="bg-green-950 border border-neon-green rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-gray-100">Solar Farm A</p>
                <p className="text-xs text-gray-400">42.5 kW ↑ synced (0ms)</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-950 border border-neon-cyan rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-gray-100">Residential Hub</p>
                <p className="text-xs text-gray-400">48.2 kW ↓ synced (1ms)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

