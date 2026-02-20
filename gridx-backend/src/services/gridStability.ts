import { Server as SocketIOServer } from 'socket.io';
import db from '../db';

export interface GridMetrics {
  supply: number;
  demand: number;
  imbalance: number;
  gridStatus: 'Balanced' | 'Oversupply' | 'Shortage';
  updatedPrice: number;
  timestamp: string;
}

export interface GridConfig {
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  elasticity: number; // Price sensitivity to imbalance
  threshold: number; // Imbalance threshold for "Balanced" status
  smoothingFactor: number; // For moving average
}

class GridStabilityEngine {
  private config: GridConfig = {
    basePrice: 6, // ₹/kWh
    minPrice: 3,
    maxPrice: 12,
    elasticity: 0.15,
    threshold: 2, // kW
    smoothingFactor: 0.3,
  };

  private priceHistory: number[] = [];
  private currentPrice: number = this.config.basePrice;
  private io: SocketIOServer | null = null;

  setSocket(ioServer: SocketIOServer) {
    this.io = ioServer;
  }

  /**
   * Calculate total supply from all producers
   */
  async calculateTotalSupply(): Promise<number> {
    try {
      const result = await db.query(
        `SELECT COALESCE(SUM(current_output), 0) as total_supply 
         FROM grid_nodes WHERE node_type = 'producer' AND is_active = true`
      );
      return parseFloat(result.rows[0].total_supply) || 0;
    } catch (error) {
      console.error('Error calculating supply:', error);
      return 45; // Mock fallback
    }
  }

  /**
   * Calculate total demand from all consumers
   */
  async calculateTotalDemand(): Promise<number> {
    try {
      const result = await db.query(
        `SELECT COALESCE(SUM(current_load), 0) as total_demand 
         FROM grid_nodes WHERE node_type = 'consumer' AND is_active = true`
      );
      return parseFloat(result.rows[0].total_demand) || 0;
    } catch (error) {
      console.error('Error calculating demand:', error);
      return 48; // Mock fallback
    }
  }

  /**
   * Classify grid status based on imbalance
   */
  classifyGridStatus(imbalance: number): 'Balanced' | 'Oversupply' | 'Shortage' {
    const absImbalance = Math.abs(imbalance);

    if (absImbalance < this.config.threshold) {
      return 'Balanced';
    }

    if (imbalance > 0) {
      return 'Oversupply'; // Supply > Demand
    }

    return 'Shortage'; // Demand > Supply
  }

  /**
   * Calculate adaptive price using supply-demand elasticity
   * Formula: newPrice = basePrice + (elasticity * imbalance)
   * With smoothing: finalPrice = (smoothing * newPrice) + ((1 - smoothing) * lastPrice)
   */
  calculateAdaptivePrice(imbalance: number): number {
    // Calculate raw new price
    const priceAdjustment = this.config.elasticity * imbalance;
    let newPrice = this.config.basePrice + priceAdjustment;

    // Apply price caps
    newPrice = Math.max(
      this.config.minPrice,
      Math.min(this.config.maxPrice, newPrice)
    );

    // Apply smoothing (moving average)
    const smoothedPrice =
      this.config.smoothingFactor * newPrice +
      (1 - this.config.smoothingFactor) * this.currentPrice;

    this.currentPrice = smoothedPrice;
    this.priceHistory.push(smoothedPrice);

    // Keep only last 20 prices for analysis
    if (this.priceHistory.length > 20) {
      this.priceHistory.shift();
    }

    return parseFloat(smoothedPrice.toFixed(2));
  }

  /**
   * Get moving average price
   */
  getMovingAveragePrice(): number {
    if (this.priceHistory.length === 0) return this.config.basePrice;
    const sum = this.priceHistory.reduce((a, b) => a + b, 0);
    return parseFloat((sum / this.priceHistory.length).toFixed(2));
  }

  /**
   * Get grid health score (0-100)
   */
  getGridHealthScore(imbalance: number): number {
    const absImbalance = Math.abs(imbalance);
    // Max imbalance considered is 20 kW
    const healthScore = Math.max(0, 100 - (absImbalance / 20) * 100);
    return parseFloat(healthScore.toFixed(2));
  }

  /**
   * Main function to monitor grid and emit updates
   */
  async monitorGrid(): Promise<GridMetrics> {
    const supply = await this.calculateTotalSupply();
    const demand = await this.calculateTotalDemand();
    const imbalance = demand - supply;
    const gridStatus = this.classifyGridStatus(imbalance);
    const updatedPrice = this.calculateAdaptivePrice(imbalance);

    const metrics: GridMetrics = {
      supply: parseFloat(supply.toFixed(2)),
      demand: parseFloat(demand.toFixed(2)),
      imbalance: parseFloat(imbalance.toFixed(2)),
      gridStatus,
      updatedPrice,
      timestamp: new Date().toISOString(),
    };

    // Emit via Socket.io if connected
    if (this.io) {
      this.io.emit('GRID_UPDATE', metrics);
    }

    // Log to database for analytics
    try {
      await db.query(
        `INSERT INTO grid_metrics (supply, demand, imbalance, grid_status, price, timestamp)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          metrics.supply,
          metrics.demand,
          metrics.imbalance,
          metrics.gridStatus,
          metrics.updatedPrice,
        ]
      );
    } catch (error) {
      console.error('Error logging grid metrics:', error);
    }

    return metrics;
  }

  /**
   * Get current grid state without monitoring
   */
  async getGridState(): Promise<GridMetrics> {
    const supply = await this.calculateTotalSupply();
    const demand = await this.calculateTotalDemand();
    const imbalance = demand - supply;
    const gridStatus = this.classifyGridStatus(imbalance);

    return {
      supply: parseFloat(supply.toFixed(2)),
      demand: parseFloat(demand.toFixed(2)),
      imbalance: parseFloat(imbalance.toFixed(2)),
      gridStatus,
      updatedPrice: this.currentPrice,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get historical grid metrics
   */
  async getGridHistory(hours: number = 24): Promise<GridMetrics[]> {
    try {
      const result = await db.query(
        `SELECT supply, demand, imbalance, grid_status as "gridStatus", price as "updatedPrice", timestamp
         FROM grid_metrics
         WHERE timestamp > NOW() - INTERVAL '${hours} hours'
         ORDER BY timestamp DESC
         LIMIT 100`,
        []
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching grid history:', error);
      return [];
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<GridConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): GridConfig {
    return { ...this.config };
  }

  /**
   * Get current metrics snapshot
   */
  getCurrentMetrics() {
    return {
      currentPrice: this.currentPrice,
      basePrice: this.config.basePrice,
      minPrice: this.config.minPrice,
      maxPrice: this.config.maxPrice,
      priceHistory: [...this.priceHistory],
      movingAverage: this.getMovingAveragePrice(),
    };
  }
}

// Export singleton instance
export const gridStabilityEngine = new GridStabilityEngine();
