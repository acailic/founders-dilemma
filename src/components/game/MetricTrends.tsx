// Utility functions for calculating metric trends and forecasts

export interface TrendData {
  direction: 'rising' | 'falling' | 'stable';
  velocity: 'fast' | 'moderate' | 'slow';
  forecast: number;
  weeksForecast: number;
  isGoodTrend: boolean;
}

interface HistoryPoint {
  week: number;
  value: number;
}

/**
 * Calculate trend for a metric based on historical data
 * @param history - Array of historical values (most recent last)
 * @param isHigherBetter - Whether higher values are better for this metric
 * @returns Trend analysis including direction, velocity, and forecast
 */
export function calculateTrend(
  history: HistoryPoint[],
  isHigherBetter: boolean = true
): TrendData | null {
  if (history.length < 2) {
    return null;
  }

  const currentValue = history[history.length - 1].value;
  const previousValue = history[history.length - 2].value;
  const change = currentValue - previousValue;
  const changePercent = Math.abs((change / Math.max(previousValue, 1)) * 100);

  // Determine direction
  let direction: TrendData['direction'];
  if (Math.abs(changePercent) < 2) {
    direction = 'stable';
  } else if (change > 0) {
    direction = 'rising';
  } else {
    direction = 'falling';
  }

  // Determine velocity based on rate of change
  let velocity: TrendData['velocity'];
  if (changePercent > 15) {
    velocity = 'fast';
  } else if (changePercent > 5) {
    velocity = 'moderate';
  } else {
    velocity = 'slow';
  }

  // Calculate 4-week forecast using linear regression on last 4 weeks
  const forecastWeeks = 4;
  const recentHistory = history.slice(-Math.min(4, history.length));

  if (recentHistory.length >= 2) {
    // Simple linear regression
    const n = recentHistory.length;
    const sumX = recentHistory.reduce((sum, point, idx) => sum + idx, 0);
    const sumY = recentHistory.reduce((sum, point) => sum + point.value, 0);
    const sumXY = recentHistory.reduce((sum, point, idx) => sum + idx * point.value, 0);
    const sumX2 = recentHistory.reduce((sum, point, idx) => sum + idx * idx, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Forecast 4 weeks ahead
    const forecastValue = slope * (n + forecastWeeks - 1) + intercept;

    // Determine if trend is good
    const isGoodTrend = isHigherBetter
      ? forecastValue >= currentValue
      : forecastValue <= currentValue;

    return {
      direction,
      velocity,
      forecast: Math.max(0, forecastValue), // Don't forecast negative values
      weeksForecast: forecastWeeks,
      isGoodTrend,
    };
  }

  // Fallback: simple linear projection
  const avgChange = change;
  const forecast = Math.max(0, currentValue + avgChange * forecastWeeks);
  const isGoodTrend = isHigherBetter
    ? forecast >= currentValue
    : forecast <= currentValue;

  return {
    direction,
    velocity,
    forecast,
    weeksForecast: forecastWeeks,
    isGoodTrend,
  };
}

/**
 * Get trend arrow icon based on direction and whether higher is better
 */
export function getTrendArrow(
  direction: TrendData['direction'],
  isHigherBetter: boolean
): string {
  if (direction === 'stable') return '➡️';

  if (direction === 'rising') {
    return isHigherBetter ? '📈' : '📉';
  } else {
    return isHigherBetter ? '📉' : '📈';
  }
}

/**
 * Get trend color based on direction and whether higher is better
 */
export function getTrendColor(
  direction: TrendData['direction'],
  isHigherBetter: boolean
): string {
  if (direction === 'stable') return 'gray';

  const isPositive = (direction === 'rising' && isHigherBetter) ||
                     (direction === 'falling' && !isHigherBetter);

  return isPositive ? 'green' : 'red';
}

/**
 * Format forecast text with appropriate units
 */
export function formatForecast(
  forecast: number,
  formatter: (value: number) => string,
  weeks: number
): string {
  return `→ ${formatter(forecast)} in ${weeks}wk`;
}
