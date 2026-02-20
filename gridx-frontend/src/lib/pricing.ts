// Shared pricing calculation for both LiveMarketplace and GridStabilityDashboard
// This ensures both components show the exact same live price

export const PRICING_CONFIG = {
  BASE_PRICE: 5.2,
  DEMAND_MIN: 0.98,
  DEMAND_MAX: 1.02,
};

/**
 * Calculate the live market demand multiplier based on current time
 * This ensures deterministic, synchronized updates every 3 seconds
 */
export function calculateDemandMultiplier(): number {
  const now = Date.now();
  const cycle = Math.floor(now / 3000); // 3-second cycle
  const seed = Math.sin(cycle * 0.73) * 0.95 + 1.0;
  return Math.max(
    PRICING_CONFIG.DEMAND_MIN,
    Math.min(PRICING_CONFIG.DEMAND_MAX, parseFloat(seed.toFixed(3)))
  );
}

/**
 * Calculate the live market price based on demand multiplier
 * Both LiveMarketplace and GridStabilityDashboard use this function
 */
export function calculateLivePrice(demandMultiplier: number): number {
  return parseFloat(
    (PRICING_CONFIG.BASE_PRICE * demandMultiplier).toFixed(2)
  );
}
