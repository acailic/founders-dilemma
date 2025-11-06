import { GameState, DifficultyMode } from '../../types/game-systems';

// Port of Rust progression system from src-tauri/src/game/progression.rs

export interface ProgressionMilestone {
  id: string;
  name: string;
  description: string;
  category: 'Revenue' | 'Users' | 'Team' | 'Product' | 'Funding' | 'Reputation';
  threshold: number;
  reward: ProgressionReward;
  unlocked: boolean;
  achieved_week: number;
}

export interface ProgressionReward {
  type: 'Action' | 'Bonus' | 'Unlock' | 'Modifier';
  value: string;
  description: string;
  permanent: boolean;
}

export interface ProgressionStatus {
  milestones: ProgressionMilestone[];
  completed_count: number;
  total_count: number;
  current_level: number;
  next_level_threshold: number;
  available_rewards: ProgressionReward[];
}

export function checkProgressionMilestones(state: GameState, milestones: ProgressionMilestone[]): ProgressionMilestone[] {
  for (const milestone of milestones) {
    if (!milestone.unlocked && checkMilestoneCondition(state, milestone)) {
      milestone.unlocked = true;
      milestone.achieved_week = state.week;
    }
  }

  return milestones;
}

function checkMilestoneCondition(state: GameState, milestone: ProgressionMilestone): boolean {
  switch (milestone.id) {
    // Revenue milestones
    case 'first_revenue': return state.mrr >= 1000;
    case 'profitability': return state.mrr >= state.burn;
    case 'million_arr': return state.mrr >= 1000000;
    case 'scale_revenue': return state.mrr >= 10000000;

    // User milestones
    case 'first_users': return state.wau >= 100;
    case 'product_market_fit': return state.wau >= 1000 && state.churn_rate <= 5;
    case 'scale_users': return state.wau >= 10000;
    case 'massive_scale': return state.wau >= 100000;

    // Team milestones
    case 'first_hire': return state.burn >= 15000; // Rough proxy for having employees
    case 'team_of_10': return state.burn >= 150000; // Rough proxy
    case 'high_morale': return state.morale >= 80;
    case 'peak_performance': return state.velocity >= 1.5 && state.morale >= 70;

    // Product milestones
    case 'technical_foundation': return state.tech_debt <= 20;
    case 'quality_product': return state.nps >= 40;
    case 'market_leader': return state.reputation >= 90;

    // Funding milestones
    case 'first_funding': return state.bank >= 100000 && state.founder_equity < 95;
    case 'series_a': return state.bank >= 1000000 && state.founder_equity < 90;
    case 'well_funded': return state.bank >= 5000000;

    // Reputation milestones
    case 'recognized': return state.reputation >= 50;
    case 'respected': return state.reputation >= 70;
    case 'legendary': return state.reputation >= 95;

    default: return false;
  }
}

export function getProgressionStatus(state: GameState, milestones: ProgressionMilestone[]): ProgressionStatus {
  const completed = milestones.filter(m => m.unlocked);
  const completedCount = completed.length;
  const totalCount = milestones.length;

  // Calculate level based on completed milestones
  const currentLevel = Math.floor(completedCount / 5) + 1;
  const nextLevelThreshold = (currentLevel * 5);

  // Get available rewards from completed milestones
  const availableRewards = completed
    .filter(m => m.reward.permanent || m.achieved_week === state.week)
    .map(m => m.reward);

  return {
    milestones,
    completed_count: completedCount,
    total_count: totalCount,
    current_level: currentLevel,
    next_level_threshold: nextLevelThreshold,
    available_rewards: availableRewards,
  };
}

export function applyProgressionRewards(state: GameState, rewards: ProgressionReward[]): void {
  for (const reward of rewards) {
    applyProgressionReward(state, reward);
  }
}

function applyProgressionReward(state: GameState, reward: ProgressionReward): void {
  switch (reward.type) {
    case 'Bonus':
      applyBonusReward(state, reward.value);
      break;
    case 'Modifier':
      applyModifierReward(state, reward.value);
      break;
    case 'Unlock':
      // Unlocks would be handled in the UI/action system
      break;
    case 'Action':
      // Action unlocks would be handled in the action system
      break;
  }
}

function applyBonusReward(state: GameState, value: string): void {
  switch (value) {
    case 'cash_bonus_10k':
      state.bank += 10000;
      break;
    case 'cash_bonus_50k':
      state.bank += 50000;
      break;
    case 'cash_bonus_100k':
      state.bank += 100000;
      break;
    case 'morale_boost':
      state.morale = Math.min(100, state.morale + 10);
      break;
    case 'reputation_boost':
      state.reputation = Math.min(100, state.reputation + 5);
      break;
    case 'velocity_boost':
      state.velocity += 0.1;
      break;
  }
}

function applyModifierReward(state: GameState, value: string): void {
  // Modifiers would be applied as ongoing effects
  // This is a simplified implementation
  switch (value) {
    case 'reduced_churn':
      state.churn_rate = Math.max(0, state.churn_rate - 1);
      break;
    case 'improved_efficiency':
      state.velocity += 0.05;
      break;
    case 'better_fundraising':
      // Would affect fundraising success rates
      break;
  }
}

export function getAllProgressionMilestones(difficulty: DifficultyMode): ProgressionMilestone[] {
  const baseMilestones: ProgressionMilestone[] = [
    // Revenue milestones
    {
      id: 'first_revenue',
      name: 'First Revenue',
      description: 'Generate your first $1K in monthly recurring revenue',
      category: 'Revenue',
      threshold: 1000,
      reward: {
        type: 'Bonus',
        value: 'morale_boost',
        description: 'Team morale increases from first revenue milestone',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'profitability',
      name: 'Break Even',
      description: 'Achieve profitability (MRR >= monthly burn)',
      category: 'Revenue',
      threshold: 0, // Calculated
      reward: {
        type: 'Bonus',
        value: 'cash_bonus_10k',
        description: 'Profitability milestone bonus',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'million_arr',
      name: 'Million Dollar Company',
      description: 'Reach $1M in annual recurring revenue',
      category: 'Revenue',
      threshold: 1000000,
      reward: {
        type: 'Unlock',
        value: 'advanced_actions',
        description: 'Unlock advanced strategic actions',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'scale_revenue',
      name: 'Scale Revenue',
      description: 'Reach $10M in annual recurring revenue',
      category: 'Revenue',
      threshold: 10000000,
      reward: {
        type: 'Bonus',
        value: 'cash_bonus_100k',
        description: 'Major revenue milestone achievement',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },

    // User milestones
    {
      id: 'first_users',
      name: 'First Users',
      description: 'Reach 100 weekly active users',
      category: 'Users',
      threshold: 100,
      reward: {
        type: 'Bonus',
        value: 'reputation_boost',
        description: 'User traction builds reputation',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'product_market_fit',
      name: 'Product-Market Fit',
      description: 'Reach 1K users with churn rate ≤5%',
      category: 'Users',
      threshold: 1000,
      reward: {
        type: 'Modifier',
        value: 'reduced_churn',
        description: 'Product-market fit reduces churn permanently',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'scale_users',
      name: 'Scale Users',
      description: 'Reach 10K weekly active users',
      category: 'Users',
      threshold: 10000,
      reward: {
        type: 'Unlock',
        value: 'scaling_actions',
        description: 'Unlock enterprise-focused actions',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'massive_scale',
      name: 'Massive Scale',
      description: 'Reach 100K weekly active users',
      category: 'Users',
      threshold: 100000,
      reward: {
        type: 'Bonus',
        value: 'cash_bonus_50k',
        description: 'Massive scale achievement bonus',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },

    // Team milestones
    {
      id: 'first_hire',
      name: 'First Hire',
      description: 'Hire your first team member',
      category: 'Team',
      threshold: 15000, // Burn proxy
      reward: {
        type: 'Modifier',
        value: 'improved_efficiency',
        description: 'First hire improves team efficiency',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'team_of_10',
      name: 'Team of 10',
      description: 'Build a team of 10 people',
      category: 'Team',
      threshold: 150000, // Burn proxy
      reward: {
        type: 'Bonus',
        value: 'velocity_boost',
        description: 'Larger team accelerates development',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'high_morale',
      name: 'High Morale',
      description: 'Maintain team morale above 80',
      category: 'Team',
      threshold: 80,
      reward: {
        type: 'Modifier',
        value: 'improved_efficiency',
        description: 'High morale improves productivity',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'peak_performance',
      name: 'Peak Performance',
      description: 'Achieve high velocity (1.5x) with good morale (70+)',
      category: 'Team',
      threshold: 0, // Calculated
      reward: {
        type: 'Bonus',
        value: 'morale_boost',
        description: 'Peak performance celebrated by team',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },

    // Product milestones
    {
      id: 'technical_foundation',
      name: 'Technical Foundation',
      description: 'Keep technical debt below 20',
      category: 'Product',
      threshold: 20,
      reward: {
        type: 'Modifier',
        value: 'improved_efficiency',
        description: 'Strong technical foundation enables faster development',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'quality_product',
      name: 'Quality Product',
      description: 'Achieve NPS of 40 or higher',
      category: 'Product',
      threshold: 40,
      reward: {
        type: 'Modifier',
        value: 'reduced_churn',
        description: 'Quality product retains more customers',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'market_leader',
      name: 'Market Leader',
      description: 'Achieve reputation score of 90+',
      category: 'Product',
      threshold: 90,
      reward: {
        type: 'Bonus',
        value: 'reputation_boost',
        description: 'Market leadership attracts premium opportunities',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },

    // Funding milestones
    {
      id: 'first_funding',
      name: 'First Funding',
      description: 'Raise your first round of external funding',
      category: 'Funding',
      threshold: 100000,
      reward: {
        type: 'Bonus',
        value: 'cash_bonus_10k',
        description: 'Funding success bonus',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'series_a',
      name: 'Series A',
      description: 'Raise Series A funding',
      category: 'Funding',
      threshold: 1000000,
      reward: {
        type: 'Modifier',
        value: 'better_fundraising',
        description: 'Series A success improves future fundraising',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'well_funded',
      name: 'Well Funded',
      description: 'Accumulate $5M+ in funding',
      category: 'Funding',
      threshold: 5000000,
      reward: {
        type: 'Bonus',
        value: 'cash_bonus_50k',
        description: 'Strong funding position bonus',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },

    // Reputation milestones
    {
      id: 'recognized',
      name: 'Industry Recognition',
      description: 'Achieve reputation score of 50+',
      category: 'Reputation',
      threshold: 50,
      reward: {
        type: 'Bonus',
        value: 'reputation_boost',
        description: 'Recognition opens new opportunities',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'respected',
      name: 'Industry Respect',
      description: 'Achieve reputation score of 70+',
      category: 'Reputation',
      threshold: 70,
      reward: {
        type: 'Modifier',
        value: 'better_fundraising',
        description: 'Respect improves fundraising outcomes',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
    {
      id: 'legendary',
      name: 'Legendary Status',
      description: 'Achieve reputation score of 95+',
      category: 'Reputation',
      threshold: 95,
      reward: {
        type: 'Bonus',
        value: 'cash_bonus_100k',
        description: 'Legendary status attracts premium opportunities',
        permanent: true,
      },
      unlocked: false,
      achieved_week: 0,
    },
  ];

  // Difficulty-specific milestones
  const difficultyMilestones = getDifficultyMilestones(difficulty);

  return [...baseMilestones, ...difficultyMilestones];
}

function getDifficultyMilestones(difficulty: DifficultyMode): ProgressionMilestone[] {
  switch (difficulty) {
    case 'IndieBootstrap':
      return [
        {
          id: 'indie_success',
          name: 'Indie Success',
          description: 'Reach $100K ARR without external funding',
          category: 'Revenue',
          threshold: 100000,
          reward: {
            type: 'Bonus',
            value: 'cash_bonus_50k',
            description: 'Bootstrapping success celebrated',
            permanent: true,
          },
          unlocked: false,
          achieved_week: 0,
        },
      ];

    case 'VCTrack':
      return [
        {
          id: 'vc_exit',
          name: 'VC Exit',
          description: 'Reach $50M valuation for successful exit',
          category: 'Funding',
          threshold: 50000000,
          reward: {
            type: 'Bonus',
            value: 'cash_bonus_100k',
            description: 'Successful exit bonus',
            permanent: true,
          },
          unlocked: false,
          achieved_week: 0,
        },
      ];

    case 'RegulatedFintech':
      return [
        {
          id: 'compliance_mastery',
          name: 'Compliance Mastery',
          description: 'Achieve $5M ARR with compliance risk below 20',
          category: 'Product',
          threshold: 5000000,
          reward: {
            type: 'Modifier',
            value: 'reduced_churn',
            description: 'Regulatory confidence reduces customer churn',
            permanent: true,
          },
          unlocked: false,
          achieved_week: 0,
        },
      ];

    case 'InfraDevTool':
      return [
        {
          id: 'enterprise_adoption',
          name: 'Enterprise Adoption',
          description: 'Reach 50K users with reputation above 85',
          category: 'Users',
          threshold: 50000,
          reward: {
            type: 'Modifier',
            value: 'improved_efficiency',
            description: 'Enterprise customers provide stability and efficiency',
            permanent: true,
          },
          unlocked: false,
          achieved_week: 0,
        },
      ];

    default:
      return [];
  }
}

export function getProgressionLevelName(level: number): string {
  const names = [
    'Startup',
    'Growing',
    'Established',
    'Scaling',
    'Mature',
    'Industry Leader',
    'Legendary',
  ];

  return names[Math.min(level - 1, names.length - 1)] || 'Legendary';
}