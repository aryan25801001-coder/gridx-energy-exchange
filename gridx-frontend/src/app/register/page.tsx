"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer" as "buyer" | "seller" | "both",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setToken, setUser } = useStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const response = await api.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // Save token and user to store (persist middleware handles localStorage)
      setToken(response.data.token);
      setUser(response.data.user);
      
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
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
          <p className="text-gray-400">Join the Energy Revolution</p>
        </div>

        {/* Register Form */}
        <div className="bg-secondary border border-neon-green border-opacity-30 rounded-lg p-8 shadow-lg shadow-neon-green/20">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Create Account</h2>

          {error && (
            <div className="bg-red-900 border border-neon-red rounded p-4 mb-4 text-neon-red text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-gray-100 focus:border-neon-green focus:outline-none transition-colors"
                placeholder="Your Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-gray-100 focus:border-neon-green focus:outline-none transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-gray-100 focus:border-neon-green focus:outline-none transition-colors"
              >
                <option value="buyer">Energy Buyer</option>
                <option value="seller">Solar Seller</option>
                <option value="both">Both (Prosumer)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-gray-100 focus:border-neon-green focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm mb-4">Already have an account?</p>
            <Link
              href="/login"
              className="text-neon-green hover:text-neon-yellow transition-colors font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
