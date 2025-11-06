import { GameState, DifficultyMode, Action } from '../../types/game-systems';

// Re-export all functions from individual modules
export { newGame, updateDerivedMetrics, saveSnapshot, advanceWeek, isGameOver, hasWon, isActionUnlocked, getActiveModifiers, calculateMarketAdjustedMetric } from './state';
export { takeTurn, resolveAction } from './actions';
export { checkGameStatus, getAvailableActions, getMarketStatus as getVictoryMarketStatus } from './victory';
export { generateInsights } from './insights';
export { generateWarnings } from './warnings';
export { processCompoundingEffects, getCompoundingEffectDescription, calculateCompoundingImpact } from './compounding';
export { checkForEvents, applyEventChoice, getEventSummary, getChoiceSummary } from './events';
export { checkActionSynergies, getAllSynergies, applySynergyEffects, getSynergySummary } from './synergies';
export { updateMarketConditions, applyMarketEffects, getMarketStatus, getMarketConditionSummary } from './market-conditions';
export { checkProgressionMilestones, getProgressionStatus, applyProgressionRewards, getAllProgressionMilestones, getProgressionLevelName } from './progression';
export { updateCustomerSegments, acquireCustomers, calculateCustomerMetrics, getInitialCustomerSegments, getCustomerSegmentSummary, calculateCustomerHealthScore, getCustomerInsights } from './customers';
export { updateCompetitors, getCompetitiveLandscape, calculateCompetitivePressure, getCompetitorInsights, simulateCompetitorActions, getCompetitorSummary } from './competitors';

// Convenience function that combines all weekly processing
export function processWeek(state: GameState, actions: Action[]): any {
  // Process actions
  const turnResult = takeTurn(state, actions);

  // Update market conditions
  const marketConditions: any[] = []; // Would be passed in from persistent state
  updateMarketConditions(state, marketConditions);

  // Update customers
  const customerSegments: any[] = []; // Would be passed in from persistent state
  updateCustomerSegments(state, customerSegments);

  // Update competitors
  const competitors: any[] = []; // Would be passed in from persistent state
  updateCompetitors(state, competitors);

  // Check progression
  const milestones: any[] = []; // Would be passed in from persistent state
  checkProgressionMilestones(state, milestones);

  // Generate insights
  const prevState = JSON.parse(JSON.stringify(state));
  advanceWeek(state); // Advance week after capturing previous state
  const insights = generateInsights(prevState, state);

  // Generate warnings
  const warnings = generateWarnings(state);

  // Process compounding effects
  const compoundingEffects: any[] = []; // Would be passed in from persistent state
  const compoundingResult = processCompoundingEffects(state, compoundingEffects);

  return {
    state,
    insights,
    warnings,
    compounding_bonuses: compoundingResult.effects,
  };
}