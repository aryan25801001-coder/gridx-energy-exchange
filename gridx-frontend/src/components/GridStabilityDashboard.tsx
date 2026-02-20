"use client";

import { useEffect, useState } from "react";
import { FiZap, FiTrendingUp, FiActivity } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface GridMetrics {
  supply: number;
  demand: number;
  imbalance: number;
  gridStatus: "Balanced" | "Oversupply" | "Shortage";
  updatedPrice: number;
  timestamp: string;
}

export default function GridStabilityDashboard() {
  const [metrics, setMetrics] = useState<GridMetrics>({
    supply: 0,
    demand: 0,
    imbalance: 0,
    gridStatus: "Balanced",
    updatedPrice: 6,
    timestamp: new Date().toISOString(),
  });
  const [priceHistory, setPriceHistory] = useState<number[]>([6]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initialize with random data
    const generateRandomMetrics = () => {
      const supply = Math.max(30, 50 + (Math.random() - 0.5) * 40);
      const demand = Math.max(35, 55 + (Math.random() - 0.5) * 35);
      const imbalance = supply - demand;
      let gridStatus: "Balanced" | "Oversupply" | "Shortage" = "Balanced";
      
      if (Math.abs(imbalance) > 5) {
        gridStatus = imbalance > 0 ? "Oversupply" : "Shortage";
      }
      
      const basePrice = 6;
      const elasticity = 0.15;
      const updatedPrice = Math.max(3, Math.min(12, basePrice + elasticity * imbalance));
      
      return {
        supply: parseFloat(supply.toFixed(2)),
        demand: parseFloat(demand.toFixed(2)),
        imbalance: parseFloat(imbalance.toFixed(2)),
        gridStatus,
        updatedPrice: parseFloat(updatedPrice.toFixed(2)),
        timestamp: new Date().toISOString(),
      };
    };

    setConnected(true);
    const initialMetrics = generateRandomMetrics();
    setMetrics(initialMetrics);
    setPriceHistory([initialMetrics.updatedPrice]);

    // Update with random data every 3 seconds
    const interval = setInterval(() => {
      const newMetrics = generateRandomMetrics();
      setMetrics(newMetrics);
      setPriceHistory((prev) => {
        const updated = [...prev, newMetrics.updatedPrice];
        return updated.slice(-20);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Balanced":
        return { bg: "bg-green-950", border: "border-neon-green", icon: "🟢", text: "text-neon-green" };
      case "Oversupply":
        return { bg: "bg-yellow-950", border: "border-neon-yellow", icon: "🟠", text: "text-neon-yellow" };
      case "Shortage":
        return { bg: "bg-red-950", border: "border-red-500", icon: "🔴", text: "text-red-500" };
      default:
        return { bg: "bg-gray-900", border: "border-gray-800", icon: "⚪", text: "text-gray-400" };
    }
  };

  const statusStyle = getStatusColor(metrics.gridStatus);
  const priceChange = priceHistory.length > 1 ? metrics.updatedPrice - priceHistory[priceHistory.length - 2] : 0;
  const isPriceUp = priceChange > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-100 uppercase tracking-widest flex items-center gap-3">
          <FiZap className="text-neon-cyan" />
          Grid Stability Dashboard
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-neon-green animate-pulse" : "bg-red-500"}`} />
          <span className="text-xs font-bold text-gray-300">
            {connected ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Supply Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-green-950 border border-neon-green rounded-xl p-6"
        >
          <p className="text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
            <FiZap className="text-neon-green" /> Supply
          </p>
          <motion.p
            key={`supply-${metrics.supply}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-black text-neon-green"
          >
            {metrics.supply.toFixed(1)}
            <span className="text-sm text-gray-400 ml-1">kW</span>
          </motion.p>
          <p className="text-xs text-gray-400 mt-2">Current production</p>
        </motion.div>

        {/* Demand Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-950 border border-neon-cyan rounded-xl p-6"
        >
          <p className="text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
            <FiActivity className="text-neon-cyan" /> Demand
          </p>
          <motion.p
            key={`demand-${metrics.demand}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-black text-neon-cyan"
          >
            {metrics.demand.toFixed(1)}
            <span className="text-sm text-gray-400 ml-1">kW</span>
          </motion.p>
          <p className="text-xs text-gray-400 mt-2">Current consumption</p>
        </motion.div>

        {/* Imbalance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-950 border border-neon-yellow rounded-xl p-6"
        >
          <p className="text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
            <FiTrendingUp className="text-neon-yellow" /> Imbalance
          </p>
          <motion.p
            key={`imbalance-${metrics.imbalance}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`text-3xl font-black ${metrics.imbalance > 0 ? "text-red-400" : "text-neon-green"}`}
          >
            {Math.abs(metrics.imbalance).toFixed(1)}
            <span className="text-sm text-gray-400 ml-1">kW</span>
          </motion.p>
          <p className="text-xs text-gray-400 mt-2">
            {metrics.imbalance > 0 ? "High demand" : "High supply"}
          </p>
        </motion.div>

        {/* Price Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-950 border border-purple-500 rounded-xl p-6"
        >
          <p className="text-xs font-black text-gray-400 uppercase mb-3">Live Price</p>
          <div className="flex items-end gap-2">
            <motion.p
              key={`price-${metrics.updatedPrice}`}
              initial={{ scale: 1.2, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              className="text-3xl font-black text-purple-300"
            >
              ₹{metrics.updatedPrice.toFixed(2)}
            </motion.p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-sm font-bold ${isPriceUp ? "text-red-400" : "text-neon-green"}`}
            >
              {isPriceUp ? "↑" : "↓"} {Math.abs(priceChange).toFixed(2)}
            </motion.div>
          </div>
          <p className="text-xs text-gray-400 mt-2">per kWh</p>
        </motion.div>
      </div>

      {/* Status Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className={`${statusStyle.bg} border-2 ${statusStyle.border} rounded-2xl p-8`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase mb-2">Grid Status</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{statusStyle.icon}</span>
              <motion.h3
                key={metrics.gridStatus}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-3xl font-black ${statusStyle.text}`}
              >
                {metrics.gridStatus}
              </motion.h3>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-black text-gray-400 uppercase mb-2">Stability Score</p>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              className="text-4xl font-black text-neon-yellow"
            >
              {(100 - Math.abs(metrics.imbalance) * 5).toFixed(0)}%
            </motion.div>
          </div>
        </div>

        {/* Status Message */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-300 mt-6 italic"
        >
          {metrics.gridStatus === "Balanced"
            ? "Grid is operating at optimal balance. All systems functioning normally."
            : metrics.gridStatus === "Oversupply"
            ? "Renewable generation exceeds demand. Perfect time for energy exports and storage."
            : "Grid demand exceeds supply. Prioritizing critical loads and optimizing distribution."}
        </motion.p>
      </motion.div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Balance Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <p className="text-sm font-black text-gray-300 uppercase mb-4">Balance Trend</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Supply</span>
              <div className="w-24 bg-gray-800 rounded h-2">
                <div
                  className="bg-neon-green rounded h-2"
                  style={{ width: `${(metrics.supply / 100) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-neon-green">{metrics.supply.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Demand</span>
              <div className="w-24 bg-gray-800 rounded h-2">
                <div
                  className="bg-neon-cyan rounded h-2"
                  style={{ width: `${(metrics.demand / 100) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-neon-cyan">{metrics.demand.toFixed(0)}</span>
            </div>
          </div>
        </motion.div>

        {/* Price Range */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <p className="text-sm font-black text-gray-300 uppercase mb-4">Price Range (24h)</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">Min</span>
                <span className="text-xs font-bold text-gray-200">₹{Math.min(...priceHistory).toFixed(2)}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">Avg</span>
                <span className="text-xs font-bold text-neon-yellow">
                  ₹{(priceHistory.reduce((a, b) => a + b, 0) / priceHistory.length).toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Max</span>
                <span className="text-xs font-bold text-gray-200">₹{Math.max(...priceHistory).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grid Health */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <p className="text-sm font-black text-gray-300 uppercase mb-4">System Health</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">Stability</span>
                <span className="text-xs font-bold text-neon-green">
                  {(100 - Math.abs(metrics.imbalance) * 5).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, 100 - Math.abs(metrics.imbalance) * 5)}%` }}
                  className="bg-neon-green rounded-full h-2"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Last update: {new Date(metrics.timestamp).toLocaleTimeString()}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
