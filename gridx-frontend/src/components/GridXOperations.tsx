"use client";

import React, { useState, useEffect } from "react";
import { BiServer, BiCheckCircle, BiErrorCircle, BiCopy } from "react-icons/bi";
import { FiRefreshCw, FiCheck, FiAlertTriangle } from "react-icons/fi";
import { motion } from "framer-motion";

interface OperationStatus {
  id: string;
  name: string;
  status: "active" | "pending" | "error";
  uptime: number;
  lastSync: string;
  responseTime: number;
}

export default function GridXOperations() {
  const [operations, setOperations] = useState<OperationStatus[]>([
    {
      id: "grid-monitor",
      name: "Grid Monitoring Service",
      status: "active",
      uptime: 99.98,
      lastSync: "2 seconds ago",
      responseTime: 45,
    },
    {
      id: "price-engine",
      name: "Dynamic Price Engine",
      status: "active",
      uptime: 99.95,
      lastSync: "1 second ago",
      responseTime: 28,
    },
    {
      id: "allocation",
      name: "Priority Allocation System",
      status: "active",
      uptime: 99.92,
      lastSync: "3 seconds ago",
      responseTime: 62,
    },
    {
      id: "forecast",
      name: "AI Demand Forecast",
      status: "active",
      uptime: 98.85,
      lastSync: "5 seconds ago",
      responseTime: 156,
    },
    {
      id: "emergency",
      name: "Emergency Mode Controller",
      status: "active",
      uptime: 100,
      lastSync: "Just now",
      responseTime: 15,
    },
    {
      id: "blockchain",
      name: "Blockchain Sync",
      status: "pending",
      uptime: 99.88,
      lastSync: "8 seconds ago",
      responseTime: 240,
    },
  ]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setOperations((prev) =>
      prev.map((op) => ({
        ...op,
        lastSync: "Just now",
        responseTime: Math.max(15, op.responseTime + Math.random() * 50 - 25),
      }))
    );
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-neon-green";
      case "pending":
        return "text-neon-yellow";
      case "error":
        return "text-neon-red";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-950 border-neon-green border-opacity-30";
      case "pending":
        return "bg-yellow-950 border-neon-yellow border-opacity-30";
      case "error":
        return "bg-red-950 border-neon-red border-opacity-30";
      default:
        return "bg-gray-900 border-gray-800";
    }
  };

  const avgUptime = (
    operations.reduce((sum, op) => sum + op.uptime, 0) / operations.length
  ).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-100 uppercase tracking-widest flex items-center gap-3">
          <BiServer className="text-neon-cyan" />
          GridX Operations Hub
        </h2>
        <motion.button
          onClick={handleRefresh}
          disabled={refreshing}
          whileHover={{ rotate: 10 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-neon-cyan hover:border-neon-cyan transition-all disabled:opacity-50"
        >
          <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
        </motion.button>
      </div>

      {/* System Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
            Services Active
          </p>
          <p className="text-3xl font-black text-neon-green">{operations.filter(op => op.status === 'active').length}/6</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
            Avg Uptime
          </p>
          <p className="text-3xl font-black text-neon-cyan">{avgUptime}%</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
            Avg Response
          </p>
          <p className="text-3xl font-black text-neon-yellow">
            {Math.round(operations.reduce((sum, op) => sum + op.responseTime, 0) / operations.length)}ms
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
            System Status
          </p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon-green animate-pulse"></div>
            <p className="text-sm font-black text-neon-green">HEALTHY</p>
          </div>
        </div>
      </div>

      {/* Operations List */}
      <div className="space-y-3">
        {operations.map((op) => (
          <motion.div
            key={op.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`border rounded-xl p-5 transition-all ${getStatusBgColor(op.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`mt-1 ${getStatusColor(op.status)}`}>
                  {op.status === "active" ? (
                    <BiCheckCircle className="w-6 h-6" />
                  ) : op.status === "pending" ? (
                    <FiAlertTriangle className="w-6 h-6" />
                  ) : (
                    <BiErrorCircle className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-gray-100 uppercase tracking-wide">
                    {op.name}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                        Uptime
                      </p>
                      <p className="text-sm font-black text-gray-300">{op.uptime}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                        Last Sync
                      </p>
                      <p className="text-sm font-black text-gray-300">{op.lastSync}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                        Response
                      </p>
                      <p className="text-sm font-black text-gray-300">{op.responseTime}ms</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(
                  op.status
                )}`}
              >
                {op.status}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
        <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
          Real-time monitoring enabled • Last update: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
