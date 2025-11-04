// TypeScript interfaces for enhanced game systems

export type InsightCategory =
  | 'Morale'
  | 'TechnicalDebt'
  | 'Runway'
  | 'Growth'
  | 'CustomerSatisfaction'
  | 'Velocity'
  | 'Burnout';

export type InsightSeverity = 'Info' | 'Warning' | 'Critical';

export interface WeeklyInsight {
  category: InsightCategory;
  title: string;
  observation: string;
  insight: string;
  action_suggestion: string;
  severity: InsightSeverity;
}

export interface EscapeVelocityProgress {
  revenue_covers_burn: boolean;
  growth_sustained: boolean;
  customer_love: boolean;
  founder_healthy: boolean;
  streak_weeks: number;
}

export interface GameStateHistoryEntry {
  week: number;
  bank: number;
  mrr: number;
  burn: number;
  wau: number;
  morale: number;
  reputation: number;
  momentum: number;
}

export interface GameState {
  game_id: string;
  week: number;
  difficulty: string;
  started_at: number;
  bank: number;
  burn: number;
  runway_months: number;
  focus_slots: number;
  mrr: number;
  wau: number;
  wau_growth_rate: number;
  churn_rate: number;
  morale: number;
  reputation: number;
  nps: number;
  tech_debt: number;
  compliance_risk: number;
  velocity: number;
  founder_equity: number;
  option_pool: number;
  momentum: number;
  escape_velocity_progress: EscapeVelocityProgress;
  history: GameStateHistoryEntry[];
  unlocked_actions: string[];  // NEW
  active_market_conditions: MarketCondition[];  // NEW
  specialization_path: SpecializationPath | null;  // NEW
  team_size: number;  // NEW
  incident_count: number;  // NEW
  last_break_week: number;  // NEW
}

export type WarningSeverity = 'Watch' | 'Caution' | 'Danger' | 'Critical';

export interface WarningSign {
  week: number;
  observation: string;
  indicator_level: number; // 0-100
}

export interface FailureWarning {
  risk_id: string;
  title: string;
  current_status: string;
  warning_signs: WarningSign[];
  projected_outcome: string;
  lesson: string;
  weeks_until_critical: number | null;
  severity: WarningSeverity;
}

export interface StatBonus {
  stat_name: string;
  bonus_amount: number;
  is_multiplier: boolean;
}

export interface CompoundingBonus {
  effect_id: string;
  name: string;
  message: string;
  bonuses: StatBonus[];
}

export interface EventEffect {
  stat_name: string;
  change: number;
  description: string;
}

export interface EventChoice {
  label: string;
  description: string;
  short_term: string;
  long_term: string;
  wisdom: string;
  effects: EventEffect[];
}

export interface GameEvent {
  id: string;
  week: number;
  title: string;
  description: string;
  event_type: {
    Automatic?: { effects: EventEffect[] };
    Dilemma?: { choices: EventChoice[] };
  };
}

export interface ActionSynergy {
  id: string;
  name: string;
  description: string;
  bonus_effects: SynergyEffect[];
}

export interface SynergyEffect {
  stat_name: string;
  bonus_amount: number;
  description: string;
}

export interface MarketCondition {
  id: string;
  name: string;
  description: string;
  duration_weeks: number;
  modifiers: MarketModifier[];
  icon: string;
}

export interface MarketModifier {
  stat_affected: string;
  multiplier: number;
  description: string;
}

export type SpecializationPath = 
  | 'ProductExcellence' 
  | 'GrowthHacking' 
  | 'OperationalEfficiency' 
  | 'CustomerObsessed';

export interface MilestoneEvent {
  week: number;
  title: string;
  description: string;
  rewards: string[];
}

export interface UnlockedAction {
  action_name: string;
  unlocked_at_week: number;
  unlock_reason: string;
}

export interface TurnResult {
  state: GameState;
  insights: WeeklyInsight[];
  warnings: FailureWarning[];
  compounding_bonuses: CompoundingBonus[];
  events: GameEvent[];
  synergies: ActionSynergy[];  // NEW
  market_conditions: MarketCondition[];  // NEW
  unlocked_actions: string[];  // NEW
  milestone_event: MilestoneEvent | null;  // NEW
  specialization_bonus: SpecializationPath | null;  // NEW
}

// Helper functions for UI

export function getSeverityColor(severity: InsightSeverity | WarningSeverity): string {
  switch (severity) {
    case 'Info':
    case 'Watch':
      return 'blue';
    case 'Warning':
    case 'Caution':
      return 'yellow';
    case 'Critical':
    case 'Danger':
      return 'red';
    default:
      return 'gray';
  }
}

export function getSeverityIcon(severity: InsightSeverity | WarningSeverity): string {
  switch (severity) {
    case 'Info':
    case 'Watch':
      return 'ℹ️';
    case 'Warning':
    case 'Caution':
      return '⚠️';
    case 'Critical':
    case 'Danger':
      return '🚨';
    default:
      return '📌';
  }
}

export function getCategoryIcon(category: InsightCategory): string {
  switch (category) {
    case 'Morale':
      return '💪';
    case 'TechnicalDebt':
      return '⚙️';
    case 'Runway':
      return '💰';
    case 'Growth':
      return '📈';
    case 'CustomerSatisfaction':
      return '❤️';
    case 'Velocity':
      return '⚡';
    case 'Burnout':
      return '🔥';
    default:
      return '📊';
  }
}

export function getSpecializationIcon(path: SpecializationPath): string {
  switch (path) {
    case 'ProductExcellence':
      return '🎨';
    case 'GrowthHacking':
      return '📈';
    case 'OperationalEfficiency':
      return '⚙️';
    case 'CustomerObsessed':
      return '❤️';
    default:
      return '🎯';
  }
}

export function getSpecializationDescription(path: SpecializationPath): string {
  switch (path) {
    case 'ProductExcellence':
      return 'Focus on building exceptional products with high velocity and low tech debt.';
    case 'GrowthHacking':
      return 'Prioritize user acquisition and retention through marketing and sales efforts.';
    case 'OperationalEfficiency':
      return 'Optimize processes and reduce costs to maximize runway and sustainability.';
    case 'CustomerObsessed':
      return 'Build deep customer relationships and high satisfaction for long-term loyalty.';
    default:
      return 'A balanced approach to startup growth and management.';
  }
}

export function getMarketConditionColor(condition: MarketCondition): string {
  const totalMultiplier = condition.modifiers.reduce((sum, mod) => sum + mod.multiplier, 0);
  if (totalMultiplier > 1.1) return 'green';
  if (totalMultiplier < 0.9) return 'red';
  return 'yellow';
}

export function formatSynergyBonus(synergy: ActionSynergy): string {
  const bonuses = synergy.bonus_effects.map(effect => `${effect.description} (+${effect.bonus_amount})`).join(', ');
  return `${synergy.name}: ${bonuses}`;
}
