"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import DisasterMode from "./DisasterMode";

export default function Dashboard() {
  const { setUser, setHouses, setCarbonWallet, isDisasterMode } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch all data
        const [usersRes, housesRes] = await Promise.all([
          api.getAllUsers().catch(() => ({
            data: [{ id: 'u1', name: 'Arjun Solar Farm', email: 'arjun@solargrid.in', role: 'seller' }]
          })),
          api.getAllHouses().catch(() => ({
            data: [{ id: 'h1', userId: 'u1', name: 'Main Solar Array', address: 'Sector 44, Gurugram', capacity: 15.5, latitude: 28.4595, longitude: 77.0266 }]
          })),
        ]);

        const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
        if (usersData.length > 0) {
          const currentUser = usersData[0];
          setUser(currentUser);

          const housesData = Array.isArray(housesRes.data) ? housesRes.data : [];
          const userHouses = housesData.filter(
            (h: any) => h.userId === currentUser.id
          );
          setHouses(userHouses);

          // Fetch carbon wallet with fallback
          const walletRes = await api.getCarbonWallet(currentUser.id).catch(() => ({
            data: { userId: currentUser.id, balance: 1250, totalEarned: 4500 }
          }));
          if (walletRes.data) setCarbonWallet(walletRes.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to load data:", error);
        setLoading(false);
      }
    };

    initializeData();
  }, [setUser, setHouses, setCarbonWallet]);

  // Force render for Hackathon Demo
  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1">
          {isDisasterMode ? <DisasterMode /> : <MainContent />}
        </div>
      </div>
    </div>
  );
}
