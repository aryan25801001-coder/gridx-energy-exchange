import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { query } from './db';

// Import routes
import usersRouter from './routes/users';
import housesRouter from './routes/houses';
import energyProductionRouter from './routes/energy-production';
import energyTradesRouter from './routes/energy-trades';
import carbonWalletRouter from './routes/carbon-wallet';
import aiRouter from './routes/ai';
import blockchainRouter from './routes/blockchain';
import transferRouter from './routes/transfer';
import gridStabilityRouter from './routes/grid-stability';

// Import services
import { gridStabilityEngine } from './services/gridStability';
import { meterSimulation } from './services/meterSimulation';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database on startup
async function initializeDatabase() {
  try {
    const tablesQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        role VARCHAR(50) NOT NULL,
        wallet_address VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS houses (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        capacity NUMERIC(10, 2),
        latitude NUMERIC(10, 6),
        longitude NUMERIC(10, 6),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS energy_production (
        id UUID PRIMARY KEY,
        house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
        timestamp TIMESTAMP NOT NULL,
        production NUMERIC(10, 2),
        temperature NUMERIC(5, 2),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS energy_trades (
        id UUID PRIMARY KEY,
        seller_id UUID NOT NULL REFERENCES users(id),
        buyer_id UUID NOT NULL REFERENCES users(id),
        energy_kwh NUMERIC(10, 2) NOT NULL,
        price_per_kwh NUMERIC(10, 4) NOT NULL,
        tx_hash VARCHAR(255),
        carbon_saved NUMERIC(10, 2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS carbon_wallet (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        balance NUMERIC(15, 2) DEFAULT 0,
        total_earned NUMERIC(15, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS carbon_transactions (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id),
        amount NUMERIC(15, 2) NOT NULL,
        tx_type VARCHAR(50),
        related_trade_id UUID REFERENCES energy_trades(id),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS grid_nodes (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        node_type VARCHAR(50) NOT NULL,
        capacity NUMERIC(10, 2),
        status VARCHAR(50) DEFAULT 'synced',
        uptime NUMERIC(5, 2) DEFAULT 99.5,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS grid_emergency_log (
        id UUID PRIMARY KEY,
        is_active BOOLEAN DEFAULT false,
        reason TEXT,
        activated_at TIMESTAMP DEFAULT NOW(),
        deactivated_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_priorities (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        priority_level INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS energy_meters (
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

      CREATE TABLE IF NOT EXISTS grid_metrics (
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

      CREATE INDEX IF NOT EXISTS idx_energy_meters_user_id ON energy_meters(user_id);
      CREATE INDEX IF NOT EXISTS idx_energy_meters_timestamp ON energy_meters(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_grid_metrics_timestamp ON grid_metrics(timestamp DESC);
    `;

    const statements = tablesQuery.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        await query(stmt);
      }
    }

    console.log('✓ Database tables initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use('/api/users', usersRouter);
app.use('/api/houses', housesRouter);
app.use('/api/energy-production', energyProductionRouter);
app.use('/api/energy-trades', energyTradesRouter);
app.use('/api/carbon-wallet', carbonWalletRouter);
app.use('/api/ai', aiRouter);
app.use('/api/blockchain', blockchainRouter);
app.use('/api/energy-transfer', transferRouter);
app.use('/api/grid-stability', gridStabilityRouter);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// Start server with Socket.io
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize services with Socket.io
gridStabilityEngine.setSocket(io);
meterSimulation.setSocket(io);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // User joins their specific room
  socket.on('subscribe_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} subscribed to updates`);
  });

  // User unsubscribes
  socket.on('unsubscribe_user', (userId) => {
    socket.leave(`user_${userId}`);
    console.log(`👤 User ${userId} unsubscribed from updates`);
  });

  socket.on('disconnect', () => {
    console.log(`⚡ Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 GridX Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`⚡ WebSocket server ready`);

  // Start grid monitoring
  setInterval(async () => {
    try {
      await gridStabilityEngine.monitorGrid();
    } catch (error) {
      console.error('Error in grid monitoring:', error);
    }
  }, 5000); // Monitor every 5 seconds

  // Start meter simulation for demo users
  const demoUserIds = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];
  demoUserIds.forEach((userId) => {
    meterSimulation.startSimulation(userId, 5000); // Simulate every 5 seconds
  });
});

// Initialize database in background
initializeDatabase().catch(err => {
  console.warn('⚠️ Database initialization failed, but server is running in mock mode.', err);
});

export default app;
