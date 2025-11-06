import { GameState } from '../../types/game-systems';

// Port of Rust insights generation from src-tauri/src/game/insights.rs

export interface Insight {
  category: string;
  title: string;
  observation: string;
  insight: string;
  action_suggestion: string;
  severity: 'Info' | 'Warning' | 'Critical';
  metric?: string;
  threshold?: number;
  current_value?: number;
}

export interface InsightsResult {
  insights: Insight[];
  warnings: Warning[];
  compounding_bonuses: CompoundingBonus[];
}

export interface Warning {
  category: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  suggested_actions: string[];
}

export interface CompoundingBonus {
  category: string;
  title: string;
  description: string;
  effect: string;
  duration_weeks: number;
}

export function generateInsights(prevState: GameState, currentState: GameState): InsightsResult {
  const insights: Insight[] = [];
  const warnings: Warning[] = [];
  const compoundingBonuses: CompoundingBonus[] = [];

  // Generate insights based on state changes
  insights.push(...generateMetricInsights(prevState, currentState));
  insights.push(...generateTrendInsights(currentState));
  insights.push(...generateStrategicInsights(currentState));

  // Generate warnings
  warnings.push(...generateWarnings(currentState));

  // Generate compounding bonuses
  compoundingBonuses.push(...generateCompoundingBonuses(currentState));

  return {
    insights,
    warnings,
    compounding_bonuses: compoundingBonuses,
  };
}

function generateMetricInsights(prevState: GameState, currentState: GameState): Insight[] {
  const insights: Insight[] = [];

  // Revenue insights
  const revenueChange = currentState.mrr - prevState.mrr;
  if (Math.abs(revenueChange) > prevState.mrr * 0.1) {
    if (revenueChange > 0) {
      insights.push({
        category: 'Revenue',
        title: 'Revenue Growth',
        observation: `MRR increased by $${revenueChange.toFixed(0)}`,
        insight: 'Recent actions are driving revenue growth',
        action_suggestion: 'Continue focusing on revenue-generating activities',
        severity: 'Info',
        metric: 'MRR',
        current_value: currentState.mrr,
      });
    } else {
      insights.push({
        category: 'Revenue',
        title: 'Revenue Decline',
        observation: `MRR decreased by $${Math.abs(revenueChange).toFixed(0)}`,
        insight: 'Revenue is declining - investigate churn or pricing issues',
        action_suggestion: 'Run pricing experiments or improve product quality',
        severity: 'Warning',
        metric: 'MRR',
        current_value: currentState.mrr,
      });
    }
  }

  // User growth insights
  const userChange = currentState.wau - prevState.wau;
  if (Math.abs(userChange) > prevState.wau * 0.05) {
    if (userChange > 0) {
      insights.push({
        category: 'Users',
        title: 'User Growth',
        observation: `WAU increased by ${userChange}`,
        insight: 'User acquisition is working well',
        action_suggestion: 'Scale successful acquisition channels',
        severity: 'Info',
        metric: 'WAU',
        current_value: currentState.wau,
      });
    } else {
      insights.push({
        category: 'Users',
        title: 'User Decline',
        observation: `WAU decreased by ${Math.abs(userChange)}`,
        insight: 'Users are leaving - check product quality and competition',
        action_suggestion: 'Investigate churn reasons and improve product',
        severity: 'Warning',
        metric: 'WAU',
        current_value: currentState.wau,
      });
    }
  }

  // Morale insights
  const moraleChange = currentState.morale - prevState.morale;
  if (Math.abs(moraleChange) > 5) {
    if (moraleChange < -5) {
      insights.push({
        category: 'Team',
        title: 'Morale Decline',
        observation: `Team morale dropped by ${Math.abs(moraleChange).toFixed(1)} points`,
        insight: 'Team is becoming demotivated',
        action_suggestion: 'Consider coaching, process improvements, or taking breaks',
        severity: 'Warning',
        metric: 'Morale',
        current_value: currentState.morale,
      });
    } else if (moraleChange > 5) {
      insights.push({
        category: 'Team',
        title: 'Morale Boost',
        observation: `Team morale increased by ${moraleChange.toFixed(1)} points`,
        insight: 'Team is energized and productive',
        action_suggestion: 'Maintain positive momentum',
        severity: 'Info',
        metric: 'Morale',
        current_value: currentState.morale,
      });
    }
  }

  // Tech debt insights
  const debtChange = currentState.tech_debt - prevState.tech_debt;
  if (debtChange > 5) {
    insights.push({
      category: 'Technical',
      title: 'Tech Debt Increase',
      observation: `Technical debt increased by ${debtChange.toFixed(1)} points`,
      insight: 'Code quality is deteriorating',
      action_suggestion: 'Schedule refactoring time or hire more engineers',
      severity: 'Warning',
      metric: 'Tech Debt',
      current_value: currentState.tech_debt,
    });
  }

  return insights;
}

function generateTrendInsights(state: GameState): Insight[] {
  const insights: Insight[] = [];

  // Growth rate trends
  if (state.wau_growth_rate > 15) {
    insights.push({
      category: 'Growth',
      title: 'Strong Growth Momentum',
      observation: `WAU growth rate is ${state.wau_growth_rate.toFixed(1)}%`,
      insight: 'Product has strong market traction',
      action_suggestion: 'Consider scaling operations and hiring',
      severity: 'Info',
    });
  } else if (state.wau_growth_rate < 5) {
    insights.push({
      category: 'Growth',
      title: 'Slow Growth',
      observation: `WAU growth rate is only ${state.wau_growth_rate.toFixed(1)}%`,
      insight: 'Growth has stalled - need to find new acquisition channels',
      action_suggestion: 'Experiment with new marketing channels or product features',
      severity: 'Warning',
    });
  }

  // Cash position
  if (state.bank < state.burn * 3) {
    insights.push({
      category: 'Finance',
      title: 'Cash Runway Concern',
      observation: `Only ${Math.floor(state.bank / state.burn)} months of runway`,
      insight: 'Cash position is precarious',
      action_suggestion: 'Focus on revenue growth or consider fundraising',
      severity: 'Critical',
      metric: 'Bank',
      current_value: state.bank,
    });
  }

  // Reputation trends
  if (state.reputation > 75) {
    insights.push({
      category: 'Reputation',
      title: 'Strong Market Position',
      observation: `Reputation score of ${state.reputation.toFixed(1)}`,
      insight: 'Company has established credibility',
      action_suggestion: 'Leverage reputation for partnerships and hiring',
      severity: 'Info',
    });
  }

  // Compliance risk
  if (state.compliance_risk > 50) {
    insights.push({
      category: 'Compliance',
      title: 'High Compliance Risk',
      observation: `Compliance risk at ${state.compliance_risk.toFixed(1)}%`,
      insight: 'Regulatory issues could threaten the business',
      action_suggestion: 'Prioritize compliance work and legal review',
      severity: 'Critical',
      metric: 'Compliance Risk',
      current_value: state.compliance_risk,
    });
  }

  // NPS trends
  if (state.nps < 0) {
    insights.push({
      category: 'Customer',
      title: 'Poor Customer Satisfaction',
      observation: `NPS is ${state.nps.toFixed(1)}`,
      insight: 'Customers are unhappy with the product',
      action_suggestion: 'Focus on product quality and customer support',
      severity: 'Warning',
      metric: 'NPS',
      current_value: state.nps,
    });
  }

  return insights;
}

function generateStrategicInsights(state: GameState): Insight[] {
  const insights: Insight[] = [];

  // Strategic opportunities based on current state
  if (state.reputation > 70 && state.bank > state.burn * 6) {
    insights.push({
      category: 'Strategy',
      title: 'Fundraising Opportunity',
      observation: 'Strong reputation and healthy cash position',
      insight: 'Market conditions are favorable for fundraising',
      action_suggestion: 'Consider raising capital to accelerate growth',
      severity: 'Info',
    });
  }

  if (state.tech_debt > 40 && state.velocity < 0.8) {
    insights.push({
      category: 'Strategy',
      title: 'Technical Debt Crisis',
      observation: 'High tech debt is severely impacting velocity',
      insight: 'Development speed has slowed significantly',
      action_suggestion: 'Prioritize refactoring and technical debt reduction',
      severity: 'Critical',
    });
  }

  if (state.morale > 80 && state.velocity > 1.2) {
    insights.push({
      category: 'Strategy',
      title: 'High Performance Period',
      observation: 'Team is highly motivated and productive',
      insight: 'This is an optimal time for ambitious projects',
      action_suggestion: 'Tackle complex features or strategic initiatives',
      severity: 'Info',
    });
  }

  if (state.wau > 50000 && state.mrr / state.wau < 10) {
    insights.push({
      category: 'Strategy',
      title: 'Monetization Opportunity',
      observation: `ARPU is only $${(state.mrr / state.wau).toFixed(2)}`,
      insight: 'Large user base with low revenue per user',
      action_suggestion: 'Experiment with pricing tiers or upselling',
      severity: 'Info',
    });
  }

  return insights;
}

function generateWarnings(state: GameState): Warning[] {
  const warnings: Warning[] = [];

  // Critical warnings
  if (state.bank < 0) {
    warnings.push({
      category: 'Finance',
      title: 'Negative Cash Balance',
      description: 'Company has negative cash balance',
      severity: 'High',
      suggested_actions: [
        'Immediately cut costs',
        'Seek emergency funding',
        'Focus on revenue generation',
      ],
    });
  }

  if (state.morale <= 20) {
    warnings.push({
      category: 'Team',
      title: 'Critical Morale Issues',
      description: 'Team morale is critically low',
      severity: 'High',
      suggested_actions: [
        'Address team concerns immediately',
        'Consider leadership changes',
        'Take immediate action to improve work conditions',
      ],
    });
  }

  // Medium warnings
  if (state.tech_debt > 80) {
    warnings.push({
      category: 'Technical',
      title: 'Critical Technical Debt',
      description: 'Technical debt has reached critical levels',
      severity: 'Medium',
      suggested_actions: [
        'Stop all new feature development',
        'Dedicate team to refactoring',
        'Consider hiring senior engineers',
      ],
    });
  }

  if (state.compliance_risk > 70) {
    warnings.push({
      category: 'Compliance',
      title: 'Severe Compliance Risk',
      description: 'Company faces severe regulatory risk',
      severity: 'Medium',
      suggested_actions: [
        'Hire compliance officer',
        'Conduct legal review',
        'Implement compliance processes',
      ],
    });
  }

  // Low warnings
  if (state.churn_rate > 10) {
    warnings.push({
      category: 'Customer',
      title: 'High Churn Rate',
      description: 'Customer churn rate is elevated',
      severity: 'Low',
      suggested_actions: [
        'Improve product quality',
        'Enhance customer support',
        'Run retention experiments',
      ],
    });
  }

  if (state.velocity < 0.5) {
    warnings.push({
      category: 'Product',
      title: 'Low Development Velocity',
      description: 'Team development speed is very low',
      severity: 'Low',
      suggested_actions: [
        'Address technical debt',
        'Improve team processes',
        'Consider hiring additional developers',
      ],
    });
  }

  return warnings;
}

function generateCompoundingBonuses(state: GameState): CompoundingBonus[] {
  const bonuses: CompoundingBonus[] = [];

  // Reputation compounding
  if (state.reputation > 60) {
    bonuses.push({
      category: 'Reputation',
      title: 'Reputation Flywheel',
      description: 'High reputation attracts better talent and customers',
      effect: '+10% hiring success, +5% customer conversion',
      duration_weeks: -1, // Permanent
    });
  }

  // Scale bonuses
  if (state.wau > 10000) {
    bonuses.push({
      category: 'Scale',
      title: 'Network Effects',
      description: 'Large user base creates network effects',
      effect: '+15% organic growth, +5% reputation growth',
      duration_weeks: -1,
    });
  }

  // Product quality bonuses
  if (state.tech_debt < 20) {
    bonuses.push({
      category: 'Quality',
      title: 'Quality Advantage',
      description: 'Low technical debt enables fast, reliable development',
      effect: '+20% development velocity, +10% morale',
      duration_weeks: -1,
    });
  }

  // Team bonuses
  if (state.morale > 70) {
    bonuses.push({
      category: 'Team',
      title: 'High Morale Bonus',
      description: 'Motivated team performs at higher levels',
      effect: '+15% velocity, +10% innovation chance',
      duration_weeks: -1,
    });
  }

  // Market position bonuses
  if (state.momentum > 60) {
    bonuses.push({
      category: 'Momentum',
      title: 'Momentum Advantage',
      description: 'Strong momentum attracts investors and talent',
      effect: '+20% fundraising success, +10% hiring success',
      duration_weeks: 12,
    });
  }

  return bonuses;
}