# API Reference - GridX Backend

## Base URL
```
http://localhost:3001
```

## Health Check

### GET /health
Check backend status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-02-19T10:30:00Z"
}
```

---

## Users Endpoints

### GET /api/users
Get all users in the system.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Arjun Solar Farm",
    "email": "arjun@solargrid.in",
    "role": "seller",
    "wallet_address": "0x...",
    "created_at": "2024-02-19T10:00:00Z"
  }
]
```

### GET /api/users/:id
Get specific user by ID.

**Parameters:**
- `id`: User UUID

**Response:**
```json
{
  "id": "uuid",
  "name": "Arjun Solar Farm",
  "email": "arjun@solargrid.in",
  "role": "seller",
  "wallet_address": "0x...",
  "created_at": "2024-02-19T10:00:00Z"
}
```

### POST /api/users
Create new user.

**Request Body:**
```json
{
  "name": "New User",
  "email": "user@example.com",
  "role": "buyer",
  "walletAddress": "0x..."
}
```

---

## Houses Endpoints

### GET /api/houses
Get all houses with solar capacity.

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Arjun Solar Rooftop",
    "address": "123 Solar St", 
    "capacity": 5.0,
    "latitude": 29.0589,
    "longitude": 77.0193,
    "created_at": "2024-02-19T10:00:00Z"
  }
]
```

### GET /api/houses/:id
Get specific house.

### POST /api/houses
Create new house.

**Request Body:**
```json
{
  "userId": "uuid",
  "name": "New Solar Rooftop",
  "address": "456 Green Ave",
  "capacity": 5.5,
  "latitude": 29.0650,
  "longitude": 77.0300
}
```

---

## Energy Production Endpoints

### GET /api/energy-production/:houseId
Get 24-hour energy production history for house.

**Response:**
```json
[
  {
    "id": "uuid",
    "house_id": "uuid",
    "timestamp": "2024-02-19T12:00:00Z",
    "production": 4.2,
    "temperature": 25.5,
    "created_at": "2024-02-19T12:00:00Z"
  }
]
```

### GET /api/energy-production/latest/:houseId
Get latest production record.

### POST /api/energy-production
Create new production record.

**Request Body:**
```json
{
  "houseId": "uuid",
  "production": 4.2,
  "temperature": 25.5
}
```

---

## Energy Trades Endpoints

### GET /api/energy-trades
Get all energy trades.

**Response:**
```json
[
  {
    "id": "uuid",
    "seller_id": "uuid",
    "buyer_id": "uuid",
    "energy_kwh": 2.5,
    "price_per_kwh": 5.20,
    "tx_hash": "0x...",
    "carbon_saved": 2.0,
    "created_at": "2024-02-19T12:00:00Z"
  }
]
```

### GET /api/energy-trades/user/:userId
Get trades for specific user (as seller or buyer).

### POST /api/energy-trades
Execute energy trade.

**Request Body:**
```json
{
  "sellerId": "uuid",
  "buyerId": "uuid",
  "energyKwh": 2.5,
  "pricePerKwh": 5.20,
  "txHash": "0x..." 
}
```

**Response:**
```json
{
  "id": "uuid",
  "seller_id": "uuid",
  "buyer_id": "uuid",
  "energy_kwh": 2.5,
  "price_per_kwh": 5.20,
  "tx_hash": "0x...",
  "carbon_saved": 2.0,
  "created_at": "2024-02-19T12:05:00Z"
}
```

**Side Effects:**
- Updates buyer's carbon wallet (+2.0 kg CO2)
- Records carbon transaction
- All in database transaction for consistency

---

## Carbon Wallet Endpoints

### GET /api/carbon-wallet/:userId
Get carbon wallet for user.

**Response:**
```json
{
  "user_id": "uuid",
  "balance": 2450.50,
  "total_earned": 2450.50,
  "created_at": "2024-02-19T10:00:00Z"
}
```

### GET /api/carbon-wallet/transactions/:userId
Get carbon transaction history.

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "amount": 2.0,
    "tx_type": "earned",
    "related_trade_id": "uuid",
    "created_at": "2024-02-19T12:05:00Z"
  }
]
```

### GET /api/carbon-wallet/leaderboard
Get top carbon earners leaderboard.

**Response:**
```json
[
  {
    "user_id": "uuid",
    "name": "Arjun Solar Farm",
    "balance": 3500.25,
    "total_earned": 3500.25
  },
  {
    "user_id": "uuid",
    "name": "Priya Green Energy",
    "balance": 2890.75,
    "total_earned": 2890.75
  }
]
```

---

## AI Forecasting Endpoints

### POST /api/ai/forecast
Get demand forecast using AI service.

**Request Body:**
```json
{
  "houseId": "optional",
  "hours": 24
}
```

**Response:**
```json
{
  "predictedDemand": 3.45,
  "confidence": 0.92,
  "trend": "STABLE",
  "recommendation": "Maintain current supply",
  "timestamp": "2024-02-19T12:00:00Z",
  "hourlyForecast": [
    {
      "hour": 0,
      "predictedDemand": 2.1,
      "confidence": 0.92
    }
  ]
}
```

### GET /api/ai/price?demand=3.5
Get dynamic energy price based on demand.

**Response:**
```json
{
  "pricePerKwh": 5.20,
  "demandLevel": "MEDIUM",
  "recommendation": "Maintain current pricing",
  "timestamp": "2024-02-19T12:00:00Z"
}
```

---

## Blockchain Endpoints

### GET /api/blockchain/tx/:txHash
Get transaction status and details.

**Response:**
```json
{
  "txHash": "0x...",
  "status": "confirmed",
  "energyKwh": 2.5,
  "carbonSaved": 2.0,
  "createdAt": "2024-02-19T12:00:00Z",
  "blockNumber": 45321234
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to process request"
}
```

---

## Authentication

Currently no authentication is required. Add JWT in production:

```bash
Authorization: Bearer <token>
```

---

## Rate Limiting

Not implemented in demo. Recommended for production.

---

## Pagination

Add to requests for large datasets:
```bash
?limit=10&offset=0
```

---

## Data Types

### UUID
Example: `550e8400-e29b-41d4-a716-446655440000`

### Numeric (10,2)
Example: `2450.50` (2 decimal places)

### Timestamp (ISO 8601)
Example: `2024-02-19T12:00:00Z`

---

## Response Headers

```
Content-Type: application/json
Access-Control-Allow-Origin: *
```

---

## Testing with cURL

### Create Trade
```bash
curl -X POST http://localhost:3001/api/energy-trades \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "uuid1",
    "buyerId": "uuid2",
    "energyKwh": 2.5,
    "pricePerKwh": 5.20,
    "txHash": "0x..."
  }'
```

### Get Leaderboard
```bash
curl http://localhost:3001/api/carbon-wallet/leaderboard
```

### Get Forecast
```bash
curl -X POST http://localhost:3001/api/ai/forecast \
  -H "Content-Type: application/json" \
  -d '{"hours": 24}'
```

---

## Webhook Integration (Future)

Planned endpoints for real-time updates:
- `/api/webhooks/trade-completed`
- `/api/webhooks/price-updated`
- `/api/webhooks/forecast-available`

---

## Performance Notes

- Database queries optimized with indexes on `user_id`, `house_id`, `timestamp`
- Connection pooling enabled for PostgreSQL
- All responses cached for 60 seconds where applicable
- AI forecasts cached for 5 minutes

---

## Example Workflow

1. Get all users: `GET /api/users`
2. Select a house: `GET /api/houses/:id`
3. Get forecast: `POST /api/ai/forecast`
4. Get dynamic price: `GET /api/ai/price?demand=3.5`
5. Execute trade: `POST /api/energy-trades`
6. Check wallet: `GET /api/carbon-wallet/:userId`
7. View leaderboard: `GET /api/carbon-wallet/leaderboard`

---

## Changelog

### v1.0.0 (2024-02-19)
- Initial API release
- All endpoints functional
- Demo data seeded
