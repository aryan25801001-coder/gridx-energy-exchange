# GridX Quick Reference

## Project Complete ✅

Your full-stack decentralized energy trading platform is ready!

## Directory Structure

```
haryana/
├── gridx-frontend/          # Next.js Dashboard (Port 3000)
├── gridx-backend/           # Express API (Port 3001)
├── gridx-ai/                # FastAPI Service (Port 8000)
├── gridx-contract/          # Solidity Smart Contract
├── docs/                    # Full documentation
├── docker-compose.yml       # Multi-container setup
├── setup.sh / setup.bat     # Automated setup
├── README.md                # Main documentation
└── .gitignore
```

## Quick Start (Choose One)

### ⚡ Fastest: Docker Compose
```bash
docker-compose up --build
# All 3 services start automatically
# Frontend: http://localhost:3000
```

### 🛠️ Local Development
```bash
# Terminal 1: Backend
cd gridx-backend && npm install && npm run dev

# Terminal 2: Frontend
cd gridx-frontend && npm install && npm run dev

# Terminal 3: AI Service
cd gridx-ai && pip install -r requirements.txt && python main.py
```

### 🪟 Windows Users
```bash
# Just run this:
setup.bat
# Wait ~5 minutes, all services will start
```

### 🐧 Linux/Mac Users
```bash
# Just run this:
chmod +x setup.sh
./setup.sh
# Wait ~5 minutes, all services will start
```

## First Steps

### 1️⃣ Access the Application
```
Frontend:   http://localhost:3000
Backend API: http://localhost:3001
AI Service: http://localhost:8000
Swagger:    http://localhost:3001/docs (when added)
```

### 2️⃣ Test Backend
```bash
# Check health
curl http://localhost:3001/health

# Get all users
curl http://localhost:3001/api/users

# Get forecast
curl -X POST http://localhost:3001/api/ai/forecast
```

### 3️⃣ Setup MetaMask
1. Install MetaMask browser extension
2. Add Polygon Mumbai network:
   - RPC: `https://rpc-mumbai.maticvigil.com`
   - Chain ID: `80001`
3. Get test MATIC from [faucet](https://faucet.polygon.technology/)
4. Get contract address from Smart Contract deployment

### 4️⃣ Deploy Smart Contract

**Via Remix IDE (Easiest):**
1. Go to https://remix.ethereum.org
2. Create new file: `GridXEnergyTrading.sol`
3. Copy from `gridx-contract/GridXEnergyTrading.sol`
4. Compile (v0.8.19)
5. Deploy to Mumbai → Copy address
6. Update `.env.local`: `NEXT_PUBLIC_CONTRACT_ADDRESS=0x...`

### 5️⃣ Seed Database (Optional)
```bash
cd gridx-backend
npm run seed
# Populates 5 houses, 3 trades, demo data
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `gridx-frontend/src/components/Dashboard.tsx` | Main UI |
| `gridx-frontend/src/lib/api.ts` | API calls |
| `gridx-backend/src/index.ts` | Server entry |
| `gridx-backend/src/routes/*.ts` | API endpoints |
| `gridx-ai/main.py` | Forecasting engine |
| `gridx-contract/GridXEnergyTrading.sol` | Smart contract |
| `README.md` | Full documentation |
| `docs/API_REFERENCE.md` | All endpoints |
| `docs/DEPLOYMENT.md` | Production setup |
| `docs/ARCHITECTURE.md` | System design |

## Database

### Connect Directly
```bash
# If running locally
psql -h localhost -U postgres -d gridx

# If using Docker
docker exec -it gridx-postgres psql -U postgres -d gridx
```

### View Tables
```sql
SELECT * FROM users;
SELECT * FROM houses;
SELECT * FROM energy_trades;
SELECT * FROM carbon_wallet;
```

## Testing the Features

### ✅ View Demo Data
```bash
curl http://localhost:3001/api/users
curl http://localhost:3001/api/houses
curl http://localhost:3001/api/carbon-wallet/leaderboard
```

### ✅ Test Energy Trading
1. Open Frontend
2. Connect MetaMask
3. Click "Buy Energy" in Energy Market
4. Approve MetaMask transaction
5. See blockchain hash in UI

### ✅ Test Carbon Leaderboard
- Leaderboard tab shows top earners
- Animated counters
- Real-time updates

### ✅ Test Disaster Mode
- Toggle "Enable Disaster Mode" in sidebar
- Shows autonomous microgrid view
- Demonstrates local sustainability

## Debugging

### Backend Not Starting?
```bash
# Check database connection
cd gridx-backend
npm run migrate

# See logs
docker logs gridx-backend
```

### Frontend Blank?
```bash
# Check API is running
curl http://localhost:3001/health

# Check browser console for errors
# Press F12 in browser
```

### AI Service Timeout?
```bash
# Check if running
curl http://localhost:8000/health

# View logs
docker logs gridx-ai
```

### Database Issues?
```bash
# Reset everything
docker-compose down -v
docker-compose up --build

# Or manually seed
npm run seed
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
NEXT_PUBLIC_CHAIN_ID=80001
```

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gridx
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3001
AI_SERVICE_URL=http://localhost:8000
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
```

## Production Deployment

### One-Click Deployment
```bash
# See docs/DEPLOYMENT.md for:
# - Heroku deployment
# - AWS EC2 setup
# - DigitalOcean App Platform
# - Docker & Kubernetes
```

## Hackathon Demo Script

**30-Second Live Demo:**

1. **Show Frontend** (10s)
   - Display dark neon UI
   - Show live energy stats
   - Highlight carbon counter

2. **Buy Energy** (10s)
   - Click "Buy Energy" button
   - Approve MetaMask
   - Show blockchain hash

3. **Show Results** (10s)
   - Carbon tokens updated
   - Trade in history
   - Leaderboard updated

## API Quick Reference

```bash
# Get all users
GET /api/users

# Create trade (executes blockchain tx)
POST /api/energy-trades
{
  "sellerId": "uuid",
  "buyerId": "uuid", 
  "energyKwh": 2.5,
  "pricePerKwh": 5.20,
  "txHash": "0x..."
}

# Get carbon leaderboard
GET /api/carbon-wallet/leaderboard

# Get AI forecast
POST /api/ai/forecast

# Get dynamic price
GET /api/ai/price?demand=3.5
```

## Folder Descriptions

### gridx-frontend/
- Next.js 14 with App Router
- Dark neon theme (green/yellow/red)
- Components: Dashboard, Energy Market, Leaderboard, DisasterMode
- State: Zustand
- Blockchain: Ethers.js

### gridx-backend/
- Express.js REST API
- PostgreSQL with UUID primary keys
- MVC architecture
- Routes: users, houses, energy-production, trades, carbon-wallet, ai, blockchain

### gridx-ai/
- FastAPI microservice
- Exponential smoothing forecasting
- Dynamic pricing algorithm
- Solar generation prediction

### gridx-contract/
- Solidity 0.8.19
- Polygon Mumbai testnet
- Trade logging on blockchain
- Carbon savings tracking

## Common Commands

```bash
# Development
docker-compose up --build         # Start all services
docker-compose down               # Stop all services
docker compose logs -f            # View all logs

# Backend only
cd gridx-backend && npm run dev   # Start backend

# Frontend only  
cd gridx-frontend && npm run dev  # Start frontend

# AI only
cd gridx-ai && python main.py     # Start AI service

# Database
npm run migrate                   # Run migrations
npm run seed                      # Populate demo data
```

## Success Checklist

- [ ] Frontend loads at localhost:3000
- [ ] Dark neon theme visible
- [ ] Backend API responds at localhost:3001
- [ ] Database has 5 demo users
- [ ] MetaMask wallet connected
- [ ] Smart contract deployed
- [ ] Can buy energy
- [ ] Blockchain transaction hash shown
- [ ] Carbon wallet updates
- [ ] Leaderboard shows data
- [ ] Disaster Mode toggle works

## Next Steps

1. **Explore Code**
   - Check `gridx-frontend/src/components/Dashboard.tsx`
   - See `gridx-backend/src/routes/energy-trades.ts`
   - Review `gridx-ai/main.py`

2. **Customize**
   - Change theme in `tailwind.config.ts`
   - Add more energy types
   - Implement payment gateway

3. **Deploy**
   - Follow `docs/DEPLOYMENT.md`
   - Choose Vercel, Heroku, or AWS
   - Setup CI/CD with GitHub Actions

4. **Scale**
   - Add WebSockets for real-time
   - Implement caching layer
   - Add monitoring with Sentry

## Support

- **Docs**: See `README.md`
- **API**: See `docs/API_REFERENCE.md`
- **Deployment**: See `docs/DEPLOYMENT.md`
- **Architecture**: See `docs/ARCHITECTURE.md`

---

## 🎉 Ready to Go!

Your GridX platform is **100% functional** and **hackathon-ready**.

**All features implemented:**
✅ P2P Energy Trading  
✅ AI Forecasting  
✅ Blockchain Logging  
✅ Carbon Tracking  
✅ Dark Neon UI  
✅ Disaster Mode  
✅ Demo Data  
✅ Docker Setup  

**Start local dev:** `docker-compose up`  
**Open browser:** `http://localhost:3000`  
**Enjoy! 🚀**

---

Questions? Check the docs or review the code!
