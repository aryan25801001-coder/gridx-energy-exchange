"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setToken, setUser } = useStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.login({ email, password });

      // Save token and user to store (persist middleware handles localStorage)
      setToken(response.data.token);
      setUser(response.data.user);
      
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neon-green neon-glow-green mb-2">
            GridX
          </h1>
          <p className="text-gray-400">Decentralized Energy Trading</p>
        </div>

        {/* Login Form */}
        <div className="bg-secondary border border-neon-green border-opacity-30 rounded-lg p-8 shadow-lg shadow-neon-green/20">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Welcome Back</h2>

          {error && (
            <div className="bg-red-900 border border-neon-red rounded p-4 mb-4 text-neon-red text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-gray-100 focus:border-neon-green focus:outline-none transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-gray-100 focus:border-neon-green focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neon-green text-black font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-neon-green transition-all disabled:opacity-50 mt-6"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm mb-4">Don't have an account?</p>
            <Link
              href="/register"
              className="text-neon-green hover:text-neon-yellow transition-colors font-semibold"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-8 bg-gray-900 border border-neon-yellow border-opacity-30 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-400 mb-2">Demo Credentials:</p>
          <p className="text-xs text-neon-yellow font-mono">
            arjun@solargrid.in / password123
          </p>
        </div>
      </div>
    </div>
  );
}
