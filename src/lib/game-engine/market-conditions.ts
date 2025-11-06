import { GameState } from '../../types/game-systems';

// Port of Rust market conditions from src-tauri/src/game/market-conditions.rs

export interface MarketCondition {
  id: string;
  name: string;
  description: string;
  category: 'Economic' | 'Industry' | 'Competitive' | 'Regulatory';
  intensity: number; // 0-100, how strong the condition is
  duration_weeks: number;
  effects: MarketEffect[];
  active: boolean;
  week_started: number;
}

export interface MarketEffect {
  stat_name: string;
  multiplier: number; // Multiplicative effect (1.0 = no change)
  additive: number; // Additive effect
  description: string;
}

export interface MarketStatus {
  conditions: MarketCondition[];
  overall_sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  funding_environment: 'Hot' | 'Normal' | 'Frozen';
  competitive_pressure: 'Low' | 'Medium' | 'High';
  regulatory_pressure: 'Low' | 'Medium' | 'High';
  summary: string;
}

export function updateMarketConditions(state: GameState, conditions: MarketCondition[]): MarketCondition[] {
  // Update existing conditions
  for (const condition of conditions) {
    if (condition.active) {
      const weeksActive = state.week - condition.week_started;
      if (weeksActive >= condition.duration_weeks) {
        condition.active = false;
      }
    }
  }

  // Potentially add new conditions
  const newConditions = generateNewMarketConditions(state);
  for (const newCondition of newConditions) {
    // Check if similar condition already exists
    const existingSimilar = conditions.find(c =>
      c.category === newCondition.category &&
      Math.abs(c.intensity - newCondition.intensity) < 20
    );

    if (!existingSimilar) {
      newCondition.active = true;
      newCondition.week_started = state.week;
      conditions.push(newCondition);
    }
  }

  return conditions;
}

export function applyMarketEffects(state: GameState, conditions: MarketCondition[]): void {
  // Reset temporary modifiers
  let fundingMultiplier = 1.0;
  let growthMultiplier = 1.0;
  let churnMultiplier = 1.0;
  let reputationDrift = 0;
  let moraleDrift = 0;

  // Apply effects from active conditions
  for (const condition of conditions.filter(c => c.active)) {
    for (const effect of condition.effects) {
      switch (effect.stat_name) {
        case 'Funding':
          fundingMultiplier *= effect.multiplier;
          break;
        case 'Growth':
          growthMultiplier *= effect.multiplier;
          break;
        case 'Churn':
          churnMultiplier *= effect.multiplier;
          break;
        case 'Reputation':
          reputationDrift += effect.additive;
          break;
        case 'Morale':
          moraleDrift += effect.additive;
          break;
      }
    }
  }

  // Apply funding environment effects
  // This would affect fundraising success rates (implemented in actions.ts)

  // Apply growth effects
  state.wau_growth_rate *= growthMultiplier;

  // Apply churn effects
  state.churn_rate *= churnMultiplier;

  // Apply drift effects
  state.reputation += reputationDrift;
  state.morale += moraleDrift;

  // Ensure bounds
  state.reputation = Math.max(0, Math.min(100, state.reputation));
  state.morale = Math.max(0, Math.min(100, state.morale));
  state.churn_rate = Math.max(0, Math.min(20, state.churn_rate));
}

export function getMarketStatus(state: GameState, conditions: MarketCondition[]): MarketStatus {
  const activeConditions = conditions.filter(c => c.active);

  // Calculate overall sentiment
  const economicConditions = activeConditions.filter(c => c.category === 'Economic');
  const avgEconomicIntensity = economicConditions.length > 0
    ? economicConditions.reduce((sum, c) => sum + c.intensity, 0) / economicConditions.length
    : 50;

  let sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  if (avgEconomicIntensity > 70) {
    sentiment = 'Bullish';
  } else if (avgEconomicIntensity < 30) {
    sentiment = 'Bearish';
  } else {
    sentiment = 'Neutral';
  }

  // Calculate funding environment
  const fundingConditions = activeConditions.filter(c =>
    c.effects.some(e => e.stat_name === 'Funding')
  );
  const avgFundingMultiplier = fundingConditions.length > 0
    ? fundingConditions.reduce((sum, c) =>
        sum + c.effects.find(e => e.stat_name === 'Funding')!.multiplier, 0
      ) / fundingConditions.length
    : 1.0;

  let funding: 'Hot' | 'Normal' | 'Frozen';
  if (avgFundingMultiplier > 1.2) {
    funding = 'Hot';
  } else if (avgFundingMultiplier < 0.8) {
    funding = 'Frozen';
  } else {
    funding = 'Normal';
  }

  // Calculate competitive pressure
  const competitiveConditions = activeConditions.filter(c => c.category === 'Competitive');
  const maxCompetitiveIntensity = competitiveConditions.length > 0
    ? Math.max(...competitiveConditions.map(c => c.intensity))
    : 0;

  let competitive: 'Low' | 'Medium' | 'High';
  if (maxCompetitiveIntensity > 70) {
    competitive = 'High';
  } else if (maxCompetitiveIntensity > 30) {
    competitive = 'Medium';
  } else {
    competitive = 'Low';
  }

  // Calculate regulatory pressure
  const regulatoryConditions = activeConditions.filter(c => c.category === 'Regulatory');
  const maxRegulatoryIntensity = regulatoryConditions.length > 0
    ? Math.max(...regulatoryConditions.map(c => c.intensity))
    : 0;

  let regulatory: 'Low' | 'Medium' | 'High';
  if (maxRegulatoryIntensity > 70) {
    regulatory = 'High';
  } else if (maxRegulatoryIntensity > 30) {
    regulatory = 'Medium';
  } else {
    regulatory = 'Low';
  }

  // Generate summary
  const summary = generateMarketSummary(sentiment, funding, competitive, regulatory, activeConditions);

  return {
    conditions: activeConditions,
    overall_sentiment: sentiment,
    funding_environment: funding,
    competitive_pressure: competitive,
    regulatory_pressure: regulatory,
    summary,
  };
}

function generateNewMarketConditions(state: GameState): MarketCondition[] {
  const conditions: MarketCondition[] = [];

  // Economic conditions based on game state
  if (state.week > 52 && Math.random() < 0.15) {
    // Market cycle - roughly every 2-3 years
    const cyclePosition = (state.week % 104) / 104; // 0-1 cycle
    if (cyclePosition < 0.3) {
      // Recession period
      conditions.push({
        id: `recession_${state.week}`,
        name: 'Economic Recession',
        description: 'Broader economic downturn affecting all businesses',
        category: 'Economic',
        intensity: 75 + Math.random() * 15,
        duration_weeks: 26 + Math.floor(Math.random() * 26),
        effects: [
          { stat_name: 'Funding', multiplier: 0.6, additive: 0, description: 'Funding environment freezes' },
          { stat_name: 'Growth', multiplier: 0.8, additive: 0, description: 'Slower user growth' },
          { stat_name: 'Churn', multiplier: 1.3, additive: 0, description: 'Higher churn in downturn' },
          { stat_name: 'Morale', multiplier: 1.0, additive: -2, description: 'Economic uncertainty affects morale' },
        ],
        active: false,
        week_started: 0,
      });
    } else if (cyclePosition > 0.7) {
      // Boom period
      conditions.push({
        id: `boom_${state.week}`,
        name: 'Economic Boom',
        description: 'Strong economic growth benefiting innovative companies',
        category: 'Economic',
        intensity: 80 + Math.random() * 15,
        duration_weeks: 20 + Math.floor(Math.random() * 20),
        effects: [
          { stat_name: 'Funding', multiplier: 1.4, additive: 0, description: 'Abundant funding available' },
          { stat_name: 'Growth', multiplier: 1.2, additive: 0, description: 'Accelerated user growth' },
          { stat_name: 'Reputation', multiplier: 1.0, additive: 1, description: 'Economic tailwinds help reputation' },
        ],
        active: false,
        week_started: 0,
      });
    }
  }

  // Industry-specific conditions
  if (state.reputation > 60 && Math.random() < 0.1) {
    // Industry hype cycle
    const hypeIntensity = Math.min(90, state.reputation + Math.random() * 20);
    conditions.push({
      id: `industry_hype_${state.week}`,
      name: 'Industry Hype Cycle',
      description: 'Your industry is experiencing significant media attention and investor interest',
      category: 'Industry',
      intensity: hypeIntensity,
      duration_weeks: 12 + Math.floor(Math.random() * 12),
      effects: [
        { stat_name: 'Funding', multiplier: 1.3, additive: 0, description: 'Easier fundraising in hyped sector' },
        { stat_name: 'Growth', multiplier: 1.15, additive: 0, description: 'Industry buzz drives user interest' },
        { stat_name: 'Reputation', multiplier: 1.0, additive: 2, description: 'Industry momentum boosts reputation' },
      ],
      active: false,
      week_started: 0,
    });
  }

  // Competitive conditions
  if (state.wau > 25000 && Math.random() < 0.12) {
    // Increased competition at scale
    conditions.push({
      id: `competition_${state.week}`,
      name: 'Increased Competition',
      description: 'Market success attracts well-funded competitors',
      category: 'Competitive',
      intensity: 60 + Math.random() * 25,
      duration_weeks: 16 + Math.floor(Math.random() * 16),
      effects: [
        { stat_name: 'Growth', multiplier: 0.9, additive: 0, description: 'Competitors capture market share' },
        { stat_name: 'Churn', multiplier: 1.1, additive: 0, description: 'Users compare alternatives' },
        { stat_name: 'Funding', multiplier: 0.95, additive: 0, description: 'Competition makes fundraising harder' },
      ],
      active: false,
      week_started: 0,
    });
  }

  // Regulatory conditions
  if (state.compliance_risk > 40 && Math.random() < 0.08) {
    // Regulatory scrutiny
    conditions.push({
      id: `regulation_${state.week}`,
      name: 'Regulatory Scrutiny',
      description: 'Increased regulatory attention on your industry',
      category: 'Regulatory',
      intensity: 70 + Math.random() * 20,
      duration_weeks: 20 + Math.floor(Math.random() * 20),
      effects: [
        { stat_name: 'Growth', multiplier: 0.85, additive: 0, description: 'Regulatory uncertainty slows growth' },
        { stat_name: 'Churn', multiplier: 1.15, additive: 0, description: 'Users concerned about regulatory risks' },
        { stat_name: 'Morale', multiplier: 1.0, additive: -3, description: 'Regulatory pressure stresses team' },
      ],
      active: false,
      week_started: 0,
    });
  }

  return conditions;
}

function generateMarketSummary(
  sentiment: 'Bullish' | 'Neutral' | 'Bearish',
  funding: 'Hot' | 'Normal' | 'Frozen',
  competitive: 'Low' | 'Medium' | 'High',
  regulatory: 'Low' | 'Medium' | 'High',
  conditions: MarketCondition[]
): string {
  let summary = `Market sentiment is ${sentiment.toLowerCase()}. `;

  summary += `Funding environment is ${funding.toLowerCase()}. `;
  summary += `Competitive pressure is ${competitive.toLowerCase()}. `;
  summary += `Regulatory pressure is ${regulatory.toLowerCase()}.`;

  if (conditions.length > 0) {
    const conditionNames = conditions.map(c => c.name).join(', ');
    summary += ` Active conditions: ${conditionNames}.`;
  }

  return summary;
}

export function getMarketConditionSummary(condition: MarketCondition): string {
  const duration = condition.duration_weeks === -1 ? 'ongoing' : `${condition.duration_weeks} weeks`;
  return `${condition.name}: ${condition.description} (Intensity: ${condition.intensity}%, Duration: ${duration})`;
}