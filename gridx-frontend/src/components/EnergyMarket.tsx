"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { logEnergyTrade, connectWallet } from "@/lib/blockchain";
import { BiCheckCircle, BiShield } from "react-icons/bi";
import { FiTrendingUp, FiArrowRight, FiZap } from "react-icons/fi";

export default function EnergyMarket({ selectedHouse }: { selectedHouse?: any }) {
  const { user, setCarbonWallet } = useStore();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [energyAmount, setEnergyAmount] = useState(2.5);
  const [walletConnected, setWalletConnected] = useState(false);
  const [sellers, setSellers] = useState<any[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);

  const pricePerKwh = forecast?.suggestedPricePerKwh || 5.2;
  const carbonSaved = energyAmount * 0.8;
  const totalCost = energyAmount * pricePerKwh;

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch sellers (users with role 'seller')
        const usersRes = await api.getAllUsers().catch(() => ({ data: [] }));
        if (Array.isArray(usersRes.data)) {
          const sellersList = usersRes.data.filter((u: any) => u.role === 'seller');
          setSellers(sellersList);
          if (sellersList.length > 0) setSelectedSeller(sellersList[0]);
        }

        // Fetch AI Forecast/Price
        try {
          const priceRes = await api.getPrice(2.5); // Use a default demand for calculation
          if (priceRes.data) setForecast(priceRes.data);
        } catch (e: any) {
          console.error("AI Price fetch failed", e);
        }
      } catch (error: any) {
        console.error("Failed to fetch market data:", error);
      }
    };

    fetchMarketData();
  }, []);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setWalletConnected(true);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const handleBuyEnergy = async () => {
    if (!walletConnected) {
      alert("Please connect wallet first");
      return;
    }

    if (!selectedSeller || !user) {
      alert("Invalid trade parameters");
      return;
    }

    setLoading(true);
    try {
      // 1. Log trade on blockchain
      // For demo, we might use mock addresses if real ones aren't available
      const sellerAddr = selectedSeller.wallet_address || "0x0000000000000000000000000000000000000001";
      const buyerAddr = user.walletAddress || "0x0000000000000000000000000000000000000002";

      const blockchainTxHash = await logEnergyTrade(
        sellerAddr,
        buyerAddr,
        energyAmount,
        pricePerKwh
      );

      setTxHash(blockchainTxHash);

      // 2. Save to database via API
      await api.createTrade({
        sellerId: selectedSeller.id,
        buyerId: user.id,
        energyKwh: energyAmount,
        pricePerKwh,
        txHash: blockchainTxHash,
      });

      // 3. Refresh Carbon Wallet
      const walletRes = await api.getCarbonWallet(user.id);
      setCarbonWallet(walletRes.data);

      // Reset after success
      setTimeout(() => {
        setTxHash(null);
      }, 8000);
    } catch (error) {
      console.error("Trade failed:", error);
      alert("Trade failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {txHash && (
        <div className="bg-green-900 bg-opacity-30 border border-neon-green rounded-xl p-6 flex items-start gap-4 animate-float">
          <div className="bg-neon-green p-2 rounded-full text-black">
            <BiCheckCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-neon-green mb-1 text-lg">
              Trade Verified by Blockchain!
            </h4>
            <p className="text-sm text-gray-300 mb-3">
              Energy transfer initiated. {carbonSaved.toFixed(2)} Carbon Tokens credited to your wallet.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase text-gray-500 font-bold">Transaction Hash:</span>
              <p className="text-xs font-mono text-neon-green break-all bg-black bg-opacity-50 p-2 rounded border border-neon-green border-opacity-20 flex-1">
                {txHash}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Seller List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <FiZap className="text-neon-yellow" />
              Available Local Producers
            </h3>
            <span className="text-xs text-gray-500">Showing producers in your microgrid</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sellers.map((seller) => (
              <div
                key={seller.id}
                onClick={() => setSelectedSeller(seller)}
                className={`p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${selectedSeller?.id === seller.id
                  ? "bg-gray-800 border-neon-green ring-1 ring-neon-green ring-opacity-50 shadow-glow"
                  : "bg-secondary border-gray-700 hover:border-neon-green hover:border-opacity-40"
                  }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-100 group-hover:text-neon-green transition-colors">{seller.name}</h4>
                    <p className="text-xs text-gray-500 truncate w-40">{seller.wallet_address || "0x742...d82"}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${Math.random() > 0.3 ? "bg-green-900 text-green-400" : "bg-blue-900 text-blue-400"
                    }`}>
                    {Math.random() > 0.3 ? "Solar Active" : "Battery Ops"}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Surplus Available</p>
                    <p className="text-xl font-bold text-gray-200">{Math.floor(Math.random() * 20 + 5)} <span className="text-sm font-normal text-gray-500">kWh</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Market Price</p>
                    <p className="text-xl font-bold text-neon-yellow">₹{pricePerKwh.toFixed(2)}</p>
                  </div>
                </div>

                {selectedSeller?.id === seller.id && (
                  <div className="absolute top-0 right-0 p-1">
                    <BiCheckCircle className="text-neon-green w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Trade Panel */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green via-neon-yellow to-neon-cyan"></div>

          <h3 className="text-xl font-bold text-gray-100 mb-8 flex items-center gap-2">
            Trade Execution
            <span className="text-[10px] bg-gray-800 text-neon-cyan px-2 py-0.5 rounded border border-neon-cyan border-opacity-30">AI Optimized</span>
          </h3>

          <div className="space-y-6">
            {/* Amount Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-400">Energy Amount</span>
                <span className="text-neon-green">{energyAmount} kWh</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.5"
                value={energyAmount}
                onChange={(e) => setEnergyAmount(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-green"
              />
              <div className="flex justify-between text-[10px] text-gray-600 font-bold uppercase">
                <span>Min: 0.5 kWh</span>
                <span>Max: 20 kWh</span>
              </div>
            </div>

            {/* Price Details */}
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4 space-y-4 border border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FiTrendingUp className="text-neon-cyan" />
                  Dynamic Price
                </div>
                <span className="font-bold text-gray-100">₹{pricePerKwh.toFixed(2)}/kWh</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Carbon Saved estimate</span>
                <span className="font-bold text-neon-green">+{carbonSaved.toFixed(2)} kg CO₂</span>
              </div>
              <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
                <span className="font-bold text-gray-300">Total Purchase</span>
                <span className="text-2xl font-black text-neon-yellow">₹{totalCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              {!walletConnected ? (
                <button
                  onClick={handleConnectWallet}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Exploits.png" className="w-5 h-5 hidden" alt="" />
                  Connect MetaMask Wallet
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={handleBuyEnergy}
                  disabled={loading || energyAmount === 0 || !selectedSeller}
                  className="w-full relative overflow-hidden bg-neon-green text-black font-black py-4 rounded-xl hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Verifying on Chain...
                      </>
                    ) : (
                      <>
                        Confirm Trade
                        <FiZap />
                      </>
                    )}
                  </span>
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-2">
                <BiShield className="text-neon-cyan" />
                <span>Blockchain Secured • Zero Gas Demo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-secondary border border-neon-cyan border-opacity-10 rounded-xl p-6">
        <h4 className="text-sm font-bold text-neon-cyan mb-4 flex items-center gap-2">
          <FiTrendingUp />
          AI Market Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Demand Peak</p>
            <p className="text-lg font-bold text-gray-200">18:30 - 21:00</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Supply Stability</p>
            <p className="text-lg font-bold text-green-400">High (98.4%)</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Price Trend</p>
            <p className="text-lg font-bold text-neon-yellow">↑ Rising (₹0.15)</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Network Efficiency</p>
            <p className="text-lg font-bold text-gray-200">92%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
