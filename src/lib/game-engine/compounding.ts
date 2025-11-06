import { GameState } from '../../types/game-systems';

// Port of Rust compounding effects from src-tauri/src/game/compounding.rs

export interface CompoundingEffect {
  id: string;
  name: string;
  description: string;
  category: 'Revenue' | 'Growth' | 'Efficiency' | 'Quality' | 'Reputation' | 'Team';
  trigger_condition: (state: GameState) => boolean;
  effect: (state: GameState) => void;
  magnitude: number; // 0-100, represents strength of effect
  duration_weeks: number; // -1 for permanent
  stacks: boolean; // whether multiple instances can stack
  active: boolean;
  weeks_active: number;
}

export interface CompoundingResult {
  effects: CompoundingEffect[];
  total_magnitude: number;
  categories_active: string[];
}

export function processCompoundingEffects(state: GameState, effects: CompoundingEffect[]): CompoundingResult {
  // Update existing effects
  for (const effect of effects) {
    if (effect.active) {
      effect.weeks_active++;

      // Deactivate expired effects
      if (effect.duration_weeks > 0 && effect.weeks_active >= effect.duration_weeks) {
        effect.active = false;
      }
    }
  }

  // Check for new effects to activate
  const allEffects = getAllCompoundingEffects();
  for (const effect of allEffects) {
    if (!effects.some(e => e.id === effect.id) && effect.trigger_condition(state)) {
      effect.active = true;
      effect.weeks_active = 0;
      effects.push(effect);
    }
  }

  // Apply active effects
  const activeEffects = effects.filter(e => e.active);
  for (const effect of activeEffects) {
    effect.effect(state);
  }

  const totalMagnitude = activeEffects.reduce((sum, e) => sum + e.magnitude, 0);
  const categoriesActive = [...new Set(activeEffects.map(e => e.category))];

  return {
    effects: activeEffects,
    total_magnitude: totalMagnitude,
    categories_active: categoriesActive,
  };
}

function getAllCompoundingEffects(): CompoundingEffect[] {
  return [
    // Revenue compounding effects
    {
      id: 'revenue_momentum',
      name: 'Revenue Momentum',
      description: 'Consistent revenue growth creates compounding returns',
      category: 'Revenue',
      trigger_condition: (state) => state.mrr > 50000 && state.wau_growth_rate > 10,
      effect: (state) => {
        // Revenue grows faster with momentum
        const bonus = 0.02; // 2% bonus growth
        state.mrr *= (1 + bonus);
      },
      magnitude: 25,
      duration_weeks: -1,
      stacks: false,
      active: false,
      weeks_active: 0,
    },

    {
      id: 'scale_economics',
      name: 'Scale Economics',
      description: 'Larger companies benefit from economies of scale',
      category: 'Revenue',
      trigger_condition: (state) => state.wau > 100000,
      effect: (state) => {
        // Reduce burn rate at scale
        const burnReduction = 0.05; // 5% burn reduction
        state.burn *= (1 - burnReduction);
      },
      magnitude: 30,
      duration_weeks: -1,
      stacks: false,
      active: false,
      weeks_active: 0,
    },

    // Growth compounding effects
    {
      id: 'network_effects',
      name: 'Network Effects',
      description: 'More users attract more users through network effects',
      category: 'Growth',
      trigger_condition: (state) => state.wau > 10000,
      effect: (state) => {
        // Organic growth bonus
        const growthBonus = 0.03; // 3% additional growth
        state.wau_growth_rate += growthBonus;
      },
      magnitude: 35,
      duration_weeks: -1,
      stacks: false,
      active: false,
      weeks_active: 0,
    },

    {
      id: 'viral_coefficient',
      name: 'Viral Growth',
      description: 'Product virality creates exponential user growth',
      category: 'Growth',
      trigger_condition: (state) => state.reputation > 70 && state.nps > 20,
      effect: (state) => {
        // Viral growth bonus
        const viralBonus = 0.05; // 5% viral growth
        state.wau_growth_rate += viralBonus;
      },
      magnitude: 40,
      duration_weeks: -1,
      stacks: false,
      active: false,
      weeks_active: 0,
    },

    // Efficiency compounding effects
    {
      id: 'process_maturity',
      name: 'Process Maturity',
      description: 'Mature processes enable efficient scaling',
      category: 'Efficiency',
      trigger_condition: (state) => state.week > 26 && state.velocity > 1.0,
      effect: (state) => {
        // Velocity bonus from processes
        state.velocity += 0.1;
      },
      magnitude: 20,
      duration_weeks: -1,
      stacks: false,
      active: false,
      weeks_active: 0,
    },

    {
      id: 'automation_benefits',
      name: 'Automation Benefits',
      description: 'Automation reduces manual work and increases efficiency',
      category: 'Efficiency',
      trigger_condition: (state) => state.tech_debt < 30 && state.morale > 60,
      effect: (state) => {
        // Efficiency bonus
        state.velocity += 0.15;
        state.morale += 2; // Automation reduces stress
      },
      magnitude: 25,
      duration_weeks: -1,
      stacks: false,
      active: false,
      weeks_active: 0,
    },

    // Quality compounding effects
    {
      id: 'quality_reputation',
      name: 'Quality Reputation',
      description: 'High quality builds reputation and attracts better customers',
      category: 'Quality',
      trigger_condition: (state) => state.tech_debt < 25 && state.nps > 15,
      effect: (state) => {
        // Reputation growth bonus
        state.reputation += 1.5;
      },
      magnitude: 30,
      duration_weeks: -1,
      stacks: false,
      active: false,
      weeks_active: 0,
    },

    {
      id: 'compound_innovation',
      name: 'Compound Innovation',
      description: 'Quality foundation enables breakthrough innovations',
      category: 'Quality',
      trigger_condition: (state) => state.tech_debt < 20 && state.reputation > 60,
      effect: (state) => {
        // Innovation bonus - higher chance of successful experiments
        // This would be implemented in the experiment logic
      },
      magnitude: 20,
      duration_weeks: -1,
      stacks: false,
      active: false,
      weeks_active: 0,
    },

    // Reputation compounding effects
    {
      id: 'reputation_flywheel',
      name: 'Reputation Flywheel',
      description: 'Good reputation attracts talent, customers, and investors',
      category: 'Reputation',
      trigger_condition: (state) => state.reputation > 60,
      effect: (state) => {
        // Reputation compounds on itself
        state.reputation += 0.5;
        // Bonus effects on hiring and sales
        state.morale += 1; // Better talent
      },
      magnitude: 35,
      duration_weeks: -1,
      stacks: false,
      active: false,
      weeks_active: 0,
    },

    {
      id: 'thought_leadership',
      name: 'Thought Leadership',
      description: 'Industry recognition creates competitive advantages',
      category: 'Reputation',
      trigger_condition: (state) => state.reputation > 75,
      effect: (state) => {
        // Thought leadership benefits
        state.reputation += 1.0;
        state.wau_growth_rate += 0.02;
      },
      magnitude: 40,
      duration_weeks: -1,
      stacks: false,
      active: false,
      weeks_active: 0,
    },

    // Team compounding effects
    {
      id: 'team_compounding',
      name: 'Team Excellence',
      description: 'Great teams get better through experience and cohesion',
      category: 'Team',
      trigger_condition: (state) => state.morale > 70 && state.velocity > 1.0,
      effect: (state) => {
        // Team improvement over time
        state.velocity += 0.05;
        state.morale += 0.5;
      },
      magnitude: 25,
      duration_weeks: -1,
      stacks: false,
      active: false,
      weeks_active: 0,
    },

    {
      id: 'culture_compounding',
      name: 'Company Culture',
      description: 'Strong culture attracts and retains top talent',
      category: 'Team',
      trigger_condition: (state) => state.morale > 75 && state.week > 13,
      effect: (state) => {
        // Culture benefits
        state.morale += 1.0;
        state.velocity += 0.08;
      },
      magnitude: 30,
      duration_weeks: -1,
      stacks: false,
      active: false,
      weeks_active: 0,
    },

    // Temporary compounding effects
    {
      id: 'fundraising_momentum',
      name: 'Fundraising Momentum',
      description: 'Recent fundraising creates temporary growth boost',
      category: 'Growth',
      trigger_condition: (state) => state.bank > 1000000, // Large cash position indicates recent raise
      effect: (state) => {
        // Temporary hiring and marketing boost
        state.velocity += 0.1;
        state.wau_growth_rate += 0.03;
      },
      magnitude: 45,
      duration_weeks: 26, // 6 months
      stacks: false,
      active: false,
      weeks_active: 0,
    },

    {
      id: 'product_launch_boost',
      name: 'Launch Momentum',
      description: 'Recent product launch creates temporary user growth',
      category: 'Growth',
      trigger_condition: (state) => state.momentum > 80,
      effect: (state) => {
        // Launch momentum
        state.wau_growth_rate += 0.04;
        state.reputation += 0.8;
      },
      magnitude: 35,
      duration_weeks: 12, // 3 months
      stacks: false,
      active: false,
      weeks_active: 0,
    },
  ];
}

export function getCompoundingEffectDescription(effect: CompoundingEffect): string {
  const duration = effect.duration_weeks === -1 ? 'permanent' : `${effect.duration_weeks} weeks`;
  const stacking = effect.stacks ? 'stacks' : 'does not stack';

  return `${effect.description} (${duration}, ${stacking})`;
}

export function calculateCompoundingImpact(effects: CompoundingEffect[], state: GameState): {
  revenue_impact: number;
  growth_impact: number;
  efficiency_impact: number;
  quality_impact: number;
} {
  // Calculate the net impact of all active compounding effects
  let revenueImpact = 0;
  let growthImpact = 0;
  let efficiencyImpact = 0;
  let qualityImpact = 0;

  for (const effect of effects.filter(e => e.active)) {
    switch (effect.category) {
      case 'Revenue':
        revenueImpact += effect.magnitude;
        break;
      case 'Growth':
        growthImpact += effect.magnitude;
        break;
      case 'Efficiency':
        efficiencyImpact += effect.magnitude;
        break;
      case 'Quality':
        qualityImpact += effect.magnitude;
        break;
    }
  }

  return {
    revenue_impact: revenueImpact,
    growth_impact: growthImpact,
    efficiency_impact: efficiencyImpact,
    quality_impact: qualityImpact,
  };
}