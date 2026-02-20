import { Server as SocketIOServer } from 'socket.io';
import db from '../db';

export interface MeterReading {
  userId: string;
  imported: number; // kWh
  exported: number; // kWh
  netEnergy: number; // kWh (exported - imported)
  role: 'Buyer' | 'Seller' | 'Prosumer';
  timestamp: string;
}

export interface UserMeterData {
  userId: string;
  energyImported: number;
  energyExported: number;
  netEnergy: number;
  userRole: 'Buyer' | 'Seller' | 'Prosumer';
  lastUpdate: string;
}

class MeterSimulation {
  private io: SocketIOServer | null = null;
  private userMeters: Map<string, UserMeterData> = new Map();
  private simulationIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();

  setSocket(ioServer: SocketIOServer) {
    this.io = ioServer;
  }

  /**
   * Classify user role based on net energy
   * Prosumer = can buy or sell
   * Seller = exporting more than importing
   * Buyer = importing more than exporting
   */
  classifyUserRole(netEnergy: number): 'Buyer' | 'Seller' | 'Prosumer' {
    if (netEnergy > 0.5) {
      return 'Seller';
    } else if (netEnergy < -0.5) {
      return 'Buyer';
    } else {
      return 'Prosumer';
    }
  }

  /**
   * Generate realistic meter simulation values
   * Simulates random household consumption and solar generation
   */
  private generateMeterValues(
    userId: string
  ): { imported: number; exported: number } {
    // Base consumption varies through the day
    const hour = new Date().getHours();
    const baseConsumption = 2 + Math.sin((hour / 24) * Math.PI) * 2; // 2-4 kWh/hour

    // Solar generation (peaks at noon)
    const baseSolar = Math.max(0, 3 + Math.sin(((hour - 6) / 12) * Math.PI) * 2);

    // Add random variation
    const imported = Math.max(
      0,
      baseConsumption + (Math.random() - 0.5) * 1
    );
    const exported = Math.max(0, baseSolar + (Math.random() - 0.5) * 0.5);

    return {
      imported: parseFloat(imported.toFixed(2)),
      exported: parseFloat(exported.toFixed(2)),
    };
  }

  /**
   * Create or update smart meter for a user
   */
  async initializeMeter(userId: string) {
    // Generate initial values
    const { imported, exported } = this.generateMeterValues(userId);
    const netEnergy = parseFloat((exported - imported).toFixed(2));
    const userRole = this.classifyUserRole(netEnergy);

    // Store in memory
    this.userMeters.set(userId, {
      userId,
      energyImported: imported,
      energyExported: exported,
      netEnergy,
      userRole,
      lastUpdate: new Date().toISOString(),
    });

    // Store in database
    try {
      await db.query(
        `INSERT INTO energy_meters (user_id, energy_imported, energy_exported, net_energy, user_role, timestamp)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_id) 
         DO UPDATE SET energy_imported = $2, energy_exported = $3, net_energy = $4, user_role = $5, timestamp = NOW()`,
        [userId, imported, exported, netEnergy, userRole]
      );
    } catch (error) {
      console.error('Error initializing meter:', error);
    }

    return this.userMeters.get(userId);
  }

  /**
   * Simulate meter reading for a user (call this every 5 seconds)
   */
  async simulateMeterReading(userId: string): Promise<MeterReading> {
    const { imported, exported } = this.generateMeterValues(userId);
    const netEnergy = parseFloat((exported - imported).toFixed(2));
    const role = this.classifyUserRole(netEnergy);

    const reading: MeterReading = {
      userId,
      imported,
      exported,
      netEnergy,
      role,
      timestamp: new Date().toISOString(),
    };

    // Update in-memory cache
    this.userMeters.set(userId, {
      userId,
      energyImported: imported,
      energyExported: exported,
      netEnergy,
      userRole: role,
      lastUpdate: new Date().toISOString(),
    });

    // Store in database
    try {
      await db.query(
        `INSERT INTO energy_meters (user_id, energy_imported, energy_exported, net_energy, user_role, timestamp)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [userId, imported, exported, netEnergy, role]
      );
    } catch (error) {
      console.error('Error storing meter reading:', error);
    }

    // Emit via Socket.io
    if (this.io) {
      this.io.emit('METER_UPDATE', reading);
      this.io.to(`user_${userId}`).emit('MY_METER_UPDATE', reading);
    }

    return reading;
  }

  /**
   * Start continuous simulation for a user
   */
  startSimulation(userId: string, intervalMs: number = 5000) {
    // Clear existing interval if any
    if (this.simulationIntervals.has(userId)) {
      clearInterval(this.simulationIntervals.get(userId));
    }

    // Initialize meter first
    this.initializeMeter(userId);

    // Start simulation interval
    const interval = setInterval(() => {
      this.simulateMeterReading(userId).catch((error) =>
        console.error('Error in meter simulation:', error)
      );
    }, intervalMs);

    this.simulationIntervals.set(userId, interval);
  }

  /**
   * Stop simulation for a user
   */
  stopSimulation(userId: string) {
    if (this.simulationIntervals.has(userId)) {
      clearInterval(this.simulationIntervals.get(userId));
      this.simulationIntervals.delete(userId);
    }
  }

  /**
   * Start global simulation for all users
   */
  startGlobalSimulation(intervalMs: number = 5000) {
    // Get all users from database
    db.query('SELECT DISTINCT user_id FROM energy_meters', [])
      .then((result) => {
        result.rows.forEach((row) => {
          if (!this.simulationIntervals.has(row.user_id)) {
            this.startSimulation(row.user_id, intervalMs);
          }
        });
      })
      .catch((error) =>
        console.error('Error starting global simulation:', error)
      );
  }

  /**
   * Stop all simulations
   */
  stopAllSimulations() {
    this.simulationIntervals.forEach((interval) => clearInterval(interval));
    this.simulationIntervals.clear();
  }

  /**
   * Get current meter data for a user
   */
  getUserMeterData(userId: string): UserMeterData | undefined {
    return this.userMeters.get(userId);
  }

  /**
   * Get all meter readings
   */
  getAllMeterData(): UserMeterData[] {
    return Array.from(this.userMeters.values());
  }

  /**
   * Get meter history for a user
   */
  async getUserMeterHistory(
    userId: string,
    hours: number = 24
  ): Promise<MeterReading[]> {
    try {
      const result = await db.query(
        `SELECT user_id as "userId", energy_imported as imported, energy_exported as exported, 
                net_energy as "netEnergy", user_role as role, timestamp
         FROM energy_meters
         WHERE user_id = $1 AND timestamp > NOW() - INTERVAL '${hours} hours'
         ORDER BY timestamp DESC
         LIMIT 288`, // 24 hours * 12 readings per hour (5 second intervals)
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching meter history:', error);
      return [];
    }
  }

  /**
   * Get aggregate statistics for all users
   */
  async getAggregateStats(): Promise<{
    totalImported: number;
    totalExported: number;
    totalNetEnergy: number;
    buyerCount: number;
    sellerCount: number;
    prosumerCount: number;
  }> {
    try {
      const result = await db.query(
        `SELECT 
         COALESCE(SUM(energy_imported), 0) as total_imported,
         COALESCE(SUM(energy_exported), 0) as total_exported,
         COALESCE(SUM(net_energy), 0) as total_net_energy,
         COUNT(CASE WHEN user_role = 'Buyer' THEN 1 END) as buyer_count,
         COUNT(CASE WHEN user_role = 'Seller' THEN 1 END) as seller_count,
         COUNT(CASE WHEN user_role = 'Prosumer' THEN 1 END) as prosumer_count
         FROM (
           SELECT DISTINCT ON (user_id) user_id, energy_imported, energy_exported, net_energy, user_role
           FROM energy_meters
           ORDER BY user_id, timestamp DESC
         ) latest_readings`,
        []
      );

      const row = result.rows[0];
      return {
        totalImported: parseFloat(row.total_imported),
        totalExported: parseFloat(row.total_exported),
        totalNetEnergy: parseFloat(row.total_net_energy),
        buyerCount: parseInt(row.buyer_count),
        sellerCount: parseInt(row.seller_count),
        prosumerCount: parseInt(row.prosumer_count),
      };
    } catch (error) {
      console.error('Error calculating aggregate stats:', error);
      return {
        totalImported: 0,
        totalExported: 0,
        totalNetEnergy: 0,
        buyerCount: 0,
        sellerCount: 0,
        prosumerCount: 0,
      };
    }
  }
}

// Export singleton instance
export const meterSimulation = new MeterSimulation();
