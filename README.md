# GridX: Decentralized AI Renewable Energy Trading Platform

A full-stack web3 application for peer-to-peer renewable energy trading with blockchain verification, AI price optimization, and smart microgrids.

**Live Demo Links:**
- Frontend: http://localhost:3003 (or :3000-:3002 if ports in use)
- Backend API Health: http://localhost:3001/health
- Dashboard: http://localhost:3003

---

## 📋 Project Structure

```
haryana/
├── gridx-frontend/          # Next.js frontend (React + TypeScript)
│   ├── src/
│   │   ├── app/             # App Router (pages: login, register, dashboard)
│   │   ├── components/      # React components (Sidebar, Dashboard, EnergyMarket, etc.)
│   │   ├── lib/             # Utilities (api.ts, store.ts, blockchain.ts)
│   │   └── styles/          # Tailwind CSS
│   ├── package.json         # Frontend dependencies
│   ├── next.config.js       # Next.js config
│   └── tailwind.config.ts   # Tailwind config
│
├── gridx-backend/           # Express.js backend (TypeScript)
│   ├── src/
│   │   ├── routes/          # API endpoints (auth, energy-trades, blockchain, etc.)
│   │   ├── middleware/      # Auth middleware, error handling
│   │   ├── db.ts            # PostgreSQL connection pool
│   │   ├── index.ts         # Express server & DB initialization
│   │   └── seed/            # Demo data seeding
│   ├── package.json         # Backend dependencies
│   ├── tsconfig.json        # TypeScript config
│   └── Dockerfile           # Docker container
│
├── gridx-contract/          # Solidity smart contracts
│   ├── contracts/
│   │   └── GridXEnergy.sol  # Main energy trading contract
│   ├── scripts/
│   │   └── deploy.js        # Deployment script (Hardhat)
│   └── hardhat.config.js    # Hardhat config (Polygon Mumbai testnet)
│
├── gridx-ai/                # Python FastAPI AI service (optional)
│   ├── main.py              # AI forecasting & pricing endpoints
│   ├── requirements.txt      # Python dependencies
│   └── README.md            # AI service docs
│
├── docker-compose.yml       # Full stack orchestration
├── index.html               # Quick dashboard links
├── START.bat / START.ps1    # One-click startup scripts
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+
- **npm** or **yarn**
- **PostgreSQL** (optional, uses mock data if DB offline)
- **MetaMask** browser extension (for blockchain features)
- **Docker** (optional, for containerization)

### 1. Clone & Setup

```bash
# Clone repository
git clone https://github.com/your-username/gridx.git
cd gridx

# Frontend setup
cd gridx-frontend
npm install
npm run dev
# Opens at http://localhost:3003

# Backend setup (in a new terminal)
cd gridx-backend
npm install
npm run dev
# Runs at http://localhost:3001
```

### 2. Demo Credentials

```
Email: arjun@solargrid.in
Password: password123
Role: seller
```

Or register a new account directly via the Register page.

---

## 📁 Key Source Files

### Frontend (React + Next.js + TypeScript)

| File | Purpose |
|------|---------|
| `gridx-frontend/src/app/page.tsx` | Dashboard (protected route) |
| `gridx-frontend/src/app/login/page.tsx` | Login page |
| `gridx-frontend/src/app/register/page.tsx` | Register page |
| `gridx-frontend/src/components/Dashboard.tsx` | Main dashboard layout |
| `gridx-frontend/src/components/EnergyMarket.tsx` | Energy trading interface |
| `gridx-frontend/src/components/MainContent.tsx` | Content views (analytics, market, history) |
| `gridx-frontend/src/components/Sidebar.tsx` | Navigation sidebar |
| `gridx-frontend/src/lib/api.ts` | API client + mock auth fallback |
| `gridx-frontend/src/lib/store.ts` | Zustand global state |
| `gridx-frontend/src/lib/blockchain.ts` | Web3 helpers (ethers.js) |

### Backend (Express + TypeScript)

| File | Purpose |
|------|---------|
| `gridx-backend/src/index.ts` | Express server, DB initialization |
| `gridx-backend/src/db.ts` | PostgreSQL connection pool |
| `gridx-backend/src/middleware/auth.ts` | JWT authentication middleware |
| `gridx-backend/src/routes/auth.ts` | Register, login, me endpoints |
| `gridx-backend/src/routes/energy-trades.ts` | Energy trade CRUD |
| `gridx-backend/src/routes/blockchain.ts` | Blockchain tx status |
| `gridx-backend/src/routes/transfer.ts` | On-chain energy unit transfers |
| `gridx-backend/src/routes/ai.ts` | AI forecast & price endpoints |
| `gridx-backend/src/routes/carbon-wallet.ts` | Carbon credit tracking |

### Smart Contract (Solidity)

| File | Purpose |
|------|---------|
| `gridx-contract/contracts/GridXEnergy.sol` | Main energy trading contract (Polygon Mumbai) |
| `gridx-contract/scripts/deploy.js` | Deploy contract to blockchain |

---

## 🔑 Core Features

### 1. **Authentication**
- JWT-based login/register
- Zustand state persistence
- Mock auth fallback (works offline)

### 2. **Energy Trading**
- Peer-to-peer energy marketplace
- Real-time seller/buyer matching
- Dynamic AI-optimized pricing

### 3. **Blockchain Integration**
- On-chain energy trade logging
- Carbon credit minting
- Polygon Mumbai testnet deployment
- Owner-relayed transfer function for admins

### 4. **AI & Analytics**
- Demand forecasting
- Dynamic price optimization
- Grid insights & recommendations

### 5. **Carbon Credits**
- Per-kWh CO₂ offset tracking
- Leaderboard rankings
- Carbon wallet balance

### 6. **Disaster Mode**
- Autonomous microgrid fallback
- Priority load allocation
- System isolation protocol

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **State:** Zustand + localStorage persistence
- **Styling:** Tailwind CSS
- **Icons:** react-icons
- **Web3:** ethers.js
- **Charts:** Recharts
- **Animation:** Framer Motion

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (with pg client)
- **Auth:** JWT + bcrypt
- **Real-time:** Socket.io (ready)
- **Payments:** Stripe (ready)
- **Email:** Nodemailer (ready)

### Blockchain
- **Smart Contract:** Solidity 0.8.19
- **Network:** Polygon Mumbai (testnet)
- **Framework:** Hardhat
- **Libraries:** OpenZeppelin (optional)

---

## ⚙️ Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
```

### Backend (`.env`)
```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/gridx
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:3003
RPC_URL=https://rpc-mumbai.maticvigil.com
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...
AI_SERVICE_URL=http://localhost:8000
STRIPE_SECRET_KEY=sk_...
SENDGRID_API_KEY=SG...
```

---

## 🗄️ Database Schema

### Users Table
```sql
id UUID PRIMARY KEY
name VARCHAR(255)
email VARCHAR(255) UNIQUE
password_hash VARCHAR(255)
role VARCHAR(50) -- 'seller', 'buyer', 'both'
wallet_address VARCHAR(255)
created_at TIMESTAMP DEFAULT NOW()
```

### Energy Trades Table
```sql
id UUID PRIMARY KEY
seller_id UUID REFERENCES users(id)
buyer_id UUID REFERENCES users(id)
energy_kwh NUMERIC(10, 2)
price_per_kwh NUMERIC(10, 4)
tx_hash VARCHAR(255) -- blockchain hash
carbon_saved NUMERIC(10, 2)
created_at TIMESTAMP DEFAULT NOW()
```

### Carbon Wallet Table
```sql
user_id UUID PRIMARY KEY REFERENCES users(id)
balance NUMERIC(15, 2) DEFAULT 0
total_earned NUMERIC(15, 2) DEFAULT 0
created_at TIMESTAMP DEFAULT NOW()
```

---

## 🧪 Testing

### Run Frontend Dev Server
```bash
cd gridx-frontend
npm run dev
# Opens http://localhost:3003
```

### Run Backend Dev Server
```bash
cd gridx-backend
npm install
npm run dev
# Runs on http://localhost:3001
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"arjun@solargrid.in","password":"password123"}'

# Get all trades
curl http://localhost:3001/api/energy-trades
```

---

## 🚢 Deployment

### Docker Compose (Full Stack)
```bash
cd haryana
docker-compose up -d
```

### Polygon Mumbai Deployment
```bash
cd gridx-contract
npx hardhat run scripts/deploy.js --network mumbai
# Save the deployed CONTRACT_ADDRESS in your .env
```

### Frontend Deployment (Vercel)
```bash
cd gridx-frontend
npm run build
vercel deploy
```

### Backend Deployment (Heroku/Railway)
```bash
cd gridx-backend
heroku create your-app-name
git push heroku main
```

---

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user (protected)

### Energy Trades
- `GET /api/energy-trades` - Get all trades
- `POST /api/energy-trades` - Create trade
- `GET /api/energy-trades/user/:userId` - Get user trades

### Smart Contracts
- `POST /api/energy-transfer/transfer` - Relay on-chain transfer
- `GET /api/blockchain/tx/:txHash` - Get tx status

### AI & Forecasting
- `GET /api/ai/forecast` - AI demand prediction
- `GET /api/ai/price?demand=2.5` - Dynamic pricing

### Carbon Tracking
- `GET /api/carbon-wallet/:userId` - User wallet balance
- `GET /api/carbon-wallet/leaderboard` - Global rankings

---

## 🔐 Security

- ✅ JWT tokens with 7-day expiry
- ✅ Bcrypt password hashing (10 rounds)
- ✅ CORS enabled for frontend origins
- ✅ Protected routes with middleware
- ✅ Blockchain-verified trades
- ✅ Mock auth fallback (offline mode)

---

## 🎯 Roadmap

- [ ] WebSocket real-time order updates
- [ ] Payment gateway integration (Stripe)
- [ ] Email notifications (Nodemailer)
- [ ] Admin dashboard
- [ ] Advanced analytics & BI
- [ ] Production CI/CD (GitHub Actions)
- [ ] Mobile app (React Native)
- [ ] DAO governance token

---

## 📝 License

MIT License - see LICENSE file for details

---

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For issues, feature requests, or questions:
- Create an Issue on GitHub
- Check existing documentation
- Review API endpoint examples

---

## 🙏 Acknowledgments

- Polygon Network (Mumbai testnet)
- OpenZeppelin contracts
- Framer Motion animations
- Recharts visualizations

---

**Built with ❤️ for decentralized energy trading**
