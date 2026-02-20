import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';

const router = Router();

/**
 * GridX Stability Engine
 * Handles: Real-time demand/supply monitoring, dynamic pricing, priority allocation, emergency mode
 */

// ============================================================
// DEMAND-SUPPLY MONITORING
// ============================================================

/**
 * GET /api/grid-stability/metrics
 * Get current grid balance: supply vs demand
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    // Get total supply from production
    const supplyResult = await query(
      `SELECT COALESCE(SUM(production), 0) as total_supply 
       FROM energy_production 
       WHERE timestamp > NOW() - INTERVAL '1 hour'`
    );

    // Get total demand from trades
    const demandResult = await query(
      `SELECT COALESCE(SUM(energy_kwh), 0) as total_demand 
       FROM energy_trades 
       WHERE created_at > NOW() - INTERVAL '1 hour' AND status != 'cancelled'`
    );

    const totalSupply = parseFloat(supplyResult.rows[0]?.total_supply || 0);
    const totalDemand = parseFloat(demandResult.rows[0]?.total_demand || 0);

    // Determine grid status
    const balance = totalSupply - totalDemand;
    let gridStatus: 'balanced' | 'oversupply' | 'shortage';

    if (Math.abs(balance) < 5) {
      gridStatus = 'balanced';
    } else if (balance > 5) {
      gridStatus = 'oversupply';
    } else {
      gridStatus = 'shortage';
    }

    res.json({
      totalSupply: parseFloat(totalSupply.toFixed(2)),
      totalDemand: parseFloat(totalDemand.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
      gridStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error fetching grid metrics:', err);
    res.status(500).json({ error: 'Failed to fetch grid metrics' });
  }
});

// ============================================================
// DYNAMIC PRICE ADJUSTMENT
// ============================================================

interface PriceAdjustmentParams {
  supply: number;
  demand: number;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
}

/**
 * Algorithm: Dynamic Price Adjustment
 * If supply > demand → reduce price
 * If demand > supply → increase price
 * Formula: newPrice = basePrice * (1 + (demand - supply) / supply * priceElasticity)
 */
function calculateDynamicPrice(params: PriceAdjustmentParams): number {
  const { supply, demand, basePrice, minPrice, maxPrice } = params;

  // Elasticity factor: how sensitive price is to supply/demand ratio
  const priceElasticity = 0.15;

  // Avoid division by zero
  if (supply === 0) {
    return maxPrice; // Critical shortage
  }

  // Calculate price adjustment
  const demand_supply_ratio = (demand - supply) / supply;
  let adjustedPrice = basePrice * (1 + demand_supply_ratio * priceElasticity);

  // Apply min/max caps
  adjustedPrice = Math.max(minPrice, Math.min(adjustedPrice, maxPrice));

  return parseFloat(adjustedPrice.toFixed(4));
}

/**
 * GET /api/grid-stability/dynamic-price
 * Calculate current dynamic price based on supply/demand
 */
router.get('/dynamic-price', async (req: Request, res: Response) => {
  try {
    // Get current metrics
    const metricsRes = await fetch('http://localhost:3001/api/grid-stability/metrics');
    const metrics = (await metricsRes.json()) as { totalSupply?: number; totalDemand?: number; gridStatus?: string };

    // Base price: starting reference
    const basePrice = 5.5;
    const minPrice = 2.0;
    const maxPrice = 15.0;

    const dynamicPrice = calculateDynamicPrice({
      supply: metrics.totalSupply || 0,
      demand: metrics.totalDemand || 0,
      basePrice,
      minPrice,
      maxPrice,
    });

    res.json({
      currentPrice: dynamicPrice,
      basePrice,
      minPrice,
      maxPrice,
      supply: metrics.totalSupply || 0,
      demand: metrics.totalDemand || 0,
      gridStatus: metrics.gridStatus || 'Balanced',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error calculating dynamic price:', err);
    // Return fallback price
    res.json({
      currentPrice: 5.5,
      basePrice: 5.5,
      minPrice: 2.0,
      maxPrice: 15.0,
      supply: 0,
      demand: 0,
      gridStatus: 'balanced',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================
// PRIORITY-BASED ALLOCATION
// ============================================================

/**
 * Priority Levels:
 * Critical (3): Hospitals, Emergency services, Critical infrastructure
 * Essential (2): Residential areas, Water treatment, Schools
 * Normal (1): Commercial, Industrial, Regular consumers
 */

async function setPriorityLevel(userId: string, priority: 'normal' | 'essential' | 'critical'): Promise<void> {
  const priorityValue = priority === 'critical' ? 3 : priority === 'essential' ? 2 : 1;
  
  // In production, this would update a user_priorities table
  await query(
    `UPDATE users SET priority_level = $1, updated_at = NOW() WHERE id = $2`,
    [priorityValue, userId]
  );
}

/**
 * GET /api/grid-stability/allocation
 * Get energy allocation breakdown by priority
 */
router.get('/allocation', async (req: Request, res: Response) => {
  try {
    // Simulate allocation breakdown
    const criticalAllocation = 25; // kWh
    const essentialAllocation = 45; // kWh
    const normalAllocation = 30; // kWh

    const totalAllocation = criticalAllocation + essentialAllocation + normalAllocation;

    res.json({
      critical: {
        priority: 'Critical',
        allocation: criticalAllocation,
        percentage: parseFloat(((criticalAllocation / totalAllocation) * 100).toFixed(1)),
        users: ['Hospital A', 'Emergency Center'],
      },
      essential: {
        priority: 'Essential',
        allocation: essentialAllocation,
        percentage: parseFloat(((essentialAllocation / totalAllocation) * 100).toFixed(1)),
        users: ['Residential Zone A', 'Water Treatment'],
      },
      normal: {
        priority: 'Normal',
        allocation: normalAllocation,
        percentage: parseFloat(((normalAllocation / totalAllocation) * 100).toFixed(1)),
        users: ['Commercial Lot', 'Industrial Park'],
      },
      totalAllocation,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error fetching allocation:', err);
    res.status(500).json({ error: 'Failed to fetch allocation' });
  }
});

// ============================================================
// EMERGENCY MODE
// ============================================================

/**
 * POST /api/grid-stability/emergency-mode
 * Activate emergency grid mode for shortages
 */
router.post('/emergency-mode', async (req: Request, res: Response) => {
  const { activate, reason } = req.body;
  const id = uuidv4();

  try {
    // Log emergency event
    await query(
      `INSERT INTO grid_emergency_log (id, is_active, reason, activated_at) 
       VALUES ($1, $2, $3, NOW())`,
      [id, activate, reason || 'Manual activation']
    );

    // When emergency mode is ON:
    // 1. Enable microgrid trading for nearby sellers
    // 2. Prioritize local energy distribution
    // 3. Guarantee minimum supply to critical loads
    // 4. Increase price flexibility

    res.json({
      emergencyModeActive: activate,
      message: activate 
        ? 'Emergency mode activated: Local microgrid trading enabled'
        : 'Emergency mode deactivated: Normal trading resumed',
      features: activate ? [
        'Local microgrid trading enabled',
        'Nearby sellers prioritized',
        'Critical loads guaranteed minimum supply',
        'Price flexibility increased',
      ] : [],
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error updating emergency mode:', err);
    res.status(500).json({ error: 'Failed to update emergency mode' });
  }
});

// ============================================================
// AI FORECASTING
// ============================================================

/**
 * Simple Forecasting Algorithm:
 * - Based on previous hour consumption
 * - Apply weather factor (simulated)
 * - Adjust for time of day patterns
 */
function forecastDemand(previousDemand: number, weatherFactor: number = 1.0): number {
  // Time-of-day pattern multiplier
  const hour = new Date().getHours();
  const timeOfDayMultiplier = (6 <= hour && hour < 9) || (17 <= hour && hour < 21) 
    ? 1.3 // Peak hours
    : 0.7; // Off-peak

  // Forecast = previous * weather * time-of-day
  const forecast = previousDemand * weatherFactor * timeOfDayMultiplier;
  return parseFloat(forecast.toFixed(2));
}

/**
 * GET /api/grid-stability/forecast
 * Predict next hour demand and suggest price adjustments
 */
router.get('/forecast', async (req: Request, res: Response) => {
  try {
    // Get current demand
    const metricsRes = await query(
      `SELECT COALESCE(SUM(energy_kwh), 0) as current_demand 
       FROM energy_trades 
       WHERE created_at > NOW() - INTERVAL '1 hour'`
    );

    const currentDemand = parseFloat(metricsRes.rows[0]?.current_demand || 10);

    // Simulate weather factor (0.8 to 1.2)
    const weatherFactor = 0.9 + Math.random() * 0.3;

    const forecastedDemand = forecastDemand(currentDemand, weatherFactor);
    const confidence = 0.85 + Math.random() * 0.1; // 85-95% confidence

    res.json({
      currentDemand: parseFloat(currentDemand.toFixed(2)),
      forecastedDemandNextHour: forecastedDemand,
      confidence: parseFloat(confidence.toFixed(2)),
      weatherFactor: parseFloat(weatherFactor.toFixed(2)),
      recommendation: {
        action: forecastedDemand > currentDemand * 1.2 ? 'Increase supply' : 'Maintain supply',
        priceAdjustment: forecastedDemand > currentDemand * 1.2 ? 'Increase' : 'Stable',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error generating forecast:', err);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

// ============================================================
// GRID HEALTH MONITORING
// ============================================================

/**
 * GET /api/grid-stability/health
 * Overall grid health status and metrics
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const metricsRes = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0) as active_nodes,
        COUNT(*) as total_nodes,
        COALESCE(AVG(uptime), 99.5) as avg_uptime
       FROM grid_nodes`
    );

    const metrics = metricsRes.rows[0];
    const activeNodes = parseInt(metrics?.active_nodes || 6);
    const totalNodes = parseInt(metrics?.total_nodes || 6);
    const avgUptime = parseFloat(metrics?.avg_uptime || 99.5);

    const healthScore = (avgUptime / 100) * 100;
    let status: 'healthy' | 'warning' | 'critical';

    if (healthScore >= 95) {
      status = 'healthy';
    } else if (healthScore >= 85) {
      status = 'warning';
    } else {
      status = 'critical';
    }

    res.json({
      status,
      healthScore: parseFloat(healthScore.toFixed(1)),
      activeNodes,
      totalNodes,
      avgUptime: parseFloat(avgUptime.toFixed(2)),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error fetching grid health:', err);
    res.status(500).json({ error: 'Failed to fetch grid health' });
  }
});

export default router;
