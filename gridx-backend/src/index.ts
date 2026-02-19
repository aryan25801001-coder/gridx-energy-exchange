import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
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

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// Start server immediately
app.listen(PORT, () => {
  console.log(`🚀 GridX Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Initialize database in background
initializeDatabase().catch(err => {
  console.warn('⚠️ Database initialization failed, but server is running in mock mode.', err);
});

export default app;
