"use client";

import React from "react";
import { IconType } from "react-icons";

interface Props {
  title: string;
  value: string;
  unit: string;
  icon: string | React.ReactNode;
  trend?: "up" | "down";
  trendValue?: string;
  color?: string;
}

export default function EnergyStatsCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  color = "neon-green",
}: Props) {
  return (
    <div className={`bg-secondary border border-${color} border-opacity-20 rounded-xl p-5 hover:border-opacity-100 transition-all duration-300 group`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`text-2xl p-2 rounded-lg bg-gray-800 bg-opacity-50 text-${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded-full ${trend === "up" ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"
            }`}>
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h2 className={`text-2xl font-bold text-gray-100`}>
            {value}
          </h2>
          <span className="text-xs text-gray-500 font-medium">{unit}</span>
        </div>
      </div>

      {/* Decorative Glow */}
      <div className={`absolute -bottom-1 -right-1 w-12 h-12 bg-${color} opacity-5 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
    </div>
  );
}
