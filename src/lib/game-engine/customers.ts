import { GameState } from '../../types/game-systems';

// Port of Rust customer system from src-tauri/src/game/customers.rs

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  size: number; // Total addressable market size
  conversion_rate: number; // Base conversion rate
  lifetime_value: number; // Customer lifetime value
  churn_rate: number; // Monthly churn rate
  satisfaction: number; // 0-100 customer satisfaction
  acquired: number; // Number of customers acquired
  active: number; // Currently active customers
}

export interface CustomerMetrics {
  total_customers: number;
  active_customers: number;
  monthly_revenue: number;
  churn_rate: number;
  customer_acquisition_cost: number;
  lifetime_value: number;
  net_promoter_score: number;
  segments: CustomerSegment[];
}

export function updateCustomerSegments(state: GameState, segments: CustomerSegment[]): CustomerSegment[] {
  // Update customer segments based on game state
  for (const segment of segments) {
    // Update satisfaction based on product quality
    const quality_factor = (100 - state.tech_debt) / 100;
    const reputation_factor = state.reputation / 100;
    const morale_factor = state.morale / 100;

    segment.satisfaction = Math.min(100, Math.max(0,
      (quality_factor * 40) +
      (reputation_factor * 30) +
      (morale_factor * 20) +
      (state.nps * 0.1) // NPS influence
    ));

    // Update churn rate based on satisfaction
    const base_churn = segment.churn_rate;
    const satisfaction_modifier = (100 - segment.satisfaction) / 100;
    segment.churn_rate = base_churn * (1 + satisfaction_modifier);

    // Apply churn to active customers
    const churned = Math.floor(segment.active * (segment.churn_rate / 100));
    segment.active = Math.max(0, segment.active - churned);

    // Update conversion rate based on reputation and marketing
    const reputation_bonus = state.reputation / 200; // 0-0.5
    segment.conversion_rate = Math.min(0.5, segment.conversion_rate * (1 + reputation_bonus));
  }

  return segments;
}

export function acquireCustomers(state: GameState, segments: CustomerSegment[], marketing_spend: number, sales_effort: number): number {
  let total_acquired = 0;

  for (const segment of segments) {
    // Calculate acquisition potential
    const market_penetration = segment.acquired / segment.size;
    const penetration_factor = Math.max(0.1, 1 - market_penetration); // Harder to acquire when saturated

    // Marketing effectiveness
    const marketing_effectiveness = Math.min(1, marketing_spend / 10000); // Diminishing returns

    // Sales effort effectiveness
    const sales_effectiveness = Math.min(1, sales_effort / 100);

    // Combined acquisition rate
    const acquisition_rate = segment.conversion_rate *
                           penetration_factor *
                           (marketing_effectiveness + sales_effectiveness);

    // Acquire customers
    const acquired = Math.floor(segment.size * acquisition_rate * 0.01); // Convert to actual numbers
    const actual_acquired = Math.min(acquired, segment.size - segment.acquired);

    segment.acquired += actual_acquired;
    segment.active += actual_acquired;
    total_acquired += actual_acquired;
  }

  return total_acquired;
}

export function calculateCustomerMetrics(state: GameState, segments: CustomerSegment[]): CustomerMetrics {
  const total_customers = segments.reduce((sum, s) => sum + s.acquired, 0);
  const active_customers = segments.reduce((sum, s) => sum + s.active, 0);

  // Calculate weighted average metrics
  let total_weighted_churn = 0;
  let total_weighted_ltv = 0;
  let total_weight = 0;

  for (const segment of segments) {
    const weight = segment.active;
    total_weighted_churn += segment.churn_rate * weight;
    total_weighted_ltv += segment.lifetime_value * weight;
    total_weight += weight;
  }

  const avg_churn_rate = total_weight > 0 ? total_weighted_churn / total_weight : 0;
  const avg_ltv = total_weight > 0 ? total_weighted_ltv / total_weight : 0;

  // Estimate monthly revenue from active customers
  const monthly_revenue = active_customers * (avg_ltv / 12); // Rough approximation

  // Estimate CAC (simplified)
  const estimated_cac = state.wau > 0 ? (state.burn * 0.3) / (state.wau * 0.1) : 0;

  return {
    total_customers,
    active_customers,
    monthly_revenue,
    churn_rate: avg_churn_rate,
    customer_acquisition_cost: estimated_cac,
    lifetime_value: avg_ltv,
    net_promoter_score: state.nps,
    segments,
  };
}

export function getInitialCustomerSegments(): CustomerSegment[] {
  return [
    {
      id: 'early_adopters',
      name: 'Early Adopters',
      description: 'Tech-savvy users willing to try new solutions',
      size: 10000,
      conversion_rate: 0.05, // 5%
      lifetime_value: 1200, // $100/month for 12 months
      churn_rate: 8.0, // 8% monthly churn
      satisfaction: 70,
      acquired: 0,
      active: 0,
    },
    {
      id: 'small_business',
      name: 'Small Business',
      description: 'Small companies looking for cost-effective solutions',
      size: 50000,
      conversion_rate: 0.02, // 2%
      lifetime_value: 2400, // $200/month for 12 months
      churn_rate: 6.0, // 6% monthly churn
      satisfaction: 65,
      acquired: 0,
      active: 0,
    },
    {
      id: 'mid_market',
      name: 'Mid-Market',
      description: 'Growing companies with more complex needs',
      size: 10000,
      conversion_rate: 0.01, // 1%
      lifetime_value: 12000, // $1000/month for 12 months
      churn_rate: 4.0, // 4% monthly churn
      satisfaction: 60,
      acquired: 0,
      active: 0,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Large organizations with enterprise requirements',
      size: 1000,
      conversion_rate: 0.005, // 0.5%
      lifetime_value: 60000, // $5000/month for 12 months
      churn_rate: 2.0, // 2% monthly churn
      satisfaction: 55,
      acquired: 0,
      active: 0,
    },
  ];
}

export function getCustomerSegmentSummary(segment: CustomerSegment): string {
  const penetration = segment.size > 0 ? (segment.acquired / segment.size * 100).toFixed(1) : '0.0';
  return `${segment.name}: ${segment.active} active customers (${penetration}% market penetration, ${segment.satisfaction.toFixed(0)} satisfaction)`;
}

export function calculateCustomerHealthScore(metrics: CustomerMetrics): number {
  // Calculate overall customer health score (0-100)
  const retention_score = Math.max(0, 100 - metrics.churn_rate * 5); // Lower churn = higher score
  const growth_score = Math.min(100, metrics.total_customers / 100); // More customers = higher score
  const satisfaction_score = metrics.net_promoter_score + 50; // NPS -50 to +50, convert to 0-100

  // LTV/CAC ratio (higher is better)
  const ltv_cac_ratio = metrics.customer_acquisition_cost > 0 ?
    metrics.lifetime_value / metrics.customer_acquisition_cost : 0;
  const efficiency_score = Math.min(100, ltv_cac_ratio * 10);

  return (retention_score + growth_score + satisfaction_score + efficiency_score) / 4;
}

export function getCustomerInsights(metrics: CustomerMetrics): string[] {
  const insights: string[] = [];

  if (metrics.churn_rate > 10) {
    insights.push('High churn rate indicates customer satisfaction issues');
  }

  if (metrics.customer_acquisition_cost > metrics.lifetime_value * 0.3) {
    insights.push('Customer acquisition costs are too high relative to lifetime value');
  }

  if (metrics.net_promoter_score < 0) {
    insights.push('Negative NPS suggests customers are detractors rather than promoters');
  }

  if (metrics.active_customers < metrics.total_customers * 0.7) {
    insights.push('Large gap between acquired and active customers indicates retention problems');
  }

  const health_score = calculateCustomerHealthScore(metrics);
  if (health_score > 80) {
    insights.push('Excellent customer health - focus on scaling acquisition');
  } else if (health_score > 60) {
    insights.push('Good customer health - monitor retention and satisfaction');
  } else if (health_score > 40) {
    insights.push('Concerning customer health - address churn and satisfaction');
  } else {
    insights.push('Critical customer health issues - immediate action required');
  }

  return insights;
}