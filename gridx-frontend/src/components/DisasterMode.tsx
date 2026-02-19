"use client";

import React, { useState, useEffect } from "react";
import { BiPowerOff, BiShield, BiBroadcast } from "react-icons/bi";
import { FiActivity, FiAlertTriangle, FiShield, FiZap } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function DisasterMode() {
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale(s => s === 1 ? 1.05 : 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 bg-black min-h-screen">
      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-950 border-4 border-neon-red rounded-2xl p-8 text-center relative overflow-hidden shadow-glow-red"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-neon-red animate-pulse"></div>
        <h1 className="text-5xl font-black text-neon-red mb-4 tracking-tighter flex items-center justify-center gap-4">
          <FiAlertTriangle className="animate-bounce" />
          DISASTER MODE ACTIVE
          <FiAlertTriangle className="animate-bounce" />
        </h1>
        <p className="text-xl font-bold text-gray-300 uppercase tracking-widest">
          Local Microgrid: <span className="text-neon-red">Autonomous Isolation Protocol</span>
        </p>

        {/* Animated Scanning Line */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-neon-red to-transparent h-20 animate-scan"></div>
        </div>
      </motion.div>

      {/* Grid Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard
          title="Microgrid Pulse"
          value="50.2 Hz"
          status="STABLE"
          icon={<FiActivity className="text-neon-cyan" />}
          color="neon-cyan"
        />
        <StatusCard
          title="Community Storage"
          value="84%"
          status="RESERVE MODE"
          icon={<FiZap className="text-neon-yellow" />}
          color="neon-yellow"
        />
        <StatusCard
          title="Protected Households"
          value="1,248"
          status="ENERGIZED"
          icon={<BiShield className="text-neon-green" />}
          color="neon-green"
          pulse
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority Allocation */}
        <div className="bg-gray-900 border border-neon-red border-opacity-30 rounded-2xl p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-gray-100 mb-8 flex items-center gap-3">
            <BiBroadcast className="text-neon-red animate-pulse" />
            Priority Load Distribution
          </h3>
          <div className="space-y-6">
            <LoadBar label="Hospital & Emergency" value={100} color="neon-red" pulse labelColor="text-neon-red" />
            <LoadBar label="Community Shelters" value={100} color="neon-yellow" labelColor="text-neon-yellow" />
            <LoadBar label="Street Lighting" value={40} color="neon-cyan" labelColor="text-neon-cyan" />
            <LoadBar label="Residential (Limited)" value={15} color="gray-500" labelColor="text-gray-500" />
          </div>

          <div className="mt-8 p-4 bg-red-900 bg-opacity-20 border border-neon-red border-opacity-20 rounded-xl">
            <p className="text-xs text-red-300 italic">
              * Non-essential loads shed automatically to preserve lifeline services.
            </p>
          </div>
        </div>

        {/* Source Matrix */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-100 mb-8 flex items-center gap-3">
            <FiShield className="text-neon-green" />
            Resilience Matrix
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <MatrixItem label="External Grid" status="OFFLINE" value="0.0 kW" active={false} />
            <MatrixItem label="Solar Field A" status="PEAK OPS" value="1.2 MW" active={true} color="neon-yellow" />
            <MatrixItem label="Battery Array" status="DISCHARGING" value="850 kW" active={true} color="neon-cyan" />
            <MatrixItem label="Wind Gen 4" status="STANDBY" value="0.0 kW" active={false} />
          </div>

          <div className="mt-8 bg-gray-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 p-4 transform translate-y-4 translate-x-4 opacity-5 group-hover:opacity-20 transition-all">
              <img src="https://cdnt.static.com/icon/energy-shield.png" className="w-24 h-24 filter invert" alt="" />
            </div>
            <h4 className="font-bold text-neon-green mb-2 flex items-center gap-2">
              <BiShield /> Microgrid Autonomy
            </h4>
            <p className="text-sm text-gray-400">
              Your neighborhood is now operating as a standalone energy island.
              The AI is prioritizing life-support systems while maintaining
              synchronous stability at 50Hz.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Toggle Footer */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
        <div className="bg-red-950 border border-neon-red p-4 rounded-full flex items-center justify-between shadow-glow-red">
          <div className="flex items-center gap-4 ml-4">
            <div className="w-3 h-3 bg-neon-red rounded-full animate-ping"></div>
            <span className="text-xs font-black text-neon-red uppercase tracking-widest">Protocol Delta Active</span>
          </div>
          <button className="bg-neon-red text-black font-black px-6 py-2 rounded-full hover:scale-105 transition-all text-sm uppercase">
            Exit Autonomous Mode
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, value, status, icon, color, pulse = false }: any) {
  return (
    <div className={`bg-gray-900 border border-${color} border-opacity-20 rounded-2xl p-6 transition-all hover:border-opacity-100 relative overflow-hidden group`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`text-2xl text-${color} group-hover:scale-110 transition-transform`}>{icon}</div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-black border border-${color} border-opacity-30 text-${color}`}>
          {status}
        </div>
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{title}</p>
        <p className={`text-3xl font-black text-gray-100 ${pulse ? 'animate-pulse text-' + color : ''}`}>{value}</p>
      </div>
    </div>
  );
}

function LoadBar({ label, value, color, pulse = false, labelColor = "text-gray-100" }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className={`text-sm font-bold ${labelColor}`}>{label}</span>
        <span className={`text-xs font-black ${labelColor}`}>{value}% Power</span>
      </div>
      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full bg-${color} shadow-glow`}
        />
      </div>
    </div>
  );
}

function MatrixItem({ label, status, value, active, color = "gray-500" }: any) {
  return (
    <div className={`p-4 rounded-xl border ${active ? `bg-gray-800 border-${color}` : 'bg-black border-gray-800'} transition-all`}>
      <p className="text-[10px] text-gray-500 uppercase font-black mb-2">{label}</p>
      <p className={`text-sm font-black ${active ? `text-${color}` : 'text-gray-700'}`}>{status}</p>
      <p className="text-xl font-black text-gray-200">{value}</p>
    </div>
  );
}
