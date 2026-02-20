# GridX Real-Time System - Testing & Troubleshooting Guide

## ✅ Quick Start

### 1. Start Backend
```bash
cd gridx-backend
npm run dev
# OR
npx ts-node src/index.ts
```

**Expected Output**:
```
🚀 GridX Backend running on http://localhost:3001
📊 Health check: http://localhost:3001/health
⚡ WebSocket server ready
```

### 2. Start Frontend
```bash
cd gridx-frontend
npm run dev
```

**Expected Output**:
```
▲ Next.js 14.2.35
- Local:        http://localhost:3000
✓ Ready in Xs
```

### 3. Open Browser
Navigate to: **http://localhost:3000**

---

## 🧪 Feature Testing

### Test 1: Grid Stability Dashboard
**Steps**:
1. Open http://localhost:3000
2. Click **"Grid Stability"** in sidebar
3. Watch metrics update every 5 seconds

**Success Indicators**:
- ✓ Supply number changes
- ✓ Demand number changes
- ✓ Price updates
- ✓ Grid status visible (with emoji)
- ✓ No console errors
- ✓ "LIVE" indicator shows in top-right

**What You'll See**:
- Real-time supply/demand metrics
- Dynamic energy price (₹/kWh)
- Grid status (Balanced/Oversupply/Shortage)
- Stability score (%)
- Price history chart

---

### Test 2: Smart Meter Dashboard
**Steps**:
1. Open http://localhost:3000
2. Click **"Smart Meters"** in sidebar
3. Observe meter readings for 5 users

**Success Indicators**:
- ✓ 5 user cards visible
- ✓ Each user has import/export values
- ✓ Role badges show (Seller/Buyer/Prosumer)
- ✓ Progress bars animate
- ✓ Aggregate stats update
- ✓ "LIVE" indicator shows

**What You'll See**:
- user-1 through user-5 meter cards
- Individual import/export kWh values
- Color-coded role indicators
- Sum of all metrics
- Last update timestamps

---

### Test 3: WebSocket Connection
**Steps**:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Navigate between Grid Stability and Smart Meters
4. Watch console logs

**Expected Logs**:
```
🔌 Connected to Grid Stability updates
👤 User user-1 subscribed to updates
⚡ Client connected: socket-id-xxx
```

---

### Test 4: Real-Time Updates
**Steps**:
1. Open Grid Stability Dashboard
2. Note the current price
3. Wait 5 seconds
4. Check if price changed

**Success Indicator**:
- ✓ Price updates without page refresh
- ✓ Animation shows price direction (color change)
- ✓ Updated timestamp shown on metrics

---

### Test 5: Role Auto-Detection (Meter Dashboard)
**Steps**:
1. Open Smart Meter Dashboard
2. Look for user roles (Seller/Buyer/Prosumer)
3. Refresh page (F5) after 10-15 seconds
4. Observe if roles change

**Expected Behavior**:
- Roles auto-update based on net energy
- Sellers (🟢) often appear at midday (solar peak)
- Buyers (🔴) appear in evening (consumption peak)
- Prosumers (🟣) show balanced users

---

## 🔍 Monitoring

### Monitor Backend Grid Updates
**Terminal Output** (Every 5 seconds):
```
Error calculating supply: AggregateError
Error calculating demand: AggregateError
// ^ These are expected! Database unavailable but mock data used
```

**What It Means**:
- ✓ Services are running
- ✓ Attempting to query database
- ✓ Using fallback mock data
- ✓ Broadcasting WebSocket events

### Monitor Frontend Compilation
**Terminal Output** (First load):
```
✓ Compiling / in 12.1s (2719 modules)
```

**For Updates**:
```
✓ Compiled in 349ms (1314 modules)
```

---

## 🐛 Troubleshooting

### Issue: "Cannot GET /" (404 Error)
**Cause**: Frontend not running
**Solution**:
```bash
cd gridx-frontend
npm run dev
# Wait for "✓ Ready in Xs"
```

---

### Issue: Grid Stability Dashboard shows blank/no data
**Cause**: Backend not running
**Solution**:
```bash
cd gridx-backend
npm run dev
# OR
npx ts-node src/index.ts
```

---

### Issue: Meters showing "Loading..." forever
**Cause**: WebSocket connection not established
**Solution**:
1. Check backend is running
2. Open DevTools Console (F12)
3. Look for connection error messages
4. Refresh page (F5)

---

### Issue: "WebSocket connection failed"
**Cause**: Backend WebSocket port (3001) not accessible
**Solution**:
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# If in use, kill the process
taskkill /PID <PID> /F

# Restart backend
npm run dev
```

---

### Issue: Database Connection Errors (ECONNREFUSED)
**Cause**: PostgreSQL not running (Expected!)
**Solution**:
- ✓ Safe error - application uses mock data
- ✓ Ignore these errors for demo/testing
- ✓ In production, set up PostgreSQL connection:

```bash
# Connection string in .env
DATABASE_URL=postgresql://user:pass@localhost:5432/gridx
```

---

### Issue: Console shows "Unexpected token"
**Cause**: JSX parsing error in Next.js
**Solution**:
```bash
# Clear cache and rebuild
rm -r gridx-frontend/.next
npm run dev
```

---

### Issue: TypeScript errors on backend
**Cause**: Type mismatches in services
**Solution**:
```bash
# Run type check
cd gridx-backend
npx tsc --noEmit

# Fix errors shown
npm run dev
```

---

## 🔧 Common Fixes

### Fix 1: Restart Everything
```bash
# 1. Stop both servers (Ctrl+C)
# 2. Clear cache
rm -rf gridx-frontend/.next

# 3. Reinstall dependencies (if issues persist)
cd gridx-backend && npm install
cd gridx-frontend && npm install

# 4. Start backend
cd gridx-backend && npm run dev

# 5. In new terminal, start frontend
cd gridx-frontend && npm run dev
```

### Fix 2: Clear Browser Cache
```
Chrome/Edge: Ctrl+Shift+Del → Clear browsing data → Cache
Firefox: Ctrl+Shift+Del → Cache → Clear Now
Safari: Develop → Empty Caches
```

### Fix 3: Hard Refresh
```
Chrome/Edge: Ctrl+Shift+R
Firefox: Ctrl+Shift+R
Safari: Cmd+Shift+R
```

---

## 📊 Data Validation

### Valid Price Range
```
Min: ₹3/kWh
Max: ₹12/kWh
Typical: ₹5.5 - ₹8.5/kWh
```

### Valid Imbalance Range
```
Oversupply: supply > demand (supply excess)
Balanced: |demand - supply| < 2 kW
Shortage: demand > supply
```

### Valid Meter Values
```
Imported: 0 - 5 kWh per reading
Exported: 0 - 5 kWh per reading
Net Energy: -5 to +5 kWh
```

---

## 📈 Performance Baseline

### Expected Response Times
| Operation | Time | Notes |
|-----------|------|-------|
| Page load | 2-5s | Initial compilation |
| Grid update | <100ms | WebSocket delivery |
| Meter update | <100ms | Per user |
| Price recalculation | <50ms | Real-time |
| Animation frame | 16ms | 60 FPS |

### Expected Data Volumes
| Data | Size | Frequency |
|------|------|-----------|
| GRID_UPDATE event | ~150 bytes | Every 5s |
| METER_UPDATE event | ~100 bytes | Every 5s per user |
| Price history | ~400 bytes | Last 20 prices |
| Total bandwidth | ~1kB | Per 5 seconds |

---

## 🎯 Validation Checklist

After starting the system, verify:

- [ ] Backend starts without crashing
- [ ] Frontend compiles successfully
- [ ] Can open http://localhost:3000 in browser
- [ ] Can see Dashboard page
- [ ] Grid Stability menu item appears in sidebar
- [ ] Smart Meters menu item appears in sidebar
- [ ] Clicking Grid Stability loads dashboard
- [ ] Clicking Smart Meters loads dashboard
- [ ] Metrics update every 5 seconds
- [ ] WebSocket shows "LIVE" status
- [ ] No console errors (database warnings OK)
- [ ] Price shows with 2 decimal places
- [ ] Grid status shows with emoji
- [ ] Meters show role badges
- [ ] Animations are smooth

---

## 🧠 Understanding the Data

### Supply Value
```
Where it comes from: Sum of all producer nodes
Typical range: 40-50 kW
Updates: Real-time every 5 seconds
Source: grid_nodes table or mock data
```

### Demand Value
```
Where it comes from: Sum of all consumer nodes
Typical range: 45-55 kW
Updates: Real-time every 5 seconds
Source: grid_nodes table or mock data
```

### Price Calculation
```
Formula: price = basePrice + (elasticity × imbalance)
basePrice = 6.0 (constant)
elasticity = 0.15 (price sensitivity)
Example: 6.0 + (0.15 × 5) = 6.75 ₹/kWh
```

### User Role
```
Seller:    When netEnergy > 0.5  (producing excess)
Buyer:     When netEnergy < -0.5 (consuming excess)
Prosumer:  When -0.5 ≤ netEnergy ≤ 0.5 (balanced)
```

---

## 🧪 Advanced Testing

### Test Different Price Scenarios
Manually edit `gridx-backend/src/services/gridStability.ts`:

```typescript
// To increase price sensitivity
elasticity: 0.30  // Higher = more volatile prices

// To see different grid statuses
threshold: 1      // Lower = more often "Shortage" or "Oversupply"
```

### Simulate More Users
Edit `gridx-backend/src/index.ts`:

```typescript
// Start simulation for demo users
const demoUserIds = ['user-1', 'user-2', ..., 'user-10'];  // Add more
demoUserIds.forEach((userId) => {
  meterSimulation.startSimulation(userId, 5000);
});
```

### Monitor WebSocket Events
Add logging to frontend component:

```typescript
socket.onAny((event, data) => {
  console.log(`📨 Event: ${event}`, data);
});
```

---

## 🚀 Success Story

**When You Know It's Working**:
1. ✅ Grid Stability shows real-time metrics
2. ✅ Price updates every 5 seconds
3. ✅ Grid status changes between "Balanced/Oversupply/Shortage"
4. ✅ Meter Dashboard shows 5 active users
5. ✅ Each user has different import/export values
6. ✅ User roles auto-update in real-time
7. ✅ No console errors (database warnings expected)
8. ✅ WebSocket connection is "LIVE"
9. ✅ Animations are smooth and responsive
10. ✅ All metrics update without page refresh

---

## 📝 Logging to Files

To capture logs for debugging:

```bash
# Backend logs
npm run dev > backend.log 2>&1

# Frontend logs
npm run dev > frontend.log 2>&1

# Then view logs
tail -f backend.log
tail -f frontend.log
```

---

## 🎓 Learning Points

### WebSocket vs REST
- **WebSocket**: Real-time, bidirectional, low latency (used here)
- **REST**: Request-response, stateless, simpler

### Why 5-Second Updates?
- Frequent enough for real-time feel
- Not too frequent (balance CPU/bandwidth)
- Realistic for grid operations

### Why Mock Data Instead of Real DB?
- Easier testing without database setup
- Demonstrates live updates functionality
- Easy to replace with real database later

---

## 💡 Tips & Tricks

### Watch Grid Status Change
1. Open Grid Stability Dashboard
2. Note current status
3. Watch for it to change every few updates (if imbalance varies)

### Track Meter Role Changes
1. Open Smart Meter Dashboard
2. Note which role each user has
3. Refresh after 15-30 seconds
4. See how roles change based on energy balance

### Monitor Price Trends
1. Open Grid Stability
2. Watch Price Range section
3. See min/max/average updating over time

### Check Connection Status
Developer Tools → Network → Filter "WS"
Should show WebSocket connection to localhost:3001

---

## 🆘 Emergency Contacts

If system doesn't work:

1. **Check port availability**
   ```bash
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   ```

2. **Check Node.js installation**
   ```bash
   node --version
   npm --version
   ```

3. **Verify npm packages**
   ```bash
   npm list socket.io
   npm list socket.io-client
   ```

4. **Clear all caches**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

---

**GridX Real-Time System Testing Guide v1.0**
For any issues, refer to backend console and browser DevTools console.
