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

export interface TurnResult {
  state: any; // GameState from existing types
  insights: WeeklyInsight[];
  warnings: FailureWarning[];
  compounding_bonuses: CompoundingBonus[];
  events: GameEvent[];
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
