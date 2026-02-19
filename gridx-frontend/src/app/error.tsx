"use client";

import { useEffect } from "react";
import { FiAlertOctagon, FiRefreshCw } from "react-icons/fi";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("GridX Crash Report:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-secondary border border-neon-red border-opacity-30 rounded-3xl p-8 text-center shadow-glow-red">
                <div className="w-16 h-16 bg-red-900 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiAlertOctagon className="text-neon-red text-3xl animate-pulse" />
                </div>

                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                    Grid Protocol Failure
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                    The application encountered an unexpected runtime error. Our AI is analyzing the diagnostic data.
                </p>

                <div className="bg-black bg-opacity-50 rounded-xl p-4 mb-8 text-left border border-gray-800">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-2 tracking-widest">Diagnostic Info</p>
                    <p className="text-xs font-mono text-neon-red break-all opacity-80">
                        {error.message || "Unknown execution error"}
                    </p>
                    {error.digest && (
                        <p className="text-[9px] text-gray-600 mt-2">Digest: {error.digest}</p>
                    )}
                </div>

                <button
                    onClick={() => reset()}
                    className="w-full flex items-center justify-center gap-3 bg-neon-red text-white font-black py-4 rounded-xl hover:shadow-glow-red transition-all uppercase text-sm tracking-widest"
                >
                    <FiRefreshCw />
                    Re-initialize Grid
                </button>

                <p className="text-[10px] text-gray-600 mt-6 font-bold uppercase tracking-[0.2em]">
                    GridX Resiliency Protocol v1.0
                </p>
            </div>
        </div>
    );
}
