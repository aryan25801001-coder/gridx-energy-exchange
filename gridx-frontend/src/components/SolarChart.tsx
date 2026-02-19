"use client";

import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea
} from "recharts";
import { useStore } from "@/lib/store";

const data = [
    { time: "00:00", production: 0, demand: 2.1 },
    { time: "02:00", production: 0, demand: 1.9 },
    { time: "04:00", production: 0, demand: 1.8 },
    { time: "06:00", production: 0.2, demand: 2.2 },
    { time: "08:00", production: 1.5, demand: 2.8 },
    { time: "10:00", production: 3.8, demand: 3.1 },
    { time: "12:00", production: 5.2, demand: 3.4 },
    { time: "14:00", production: 4.9, demand: 3.2 },
    { time: "16:00", production: 3.2, demand: 3.8 },
    { time: "18:00", production: 0.8, demand: 5.2 },
    { time: "20:00", production: 0.1, demand: 5.8 },
    { time: "22:00", production: 0, demand: 4.8 },
    { time: "23:59", production: 0, demand: 4.2 },
];

export default function SolarChart() {
    const { isDisasterMode } = useStore();

    return (
        <div className={`h-[400px] w-full bg-secondary border rounded-3xl p-8 relative overflow-hidden transition-colors duration-1000 ${isDisasterMode ? 'border-neon-red shadow-glow-red bg-red-950 bg-opacity-5' : 'border-gray-800 shadow-2xl'
            }`}>
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-black text-gray-100 uppercase tracking-tight flex items-center gap-2">
                        Network Energy Flow
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Real-time Solar vs Community Load</p>
                </div>

                <div className="flex gap-4">
                    <ChartLegend color="bg-neon-green" label="Net Generation" />
                    <ChartLegend color="bg-neon-yellow" label="Community Demand" />
                </div>
            </div>

            <div className="h-[280px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isDisasterMode ? "#ff0000" : "#00ff00"} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={isDisasterMode ? "#ff0000" : "#00ff00"} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ffff00" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#ffff00" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="5 5" stroke="#2d3748" vertical={false} strokeOpacity={0.3} />

                        <XAxis
                            dataKey="time"
                            stroke="#4a5568"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            padding={{ left: 10, right: 10 }}
                        />

                        <YAxis
                            stroke="#4a5568"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 7]}
                        />

                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#0d1117",
                                border: `1px solid ${isDisasterMode ? "#ff0000" : "#00ff00"}`,
                                borderRadius: "16px",
                                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                                backdropFilter: "blur(8px)"
                            }}
                            itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: "800", textTransform: "uppercase" }}
                            labelStyle={{ color: "#718096", fontSize: "10px", marginBottom: "4px", fontWeight: "700" }}
                        />

                        {/* Surplus Region Highlight */}
                        <Area
                            type="monotone"
                            dataKey="production"
                            stroke={isDisasterMode ? "#ff0000" : "#00ff00"}
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorProd)"
                            name="Solar"
                            animationDuration={2000}
                        />

                        <Area
                            type="monotone"
                            dataKey="demand"
                            stroke="#ffff00"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorDemand)"
                            name="Demand"
                            animationDuration={2500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="absolute bottom-6 right-8 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isDisasterMode ? 'bg-neon-red animate-ping' : 'bg-neon-green active-glow'}`}></div>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{isDisasterMode ? 'Emergency Isolation' : 'Synchronized with Grid'}</span>
            </div>
        </div>
    );
}

function ChartLegend({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-1 rounded-full ${color}`}></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
        </div>
    );
}
