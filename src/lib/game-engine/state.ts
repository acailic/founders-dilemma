import { GameState, DifficultyMode, EscapeVelocityProgress, GameStateHistoryEntry, MarketCondition, SpecializationPath, Competitor } from '../../types/game-systems';

// Port of Rust GameState structure and logic from src-tauri/src/game/state.rs

export function newGame(difficulty: DifficultyMode): GameState {
  const bank = getStartingBank(difficulty);
  const burn = getStartingBurn(difficulty);
  const runway_months = bank / burn;

  const state: GameState = {
    game_id: generateGameId(),
    week: 0,
    difficulty,
    started_at: Date.now(),
    bank,
    burn,
    runway_months,
    focus_slots: 3,
    mrr: 0.0,
    wau: 100,
    wau_growth_rate: 0.0,
    churn_rate: 5.0,
    morale: 80.0,
    reputation: 50.0,
    nps: 0.0,
    tech_debt: 10.0,
    compliance_risk: getComplianceBurden(difficulty),
    velocity: 1.0,
    founder_equity: 100.0,
    option_pool: 0.0,
    momentum: 0.0,
    escape_velocity_progress: {
      revenue_covers_burn: false,
      growth_sustained: false,
      customer_love: false,
      founder_healthy: false,
      streak_weeks: 0,
    },
    history: [],
    unlocked_actions: [
      "ShipFeature",
      "FounderLedSales",
      "Hire",
      "Fundraise",
      "TakeBreak",
    ],
    active_market_conditions: [],
    specialization_path: null,
    team_size: 1,
    incident_count: 0,
    last_break_week: 0,
    competitors: generateCompetitors(difficulty, 0),
    player_market_share: 50.0,
  };

  updateDerivedMetrics(state);
  saveSnapshot(state);
  return state;
}

export function updateDerivedMetrics(state: GameState): void {
  // Update runway
  if (state.burn > 0.0) {
    state.runway_months = state.bank / state.burn;
  } else {
    state.runway_months = Infinity;
  }

  // Update momentum (compound score)
  state.momentum = (state.wau_growth_rate / 100.0 + 1.0) * state.velocity * (state.morale / 100.0);

  // Clamp values to valid ranges
  state.morale = Math.max(0, Math.min(100, state.morale));
  state.reputation = Math.max(0, Math.min(100, state.reputation));
  state.nps = Math.max(-100, Math.min(100, state.nps));
  state.tech_debt = Math.max(0, Math.min(100, state.tech_debt));
  state.compliance_risk = Math.max(0, Math.min(100, state.compliance_risk));
  state.velocity = Math.max(0.1, Math.min(3.0, state.velocity));
  state.churn_rate = Math.max(0, Math.min(100, state.churn_rate));
}

export function saveSnapshot(state: GameState): void {
  const snapshot: GameStateHistoryEntry = {
    week: state.week,
    bank: state.bank,
    mrr: state.mrr,
    burn: state.burn,
    wau: state.wau,
    morale: state.morale,
    reputation: state.reputation,
    momentum: state.momentum,
  };
  state.history.push(snapshot);

  // Keep only last 52 weeks (1 year) in history
  if (state.history.length > 52) {
    state.history.shift();
  }
}

export function advanceWeek(state: GameState): void {
  state.week += 1;

  // Apply weekly costs
  const weekly_burn = state.burn / 4.0;
  state.bank -= weekly_burn;

  // Apply weekly revenue
  const weekly_mrr = state.mrr / 4.0;
  state.bank += weekly_mrr;

  // Apply growth
  const prev_wau = state.wau;
  state.wau = Math.floor(state.wau * (1.0 + state.wau_growth_rate / 100.0));

  // Calculate actual growth rate
  if (prev_wau > 0) {
    state.wau_growth_rate = ((state.wau - prev_wau) / prev_wau) * 100.0;
  }

  // Natural morale decay
  state.morale -= 0.5;

  // Tech debt slightly increases if velocity is high
  if (state.velocity > 1.2) {
    state.tech_debt += 0.5;
  }

  // Update market conditions
  updateMarketConditions(state);

  // Update derived metrics
  updateDerivedMetrics(state);

  // Save snapshot
  saveSnapshot(state);
}

export function isGameOver(state: GameState): boolean {
  // Loss conditions
  if (state.runway_months <= 0.0 || state.bank <= 0.0) return true;
  if (state.morale <= 0.0) return true;
  if (state.reputation <= 10.0) return true;

  // Win condition
  if (state.escape_velocity_progress.streak_weeks >= 12) return true;

  return false;
}

export function hasWon(state: GameState): boolean {
  return state.escape_velocity_progress.streak_weeks >= 12;
}

export function isActionUnlocked(state: GameState, action: string): boolean {
  return state.unlocked_actions.includes(action);
}

export function getActiveModifiers(state: GameState): Array<[string, number]> {
  const modifiers: Array<[string, number]> = [];
  for (const condition of state.active_market_conditions) {
    for (const modifier of condition.modifiers) {
      modifiers.push([modifier.stat_affected, modifier.multiplier]);
    }
  }
  return modifiers;
}

export function calculateMarketAdjustedMetric(state: GameState, baseValue: number, metric: string): number {
  let adjusted = baseValue;
  for (const condition of state.active_market_conditions) {
    for (const modifier of condition.modifiers) {
      if (modifier.stat_affected === metric) {
        adjusted *= modifier.multiplier;
      }
    }
  }
  return adjusted;
}

// Helper functions

function generateGameId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getStartingBank(difficulty: DifficultyMode): number {
  switch (difficulty) {
    case 'IndieBootstrap': return 50_000.0;
    case 'VCTrack': return 1_000_000.0;
    case 'RegulatedFintech': return 500_000.0;
    case 'InfraDevTool': return 300_000.0;
    default: return 50_000.0;
  }
}

function getStartingBurn(difficulty: DifficultyMode): number {
  switch (difficulty) {
    case 'IndieBootstrap': return 8_000.0;
    case 'VCTrack': return 80_000.0;
    case 'RegulatedFintech': return 40_000.0;
    case 'InfraDevTool': return 25_000.0;
    default: return 8_000.0;
  }
}

function getComplianceBurden(difficulty: DifficultyMode): number {
  switch (difficulty) {
    case 'IndieBootstrap': return 20.0;
    case 'VCTrack': return 30.0;
    case 'RegulatedFintech': return 80.0;
    case 'InfraDevTool': return 40.0;
    default: return 20.0;
  }
}

function generateCompetitors(difficulty: DifficultyMode, week: number): Competitor[] {
  // Simplified competitor generation for web version
  // In a full implementation, this would mirror the Rust logic
  return [
    {
      id: 'competitor-1',
      name: 'TechCorp',
      tagline: 'Enterprise Solutions',
      funding_stage: 'SeriesA',
      feature_parity: 0.7,
      pricing_strategy: 'Premium',
      market_share: 25.0,
      aggressiveness: 0.6,
      last_action_week: 0,
      action_history: [],
      total_funding: 10_000_000,
      team_size: 50,
      is_acquired: false,
    },
    {
      id: 'competitor-2',
      name: 'StartupXYZ',
      tagline: 'Modern Platform',
      funding_stage: 'Seed',
      feature_parity: 0.5,
      pricing_strategy: 'Freemium',
      market_share: 15.0,
      aggressiveness: 0.8,
      last_action_week: 0,
      action_history: [],
      total_funding: 2_000_000,
      team_size: 15,
      is_acquired: false,
    },
  ];
}

function updateMarketConditions(state: GameState): void {
  // Decrement duration for all active conditions
  for (const condition of state.active_market_conditions) {
    if (condition.duration_weeks > 0) {
      condition.duration_weeks -= 1;
    }
  }

  // Remove expired conditions
  state.active_market_conditions = state.active_market_conditions.filter(condition => condition.duration_weeks > 0);
}