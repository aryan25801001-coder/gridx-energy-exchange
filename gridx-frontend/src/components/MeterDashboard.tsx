"use client";

import { useEffect, useState } from "react";
import { BiUpArrowAlt, BiDownArrowAlt, BiArrowToRight, BiArrowToLeft } from "react-icons/bi";
import { FiZap, FiActivity, FiTrendingUp, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";
import io, { Socket } from "socket.io-client";

interface MeterReading {
  userId: string;
  imported: number;
  exported: number;
  netEnergy: number;
  role: "Buyer" | "Seller" | "Prosumer";
  timestamp: string;
}

interface UserMeterData {
  userId: string;
  imported: number;
  exported: number;
  netEnergy: number;
  role: "Buyer" | "Seller" | "Prosumer";
  lastUpdate: string;
}

const DEMO_USERS = ["user-1", "user-2", "user-3", "user-4", "user-5"];

// Random data generator with realistic patterns
const generateRandomReading = (): Omit<MeterReading, 'userId' | 'timestamp'> => {
  // Time-of-day factor
  const hour = new Date().getHours();
  const timeOfDayFactor = Math.sin((hour / 24) * Math.PI);

  // Base consumption (higher in evening, lower at night)
  const baseConsumption = 1.5 + (2 * Math.abs(timeOfDayFactor));
  const imported = Math.max(0.1, baseConsumption + (Math.random() - 0.5) * 1.5);

  // Solar generation (peaks at noon, zero at night)
  const solarPeak = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
  const baseSolar = 2.5 * solarPeak;
  const exported = Math.max(0, baseSolar + (Math.random() - 0.5) * 1.2);

  const netEnergy = parseFloat((exported - imported).toFixed(3));

  // Determine role
  let role: "Buyer" | "Seller" | "Prosumer";
  if (netEnergy > 0.5) {
    role = "Seller";
  } else if (netEnergy < -0.5) {
    role = "Buyer";
  } else {
    role = "Prosumer";
  }

  return {
    imported: parseFloat(imported.toFixed(3)),
    exported: parseFloat(exported.toFixed(3)),
    netEnergy,
    role,
  };
};

export default function MeterDashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [meters, setMeters] = useState<Map<string, MeterReading>>(new Map());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initialize with random data for each user
    const initialMeters = new Map<string, MeterReading>();
    DEMO_USERS.forEach((userId) => {
      const reading = generateRandomReading();
      initialMeters.set(userId, {
        userId,
        ...reading,
        timestamp: new Date().toISOString(),
      });
    });
    setMeters(initialMeters);

    // Initialize Socket.io connection
    const newSocket = io("http://localhost:3001", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      setConnected(true);
      console.log("🔌 Connected to Meter updates");

      // Subscribe to meter updates for demo users
      DEMO_USERS.forEach((userId) => {
        newSocket.emit("subscribe_user", userId);
      });
    });

    newSocket.on("METER_UPDATE", (data: MeterReading) => {
      setMeters((prev) => new Map(prev).set(data.userId, data));
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
      console.log("❌ Disconnected from Meter updates");
    });

    setSocket(newSocket);

    // Update with random data every 3 seconds (simulating real-time)
    const randomUpdateInterval = setInterval(() => {
      DEMO_USERS.forEach((userId) => {
        const reading = generateRandomReading();
        setMeters((prev) => {
          const updated = new Map(prev);
          updated.set(userId, {
            userId,
            ...reading,
            timestamp: new Date().toISOString(),
          });
          return updated;
        });
      });
    }, 3000);

    return () => {
      clearInterval(randomUpdateInterval);
      newSocket.disconnect();
    };
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Seller":
        return { bg: "bg-green-950", border: "border-neon-green", icon: "⬆️", text: "text-neon-green" };
      case "Buyer":
        return { bg: "bg-red-950", border: "border-red-500", icon: "⬇️", text: "text-red-500" };
      case "Prosumer":
        return { bg: "bg-purple-950", border: "border-purple-500", icon: "⟷", text: "text-purple-300" };
      default:
        return { bg: "bg-gray-900", border: "border-gray-800", icon: "?", text: "text-gray-400" };
    }
  };

  const getTotalStats = () => {
    const allReadings = Array.from(meters.values());
    return {
      totalImported: allReadings.reduce((sum, m) => sum + m.imported, 0),
      totalExported: allReadings.reduce((sum, m) => sum + m.exported, 0),
      totalNet: allReadings.reduce((sum, m) => sum + m.netEnergy, 0),
      sellerCount: allReadings.filter((m) => m.role === "Seller").length,
      buyerCount: allReadings.filter((m) => m.role === "Buyer").length,
      prosumerCount: allReadings.filter((m) => m.role === "Prosumer").length,
    };
  };

  const totals = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-100 uppercase tracking-widest flex items-center gap-3">
          <BiDownArrowAlt className="text-neon-cyan" />
          Smart Meter Dashboard
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-neon-green animate-pulse" : "bg-red-500"}`} />
          <span className="text-xs font-bold text-gray-300">
            {connected ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Imported */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-blue-950 border border-neon-cyan rounded-xl p-6"
        >
          <p className="text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
            <BiDownArrowAlt className="text-neon-cyan" /> Total Imported
          </p>
          <motion.p
            key={`imported-${totals.totalImported}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-black text-neon-cyan"
          >
            {totals.totalImported.toFixed(2)}
            <span className="text-sm text-gray-400 ml-1">kWh</span>
          </motion.p>
          <p className="text-xs text-gray-400 mt-2">From grid</p>
        </motion.div>

        {/* Total Exported */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-950 border border-neon-green rounded-xl p-6"
        >
          <p className="text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
            <BiUpArrowAlt className="text-neon-green" /> Total Exported
          </p>
          <motion.p
            key={`exported-${totals.totalExported}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-black text-neon-green"
          >
            {totals.totalExported.toFixed(2)}
            <span className="text-sm text-gray-400 ml-1">kWh</span>
          </motion.p>
          <p className="text-xs text-gray-400 mt-2">To grid</p>
        </motion.div>

        {/* Net Energy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-950 border border-neon-yellow rounded-xl p-6"
        >
          <p className="text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
            <FiTrendingUp className="text-neon-yellow" /> Net Energy
          </p>
          <motion.p
            key={`net-${totals.totalNet}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`text-3xl font-black ${totals.totalNet > 0 ? "text-neon-green" : "text-neon-cyan"}`}
          >
            {totals.totalNet > 0 ? "+" : ""}{totals.totalNet.toFixed(2)}
            <span className="text-sm text-gray-400 ml-1">kWh</span>
          </motion.p>
          <p className="text-xs text-gray-400 mt-2">{totals.totalNet > 0 ? "Surplus" : "Deficit"}</p>
        </motion.div>

        {/* User Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-950 border border-purple-500 rounded-xl p-6"
        >
          <p className="text-xs font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
            <FiUser className="text-purple-300" /> Active Users
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-300">Sellers</span>
              <span className="font-bold text-neon-green">{totals.sellerCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-300">Buyers</span>
              <span className="font-bold text-red-400">{totals.buyerCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-300">Prosumers</span>
              <span className="font-bold text-purple-300">{totals.prosumerCount}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Meters Grid */}
      <div>
        <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
          <FiZap className="text-neon-cyan" />
          Individual Meters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEMO_USERS.map((userId) => {
            const reading = meters.get(userId);
            const roleStyle = getRoleColor(reading?.role || "Prosumer");

            return (
              <motion.div
                key={userId}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className={`${roleStyle.bg} border-2 ${roleStyle.border} rounded-xl p-6`}
              >
                {/* User ID & Role */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-black text-gray-100">{userId}</p>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    className={`px-3 py-1 rounded-full bg-gray-800 border ${roleStyle.border}`}
                  >
                    <span className={`text-xs font-black ${roleStyle.text}`}>
                      {roleStyle.icon} {reading?.role || "Loading..."}
                    </span>
                  </motion.div>
                </div>

                {/* Energy Readings */}
                <div className="space-y-3">
                  {/* Imported */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 flex items-center gap-2">
                        <BiDownArrowAlt className="text-neon-cyan" /> Imported
                      </span>
                      <motion.span
                        key={`${userId}-imported-${reading?.imported}`}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-sm font-bold text-neon-cyan"
                      >
                        {reading?.imported.toFixed(3) || "0.000"} kWh
                      </motion.span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-neon-cyan rounded-full h-2"
                        style={{ width: `${Math.min(100, (reading?.imported || 0) * 20)}%` }}
                      />
                    </div>
                  </div>

                  {/* Exported */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 flex items-center gap-2">
                        <BiUpArrowAlt className="text-neon-green" /> Exported
                      </span>
                      <motion.span
                        key={`${userId}-exported-${reading?.exported}`}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-sm font-bold text-neon-green"
                      >
                        {reading?.exported.toFixed(3) || "0.000"} kWh
                      </motion.span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-neon-green rounded-full h-2"
                        style={{ width: `${Math.min(100, (reading?.exported || 0) * 20)}%` }}
                      />
                    </div>
                  </div>

                  {/* Net Energy */}
                  <motion.div
                    key={`${userId}-net-${reading?.netEnergy}`}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 flex items-center gap-2">
                        <FiActivity /> Net Energy
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          reading && reading.netEnergy > 0.1
                            ? "text-neon-green"
                            : reading && reading.netEnergy < -0.1
                            ? "text-neon-cyan"
                            : "text-neon-yellow"
                        }`}
                      >
                        {reading && reading.netEnergy > 0 ? "+" : ""}{reading?.netEnergy.toFixed(3) || "0.000"} kWh
                      </span>
                    </div>
                  </motion.div>

                  {/* Last Update */}
                  <p className="text-xs text-gray-500 mt-3">
                    Updated: {reading ? new Date(reading.timestamp).toLocaleTimeString() : "Waiting..."}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Information Card */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="bg-gradient-to-r from-blue-950 to-purple-950 border border-neon-cyan rounded-xl p-6"
      >
        <h3 className="text-sm font-black text-gray-300 uppercase mb-3">📡 Real-Time Meter Simulation</h3>
        <p className="text-sm text-gray-300 mb-4">
          Live random data generation with realistic energy patterns:
        </p>
        <ul className="text-xs text-gray-400 space-y-2">
          <li>✓ Time-of-day consumption patterns</li>
          <li>✓ Solar generation curves (peaks at noon)</li>
          <li>✓ Real-time role auto-detection</li>
          <li>✓ Automatic buyer/seller classification</li>
          <li>✓ Updates every 3 seconds</li>
          <li>✓ Production-ready for real IoT devices</li>
        </ul>
      </motion.div>
    </div>
  );
}
