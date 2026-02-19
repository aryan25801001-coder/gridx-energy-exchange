# 📟 Deployment & Demo Guide

This guide explains how to set up and demonstrate the **GridX** platform for a live hackathon pitch.

## 1. Prerequisites
- **Node.js** v18+
- **Python** 3.10+
- **PostgreSQL** (running locally or via Docker)
- **MetaMask** browser extension (configured for Polygon Mumbai)

## 2. API & Backend Setup
```bash
# Navigate to backend
cd gridx-backend

# Install dependencies
npm install

# Setup .env (Refer to .env.example)
# Run migrations & seed data
npm run migrate
npm run seed

# Start server
npm run dev
```

## 3. AI Service Setup
```bash
# Navigate to AI service
cd gridx-ai

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python main.py
```

## 4. Frontend Setup
```bash
# Navigate to frontend
cd gridx-frontend

# Install dependencies
npm install

# Setup .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (From Hardhat)

# Start Next.js
npm run dev
```

## 5. Smart Contract (Blockchain)
If you need to redeploy the contract:
```bash
cd gridx-contract
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network mumbai
```

## 6. Live Demo Script
1. **Show the Dashboard**: Point out the live generation (4.2 kW) and Surplus energy.
2. **Buy Energy**: 
   - Go to "Energy Market".
   - Select a Seller.
   - Click "Buy Energy".
   - Confirm MetaMask transaction.
   - Show the "Blockchain Verified" badge and the transaction hash.
3. **Check Carbon Tokens**: Watch the Carbon Counter animate upwards after the trade.
4. **Disaster Mode**: 
   - Toggle the switch on the sidebar.
   - Explain how the community grid becomes independent during emergencies.
5. **Leaderboard**: Show the greenest households in the community.
