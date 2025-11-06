import { GameState, DifficultyMode, Action } from '../../types/game-systems';

// Re-export all functions from individual modules
export { newGame, updateDerivedMetrics, saveSnapshot, advanceWeek, isGameOver, hasWon, isActionUnlocked, getActiveModifiers, calculateMarketAdjustedMetric } from './state';
export { takeTurn, resolveAction } from './actions';
export { checkGameStatus, getAvailableActions } from './victory';
export { generateInsights } from './insights';
export { generateWarnings } from './warnings';
export { processCompoundingEffects, getCompoundingEffectDescription, calculateCompoundingImpact } from './compounding';
export { checkForEvents, applyEventChoice, getEventSummary, getChoiceSummary } from './events';
export { checkActionSynergies, getAllSynergies, applySynergyEffects, getSynergySummary } from './synergies';
export { updateMarketConditions, applyMarketEffects, getMarketStatus, getMarketConditionSummary } from './market-conditions';
export { checkProgressionMilestones, getProgressionStatus, applyProgressionRewards, getAllProgressionMilestones, getProgressionLevelName } from './progression';
export { updateCustomerSegments, acquireCustomers, calculateCustomerMetrics, getInitialCustomerSegments, getCustomerSegmentSummary, calculateCustomerHealthScore, getCustomerInsights } from './customers';
export { updateCompetitors, getCompetitiveLandscape, calculateCompetitivePressure, getCompetitorInsights, simulateCompetitorActions, getCompetitorSummary } from './competitors';