# GridX Real-Time API Reference

## WebSocket Events API

### Connection
```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});
```

---

## Backend Events

### `GRID_UPDATE`
Emitted every 5 seconds with current grid metrics.

**Event Name**: `GRID_UPDATE`
**Frequency**: Every 5 seconds
**Scope**: Broadcast to all connected clients

**Data Structure**:
```typescript
{
  supply: number;         // Total production in kW
  demand: number;         // Total consumption in kW
  imbalance: number;      // demand - supply (negative = oversupply)
  gridStatus: 'Balanced' | 'Oversupply' | 'Shortage';
  updatedPrice: number;   // Dynamic price in ₹/kWh
  timestamp: string;      // ISO 8601 timestamp
}
```

**Example Listener**:
```typescript
socket.on('GRID_UPDATE', (data) => {
  console.log(`Current Price: ₹${data.updatedPrice}/kWh`);
  console.log(`Grid Status: ${data.gridStatus}`);
  console.log(`Supply: ${data.supply}kW, Demand: ${data.demand}kW`);
});
```

---

### `METER_UPDATE`
Emitted every 5 seconds for each simulated user.

**Event Name**: `METER_UPDATE`
**Frequency**: Every 5 seconds per user
**Scope**: Broadcast to all connected clients

**Data Structure**:
```typescript
{
  userId: string;                          // Numeric user ID (e.g., 'user-1')
  imported: number;                        // Energy imported from grid (kWh)
  exported: number;                        // Energy exported to grid (kWh)
  netEnergy: number;                       // exported - imported (kWh)
  role: 'Buyer' | 'Seller' | 'Prosumer';  // Auto-detected role
  timestamp: string;                       // ISO 8601 timestamp
}
```

**Example Listener**:
```typescript
socket.on('METER_UPDATE', (data) => {
  console.log(`${data.userId}: ${data.role}`);
  console.log(`Imported: ${data.imported}kWh, Exported: ${data.exported}kWh`);
});
```

---

### `MY_METER_UPDATE`
Emitted to specific user room (subscribe with `subscribe_user`).

**Event Name**: `MY_METER_UPDATE`
**Frequency**: Every 5 seconds
**Scope**: User-specific room only

**Data Structure**: Same as `METER_UPDATE`

**Usage**:
```typescript
// Subscribe to personal updates
socket.emit('subscribe_user', 'user-1');

// Listen for personal updates only
socket.on('MY_METER_UPDATE', (data) => {
  console.log('My meter reading:', data);
});
```

---

## Client Events

### `subscribe_user`
Subscribe to user-specific updates.

**Event Name**: `subscribe_user`
**Payload**: `userId` (string)

**Example**:
```typescript
socket.emit('subscribe_user', 'user-1');
```

---

### `unsubscribe_user`
Unsubscribe from user-specific updates.

**Event Name**: `unsubscribe_user`
**Payload**: `userId` (string)

**Example**:
```typescript
socket.emit('unsubscribe_user', 'user-1');
```

---

## REST API Endpoints

### Grid Stability Endpoints

#### `GET /api/grid-stability/metrics`
Get current grid metrics.

**Response**:
```json
{
  "supply": 42.5,
  "demand": 48.2,
  "imbalance": 5.7,
  "gridStatus": "Shortage",
  "timestamp": "2026-02-20T10:30:00Z"
}
```

---

#### `GET /api/grid-stability/dynamic-price`
Calculate current dynamic price.

**Response**:
```json
{
  "currentPrice": 6.85,
  "basePrice": 6.0,
  "minPrice": 3.0,
  "maxPrice": 12.0,
  "supply": 42.5,
  "demand": 48.2,
  "gridStatus": "Shortage",
  "timestamp": "2026-02-20T10:30:00Z"
}
```

---

#### `GET /api/grid-stability/allocation`
Get energy allocation strategy.

**Query Parameters**:
- `critical` (optional): Number of critical load users

**Response**:
```json
{
  "strategy": "Priority-based allocation",
  "criticalAllocated": 15.0,
  "essentialAllocated": 20.0,
  "normalAllocated": 13.2,
  "allocatedTotal": 48.2,
  "timestamp": "2026-02-20T10:30:00Z"
}
```

---

#### `POST /api/grid-stability/emergency-mode`
Activate emergency mode.

**Request Body**:
```json
{
  "reason": "Grid frequency drop detected",
  "estimatedDuration": 1800
}
```

**Response**:
```json
{
  "isActive": true,
  "reason": "Grid frequency drop detected",
  "activatedAt": "2026-02-20T10:30:00Z",
  "estimatedRestoralization": "2026-02-20T11:00:00Z"
}
```

---

#### `GET /api/grid-stability/forecast`
Get AI demand forecast.

**Response**:
```json
{
  "predictedDemand": 52.3,
  "confidence": 0.92,
  "timeframe": "next_hour",
  "factors": [
    "Weather condition: Sunny",
    "Time of day: Peak hours",
    "Day type: Weekday",
    "Temperature: 32°C"
  ],
  "timestamp": "2026-02-20T10:30:00Z"
}
```

---

#### `GET /api/grid-stability/health`
Get system health score.

**Response**:
```json
{
  "healthScore": 87.5,
  "status": "Healthy",
  "stability": "Stable",
  "nodeCount": 15,
  "activeProducers": 8,
  "activeConsumers": 7,
  "timestamp": "2026-02-20T10:30:00Z"
}
```

---

## Service Class API

### GridStabilityEngine

Located in: `src/services/gridStability.ts`

#### Methods

```typescript
// Monitor grid and emit updates
async monitorGrid(): Promise<GridMetrics>

// Get current grid state
async getGridState(): Promise<GridMetrics>

// Get historical data
async getGridHistory(hours: number): Promise<GridMetrics[]>

// Get current metrics snapshot
getCurrentMetrics(): {
  currentPrice: number;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  priceHistory: number[];
  movingAverage: number;
}

// Get configuration
getConfig(): GridConfig

// Update configuration
updateConfig(newConfig: Partial<GridConfig>): void

// Set Socket.io instance
setSocket(ioServer: SocketIOServer): void
```

#### Configuration
```typescript
{
  basePrice: number;        // Base price in ₹/kWh (default: 6)
  minPrice: number;         // Minimum price cap (default: 3)
  maxPrice: number;         // Maximum price cap (default: 12)
  elasticity: number;       // Price sensitivity (default: 0.15)
  threshold: number;        // Imbalance threshold kW (default: 2)
  smoothingFactor: number;  // Moving average factor (default: 0.3)
}
```

---

### MeterSimulation

Located in: `src/services/meterSimulation.ts`

#### Methods

```typescript
// Initialize meter for user
async initializeMeter(userId: string): Promise<UserMeterData | undefined>

// Simulate meter reading
async simulateMeterReading(userId: string): Promise<MeterReading>

// Start continuous simulation
startSimulation(userId: string, intervalMs?: number): void

// Stop simulation for user
stopSimulation(userId: string): void

// Start global simulation
startGlobalSimulation(intervalMs?: number): void

// Stop all simulations
stopAllSimulations(): void

// Get user meter data
getUserMeterData(userId: string): UserMeterData | undefined

// Get all meter data
getAllMeterData(): UserMeterData[]

// Get meter history
async getUserMeterHistory(userId: string, hours?: number): Promise<MeterReading[]>

// Get aggregate statistics
async getAggregateStats(): Promise<{
  totalImported: number;
  totalExported: number;
  totalNetEnergy: number;
  buyerCount: number;
  sellerCount: number;
  prosumerCount: number;
}>

// Set Socket.io instance
setSocket(ioServer: SocketIOServer): void
```

#### User Role Classification Logic
```typescript
if (netEnergy > 0.5)      → role = "Seller"      // 🟢 Exporting power
if (netEnergy < -0.5)     → role = "Buyer"       // 🔴 Importing power
if -0.5 ≤ netEnergy ≤ 0.5 → role = "Prosumer"   // 🟣 Balanced
```

---

## Database Schema

### `grid_metrics` Table
```sql
CREATE TABLE grid_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply NUMERIC(10, 2) NOT NULL,
  demand NUMERIC(10, 2) NOT NULL,
  imbalance NUMERIC(10, 2) NOT NULL,
  grid_status VARCHAR(50) NOT NULL,
  price NUMERIC(10, 4) NOT NULL,
  health_score NUMERIC(5, 2) DEFAULT 100,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_grid_metrics_timestamp ON grid_metrics(timestamp DESC);
```

### `energy_meters` Table
```sql
CREATE TABLE energy_meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  energy_imported NUMERIC(10, 4) DEFAULT 0,
  energy_exported NUMERIC(10, 4) DEFAULT 0,
  net_energy NUMERIC(10, 4) DEFAULT 0,
  user_role VARCHAR(20) DEFAULT 'Prosumer',
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_user_latest UNIQUE (user_id)
);

CREATE INDEX idx_energy_meters_user_id ON energy_meters(user_id);
CREATE INDEX idx_energy_meters_timestamp ON energy_meters(timestamp DESC);
```

---

## Pricing Algorithm

### Price Calculation Formula

```
imbalance = demand - supply

rawPrice = basePrice + (elasticity × imbalance)

cappedPrice = CLAMP(rawPrice, minPrice, maxPrice)

smoothedPrice = (smoothingFactor × cappedPrice) + ((1 - smoothingFactor) × previousPrice)

finalPrice = ROUND(smoothedPrice, 4)
```

### Default Parameters
- **basePrice**: ₹6/kWh
- **elasticity**: 0.15 (15% price change per kW imbalance)
- **minPrice**: ₹3/kWh (floor)
- **maxPrice**: ₹12/kWh (ceiling)
- **smoothingFactor**: 0.3 (30% new, 70% historical)
- **imbalanceThreshold**: 2 kW (for "Balanced" classification)

### Example Price Changes
| Supply | Demand | Imbalance | Price Adjustment | Result Price |
|--------|--------|-----------|------------------|--------------|
| 50 | 40 | -10 | -1.50 | 4.50 |
| 40 | 50 | +10 | +1.50 | 7.50 |
| 45 | 45 | 0 | 0 | 6.00 |
| 42.5 | 48.2 | +5.7 | +0.86 | 6.86 |

---

## Frontend Integration Examples

### Using Grid Stability Dashboard
```typescript
import GridStabilityDashboard from '@/components/GridStabilityDashboard';

export default function GridPage() {
  return <GridStabilityDashboard />;
}
```

### Using Meter Dashboard
```typescript
import MeterDashboard from '@/components/MeterDashboard';

export default function MetersPage() {
  return <MeterDashboard />;
}
```

### Custom WebSocket Integration
```typescript
import io from 'socket.io-client';
import { useEffect, useState } from 'react';

export function useGridUpdates() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('GRID_UPDATE', (data) => {
      setMetrics(data);
    });

    return () => socket.disconnect();
  }, []);

  return metrics;
}
```

---

## Error Handling

### Expected Errors

**Database Connection Errors** (Safe - has fallback)
```
Error: connect ECONNREFUSED localhost:5432
Fallback: Mock data is used
```

**Socket Connection Failures**
```
io.emit('connect_error', (error) => {
  console.log('WebSocket connection failed:', error);
  // UI shows "OFFLINE" status
});
```

---

## Performance Metrics

- **Grid Update Frequency**: 5 seconds
- **Meter Update Frequency**: 5 seconds per user
- **Price Update Frequency**: Real-time (with smoothing)
- **Database Query Time**: <100ms (on healthy connection)
- **WebSocket Broadcast Latency**: <50ms
- **Frontend Update Render**: <100ms (with Framer Motion)

---

## Deployment Checklist

- [ ] PostgreSQL database running
- [ ] Environment variables configured
- [ ] Socket.io port (3001) accessible
- [ ] CORS configured for production domain
- [ ] SSL/TLS enabled for production
- [ ] Database backups configured
- [ ] Monitoring alerts set up
- [ ] WebSocket reconnection tested
- [ ] Load testing completed
- [ ] Documentation updated

---

## Support

For issues or questions:
1. Check backend logs: `npm run dev` output
2. Check browser console: DevTools → Console
3. Check network tab: DevTools → Network → WebSocket
4. Verify Socket.io connection: Look for "Connected" message

---

**GridX Real-Time API Documentation** v1.0
Last Updated: 2026-02-20
