"use client";

import { useState, useEffect } from "react";
import { FiTrendingUp, FiZap } from "react-icons/fi";
import { motion } from "framer-motion";
import { calculateDemandMultiplier, calculateLivePrice } from "@/lib/pricing";

interface PriceTier {
  minUnits: number;
  maxUnits: number;
  basePrice: number;
  color: string;
}

export default function LiveMarketplace() {
  // Dynamic pricing tiers - price changes after unit limits
  const priceTiers: PriceTier[] = [
    { minUnits: 0, maxUnits: 10, basePrice: 5.2, color: "text-neon-green" },      // 0-10 units: ₹5.2
    { minUnits: 10.1, maxUnits: 25, basePrice: 6.5, color: "text-neon-yellow" },  // 10.1-25 units: ₹6.5
    { minUnits: 25.1, maxUnits: 50, basePrice: 8.0, color: "text-neon-cyan" },    // 25.1-50 units: ₹8.0
    { minUnits: 50.1, maxUnits: 100, basePrice: 10.5, color: "text-red-400" },    // 50.1-100 units: ₹10.5
  ];

  // Market adjustment factor - CHANGE THIS VALUE TO ADJUST PRICES
  // Range: 0.98-1.02 (minimal fluctuation, ±2%)
  // To increase fluctuation: Change 0.98 + Math.random() * 0.04 to higher range
  // Example: 0.80 + Math.random() * 0.40 for ±20% fluctuation

  const [selectedUnits, setSelectedUnits] = useState(5);
  const [demandMultiplier, setDemandMultiplier] = useState(calculateDemandMultiplier());

  // Simulate live market demand changes every 3 seconds (SYNCED with GridStabilityDashboard)
  // Uses shared pricing calculation for consistency
  useEffect(() => {
    const updateMultiplier = () => {
      setDemandMultiplier(calculateDemandMultiplier());
    };

    updateMultiplier(); // Initial update
    const interval = setInterval(updateMultiplier, 3000);
    return () => clearInterval(interval);
  }, []);

  // Calculate price based on selected units and demand (SYNCED with GridStabilityDashboard)
  const getPrice = (units: number): { price: number; tier: string; color: string } => {
    // Use shared live price calculation (SYNCED with GridStabilityDashboard)
    const livePrice = calculateLivePrice(demandMultiplier);
    const applicableTier = priceTiers.find(
      (tier) => units >= tier.minUnits && units <= tier.maxUnits
    ) || priceTiers[0];

    // Apply tier multiplier on top of live base price for proper tier pricing
    const tierMultiplier = applicableTier.basePrice / 5.2; // Relative to base price
    const finalPrice = parseFloat((livePrice * tierMultiplier).toFixed(2));

    let tierName = "Standard";
    if (applicableTier.basePrice === 6.5) tierName = "Premium";
    if (applicableTier.basePrice === 8.0) tierName = "High Demand";
    if (applicableTier.basePrice === 10.5) tierName = "Peak";

    return {
      price: finalPrice,
      tier: tierName,
      color: applicableTier.color,
    };
  };

  const currentPricing = getPrice(selectedUnits);
  const totalCost = (selectedUnits * currentPricing.price).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute top-0 left-0 mt-12 ml-2 w-72 bg-gradient-to-br from-gray-900 to-black border-2 border-neon-cyan rounded-xl p-5 shadow-2xl shadow-neon-cyan/20"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FiZap className="text-neon-cyan text-lg" />
        <h3 className="text-sm font-black text-neon-cyan uppercase tracking-widest">
          Live Marketplace
        </h3>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-2 h-2 rounded-full bg-neon-green ml-auto"
        />
      </div>

      {/* Unit Selector */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4">
        <p className="text-[10px] font-black text-gray-400 uppercase mb-2">
          Select Units (0-100 kWh)
        </p>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={selectedUnits}
          onChange={(e) => setSelectedUnits(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
        />
        <p className="text-lg font-black text-neon-cyan mt-2">{selectedUnits} kWh</p>
      </div>

      {/* Current Price */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase">Price Tier</span>
          <span className={`text-sm font-black ${currentPricing.color}`}>
            {currentPricing.tier}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase">Base Rate</span>
          <span className="text-sm font-bold text-gray-300">₹{priceTiers.find(t => t.basePrice === currentPricing.price / demandMultiplier)?.basePrice.toFixed(1) || "N/A"}/kWh</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase">Live Rate</span>
          <motion.span
            key={currentPricing.price}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-lg font-black ${currentPricing.color}`}
          >
            ₹{currentPricing.price.toFixed(2)}/kWh
          </motion.span>
        </div>
      </div>

      {/* Total Cost */}
      <div className="bg-gradient-to-r from-neon-cyan to-neon-cyan bg-opacity-10 rounded-lg p-3 mb-4 border border-neon-cyan border-opacity-30">
        <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Total Cost</p>
        <motion.p
          key={totalCost}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          className="text-2xl font-black text-neon-cyan"
        >
          ₹{totalCost}
        </motion.p>
      </div>

      {/* Demand Indicator */}
      <div className="bg-gray-800 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
            <FiTrendingUp className="text-neon-yellow" /> Market Demand
          </span>
          <motion.span
            key={demandMultiplier}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-sm font-black text-neon-yellow"
          >
            {(demandMultiplier * 100).toFixed(0)}%
          </motion.span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            animate={{ width: `${demandMultiplier * 100}%` }}
            transition={{ type: "spring", stiffness: 40 }}
            className="bg-gradient-to-r from-neon-green to-neon-yellow rounded-full h-2"
          />
        </div>
        <p className="text-[8px] text-gray-500 mt-2">
          Live market adjustment: {(demandMultiplier * 100).toFixed(1)}% (minimal variance)
        </p>
      </div>
    </motion.div>
  );
}
