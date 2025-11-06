import { GameState } from '../../types/game-systems';

// Port of Rust economy system from src-tauri/src/game/economy.rs

export function calculateWeeklyRevenue(state: GameState): number {
  // Typically state.mrr / 4 with modifiers
  return state.mrr / 4.0;
}

export function calculateWeeklyBurn(state: GameState): number {
  // Typically state.burn / 4 with modifiers
  return state.burn / 4.0;
}

export function applyChurn(state: GameState): void {
  // Apply monthly churn to state.mrr based on state.churn_rate and any market/quality modifiers
  const churnAmount = state.mrr * (state.churn_rate / 100.0) / 12.0; // Monthly churn
  state.mrr -= churnAmount;
}

export function calculateChurnRate(state: GameState): number {
  // Derive current churn from inputs (e.g., NPS, tech debt, market conditions)
  // This is a simplified implementation - full version would consider multiple factors
  return state.churn_rate;
}

export function updateNps(state: GameState): void {
  // Move state.nps gradually toward a target derived from quality and satisfaction inputs
  const qualityFactor = (100.0 - state.tech_debt) / 100.0;
  const satisfactionFactor = state.morale / 100.0;
  const targetNps = (qualityFactor * satisfactionFactor * 60.0) - 20.0; // Range: -20 to 40

  // Gradual movement toward target
  const delta = (targetNps - state.nps) * 0.1;
  state.nps += delta;
}