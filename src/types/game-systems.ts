// TypeScript interfaces for enhanced game systems

export type InsightCategory =
  | 'Morale'
  | 'TechnicalDebt'
  | 'Runway'
  | 'Growth'
  | 'CustomerSatisfaction'
  | 'Velocity'
  | 'Burnout'
  | 'Competition';

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

export type DifficultyMode = 'IndieBootstrap' | 'VCTrack' | 'RegulatedFintech' | 'InfraDevTool';

export type Quality = 'Quick' | 'Balanced' | 'Polish';

export type RefactorDepth = 'Surface' | 'Medium' | 'Deep';

export type ExperimentType = 'Pricing' | 'Onboarding' | 'Channel';

export type ContentType = 'BlogPost' | 'Tutorial' | 'CaseStudy' | 'Video';

export type DevRelEvent = 'Conference' | 'Podcast' | 'OpenSource' | 'Workshop';

export type AdChannel = 'Google' | 'Social' | 'Display' | 'Influencer';

export type CoachingFocus = 'Skills' | 'Morale' | 'Alignment' | 'Performance';

export type FiringReason = 'Performance' | 'Culture' | 'Budget';

export type Action =
  | { ShipFeature: { quality: Quality } }
  | { RefactorCode: { depth: RefactorDepth } }
  | { RunExperiment: { category: ExperimentType } }
  | { FounderLedSales: { call_count: number } }
  | { ContentLaunch: { content_type: ContentType } }
  | { DevRel: { event_type: DevRelEvent } }
  | { PaidAds: { budget: number; channel: AdChannel } }
  | { Hire: null }
  | { Coach: { focus: CoachingFocus } }
  | { Fire: { reason: FiringReason } }
  | { ComplianceWork: { hours: number } }
  | { IncidentResponse: null }
  | { ProcessImprovement: null }
  | { Fundraise: { target: number } }
  | { TakeBreak: null };

export interface GameState {
  game_id: string;
  week: number;
  difficulty: DifficultyMode;
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
  competitors: Competitor[];  // NEW
  player_market_share: number;  // NEW
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

// Competitor tracking system types

export type FundingStage =
  | 'Bootstrapped'
  | 'Seed'
  | 'SeriesA'
  | 'SeriesB'
  | 'SeriesC'
  | 'PublicCompany';

export type PricingStrategy =
  | 'Freemium'
  | 'Undercut'
  | 'Premium'
  | 'Enterprise'
  | 'OpenSource';

export type CompetitorActionType =
  | 'FeatureLaunch'
  | 'PricingChange'
  | 'FundingRound'
  | 'Acquisition'
  | 'ProductPivot'
  | 'MarketingBlitz'
  | 'TalentPoach'
  | 'PartnershipAnnouncement';

export interface CompetitorAction {
  week: number;
  action_type: CompetitorActionType;
  description: string;
  impact_on_player: string;
  amount?: number;
}

export interface Competitor {
  id: string;
  name: string;
  tagline: string;
  funding_stage: FundingStage;
  feature_parity: number;
  pricing_strategy: PricingStrategy;
  market_share: number;
  aggressiveness: number;
  last_action_week: number;
  action_history: CompetitorAction[];
  total_funding: number;
  team_size: number;
  is_acquired: boolean;
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
    case 'Competition':
      return '🏁';
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

// Competitor helper functions

export function getCompetitorsByFunding(competitors: Competitor[], stage: FundingStage): Competitor[] {
  return competitors.filter(c => c.funding_stage === stage);
}

export function getMostThreateningCompetitor(competitors: Competitor[]): Competitor | null {
  const activeCompetitors = getActiveCompetitors(competitors);
  if (activeCompetitors.length === 0) return null;

  return activeCompetitors.reduce((most, current) => {
    const mostThreat = most.feature_parity * most.market_share * most.aggressiveness;
    const currentThreat = current.feature_parity * current.market_share * current.aggressiveness;
    return currentThreat > mostThreat ? current : most;
  });
}

export function getActiveCompetitors(competitors: Competitor[]): Competitor[] {
  return competitors.filter(c => !c.is_acquired);
}

export function getFundingStageIcon(stage: FundingStage): string {
  switch (stage) {
    case 'Bootstrapped':
      return '🚀';
    case 'Seed':
      return '🌱';
    case 'SeriesA':
      return '📈';
    case 'SeriesB':
      return '💰';
    case 'SeriesC':
      return '🏢';
    case 'PublicCompany':
      return '🏛️';
    default:
      return '💼';
  }
}

export function getPricingStrategyIcon(strategy: PricingStrategy): string {
  switch (strategy) {
    case 'Freemium':
      return '🆓';
    case 'Undercut':
      return '📉';
    case 'Premium':
      return '💎';
    case 'Enterprise':
      return '🏢';
    case 'OpenSource':
      return '🔓';
    default:
      return '💰';
  }
}

export function getFundingStageColor(stage: FundingStage): string {
  switch (stage) {
    case 'Bootstrapped':
      return 'gray';
    case 'Seed':
      return 'green';
    case 'SeriesA':
      return 'blue';
    case 'SeriesB':
      return 'purple';
    case 'SeriesC':
      return 'orange';
    case 'PublicCompany':
      return 'red';
    default:
      return 'gray';
  }
}

export function formatFunding(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

export function getCompetitorThreatLevel(competitor: Competitor): 'Low' | 'Medium' | 'High' | 'Critical' {
  const threat = competitor.feature_parity * competitor.market_share * competitor.aggressiveness;
  if (threat > 2000) return 'Critical';
  if (threat > 1000) return 'High';
  if (threat > 500) return 'Medium';
  return 'Low';
}
