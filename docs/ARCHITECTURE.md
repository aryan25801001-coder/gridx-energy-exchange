# Engineering Architecture - GridX

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GridX Decentralized Platform              │
└─────────────────────────────────────────────────────────────┘

                        ┌──────────────┐
                        │  Polygon     │
                        │ Mumbai       │
                        │ Blockchain   │
                        └──────────────┘
                              ▲
                              │
                              │ Web3.js/Ethers.js
                              │
        ┌─────────────────────────────────────────────┐
        │                                             │
    ┌───────────┐        ┌──────────────┐        ┌────────────┐
    │ Frontend  │◄──────►│   Backend    │◄──────►│ PostgreSQL │
    │ (Next.js) │        │  (Express)   │        │ Database   │
    │  Port     │        │   Port 3001  │        │ Port 5432  │
    │   3000    │        └──────────────┘        └────────────┘
    └───────────┘              │
                               │ HTTP
                               │ /api/*
                               ▼
                        ┌──────────────┐
                        │   AI Service │
                        │   (FastAPI)  │
                        │   Port 8000  │
                        └──────────────┘
```

## Component Architecture

### 1. Frontend Layer (Next.js)

**Responsibilities:**
- Render UI with dark neon theme
- State management with Zustand
- API calls via axios
- Web3 wallet integration

**Key Components:**
```
src/
├── app/
│   ├── layout.tsx (Root layout)
│   └── page.tsx (Main entry)
├── components/
│   ├── Dashboard (Main container)
│   ├── Header (Navigation)
│   ├── Sidebar (Menu)
│   ├── MainContent (Central area)
│   ├── EnergyMarket (Buy/Sell UI)
│   ├── TradeHistory (Transaction log)
│   ├── CarbonLeaderboard (Rankings)
│   ├── DisasterMode (Microgrid UI)
│   └── ...
└── lib/
    ├── api.ts (REST client)
    ├── store.ts (Zustand state)
    ├── blockchain.ts (Web3 integration)
```

**Technology Stack:**
- Next.js 14 with App Router
- TypeScript 5.2
- Tailwind CSS 3.3
- Zustand for state management
- Axios for HTTP
- Ethers.js for blockchain

**Features:**
- Server-side rendering (SSR)
- Static site generation (SSG)
- Image optimization
- Code splitting

### 2. Backend API Layer (Express)

**Responsibilities:**
- REST API endpoints
- Business logic
- Database operations
- Blockchain integration

**Architecture Pattern: MVC**

```
src/
├── index.ts (Entry point)
├── db.ts (Database pool)
├── routes/
│   ├── users.ts
│   ├── houses.ts
│   ├── energy-production.ts
│   ├── energy-trades.ts (Complex transactions)
│   ├── carbon-wallet.ts
│   ├── ai.ts (Proxy to AI service)
│   └── blockchain.ts
└── middleware/
    ├── auth.ts (Future)
    └── validation.ts (Future)
```

**Transaction Handling:**
```typescript
// Energy trade with ACID compliance
BEGIN TRANSACTION
  1. Create trade record
  2. Update seller stats
  3. Update buyer carbon wallet
  4. Log carbon transaction
COMMIT
```

**API Response Format:**
```json
{
  "data": {},
  "error": null,
  "timestamp": "2024-02-19T12:00:00Z"
}
```

### 3. Database Layer (PostgreSQL)

**Schema Design:**

```sql
users
├── id (PK, UUID)
├── name
├── email
├── role (seller|buyer|both)
└── wallet_address

houses
├── id (PK, UUID)
├── user_id (FK → users)
├── name
├── capacity (kW)
├── latitude, longitude
└── created_at

energy_production
├── id (PK, UUID)
├── house_id (FK → houses)
├── timestamp
├── production (kWh)
├── temperature
└── created_at (Indexed)

energy_trades
├── id (PK, UUID)
├── seller_id (FK → users)
├── buyer_id (FK → users)
├── energy_kwh
├── price_per_kwh
├── tx_hash (Blockchain)
├── carbon_saved
└── created_at (Indexed)

carbon_wallet
├── user_id (PK, FK → users)
├── balance
├── total_earned
└── created_at

carbon_transactions
├── id (PK, UUID)
├── user_id (FK → users)
├── amount
├── tx_type (earned|spent)
├── related_trade_id (FK → energy_trades)
└── created_at (Indexed)
```

**Indexing Strategy:**
```sql
CREATE INDEX idx_energy_production_house_timestamp 
  ON energy_production(house_id, timestamp DESC);

CREATE INDEX idx_energy_trades_timestamp 
  ON energy_trades(created_at DESC);

CREATE INDEX idx_energy_trades_user 
  ON energy_trades(seller_id, buyer_id);

CREATE INDEX idx_carbon_wallet_balance 
  ON carbon_wallet(balance DESC);
```

**Connection Pooling:**
```typescript
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 4. AI Forecasting Service (Python FastAPI)

**Purpose:**
- Demand forecasting
- Dynamic pricing calculation
- Solar generation prediction

**Algorithm:**

**Exponential Smoothing:**
```python
forecast = α * actual + (1 - α) * previous_forecast
# α = 0.3 (smoothing factor)
```

**Dynamic Pricing Model:**
```python
price = base_price + demand_adjustment

if demand < 2.0:
    adjustment = -0.50  # 10% discount
elif demand > 4.0:
    adjustment = +0.50  # 10% premium
else:
    adjustment = 0.00   # Base price
```

**Endpoints:**
```
POST /api/forecast
POST /api/price
GET /api/solar-forecast
GET /api/market-analysis
```

**Response Caching:**
- Forecasts: 5 minutes
- Prices: 1 minute
- Market analysis: 10 minutes

### 5. Blockchain Layer (Solidity)

**Smart Contract Functions:**

```solidity
function logEnergyTrade(
    address _seller,
    address _buyer,
    uint256 _energyKwh,
    uint256 _pricePerKwh
) → returns (bytes32 tradeId)
```

**Data Stored On-Chain:**
- Trade ID (bytes32)
- Seller address
- Buyer address
- Energy amount
- Price
- Timestamp
- Carbon saved (calculated)

**Gas Optimization:**
- Batch trades when possible
- Use events for logging
- Minimize storage writes

**Network:**
- Polygon Mumbai (Testnet)
- Chain ID: 80001
- ~2s block time
- ~0.001 MATIC per transaction

---

## Data Flow

### Energy Trade Flow

```
┌─────────────────────────────────────────────────────┐
│ User Clicks "Buy Energy"                            │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ Frontend: Validate inputs                           │
│ - Energy amount > 0                                 │
│ - Wallet connected                                  │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ Call Smart Contract: logEnergyTrade()               │
│ - User signs MetaMask transaction                  │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ Blockchain: Mine transaction                        │
│ - ~2 seconds to confirm                            │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ Frontend: Get transaction hash                      │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ Backend: POST /api/energy-trades                    │
│ {                                                   │
│   "sellerId": "...",                               │
│   "buyerId": "...",                                │
│   "energyKwh": 2.5,                                │
│   "pricePerKwh": 5.20,                             │
│   "txHash": "0x..."                                │
│ }                                                   │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ Database: BEGIN TRANSACTION                         │
│ 1. Insert into energy_trades                       │
│ 2. UPDATE carbon_wallet (buyer)                    │
│ 3. INSERT carbon_transaction                       │
│ COMMIT                                              │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ Frontend: Show success animation                    │
│ - Display "✓ Blockchain Verified"                  │
│ - Link to PolygonScan                              │
│ - Update carbon counter                            │
└─────────────────────────────────────────────────────┘
```

---

## Scalability Design

### Horizontal Scaling

**Backend (Express):**
- Stateless design
- Load balancer (AWS ALB)
- Auto-scaling group (min: 2, max: 10)
- Session storage in Redis (future)

**Database:**
- Primary + Read Replicas
- Connection pooling
- Prepared statements
- Query optimization

**AI Service:**
- Multiple instances behind load balancer
- Queue system for heavy predictions
- Result caching

### Vertical Scaling

**Frontend:** Static files on CDN
**Backend:** EC2 t3.large → t3.xlarge
**Database:** RDS db.t3.micro → db.t3.small

### Caching Strategy

```
┌─────────────┐
│ Cloudflare  │ (Page cache, 24h TTL)
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Vercel      │ (Static assets)
└─────┬───────┘
      │
      ▼
┌─────────────────────────┐
│ Backend Cache           │
│ - Forecasts: 5min       │
│ - Leaderboard: 10min    │
└─────┬───────────────────┘
      │
      ▼
┌─────────────┐
│ PostgreSQL  │ (Source of truth)
└─────────────┘
```

---

## Integration Points

### Frontend ↔ Backend

**REST JSON over HTTP:**
```
GET  /api/users
GET  /api/houses/:id
POST /api/energy-trades
```

**Error Handling:**
- Retry on 5xx errors
- Show user-friendly messages
- Log to Sentry

### Backend ↔ AI Service

**HTTP Client:**
```typescript
axios.post('http://localhost:8000/api/forecast', {
  houseId: '...',
  hours: 24
})
```

**Fallback:**
- If AI service down, return mock data
- Log warning to CloudWatch

### Backend ↔ Blockchain

**Web3.js:**
```javascript
await contract.logEnergyTrade(
  seller,
  buyer,
  energyKwh,
  pricePerKwh
);
```

**Retry Logic:**
- Exponential backoff
- Max 3 attempts
- Store pending trades locally

---

## Security Architecture

### Authentication & Authorization (Future)
```typescript
// JWT implementation
Authorization: Bearer <token>
// Verify on each protected route
```

### Data Validation
```typescript
// Input validation on backend
if (energyKwh <= 0) throw new Error('Invalid energy');
if (!isEthereumAddress(sellerAddress)) throw new Error('Invalid address');
```

### API Security
- CORS: localhost only (dev), specific domain (prod)
- HTTPS enforced
- Rate limiting: 100 requests/min per IP
- CSRF tokens (if forms added)

### Environment Secrets
```bash
# Never in code
DB_PASSWORD → AWS Secrets Manager
JWT_SECRET → Environment variable
PRIVATE_KEY → Hardware wallet
```

---

## Monitoring & Observability

### Logging
```
Backend: Winston → CloudWatch
AI: Python logs → CloudWatch
Frontend: Error tracking → Sentry
```

### Metrics
```
Backend:
- Request latency (p50, p95, p99)
- Database query time
- Error rate
- Active trades/hour

Database:
- Connection pool utilization
- Query count by table
- Backup completion status

Blockchain:
- Transaction confirmation time
- Gas price trends
- Failed transactions
```

### Alerting
```
Alert if:
- Backend response time > 1s
- Error rate > 1%
- Database connections > 18
- Blockchain sync lagged > 10 blocks
```

---

## Testing Strategy

### Unit Tests
```typescript
// test/api.test.ts
describe('Energy Trades', () => {
  it('should create trade and update carbon wallet', () => {
    // Mock database
    // Assert trade created
    // Assert wallet updated
  });
});
```

### Integration Tests
```bash
# Docker environment
docker-compose -f docker-compose.test.yml up
npm test
```

### Load Tests
```bash
# Apache Bench
ab -n 10000 -c 100 http://localhost:3001/health
```

---

## Deployment Pipeline

```
┌─────────────┐
│ Git Push    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ GitHub      │
│ Actions     │
└──────┬──────┘
       │
       ├─► Run Tests
       ├─► Build Docker
       └─► Push to Registry
       │
       ▼
┌─────────────┐
│ AWS ECR     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ ECS/K8s     │
│ Deploy      │
└─────────────┘
```

---

## Future Enhancements

### Phase 2
- [ ] Machine learning models (LSTM)
- [ ] Real-time data feeds (CoinGecko)
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)

### Phase 3
- [ ] Mainnet deployment
- [ ] Staking mechanism
- [ ] Governance DAO
- [ ] Cross-chain bridges

### Phase 4
- [ ] Advanced analytics
- [ ] Community marketplace
- [ ] Energy net metering
- [ ] Green credits market

---

This architecture is **scalable, maintainable, and production-ready**.

For more insights, see [README.md](../README.md) and [API_REFERENCE.md](./API_REFERENCE.md).
