import { GameState, Action, Quality, RefactorDepth, ExperimentType, ContentType, DevRelEvent, AdChannel, CoachingFocus, FiringReason } from '../../types/game-systems';

// Port of Rust action resolution logic from src-tauri/src/game/actions.rs

export interface ActionResult {
  success: boolean;
  message: string;
  effects: StatEffect[];
}

export interface StatEffect {
  stat_name: string;
  old_value: number;
  new_value: number;
  delta: number;
}

export interface ExperimentResult {
  success: boolean;
  insight: string;
  effects: StatEffect[];
}

export function takeTurn(state: GameState, actions: Action[]): any {
  // Clone state for comparison
  const prevState = JSON.parse(JSON.stringify(state));

  // Process actions
  for (const action of actions) {
    resolveAction(state, action);
  }

  // Apply weekly mechanics
  applyChurn(state);
  updateNPS(state);

  // Advance to next week
  advanceWeek(state);

  // Generate insights and other results
  // This is a simplified version - full implementation would include all the complex logic
  const insights = generateInsights(prevState, state);
  const warnings: any[] = [];
  const compoundingBonuses: any[] = [];
  const events: any[] = [];
  const synergies: any[] = [];
  const marketConditions: any[] = [];
  const unlockedActions: string[] = [];
  const milestoneEvent = null;
  const specializationBonus = null;

  return {
    state,
    insights,
    warnings,
    compounding_bonuses: compoundingBonuses,
    events,
    synergies,
    market_conditions: marketConditions,
    unlocked_actions: unlockedActions,
    milestone_event: milestoneEvent,
    specialization_bonus: specializationBonus,
  };
}

export function resolveAction(state: GameState, action: Action): ActionResult {
  const effects: StatEffect[] = [];

  if ('ShipFeature' in action) {
    return resolveShipFeature(state, action.ShipFeature.quality, effects);
  } else if ('FounderLedSales' in action) {
    return resolveFounderLedSales(state, action.FounderLedSales.call_count, effects);
  } else if ('Hire' in action) {
    return resolveHire(state, effects);
  } else if ('Fundraise' in action) {
    return resolveFundraise(state, action.Fundraise.target, effects);
  } else if ('RefactorCode' in action) {
    return resolveRefactorCode(state, action.RefactorCode.depth, effects);
  } else if ('RunExperiment' in action) {
    return resolveRunExperiment(state, action.RunExperiment.category, effects);
  } else if ('ContentLaunch' in action) {
    return resolveContentLaunch(state, action.ContentLaunch.content_type, effects);
  } else if ('DevRel' in action) {
    return resolveDevRel(state, action.DevRel.event_type, effects);
  } else if ('PaidAds' in action) {
    return resolvePaidAds(state, action.PaidAds.budget, action.PaidAds.channel, effects);
  } else if ('Coach' in action) {
    return resolveCoach(state, action.Coach.focus, effects);
  } else if ('Fire' in action) {
    return resolveFire(state, action.Fire.reason, effects);
  } else if ('ComplianceWork' in action) {
    return resolveComplianceWork(state, action.ComplianceWork.hours, effects);
  } else if ('IncidentResponse' in action) {
    return resolveIncidentResponse(state, effects);
  } else if ('ProcessImprovement' in action) {
    return resolveProcessImprovement(state, effects);
  } else if ('TakeBreak' in action) {
    return resolveTakeBreak(state, effects);
  }

  return {
    success: false,
    message: 'Unknown action',
    effects: [],
  };
}

function resolveShipFeature(state: GameState, quality: Quality, effects: StatEffect[]): ActionResult {
  const message = getShipFeatureMessage(quality);

  // Base effects with variance
  const { wau_boost, debt_change, morale_change } = getShipFeatureEffects(quality);

  // Apply effects
  const old_wau = state.wau;
  state.wau = Math.floor(state.wau * (1.0 + wau_boost / 100.0));
  effects.push({
    stat_name: "WAU",
    old_value: old_wau,
    new_value: state.wau,
    delta: state.wau - old_wau,
  });

  const old_debt = state.tech_debt;
  state.tech_debt += debt_change;
  effects.push({
    stat_name: "Tech Debt",
    old_value: old_debt,
    new_value: state.tech_debt,
    delta: debt_change,
  });

  const old_morale = state.morale;
  state.morale += morale_change;
  effects.push({
    stat_name: "Morale",
    old_value: old_morale,
    new_value: state.morale,
    delta: morale_change,
  });

  // Update velocity based on tech debt
  const old_velocity = state.velocity;
  state.velocity = 1.0 - (state.tech_debt / 200.0);
  effects.push({
    stat_name: "Velocity",
    old_value: old_velocity,
    new_value: state.velocity,
    delta: state.velocity - old_velocity,
  });

  return {
    success: true,
    message,
    effects,
  };
}

function resolveFounderLedSales(state: GameState, call_count: number, effects: StatEffect[]): ActionResult {
  const message = `Made ${call_count} sales calls this week`;

  // Each call has a chance to convert
  const conversion_rate = 0.05 + (state.reputation / 200.0);
  const base_deal_size = 500.0;

  let new_mrr = 0.0;
  let conversions = 0;

  for (let i = 0; i < call_count; i++) {
    if (Math.random() < conversion_rate) {
      const deal_size = base_deal_size * (0.8 + Math.random() * 0.4);
      new_mrr += deal_size;
      conversions++;
    }
  }

  const old_mrr = state.mrr;
  state.mrr += new_mrr;
  effects.push({
    stat_name: "MRR",
    old_value: old_mrr,
    new_value: state.mrr,
    delta: new_mrr,
  });

  // Sales takes energy
  const morale_cost = call_count * 0.5;
  const old_morale = state.morale;
  state.morale -= morale_cost;
  effects.push({
    stat_name: "Morale",
    old_value: old_morale,
    new_value: state.morale,
    delta: -morale_cost,
  });

  // Small reputation gain
  const old_rep = state.reputation;
  state.reputation += 1.0;
  effects.push({
    stat_name: "Reputation",
    old_value: old_rep,
    new_value: state.reputation,
    delta: 1.0,
  });

  const success_message = conversions > 0
    ? `Closed ${conversions} deals worth $${new_mrr.toFixed(0)}/mo!`
    : message;

  return {
    success: conversions > 0,
    message: success_message,
    effects,
  };
}

function resolveHire(state: GameState, effects: StatEffect[]): ActionResult {
  const message = "Hired a new team member";

  // Hiring costs
  const salary = 10_000.0;
  const old_burn = state.burn;
  state.burn += salary;
  effects.push({
    stat_name: "Monthly Burn",
    old_value: old_burn,
    new_value: state.burn,
    delta: salary,
  });

  // Velocity boost
  const old_velocity = state.velocity;
  state.velocity += 0.1;
  effects.push({
    stat_name: "Velocity",
    old_value: old_velocity,
    new_value: state.velocity,
    delta: 0.1,
  });

  // Morale boost
  const old_morale = state.morale;
  state.morale += 5.0;
  effects.push({
    stat_name: "Morale",
    old_value: old_morale,
    new_value: state.morale,
    delta: 5.0,
  });

  return {
    success: true,
    message,
    effects,
  };
}

function resolveFundraise(state: GameState, target: number, effects: StatEffect[]): ActionResult {
  // Simplified fundraising
  const success_chance = 0.3 + (state.reputation / 200.0) + (state.momentum / 100.0);
  const success = Math.random() < success_chance;

  if (success) {
    const dilution = (target / 5_000_000.0) * 20.0;

    const old_bank = state.bank;
    state.bank += target;
    effects.push({
      stat_name: "Bank",
      old_value: old_bank,
      new_value: state.bank,
      delta: target,
    });

    const old_equity = state.founder_equity;
    state.founder_equity -= dilution;
    effects.push({
      stat_name: "Founder Equity",
      old_value: old_equity,
      new_value: state.founder_equity,
      delta: -dilution,
    });

    return {
      success: true,
      message: `Raised $${(target / 1000).toFixed(0)}K! Dilution: ${dilution.toFixed(1)}%`,
      effects,
    };
  } else {
    // Morale hit from failed fundraise
    const old_morale = state.morale;
    state.morale -= 10.0;
    effects.push({
      stat_name: "Morale",
      old_value: old_morale,
      new_value: state.morale,
      delta: -10.0,
    });

    return {
      success: false,
      message: "Fundraising failed - investors passed",
      effects,
    };
  }
}

function resolveRefactorCode(state: GameState, depth: RefactorDepth, effects: StatEffect[]): ActionResult {
  const message = getRefactorMessage(depth);

  const { debt_reduction, velocity_gain, morale_cost } = calculateRefactorImpact(depth, state.tech_debt);

  const old_debt = state.tech_debt;
  state.tech_debt -= debt_reduction;
  effects.push({
    stat_name: "Tech Debt",
    old_value: old_debt,
    new_value: state.tech_debt,
    delta: -debt_reduction,
  });

  const old_velocity = state.velocity;
  state.velocity += velocity_gain;
  effects.push({
    stat_name: "Velocity",
    old_value: old_velocity,
    new_value: state.velocity,
    delta: velocity_gain,
  });

  const old_morale = state.morale;
  state.morale -= morale_cost;
  effects.push({
    stat_name: "Morale",
    old_value: old_morale,
    new_value: state.morale,
    delta: -morale_cost,
  });

  return {
    success: true,
    message,
    effects,
  };
}

function resolveRunExperiment(state: GameState, category: ExperimentType, effects: StatEffect[]): ActionResult {
  const result = calculateExperimentOutcome(category, state);
  const message = `Ran ${category.toLowerCase()} experiment: ${result.insight}`;

  for (const effect of result.effects) {
    switch (effect.stat_name) {
      case "MRR": state.mrr = effect.new_value; break;
      case "WAU": state.wau = effect.new_value; break;
      case "Churn Rate": state.churn_rate = effect.new_value; break;
      case "Morale": state.morale = effect.new_value; break;
      case "Reputation": state.reputation = effect.new_value; break;
    }
    effects.push(effect);
  }

  return {
    success: result.success,
    message,
    effects,
  };
}

function resolveContentLaunch(state: GameState, content_type: ContentType, effects: StatEffect[]): ActionResult {
  const message = `Launched ${content_type.toLowerCase().replace('_', ' ')} content`;

  const { wau_gain, rep_gain } = calculateContentReach(content_type, state.reputation);

  const old_wau = state.wau;
  state.wau = Math.floor(state.wau + wau_gain);
  effects.push({
    stat_name: "WAU",
    old_value: old_wau,
    new_value: state.wau,
    delta: wau_gain,
  });

  const old_rep = state.reputation;
  state.reputation += rep_gain;
  effects.push({
    stat_name: "Reputation",
    old_value: old_rep,
    new_value: state.reputation,
    delta: rep_gain,
  });

  return {
    success: true,
    message,
    effects,
  };
}

function resolveDevRel(state: GameState, event_type: DevRelEvent, effects: StatEffect[]): ActionResult {
  const message = `Participated in ${event_type.toLowerCase()} event`;

  const { rep_gain, wau_gain, morale_boost } = getDevRelEffects(event_type);

  const old_rep = state.reputation;
  state.reputation += rep_gain;
  effects.push({
    stat_name: "Reputation",
    old_value: old_rep,
    new_value: state.reputation,
    delta: rep_gain,
  });

  const old_wau = state.wau;
  state.wau = Math.floor(state.wau + wau_gain);
  effects.push({
    stat_name: "WAU",
    old_value: old_wau,
    new_value: state.wau,
    delta: wau_gain,
  });

  const old_morale = state.morale;
  state.morale += morale_boost;
  effects.push({
    stat_name: "Morale",
    old_value: old_morale,
    new_value: state.morale,
    delta: morale_boost,
  });

  return {
    success: true,
    message,
    effects,
  };
}

function resolvePaidAds(state: GameState, budget: number, channel: AdChannel, effects: StatEffect[]): ActionResult {
  const message = `Ran ads on ${channel.toLowerCase()} with $${budget.toFixed(0)} budget`;

  const wau_gain = calculateAdEffectiveness(channel, budget);

  const old_wau = state.wau;
  state.wau = Math.floor(state.wau + wau_gain);
  effects.push({
    stat_name: "WAU",
    old_value: old_wau,
    new_value: state.wau,
    delta: wau_gain,
  });

  const old_bank = state.bank;
  state.bank -= budget;
  effects.push({
    stat_name: "Bank",
    old_value: old_bank,
    new_value: state.bank,
    delta: -budget,
  });

  return {
    success: wau_gain > 0,
    message,
    effects,
  };
}

function resolveCoach(state: GameState, focus: CoachingFocus, effects: StatEffect[]): ActionResult {
  const message = `Coached team on ${focus.toLowerCase()}`;

  const { velocity_boost, morale_boost } = getCoachingEffects(focus);

  const velocity_gain = velocity_boost * (0.9 + Math.random() * 0.2);
  const old_velocity = state.velocity;
  state.velocity += velocity_gain;
  effects.push({
    stat_name: "Velocity",
    old_value: old_velocity,
    new_value: state.velocity,
    delta: velocity_gain,
  });

  const morale_gain = morale_boost * (0.9 + Math.random() * 0.2);
  const old_morale = state.morale;
  state.morale += morale_gain;
  effects.push({
    stat_name: "Morale",
    old_value: old_morale,
    new_value: state.morale,
    delta: morale_gain,
  });

  return {
    success: true,
    message,
    effects,
  };
}

function resolveFire(state: GameState, reason: FiringReason, effects: StatEffect[]): ActionResult {
  const message = `Fired employee for ${reason.toLowerCase()}`;

  const { burn_reduction, morale_hit, velocity_hit } = getFiringEffects(reason);

  const old_burn = state.burn;
  state.burn -= burn_reduction;
  effects.push({
    stat_name: "Monthly Burn",
    old_value: old_burn,
    new_value: state.burn,
    delta: -burn_reduction,
  });

  const old_morale = state.morale;
  state.morale += morale_hit;
  effects.push({
    stat_name: "Morale",
    old_value: old_morale,
    new_value: state.morale,
    delta: morale_hit,
  });

  const old_velocity = state.velocity;
  state.velocity += velocity_hit;
  effects.push({
    stat_name: "Velocity",
    old_value: old_velocity,
    new_value: state.velocity,
    delta: velocity_hit,
  });

  return {
    success: true,
    message,
    effects,
  };
}

function resolveComplianceWork(state: GameState, hours: number, effects: StatEffect[]): ActionResult {
  const message = `Spent ${hours} hours on compliance work`;

  const risk_reduction = hours * 2.0 * (0.9 + Math.random() * 0.2);
  const old_risk = state.compliance_risk;
  state.compliance_risk -= risk_reduction;
  effects.push({
    stat_name: "Compliance Risk",
    old_value: old_risk,
    new_value: state.compliance_risk,
    delta: -risk_reduction,
  });

  const morale_cost = hours * 0.3 * (0.9 + Math.random() * 0.2);
  const old_morale = state.morale;
  state.morale -= morale_cost;
  effects.push({
    stat_name: "Morale",
    old_value: old_morale,
    new_value: state.morale,
    delta: -morale_cost,
  });

  return {
    success: true,
    message,
    effects,
  };
}

function resolveIncidentResponse(state: GameState, effects: StatEffect[]): ActionResult {
  const message = "Responded to incident - contained damage";

  const rep_loss = 5.0 * (0.8 + Math.random() * 0.4);
  const old_rep = state.reputation;
  state.reputation -= rep_loss;
  effects.push({
    stat_name: "Reputation",
    old_value: old_rep,
    new_value: state.reputation,
    delta: -rep_loss,
  });

  const morale_cost = 15.0 * (0.9 + Math.random() * 0.2);
  const old_morale = state.morale;
  state.morale -= morale_cost;
  effects.push({
    stat_name: "Morale",
    old_value: old_morale,
    new_value: state.morale,
    delta: -morale_cost,
  });

  return {
    success: true,
    message,
    effects,
  };
}

function resolveProcessImprovement(state: GameState, effects: StatEffect[]): ActionResult {
  const message = "Implemented process improvements";

  const velocity_boost = 0.08 * (0.9 + Math.random() * 0.2);
  const old_velocity = state.velocity;
  state.velocity += velocity_boost;
  effects.push({
    stat_name: "Velocity",
    old_value: old_velocity,
    new_value: state.velocity,
    delta: velocity_boost,
  });

  const morale_boost = 3.0 * (0.9 + Math.random() * 0.2);
  const old_morale = state.morale;
  state.morale += morale_boost;
  effects.push({
    stat_name: "Morale",
    old_value: old_morale,
    new_value: state.morale,
    delta: morale_boost,
  });

  return {
    success: true,
    message,
    effects,
  };
}

function resolveTakeBreak(state: GameState, effects: StatEffect[]): ActionResult {
  const message = "Took a break to recharge";

  // Restore morale
  const old_morale = state.morale;
  state.morale += 15.0;
  effects.push({
    stat_name: "Morale",
    old_value: old_morale,
    new_value: state.morale,
    delta: 15.0,
  });

  // Slight momentum loss
  const momentum_loss = 2.0;
  const old_wau_growth = state.wau_growth_rate;
  state.wau_growth_rate -= momentum_loss;
  effects.push({
    stat_name: "WAU Growth",
    old_value: old_wau_growth,
    new_value: state.wau_growth_rate,
    delta: -momentum_loss,
  });

  return {
    success: true,
    message,
    effects,
  };
}

// Helper functions

function getShipFeatureMessage(quality: Quality): string {
  switch (quality) {
    case 'Quick': return "Shipped feature quickly - gained momentum but added tech debt";
    case 'Balanced': return "Shipped feature with balanced approach";
    case 'Polish': return "Polished feature launch - high quality, slower delivery";
  }
}

function getShipFeatureEffects(quality: Quality): { wau_boost: number; debt_change: number; morale_change: number } {
  const base_wau = quality === 'Quick' ? 3.0 : quality === 'Balanced' ? 4.0 : 2.0;
  const wau_boost = base_wau + (Math.random() - 0.5) * 2.0;

  const base_debt = quality === 'Quick' ? 6.0 : quality === 'Balanced' ? 2.0 : -3.0;
  const debt_change = base_debt + (Math.random() - 0.5) * 2.0;

  const base_morale = quality === 'Quick' ? -1.0 : quality === 'Balanced' ? 1.0 : 3.0;
  const morale_change = base_morale + (Math.random() - 0.5) * 1.0;

  return { wau_boost, debt_change, morale_change };
}

function getRefactorMessage(depth: RefactorDepth): string {
  switch (depth) {
    case 'Surface': return "Did surface-level refactoring";
    case 'Medium': return "Conducted medium-depth refactoring";
    case 'Deep': return "Performed deep code refactoring";
  }
}

function calculateRefactorImpact(depth: RefactorDepth, current_debt: number): { debt_reduction: number; velocity_gain: number; morale_cost: number } {
  const base_reduction = depth === 'Surface' ? 10.0 : depth === 'Medium' ? 20.0 : 35.0;
  const debt_modifier = current_debt > 50.0 ? 1.2 : 1.0;
  const debt_reduction = base_reduction * debt_modifier * (0.8 + Math.random() * 0.4);

  const velocity_gain = (depth === 'Surface' ? 0.05 : depth === 'Medium' ? 0.12 : 0.2) * (0.9 + Math.random() * 0.2);

  const morale_cost = (depth === 'Surface' ? 2.0 : depth === 'Medium' ? 5.0 : 10.0) * (0.9 + Math.random() * 0.2);

  return { debt_reduction, velocity_gain, morale_cost };
}

function calculateExperimentOutcome(category: ExperimentType, state: GameState): ExperimentResult {
  const success = Math.random() < 0.6;

  if (success) {
    switch (category) {
      case 'Pricing': {
        const mrr_boost = state.mrr * 0.05 * (0.8 + Math.random() * 0.4);
        return {
          success: true,
          insight: "Found optimal pricing tier - increased conversion",
          effects: [{
            stat_name: "MRR",
            old_value: state.mrr,
            new_value: state.mrr + mrr_boost,
            delta: mrr_boost,
          }],
        };
      }
      case 'Onboarding': {
        const wau_boost = (state.wau * 0.03) * (0.8 + Math.random() * 0.4);
        return {
          success: true,
          insight: "Streamlined onboarding - reduced churn",
          effects: [
            {
              stat_name: "WAU",
              old_value: state.wau,
              new_value: state.wau + wau_boost,
              delta: wau_boost,
            },
            {
              stat_name: "Churn Rate",
              old_value: state.churn_rate,
              new_value: state.churn_rate * 0.95,
              delta: state.churn_rate * -0.05,
            },
          ],
        };
      }
      case 'Channel': {
        const rep_boost = 5.0 * (0.8 + Math.random() * 0.4);
        return {
          success: true,
          insight: "Discovered high-converting channel",
          effects: [{
            stat_name: "Reputation",
            old_value: state.reputation,
            new_value: state.reputation + rep_boost,
            delta: rep_boost,
          }],
        };
      }
    }
  } else {
    return {
      success: false,
      insight: "Experiment failed - learned what not to do",
      effects: [{
        stat_name: "Morale",
        old_value: state.morale,
        new_value: state.morale - 2.0,
        delta: -2.0,
      }],
    };
  }
}

function calculateContentReach(content_type: ContentType, reputation: number): { wau_gain: number; rep_gain: number } {
  const base_wau = content_type === 'BlogPost' ? 2.0 : content_type === 'Tutorial' ? 4.0 : content_type === 'CaseStudy' ? 3.0 : 5.0;
  const rep_modifier = reputation / 100.0;
  const wau_gain = base_wau * (0.8 + rep_modifier) * (0.8 + Math.random() * 0.4);

  const rep_gain = (content_type === 'BlogPost' ? 2.0 : content_type === 'Tutorial' ? 3.0 : content_type === 'CaseStudy' ? 4.0 : 5.0) * (0.9 + Math.random() * 0.2);

  return { wau_gain, rep_gain };
}

function getDevRelEffects(event_type: DevRelEvent): { rep_gain: number; wau_gain: number; morale_boost: number } {
  const rep_gain = (event_type === 'Conference' ? 12.0 : event_type === 'Podcast' ? 8.0 : event_type === 'OpenSource' ? 6.0 : 10.0) * (0.9 + Math.random() * 0.2);
  const wau_gain = rep_gain * 0.5 * (0.8 + Math.random() * 0.4);
  const morale_boost = 5.0 * (0.9 + Math.random() * 0.2);

  return { rep_gain, wau_gain, morale_boost };
}

function calculateAdEffectiveness(channel: AdChannel, budget: number): number {
  const base_effectiveness = channel === 'Google' ? 0.8 : channel === 'Social' ? 1.0 : channel === 'Display' ? 0.6 : 1.2;
  const effectiveness = base_effectiveness * (0.8 + Math.random() * 0.4);
  return effectiveness * budget / 10000.0;
}

function getCoachingEffects(focus: CoachingFocus): { velocity_boost: number; morale_boost: number } {
  switch (focus) {
    case 'Skills': return { velocity_boost: 0.08, morale_boost: 2.0 };
    case 'Morale': return { velocity_boost: 0.02, morale_boost: 8.0 };
    case 'Alignment': return { velocity_boost: 0.05, morale_boost: 4.0 };
    case 'Performance': return { velocity_boost: 0.1, morale_boost: 3.0 };
  }
}

function getFiringEffects(reason: FiringReason): { burn_reduction: number; morale_hit: number; velocity_hit: number } {
  const burn_reduction = 8000.0 * (0.8 + Math.random() * 0.4);
  const [morale_hit, velocity_hit] = reason === 'Performance' ? [-8.0, -0.05] : reason === 'Culture' ? [-12.0, -0.08] : [-5.0, -0.02];
  return { burn_reduction, morale_hit, velocity_hit };
}

function applyChurn(state: GameState): void {
  // Simplified churn application
  const churn_amount = state.mrr * (state.churn_rate / 100.0) / 12.0; // Monthly churn
  state.mrr -= churn_amount;
}

function updateNPS(state: GameState): void {
  // Simplified NPS update based on product quality and customer satisfaction
  const quality_factor = (100.0 - state.tech_debt) / 100.0;
  const satisfaction_factor = state.morale / 100.0;
  const target_nps = (quality_factor * satisfaction_factor * 60.0) - 20.0; // Range: -20 to 40

  // Gradual movement toward target
  const delta = (target_nps - state.nps) * 0.1;
  state.nps += delta;
}

function advanceWeek(state: GameState): void {
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
}

function generateInsights(prevState: GameState, currentState: GameState): any[] {
  // Simplified insights generation
  const insights = [];

  if (currentState.morale < prevState.morale - 5) {
    insights.push({
      category: 'Morale',
      title: 'Morale Declining',
      observation: 'Team morale has dropped significantly this week',
      insight: 'High workload and stress are affecting team performance',
      action_suggestion: 'Consider taking a break or hiring additional help',
      severity: 'Warning',
    });
  }

  if (currentState.tech_debt > prevState.tech_debt + 10) {
    insights.push({
      category: 'TechnicalDebt',
      title: 'Technical Debt Increasing',
      observation: 'Technical debt has grown considerably',
      insight: 'Fast shipping is creating maintainability issues',
      action_suggestion: 'Schedule time for refactoring and code cleanup',
      severity: 'Warning',
    });
  }

  return insights;
}