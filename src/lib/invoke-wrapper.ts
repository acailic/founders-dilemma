import { GameState, DifficultyMode, Action } from '../types/game-systems';
import * as gameEngine from './game-engine';

// Type definitions for Tauri invoke
interface InvokeOptions {
  cmd: string;
  [key: string]: any;
}

// Check if running in Tauri environment
export function isTauri(): boolean {
  return typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined;
}

// Generic invoke function that routes between Tauri and TypeScript implementations
async function invoke<T = any>(options: InvokeOptions): Promise<T> {
  if (isTauri()) {
    // Use Tauri invoke
    const { invoke: tauriInvoke } = await import('@tauri-apps/api/core');
    return tauriInvoke<T>(options.cmd, options);
  } else {
    // Use TypeScript implementation
    return invokeTypeScript<T>(options);
  }
}

// Route commands to TypeScript implementations
async function invokeTypeScript<T>(options: InvokeOptions): Promise<T> {
  const { cmd, ...args } = options;

  switch (cmd) {
    case 'new_game':
      return gameEngine.newGame(args.difficulty as DifficultyMode) as T;

    case 'take_turn':
      return gameEngine.takeTurn(args.state as GameState, args.actions as Action[]) as T;

    case 'check_game_status':
      return gameEngine.checkGameStatus(args.state as GameState) as T;

    case 'get_available_actions':
      return gameEngine.getAvailableActions(args.state as GameState) as T;

    case 'get_market_status':
      return gameEngine.getMarketStatus(args.state as GameState) as T;

    case 'generate_insights':
      return gameEngine.generateInsights(args.prevState as GameState, args.currentState as GameState) as T;

    case 'generate_warnings':
      return gameEngine.generateWarnings(args.state as GameState) as T;

    case 'process_compounding_effects':
      return gameEngine.processCompoundingEffects(args.state as GameState, args.effects) as T;

    case 'check_for_events':
      return gameEngine.checkForEvents(args.state as GameState, args.activeEvents) as T;

    case 'apply_event_choice':
      return gameEngine.applyEventChoice(args.state as GameState, args.event, args.choiceId) as T;

    case 'check_action_synergies':
      return gameEngine.checkActionSynergies(args.state as GameState, args.actions, args.recentActions, args.synergies) as T;

    case 'update_market_conditions':
      return gameEngine.updateMarketConditions(args.state as GameState, args.conditions) as T;

    case 'check_progression_milestones':
      return gameEngine.checkProgressionMilestones(args.state as GameState, args.milestones) as T;

    case 'update_customer_segments':
      return gameEngine.updateCustomerSegments(args.state as GameState, args.segments) as T;

    case 'update_competitors':
      return gameEngine.updateCompetitors(args.state as GameState, args.competitors) as T;

    default:
      throw new Error(`Unknown command: ${cmd}`);
  }
}

// High-level game functions that use the invoke wrapper
export async function gameInvoke(cmd: string, args: Record<string, any> = {}): Promise<any> {
  return invoke({ cmd, ...args });
}

// Specific game functions for easier use
export async function newGame(difficulty: DifficultyMode): Promise<GameState> {
  return gameInvoke('new_game', { difficulty });
}

export async function takeTurn(state: GameState, actions: Action[]): Promise<any> {
  return gameInvoke('take_turn', { state, actions });
}

export async function checkGameStatus(state: GameState): Promise<any> {
  return gameInvoke('check_game_status', { state });
}

export async function getAvailableActions(state: GameState): Promise<string[]> {
  return gameInvoke('get_available_actions', { state });
}

export async function getMarketStatus(state: GameState): Promise<any> {
  return gameInvoke('get_market_status', { state });
}

export async function generateInsights(prevState: GameState, currentState: GameState): Promise<any> {
  return gameInvoke('generate_insights', { prevState, currentState });
}

export async function generateWarnings(state: GameState): Promise<any> {
  return gameInvoke('generate_warnings', { state });
}

export async function processCompoundingEffects(state: GameState, effects: any[]): Promise<any> {
  return gameInvoke('process_compounding_effects', { state, effects });
}

export async function checkForEvents(state: GameState, activeEvents: any[]): Promise<any> {
  return gameInvoke('check_for_events', { state, activeEvents });
}

export async function applyEventChoice(state: GameState, event: any, choiceId: string): Promise<any> {
  return gameInvoke('apply_event_choice', { state, event, choiceId });
}

export async function checkActionSynergies(state: GameState, actions: Action[], recentActions: Action[], synergies: any[]): Promise<any> {
  return gameInvoke('check_action_synergies', { state, actions, recentActions, synergies });
}

export async function updateMarketConditions(state: GameState, conditions: any[]): Promise<any> {
  return gameInvoke('update_market_conditions', { state, conditions });
}

export async function checkProgressionMilestones(state: GameState, milestones: any[]): Promise<any> {
  return gameInvoke('check_progression_milestones', { state, milestones });
}

export async function updateCustomerSegments(state: GameState, segments: any[]): Promise<any> {
  return gameInvoke('update_customer_segments', { state, segments });
}

export async function updateCompetitors(state: GameState, competitors: any[]): Promise<any> {
  return gameInvoke('update_competitors', { state, competitors });
}

// Utility functions
export function getGameEngine(): typeof gameEngine {
  return gameEngine;
}

export function isWebDeployment(): boolean {
  return !isTauri();
}