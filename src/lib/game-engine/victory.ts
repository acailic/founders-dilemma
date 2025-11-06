import { GameState, DifficultyMode } from '../../types/game-systems';

// Port of Rust victory conditions from src-tauri/src/game/victory.rs

export interface VictoryCondition {
  name: string;
  description: string;
  check: (state: GameState) => boolean;
  progress: (state: GameState) => number; // 0-100
}

export interface GameStatus {
  game_over: boolean;
  victory: boolean;
  message: string;
  conditions: VictoryCondition[];
}

export function checkGameStatus(state: GameState): GameStatus {
  // Check loss conditions first
  if (state.bank < 0) {
    return {
      game_over: true,
      victory: false,
      message: "Game Over: Ran out of money",
      conditions: getVictoryConditions(state),
    };
  }

  if (state.morale <= 0) {
    return {
      game_over: true,
      victory: false,
      message: "Game Over: Team morale collapsed",
      conditions: getVictoryConditions(state),
    };
  }

  if (state.compliance_risk >= 100) {
    return {
      game_over: true,
      victory: false,
      message: "Game Over: Compliance violations shut down the company",
      conditions: getVictoryConditions(state),
    };
  }

  // Check victory conditions
  const conditions = getVictoryConditions(state);
  const metConditions = conditions.filter(condition => condition.check(state));

  if (metConditions.length > 0) {
    const condition = metConditions[0]!; // We know this exists due to length check
    return {
      game_over: true,
      victory: true,
      message: `Victory: ${condition.name}`,
      conditions,
    };
  }

  // Game continues
  return {
    game_over: false,
    victory: false,
    message: "Game continues",
    conditions,
  };
}

function getVictoryConditions(state: GameState): VictoryCondition[] {
  const conditions: VictoryCondition[] = [];

  // Revenue-based victories
  conditions.push({
    name: "Revenue Milestone",
    description: "Reach $1M ARR",
    check: (state) => state.mrr >= 1000000,
    progress: (state) => Math.min(100, (state.mrr / 1000000) * 100),
  });

  conditions.push({
    name: "Scale Revenue",
    description: "Reach $10M ARR",
    check: (state) => state.mrr >= 10000000,
    progress: (state) => Math.min(100, (state.mrr / 10000000) * 100),
  });

  // User-based victories
  conditions.push({
    name: "Product-Market Fit",
    description: "Reach 10K WAU",
    check: (state) => state.wau >= 10000,
    progress: (state) => Math.min(100, (state.wau / 10000) * 100),
  });

  conditions.push({
    name: "Scale Users",
    description: "Reach 100K WAU",
    check: (state) => state.wau >= 100000,
    progress: (state) => Math.min(100, (state.wau / 100000) * 100),
  });

  // Reputation-based victories
  conditions.push({
    name: "Industry Recognition",
    description: "Reach 80 reputation",
    check: (state) => state.reputation >= 80,
    progress: (state) => Math.min(100, (state.reputation / 80) * 100),
  });

  conditions.push({
    name: "Market Leadership",
    description: "Reach 95 reputation",
    check: (state) => state.reputation >= 95,
    progress: (state) => Math.min(100, (state.reputation / 95) * 100),
  });

  // Time-based victories (difficulty-dependent)
  const timeLimit = getTimeLimit(state.difficulty);
  conditions.push({
    name: "IPO Ready",
    description: `Reach IPO metrics within ${timeLimit} weeks`,
    check: (state) => state.week <= timeLimit && checkIPOMetrics(state),
    progress: (state) => {
      if (state.week > timeLimit) return 0;
      const timeProgress = ((timeLimit - state.week) / timeLimit) * 100;
      const metricsProgress = checkIPOMetrics(state) ? 100 : 50;
      return Math.min(timeProgress, metricsProgress);
    },
  });

  // Sustainability victories
  conditions.push({
    name: "Sustainable Growth",
    description: "Maintain positive cash flow for 12 weeks",
    check: (state) => checkSustainableGrowth(state),
    progress: (state) => {
      // Simplified progress calculation
      const cashFlowPositive = state.mrr >= state.burn;
      const weeksPositive = cashFlowPositive ? Math.min(12, state.week) : 0;
      return (weeksPositive / 12) * 100;
    },
  });

  // Special victories based on difficulty
  switch (state.difficulty) {
    case 'IndieBootstrap':
      conditions.push({
        name: "Indie Success",
        description: "Reach $100K ARR without external funding",
        check: (state) => state.mrr >= 100000 && state.founder_equity >= 95,
        progress: (state) => Math.min(100, (state.mrr / 100000) * 100),
      });
      break;

    case 'VCTrack':
      conditions.push({
        name: "VC Exit",
        description: "Reach $50M valuation",
        check: (state) => calculateValuation(state) >= 50000000,
        progress: (state) => Math.min(100, (calculateValuation(state) / 50000000) * 100),
      });
      break;

    case 'RegulatedFintech':
      conditions.push({
        name: "Fintech Compliance",
        description: "Reach $5M ARR with low compliance risk",
        check: (state) => state.mrr >= 5000000 && state.compliance_risk <= 20,
        progress: (state) => {
          const revenueProgress = Math.min(100, (state.mrr / 5000000) * 100);
          const riskProgress = Math.max(0, 100 - state.compliance_risk);
          return Math.min(revenueProgress, riskProgress);
        },
      });
      break;

    case 'InfraDevTool':
      conditions.push({
        name: "Enterprise Adoption",
        description: "Reach 50K WAU with high reputation",
        check: (state) => state.wau >= 50000 && state.reputation >= 85,
        progress: (state) => {
          const userProgress = Math.min(100, (state.wau / 50000) * 100);
          const repProgress = Math.min(100, (state.reputation / 85) * 100);
          return Math.min(userProgress, repProgress);
        },
      });
      break;
  }

  return conditions;
}

function getTimeLimit(difficulty: DifficultyMode): number {
  switch (difficulty) {
    case 'IndieBootstrap': return 104; // 2 years
    case 'VCTrack': return 78; // 18 months
    case 'RegulatedFintech': return 130; // 2.5 years
    case 'InfraDevTool': return 156; // 3 years
  }
}

function checkIPOMetrics(state: GameState): boolean {
  return (
    state.mrr >= 10000000 && // $10M ARR
    state.wau >= 100000 && // 100K WAU
    state.reputation >= 90 && // High reputation
    state.tech_debt <= 30 && // Manageable tech debt
    state.compliance_risk <= 15 && // Low compliance risk
    state.nps >= 30 // Good NPS
  );
}

function checkSustainableGrowth(state: GameState): boolean {
  // Simplified check - in real implementation would track cash flow history
  return state.mrr >= state.burn && state.bank > 0 && state.morale >= 50;
}

function calculateValuation(state: GameState): number {
  // Simplified DCF valuation
  const revenue_multiple = state.reputation / 10.0; // Higher reputation = higher multiple
  const growth_factor = Math.max(0.1, state.wau_growth_rate / 100.0);
  const risk_adjustment = 1.0 - (state.tech_debt / 200.0) - (state.compliance_risk / 200.0);

  const base_valuation = state.mrr * 12 * revenue_multiple * growth_factor * risk_adjustment;

  return Math.max(1000000, base_valuation); // Minimum $1M valuation
}

export function getAvailableActions(state: GameState): string[] {
  const actions: string[] = [];

  // Always available actions
  actions.push('ShipFeature');
  actions.push('FounderLedSales');
  actions.push('Hire');
  actions.push('Fundraise');
  actions.push('RefactorCode');
  actions.push('RunExperiment');
  actions.push('ContentLaunch');
  actions.push('DevRel');
  actions.push('PaidAds');
  actions.push('Coach');
  actions.push('ProcessImprovement');
  actions.push('TakeBreak');

  // Conditional actions
  if (state.compliance_risk > 30) {
    actions.push('ComplianceWork');
  }

  if (state.tech_debt > 50) {
    actions.push('IncidentResponse');
  }

  if (state.morale < 30) {
    actions.push('Fire');
  }

  return actions;
}

export function getMarketStatus(state: GameState): any {
  // Simplified market status
  const market_demand = Math.max(0, Math.min(100, 50 + (state.reputation - 50) + (state.momentum - 50)));
  const competition_level = Math.max(0, Math.min(100, 30 + (state.week / 2)));
  const funding_environment = Math.max(0, Math.min(100, 60 + Math.sin(state.week / 10) * 20));

  return {
    market_demand,
    competition_level,
    funding_environment,
    trends: generateMarketTrends(state),
  };
}

function generateMarketTrends(state: GameState): string[] {
  const trends: string[] = [];

  if (state.reputation > 70) {
    trends.push("High reputation attracting top talent");
  }

  if (state.wau_growth_rate > 20) {
    trends.push("Strong user growth signaling product-market fit");
  }

  if (state.tech_debt > 60) {
    trends.push("Technical debt may slow future development");
  }

  if (state.compliance_risk > 40) {
    trends.push("Regulatory scrutiny increasing in your sector");
  }

  if (state.momentum > 70) {
    trends.push("Strong momentum - consider fundraising");
  }

  return trends;
}