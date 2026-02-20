"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import EnergyStatsCard from "./EnergyStatsCard";
import CarbonCounter from "./CarbonCounter";
import EnergyMarket from "./EnergyMarket";
import TradeHistory from "./TradeHistory";
import CarbonLeaderboard from "./CarbonLeaderboard";
import SolarChart from "./SolarChart";
import BuySell from "./BuySell";
import GridXOperations from "./GridXOperations";
import SyncGrid from "./SyncGrid";
import GridStabilityDashboard from "./GridStabilityDashboard";
import MeterDashboard from "./MeterDashboard";
import { FiRefreshCw, FiZap, FiSun, FiTrendingUp, FiActivity } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function MainContent() {
  const { activeView, setActiveView, selectedHouseId, houses } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const selectedHouse = houses.find((h) => h.id === selectedHouseId) || houses[0];

  useEffect(() => {
    if (activeView === 'analytics') {
      loadAiInsights();
    }
  }, [activeView]);

  const loadAiInsights = async () => {
    setAnalyticsLoading(true);
    try {
      const forecast = await api.getForecast();
      setAiInsights(forecast.data);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
      // Mock fallback data
      setAiInsights({
        predictedDemand: 3.2,
        confidence: 0.92,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh data logic here
      await new Promise((resolve) => setTimeout(resolve, 800 - Math.random() * 400));
    } finally {
      setRefreshing(false);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "market":
        return <EnergyMarket selectedHouse={selectedHouse} />;
      case "history":
        return <TradeHistory />;
      case "leaderboard":
        return <CarbonLeaderboard />;
      case "analytics":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-gray-100 uppercase tracking-widest flex items-center gap-3">
              <FiActivity className="text-neon-cyan" />
              Advanced Grid Analytics
            </h2>
            {analyticsLoading ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest">Loading AI Insights...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-sm font-black text-neon-cyan mb-6 uppercase tracking-widest flex items-center gap-2">
                    <FiActivity /> Deep Learning Analysis
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-cyan-950 bg-opacity-20 border border-neon-cyan border-opacity-20 rounded-xl">
                      <p className="text-xs font-black text-gray-500 uppercase mb-2">Predicted Demand</p>
                      <p className="text-3xl font-black text-neon-cyan">{aiInsights?.predictedDemand?.toFixed(2) || '0.00'} <span className="text-sm text-gray-400">kW</span></p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                        <p className="text-xs font-black text-gray-500 uppercase mb-2">Confidence</p>
                        <p className="text-2xl font-black text-neon-green">{((aiInsights?.confidence || 0.92) * 100).toFixed(1)}%</p>
                      </div>
                      <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                        <p className="text-xs font-black text-gray-500 uppercase mb-2">Grid Status</p>
                        <p className="text-lg font-black text-neon-yellow">Optimal</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 border border-neon-yellow border-opacity-30 rounded-2xl p-6">
                  <h3 className="text-xs font-black text-gray-400 mb-6 uppercase tracking-widest">AI Recommendations</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-yellow-950 bg-opacity-20 border border-neon-yellow border-opacity-10 rounded-lg">
                      <p className="text-[10px] font-bold text-gray-300 mb-1">Supply Strategy</p>
                      <p className="text-xs text-gray-400">Maintain current output to match predicted demand.</p>
                    </div>
                    <div className="p-3 bg-yellow-950 bg-opacity-20 border border-neon-yellow border-opacity-10 rounded-lg">
                      <p className="text-[10px] font-bold text-gray-300 mb-1">Market Timing</p>
                      <p className="text-xs text-gray-400">Favorable conditions for energy trading ahead.</p>
                    </div>
                    <button
                      onClick={() => setActiveView('market')}
                      className="w-full py-2 bg-neon-yellow text-black font-black rounded-lg hover:shadow-glow-yellow transition-all text-xs uppercase tracking-widest"
                    >
                      Trade Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case "operations":
        return <GridXOperations />;
      case "sync-grid":
        return <SyncGrid />;
      case "grid-stability":
        return <GridStabilityDashboard />;
      case "meters":
        return <MeterDashboard />;
      case "dashboard":
      default:
        return (
          <div className="space-y-8">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <EnergyStatsCard
                title="Live Generation"
                value="4.28"
                unit="kW"
                icon={<FiSun className="text-neon-yellow" />}
                trend="up"
                trendValue="12%"
              />
              <EnergyStatsCard
                title="Surplus Energy"
                value="2.81"
                unit="kW"
                icon={<FiZap className="text-neon-green" />}
                color="neon-green"
              />
              <EnergyStatsCard
                title="AI Optimized Price"
                value="₹5.20"
                unit="kWh"
                icon={<FiTrendingUp className="text-neon-cyan" />}
                color="neon-cyan"
                trend="down"
                trendValue="3%"
              />
              <CarbonCounter />
            </div>

            {/* Buy & Sell Section */}
            <BuySell />

            {/* Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SolarChart />
              </div>
              <div className="bg-gray-900 border border-neon-yellow border-opacity-20 rounded-2xl p-6 relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <FiZap className="w-24 h-24 text-neon-yellow" />
                </div>
                <h3 className="text-xs font-black text-gray-400 mb-6 uppercase tracking-widest">Market Intelligence</h3>
                <div className="space-y-5 relative z-10">
                  <div className="p-4 bg-yellow-950 bg-opacity-20 border border-neon-yellow border-opacity-10 rounded-xl">
                    <p className="text-sm font-bold text-gray-200 mb-1">Peak Demand Prediction</p>
                    <p className="text-xs text-gray-400">Demand spike expected at <span className="text-neon-yellow font-bold">18:45</span>. AI recommends maximizing storage.</p>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Current grid stability is high. Dynamic pricing has plateaued at the floor rate.
                    <span className="text-neon-green ml-1">✓ Ideal time for buyers.</span>
                  </p>
                  <button
                    onClick={() => setActiveView('market')}
                    className="w-full py-4 bg-neon-yellow text-black font-black rounded-xl hover:shadow-glow-yellow transition-all uppercase text-xs tracking-widest"
                  >
                    Open Energy Market
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity Mini-Table or Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-secondary border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xs font-black text-gray-500 mb-4 uppercase tracking-widest">Global Carbon Impact</h3>
                <div className="flex items-center gap-6">
                  <div className="text-4xl font-black text-neon-green neon-glow-green tracking-tighter">1.24 <span className="text-sm">Metric Tons</span></div>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      className="h-full bg-neon-green shadow-glow"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-600 mt-4 uppercase font-bold">GridX community total CO₂ offset since launch</p>
              </div>
              <div className="bg-secondary border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-gray-500 mb-4 uppercase tracking-widest">Active Smart Contracts</h3>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-green animate-ping"></div>
                    <span className="text-[10px] text-gray-400 font-black uppercase">Mainnet Bridge Online</span>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-black text-gray-100">842</p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase">Total Transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-neon-cyan">0.001</p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase">Avg. Gas (MATIC)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* View Header */}
        <div className="flex items-center justify-between">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-[10px] font-black text-neon-green uppercase tracking-[0.3em] mb-1">GridX Operations</p>
            <h1 className="text-3xl font-black text-gray-100 uppercase tracking-tight flex items-center gap-3">
              {activeView === 'dashboard' ? 'Overview' :
                activeView === 'market' ? 'Energy Market' :
                  activeView === 'history' ? 'Transaction Ledger' :
                    activeView === 'leaderboard' ? 'Carbon Heroes' : 'Analytics'}
            </h1>
          </motion.div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl hover:border-neon-green transition-all disabled:opacity-50 group"
          >
            <FiRefreshCw className={`${refreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} text-neon-green`} />
            <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-200">Sync Grid</span>
          </button>
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
