"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { useStore } from "@/lib/store";

export default function Home() {
  // Bypass for Hackathon Demo
  return (
    <main className="min-h-screen">
      <Dashboard />
    </main>
  );
}
