import axios from 'axios';
import { useStore } from './store';
import { v4 as uuidv4 } from 'uuid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock user database in localStorage
const MOCK_USERS_KEY = 'gridx_users_mock';

const getMockUsers = () => {
  try {
    const users = localStorage.getItem(MOCK_USERS_KEY);
    if (users) return JSON.parse(users);
  } catch {
    // Continue
  }
  
  // Initialize with demo users
  const demoUsers: any = {
    'arjun@solargrid.in': {
      id: uuidv4(),
      name: 'Arjun Solar Farm',
      email: 'arjun@solargrid.in',
      password: 'password123',
      role: 'seller',
    },
    'rohan@consumer.in': {
      id: uuidv4(),
      name: 'Rohan Energy Consumer',
      email: 'rohan@consumer.in',
      password: 'password123',
      role: 'buyer',
    },
    'dev@smartgrid.in': {
      id: uuidv4(),
      name: 'Dev Smart Grid',
      email: 'dev@smartgrid.in',
      password: 'password123',
      role: 'both',
    },
  };
  
  try {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(demoUsers));
  } catch (e) {
    // Continue
  }
  
  return demoUsers;
};

const saveMockUsers = (users: any) => {
  try {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving mock users', e);
  }
};

// Add auth interceptor to include token in all requests
apiClient.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock API responses
const mockLoginResponse = async (email: string, password: string) => {
  const users = getMockUsers();
  const user = users[email];
  
  if (!user || user.password !== password) {
    throw { response: { data: { error: 'Invalid email or password' } } };
  }
  
  const token = 'mock_token_' + uuidv4();
  return {
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  };
};

const mockRegisterResponse = async (data: any) => {
  const users = getMockUsers();
  
  if (users[data.email]) {
    throw { response: { data: { error: 'Email already registered' } } };
  }
  
  const newUser = {
    id: uuidv4(),
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
  };
  
  users[data.email] = newUser;
  saveMockUsers(users);
  
  const token = 'mock_token_' + uuidv4();
  return {
    data: {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    },
  };
};

export const api = {
  // Auth - with mock fallback
  register: async (data: any) => {
    try {
      return await apiClient.post('/api/auth/register', data);
    } catch (error) {
      // Fallback to mock if backend is down
      return await mockRegisterResponse(data);
    }
  },
  
  login: async (data: any) => {
    try {
      return await apiClient.post('/api/auth/login', data);
    } catch (error) {
      // Fallback to mock if backend is down
      return await mockLoginResponse(data.email, data.password);
    }
  },
  
  getMe: () => apiClient.get('/api/auth/me'),
  
  // Users
  getUser: (id: string) => apiClient.get(`/api/users/${id}`),
  getAllUsers: () => apiClient.get('/api/users'),
  
  // Houses
  getHouse: (id: string) => apiClient.get(`/api/houses/${id}`),
  getAllHouses: () => apiClient.get('/api/houses'),
  
  // Energy Production
  getEnergyProduction: (houseId: string) => 
    apiClient.get(`/api/energy-production/${houseId}`),
  getLatestProduction: (houseId: string) => 
    apiClient.get(`/api/energy-production/latest/${houseId}`),
  
  // Energy Trades
  getAllTrades: () => apiClient.get('/api/energy-trades'),
  getUserTrades: (userId: string) => apiClient.get(`/api/energy-trades/user/${userId}`),
  createTrade: (data: any) => apiClient.post('/api/energy-trades', data),
  
  // Carbon Wallet
  getCarbonWallet: (userId: string) => apiClient.get(`/api/carbon-wallet/${userId}`),
  getCarbonTransactions: (userId: string) => 
    apiClient.get(`/api/carbon-wallet/transactions/${userId}`),
  getCarbonLeaderboard: () => apiClient.get('/api/carbon-wallet/leaderboard'),
  
  // AI Forecasting
  getForecast: (houseId?: string) => 
    apiClient.get(`/api/ai/forecast${houseId ? `?houseId=${houseId}` : ''}`),
  getPrice: (demandKwh: number) => 
    apiClient.get(`/api/ai/price?demand=${demandKwh}`),
  
  // Blockchain
  getTransactionStatus: (txHash: string) => 
    apiClient.get(`/api/blockchain/tx/${txHash}`),
};
