import { GameState, Action } from '../../types/game-systems';

// Port of Rust synergies system from src-tauri/src/game/synergies.rs

export interface ActionSynergy {
  id: string;
  name: string;
  description: string;
  trigger_actions: string[]; // Action types that trigger this synergy
  required_count: number; // Number of trigger actions needed
  time_window_weeks: number; // How many weeks the actions must be within
  effect: (state: GameState, actions: Action[]) => SynergyEffect;
  active: boolean;
  last_triggered: number; // Week when synergy was last triggered
}

export interface SynergyEffect {
  stat_effects: Array<{
    stat_name: string;
    delta: number;
    description: string;
  }>;
  bonus_description: string;
  magnitude: number; // 0-100, strength of synergy
}

export interface SynergyResult {
  synergies_triggered: ActionSynergy[];
  total_effects: Array<{
    stat_name: string;
    total_delta: number;
    descriptions: string[];
  }>;
  synergy_score: number;
}

export function checkActionSynergies(state: GameState, actions: Action[], recentActions: Action[], synergies: ActionSynergy[]): SynergyResult {
  const synergiesTriggered: ActionSynergy[] = [];
  const allEffects: Array<{
    stat_name: string;
    delta: number;
    description: string;
  }> = [];

  // Check each synergy
  for (const synergy of synergies) {
    if (synergy.active) continue; // Already active this week

    const triggerCount = countTriggerActions(actions, synergy.trigger_actions);
    if (triggerCount >= synergy.required_count) {
      // Check time window for recent actions
      const recentTriggerCount = countRecentTriggerActions(recentActions, synergy.trigger_actions, synergy.time_window_weeks, state.week);
      if (recentTriggerCount >= synergy.required_count) {
        // Trigger synergy
        const effect = synergy.effect(state, actions);
        synergiesTriggered.push(synergy);
        synergy.active = true;
        synergy.last_triggered = state.week;

        // Collect effects
        allEffects.push(...effect.stat_effects);
      }
    }
  }

  // Aggregate effects by stat
  const aggregatedEffects = aggregateSynergyEffects(allEffects);
  const synergyScore = synergiesTriggered.reduce((sum, s) => sum + (s.effect(state, actions).magnitude), 0);

  return {
    synergies_triggered: synergiesTriggered,
    total_effects: aggregatedEffects,
    synergy_score: synergyScore,
  };
}

function countTriggerActions(actions: Action[], triggerTypes: string[]): number {
  return actions.filter(action => {
    const actionType = Object.keys(action)[0];
    return triggerTypes.includes(actionType);
  }).length;
}

function countRecentTriggerActions(recentActions: Action[], triggerTypes: string[], timeWindow: number, currentWeek: number): number {
  // Simplified - in real implementation would track action history with timestamps
  return recentActions.filter(action => {
    const actionType = Object.keys(action)[0];
    return triggerTypes.includes(actionType);
  }).length;
}

function aggregateSynergyEffects(effects: Array<{
  stat_name: string;
  delta: number;
  description: string;
}>[]): Array<{
  stat_name: string;
  total_delta: number;
  descriptions: string[];
}> {
  const aggregated = new Map<string, {
    total_delta: number;
    descriptions: string[];
  }>();

  for (const effect of effects) {
    const existing = aggregated.get(effect.stat_name);
    if (existing) {
      existing.total_delta += effect.delta;
      existing.descriptions.push(effect.description);
    } else {
      aggregated.set(effect.stat_name, {
        total_delta: effect.delta,
        descriptions: [effect.description],
      });
    }
  }

  return Array.from(aggregated.entries()).map(([stat_name, data]) => ({
    stat_name,
    total_delta: data.total_delta,
    descriptions: data.descriptions,
  }));
}

export function getAllSynergies(): ActionSynergy[] {
  return [
    // Product Development Synergies
    {
      id: 'product_focus',
      name: 'Product Development Focus',
      description: 'Multiple product-related actions create momentum',
      trigger_actions: ['ShipFeature', 'RefactorCode', 'RunExperiment'],
      required_count: 2,
      time_window_weeks: 4,
      effect: (state, actions) => ({
        stat_effects: [
          { stat_name: 'Velocity', delta: 0.15, description: 'Product focus improves velocity' },
          { stat_name: 'Tech Debt', delta: -3, description: 'Coordinated development reduces debt' },
          { stat_name: 'Momentum', delta: 5, description: 'Product momentum builds' },
        ],
        bonus_description: 'Coordinated product development creates compounding velocity',
        magnitude: 25,
      }),
      active: false,
      last_triggered: 0,
    },

    // Sales and Marketing Synergy
    {
      id: 'growth_engine',
      name: 'Growth Engine',
      description: 'Sales and marketing actions working together',
      trigger_actions: ['FounderLedSales', 'PaidAds', 'ContentLaunch'],
      required_count: 2,
      time_window_weeks: 3,
      effect: (state, actions) => ({
        stat_effects: [
          { stat_name: 'WAU Growth', delta: 4, description: 'Coordinated growth efforts' },
          { stat_name: 'MRR', delta: state.mrr * 0.03, description: 'Growth drives revenue' },
          { stat_name: 'Reputation', delta: 2, description: 'Visible growth attracts attention' },
        ],
        bonus_description: 'Sales and marketing synergy accelerates user acquisition',
        magnitude: 30,
      }),
      active: false,
      last_triggered: 0,
    },

    // Team Building Synergy
    {
      id: 'team_building',
      name: 'Team Building Momentum',
      description: 'Hiring and team development actions compound',
      trigger_actions: ['Hire', 'Coach', 'ProcessImprovement'],
      required_count: 2,
      time_window_weeks: 6,
      effect: (state, actions) => ({
        stat_effects: [
          { stat_name: 'Velocity', delta: 0.2, description: 'Strong team improves productivity' },
          { stat_name: 'Morale', delta: 6, description: 'Team development boosts morale' },
          { stat_name: 'Burn', delta: -2000, description: 'Efficient team reduces costs' },
        ],
        bonus_description: 'Investing in team creates long-term productivity gains',
        magnitude: 35,
      }),
      active: false,
      last_triggered: 0,
    },

    // Fundraising Synergy
    {
      id: 'fundraising_momentum',
      name: 'Fundraising Momentum',
      description: 'Multiple fundraising and preparation actions',
      trigger_actions: ['Fundraise', 'DevRel', 'ContentLaunch'],
      required_count: 2,
      time_window_weeks: 8,
      effect: (state, actions) => ({
        stat_effects: [
          { stat_name: 'Reputation', delta: 5, description: 'Fundraising preparation builds credibility' },
          { stat_name: 'Momentum', delta: 8, description: 'Fundraising momentum' },
          { stat_name: 'Bank', delta: 100000, description: 'Better fundraising outcomes' },
        ],
        bonus_description: 'Preparation activities significantly improve fundraising success',
        magnitude: 40,
      }),
      active: false,
      last_triggered: 0,
    },

    // Crisis Management Synergy
    {
      id: 'crisis_response',
      name: 'Crisis Management',
      description: 'Coordinated response to multiple issues',
      trigger_actions: ['IncidentResponse', 'ComplianceWork', 'Fire'],
      required_count: 2,
      time_window_weeks: 2,
      effect: (state, actions) => ({
        stat_effects: [
          { stat_name: 'Compliance Risk', delta: -8, description: 'Coordinated compliance efforts' },
          { stat_name: 'Tech Debt', delta: -5, description: 'Crisis response improves systems' },
          { stat_name: 'Morale', delta: -3, description: 'Crisis takes toll on team' },
          { stat_name: 'Reputation', delta: 1, description: 'Effective crisis management' },
        ],
        bonus_description: 'Coordinated crisis response minimizes damage',
        magnitude: 20,
      }),
      active: false,
      last_triggered: 0,
    },

    // Quality Focus Synergy
    {
      id: 'quality_first',
      name: 'Quality First Approach',
      description: 'Consistent focus on quality over speed',
      trigger_actions: ['RefactorCode', 'ProcessImprovement', 'Coach'],
      required_count: 3,
      time_window_weeks: 8,
      effect: (state, actions) => ({
        stat_effects: [
          { stat_name: 'Tech Debt', delta: -10, description: 'Quality focus eliminates debt' },
          { stat_name: 'Velocity', delta: 0.1, description: 'Sustainable development pace' },
          { stat_name: 'NPS', delta: 5, description: 'Quality improves customer satisfaction' },
          { stat_name: 'Churn Rate', delta: -1, description: 'Quality reduces churn' },
        ],
        bonus_description: 'Quality-first approach creates sustainable long-term growth',
        magnitude: 45,
      }),
      active: false,
      last_triggered: 0,
    },

    // Aggressive Growth Synergy
    {
      id: 'aggressive_growth',
      name: 'Aggressive Growth Mode',
      description: 'All-in focus on user acquisition and revenue',
      trigger_actions: ['FounderLedSales', 'PaidAds', 'Hire', 'Fundraise'],
      required_count: 3,
      time_window_weeks: 4,
      effect: (state, actions) => ({
        stat_effects: [
          { stat_name: 'WAU Growth', delta: 8, description: 'Aggressive acquisition works' },
          { stat_name: 'MRR', delta: state.mrr * 0.05, description: 'Growth drives revenue' },
          { stat_name: 'Burn', delta: 8000, description: 'Growth requires investment' },
          { stat_name: 'Tech Debt', delta: 6, description: 'Fast growth adds technical debt' },
          { stat_name: 'Morale', delta: -4, description: 'Aggressive pace stresses team' },
        ],
        bonus_description: 'Aggressive growth can create market leadership quickly',
        magnitude: 50,
      }),
      active: false,
      last_triggered: 0,
    },

    // Balanced Approach Synergy
    {
      id: 'balanced_execution',
      name: 'Balanced Execution',
      description: 'Mix of product, sales, and team development',
      trigger_actions: ['ShipFeature', 'FounderLedSales', 'Hire', 'Coach'],
      required_count: 3,
      time_window_weeks: 6,
      effect: (state, actions) => ({
        stat_effects: [
          { stat_name: 'Velocity', delta: 0.12, description: 'Balanced approach sustains velocity' },
          { stat_name: 'Morale', delta: 4, description: 'Balanced workload maintains morale' },
          { stat_name: 'MRR', delta: state.mrr * 0.02, description: 'Balanced growth' },
          { stat_name: 'WAU Growth', delta: 2, description: 'Sustainable user growth' },
        ],
        bonus_description: 'Balanced execution creates sustainable, predictable growth',
        magnitude: 30,
      }),
      active: false,
      last_triggered: 0,
    },

    // Take Break Recovery Synergy
    {
      id: 'recovery_mode',
      name: 'Recovery Mode',
      description: 'Taking breaks and team care after intense periods',
      trigger_actions: ['TakeBreak', 'Coach', 'ProcessImprovement'],
      required_count: 2,
      time_window_weeks: 4,
      effect: (state, actions) => ({
        stat_effects: [
          { stat_name: 'Morale', delta: 12, description: 'Recovery restores team energy' },
          { stat_name: 'Velocity', delta: 0.08, description: 'Rested team performs better' },
          { stat_name: 'Burn', delta: -1000, description: 'Recovery reduces turnover costs' },
        ],
        bonus_description: 'Proper recovery prevents burnout and maintains long-term productivity',
        magnitude: 25,
      }),
      active: false,
      last_triggered: 0,
    },
  ];
}

export function applySynergyEffects(state: GameState, synergyResult: SynergyResult): void {
  for (const effect of synergyResult.total_effects) {
    switch (effect.stat_name) {
      case 'MRR':
        state.mrr += effect.total_delta;
        break;
      case 'WAU':
        state.wau = Math.floor(state.wau + effect.total_delta);
        break;
      case 'Bank':
        state.bank += effect.total_delta;
        break;
      case 'Burn':
        state.burn += effect.total_delta;
        break;
      case 'Morale':
        state.morale += effect.total_delta;
        break;
      case 'Reputation':
        state.reputation += effect.total_delta;
        break;
      case 'Tech Debt':
        state.tech_debt += effect.total_delta;
        break;
      case 'Velocity':
        state.velocity += effect.total_delta;
        break;
      case 'Compliance Risk':
        state.compliance_risk += effect.total_delta;
        break;
      case 'Churn Rate':
        state.churn_rate += effect.total_delta;
        break;
      case 'WAU Growth':
        state.wau_growth_rate += effect.total_delta;
        break;
      case 'Momentum':
        state.momentum += effect.total_delta;
        break;
      case 'NPS':
        state.nps += effect.total_delta;
        break;
      default:
        console.warn(`Unknown synergy stat: ${effect.stat_name}`);
    }
  }
}

export function getSynergySummary(synergy: ActionSynergy): string {
  return `${synergy.name}: ${synergy.description} (Requires ${synergy.required_count} actions within ${synergy.time_window_weeks} weeks)`;
}