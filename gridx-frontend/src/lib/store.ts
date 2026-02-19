import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'both';
  walletAddress?: string;
}

interface House {
  id: string;
  userId: string;
  name: string;
  address: string;
  capacity: number;
  latitude: number;
  longitude: number;
}

interface EnergyProduction {
  id: string;
  houseId: string;
  timestamp: string;
  production: number; // kWh
  temperature: number; // celsius
}

interface CarbonWallet {
  userId: string;
  balance: number;
  totalEarned: number;
}

interface Store {
  // Auth
  token: string | null;
  setToken: (token: string | null) => void;

  // User
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;

  // Houses
  houses: House[];
  setHouses: (houses: House[]) => void;

  // Current selected house
  selectedHouseId: string | null;
  setSelectedHouseId: (id: string) => void;

  // Energy data
  currentProduction: number;
  setCurrentProduction: (value: number) => void;

  // Carbon wallet
  carbonWallet: CarbonWallet | null;
  setCarbonWallet: (wallet: CarbonWallet) => void;

  // UI state
  activeView: 'dashboard' | 'market' | 'history' | 'leaderboard' | 'analytics';
  setActiveView: (view: 'dashboard' | 'market' | 'history' | 'leaderboard' | 'analytics') => void;
  isDisasterMode: boolean;
  setDisasterMode: (active: boolean) => void;

  // Demo/Animation
  animatedCarbonValue: number;
  setAnimatedCarbonValue: (value: number) => void;
}

export const useStore = create<Store>(
  persist(
    (set) => ({
      // Hackathon Demo Mode: Pre-authenticated
      token: 'demo_token_123',
      setToken: (token) => set({ token }),

      user: {
        id: 'u1',
        name: 'Arjun Solar Farm',
        email: 'arjun@solargrid.in',
        role: 'seller'
      },
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null, token: null }),

      houses: [],
      setHouses: (houses) => set({ houses }),

      selectedHouseId: null,
      setSelectedHouseId: (id) => set({ selectedHouseId: id }),

      currentProduction: 0,
      setCurrentProduction: (value) => set({ currentProduction: value }),

      carbonWallet: null,
      setCarbonWallet: (wallet) => set({ carbonWallet: wallet }),

      activeView: 'dashboard',
      setActiveView: (view) => set({ activeView: view }),
      isDisasterMode: false,
      setDisasterMode: (active: boolean) => set({ isDisasterMode: active }),

      animatedCarbonValue: 0,
      setAnimatedCarbonValue: (value) => set({ animatedCarbonValue: value }),
    }),
    {
      name: 'gridx-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        activeView: state.activeView,
      }),
    }
  )
);
