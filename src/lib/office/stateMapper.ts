/**
 * Game State to Office State Mapper
 *
 * Converts GameState to OfficeState for rendering
 */

import type {
  OfficeState,
  OfficeGrid,
  Tile,
  OfficeLayout,
  Ambiance,
  OfficeArea,
  Furniture,
  ClutterItem,
  TeamMember,
  GridPosition
} from '../../types/office';
import {
  DEFAULT_OFFICE_CONFIG,
  TileType,
  AreaType,
  FurnitureType,
  ClutterType,
  Quality
} from '../../types/office';
import { TeamManager, type RandomFn } from './characters';
import type { GameState } from '../../types/game-systems';

const MIN_TEAM_SIZE = 1;
const MAX_TEAM_SIZE = 12;

export function estimateTeamSizeFromBurn(burn: number): number {
  if (!Number.isFinite(burn) || burn <= 0) {
    return MIN_TEAM_SIZE;
  }

  const estimated = Math.floor(burn / 10000);
  return Math.max(MIN_TEAM_SIZE, Math.min(MAX_TEAM_SIZE, estimated));
}

// ============================================================================
// STATE MAPPER CLASS
// ============================================================================

type RngFactory = (seed: string) => RandomFn;

// Fast, low-overhead PRNG that produces repeatable sequences across platforms.
function mulberry32(seed: number): RandomFn {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let n = Math.imul(t ^ (t >>> 15), t | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

// Convert string seeds to 32-bit integers using an FNV-1a style hash.
function stringToSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function defaultRngFactory(seed: string): RandomFn {
  return mulberry32(stringToSeed(seed));
}

export class OfficeStateMapper {
  private teamManager: TeamManager;
  private grid: OfficeGrid;
  private currentLayout: OfficeLayout = 'tiny';
  private rngFactory: RngFactory;
  private tileCache: Map<OfficeLayout, Tile[][]> = new Map();
  private furnitureCache: Map<string, Furniture[]> = new Map();

  constructor(rngFactory?: RngFactory) {
    this.teamManager = new TeamManager();
    this.grid = {
      width: DEFAULT_OFFICE_CONFIG.grid.width,
      height: DEFAULT_OFFICE_CONFIG.grid.height,
      tileSize: DEFAULT_OFFICE_CONFIG.grid.tileSize,
      perspective: DEFAULT_OFFICE_CONFIG.grid.perspective
    };
    this.rngFactory = rngFactory ?? defaultRngFactory;
  }

  /**
   * Map GameState to OfficeState
   */
  mapToOfficeState(gameState: GameState): OfficeState {
    // Independent RNG streams keep team updates from affecting clutter placement.
    const baseSeed = `${gameState.game_id}-${gameState.week}`;
    const teamRng = this.rngFactory(`${baseSeed}-team`);
    const clutterRng = this.rngFactory(`${baseSeed}-clutter`);

    // Determine office layout based on team size
    const teamSize = estimateTeamSizeFromBurn(gameState.burn);
    const layout = this.getLayoutForTeamSize(teamSize);

    // Generate tiles
    const tiles = this.getTilesForLayout(layout);

    // Generate furniture
    const furniture = this.getFurnitureForLayout(layout, teamSize, gameState);

    // Get available desk positions
    const deskPositions = furniture
      .filter(f => f.type === FurnitureType.Desk)
      .map(f => f.position);

    // Update team
    const team = this.teamManager.updateTeam(
      teamSize,
      gameState.week,
      gameState.morale,
      deskPositions,
      teamRng
    );

    // Generate clutter based on tech debt
    const clutter = this.generateClutter(gameState.tech_debt, tiles, clutterRng);

    // Determine ambiance
    const ambiance = this.getAmbiance(gameState);

    // Get areas
    const areas = this.getAreas(layout, furniture, team);

    return {
      grid: this.grid,
      tiles,
      layout,
      team,
      furniture,
      clutter,
      areas,
      ambiance,
      week: gameState.week,
      lastUpdate: Date.now()
    };
  }

  // ==========================================================================
  // LAYOUT DETERMINATION
  // ==========================================================================

  private getLayoutForTeamSize(teamSize: number): OfficeLayout {
    if (teamSize <= 3) return 'tiny';
    if (teamSize <= 7) return 'small';
    if (teamSize <= 12) return 'medium';
    return 'large';
  }

  // ==========================================================================
  // TILE GENERATION
  // ==========================================================================

  private generateTiles(layout: OfficeLayout): Tile[][] {
    const tiles: Tile[][] = [];

    for (let y = 0; y < this.grid.height; y++) {
      const row: Tile[] = [];

      for (let x = 0; x < this.grid.width; x++) {
        row.push({
          position: { x, y },
          type: TileType.Floor,
          occupied: false,
          walkable: true
        });
      }

      tiles.push(row);
    }

    return tiles;
  }

  private getTilesForLayout(layout: OfficeLayout): Tile[][] {
    const cached = this.tileCache.get(layout);
    if (cached) {
      return cached.map(row => row.map(tile => ({ ...tile })));
    }

    const tiles = this.generateTiles(layout);
    this.tileCache.set(layout, tiles);
    return tiles.map(row => row.map(tile => ({ ...tile })));
  }

  // ==========================================================================
  // FURNITURE GENERATION
  // ==========================================================================

  private generateFurniture(
    layout: OfficeLayout,
    teamSize: number,
    gameState: GameState
  ): Furniture[] {
    const furniture: Furniture[] = [];
    const quality = this.getQualityFromBudget(gameState.bank);

    // Add desks based on team size
    const deskPositions = this.getDeskPositions(layout, teamSize);

    for (const pos of deskPositions) {
      // Desk
      furniture.push(this.createFurniture(FurnitureType.Desk, pos, quality));

      // Computer on desk
      furniture.push(this.createFurniture(FurnitureType.Computer, pos, quality));

      // Chair in front
      furniture.push(this.createFurniture(FurnitureType.Chair, {
        x: pos.x,
        y: pos.y + 1
      }, quality));
    }

    // Add common furniture
    if (teamSize >= 3) {
      // Meeting table
      furniture.push(this.createFurniture(FurnitureType.MeetingTable, { x: 7, y: 4 }, quality));
    }

    if (teamSize >= 5) {
      // Whiteboard
      furniture.push(this.createFurniture(FurnitureType.Whiteboard, { x: 8, y: 2 }, quality));

      // Plants
      furniture.push(this.createFurniture(FurnitureType.Plant, { x: 1, y: 1 }, quality));
      furniture.push(this.createFurniture(FurnitureType.Plant, { x: 8, y: 6 }, quality));
    }

    if (teamSize >= 8) {
      // Water cooler
      furniture.push(this.createFurniture(FurnitureType.WaterCooler, { x: 9, y: 5 }, quality));
    }

    return furniture;
  }

  private getFurnitureForLayout(
    layout: OfficeLayout,
    teamSize: number,
    gameState: GameState
  ): Furniture[] {
    const cacheKey = `${layout}-${teamSize}`;
    const cached = this.furnitureCache.get(cacheKey);
    const quality = this.getQualityFromBudget(gameState.bank);

    if (cached) {
      return cached.map(item => ({ ...item, quality }));
    }

    const generated = this.generateFurniture(layout, teamSize, gameState);
    this.furnitureCache.set(cacheKey, generated.map(item => ({ ...item, quality: Quality.Basic })));

    return generated.map(item => ({ ...item, quality }));
  }

  private getDeskPositions(layout: OfficeLayout, teamSize: number): GridPosition[] {
    const positions: GridPosition[] = [];

    // Layout patterns for different sizes
    switch (layout) {
      case 'tiny':
        // Single row
        for (let i = 0; i < teamSize && i < 3; i++) {
          positions.push({ x: 2 + i * 2, y: 3 });
        }
        break;

      case 'small':
        // Two rows
        for (let i = 0; i < Math.ceil(teamSize / 2); i++) {
          positions.push({ x: 2 + i * 2, y: 2 });
        }
        for (let i = 0; i < Math.floor(teamSize / 2); i++) {
          positions.push({ x: 2 + i * 2, y: 5 });
        }
        break;

      case 'medium':
        // Three rows
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 4 && positions.length < teamSize; col++) {
            positions.push({ x: 1 + col * 2, y: 2 + row * 2 });
          }
        }
        break;

      case 'large':
        // Four rows
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 3 && positions.length < teamSize; col++) {
            positions.push({ x: 1 + col * 3, y: 1 + row * 2 });
          }
        }
        break;
    }

    return positions.slice(0, teamSize);
  }

  private createFurniture(
    type: FurnitureType,
    position: GridPosition,
    quality: Quality
  ): Furniture {
    return {
      id: `furniture-${type}-${position.x}-${position.y}`,
      type,
      position,
      quality,
      occupied: false
    };
  }

  private getQualityFromBudget(bank: number): Quality {
    if (bank > 500000) return Quality.Premium;
    if (bank > 100000) return Quality.Standard;
    return Quality.Basic;
  }

  // ==========================================================================
  // CLUTTER GENERATION
  // ==========================================================================

  private generateClutter(techDebt: number, tiles: Tile[][], rng: RandomFn): ClutterItem[] {
    const clutter: ClutterItem[] = [];
    const count = Math.floor(techDebt / 10);  // 1 item per 10% tech debt

    const clutterTypes = [
      ClutterType.Papers,
      ClutterType.Cables,
      ClutterType.Boxes,
      ClutterType.PizzaBoxes,
      ClutterType.CoffeeCups,
      ClutterType.PostIts
    ];

    for (let i = 0; i < count; i++) {
      const type = clutterTypes[Math.max(0, Math.min(clutterTypes.length - 1, Math.floor(rng() * clutterTypes.length)))];
      const position = this.getRandomFloorPosition(tiles, rng);

      if (position) {
        clutter.push({
          id: `clutter-${i}`,
          type,
          position,
          intensity: 0.3 + rng() * 0.7,  // 0.3-1.0
          age: Math.floor(rng() * 10)
        });
      }
    }

    return clutter;
  }

  private getRandomFloorPosition(tiles: Tile[][], rng: RandomFn): GridPosition | null {
    const attempts = 50;

    for (let i = 0; i < attempts; i++) {
      const x = Math.floor(rng() * this.grid.width);
      const y = Math.floor(rng() * this.grid.height);

      if (tiles[y] && tiles[y][x] && !tiles[y][x].occupied) {
        return { x, y };
      }
    }

    return null;
  }

  // ==========================================================================
  // AMBIANCE
  // ==========================================================================

  private getAmbiance(gameState: GameState): Ambiance {
    return {
      lighting: gameState.momentum > 70 ? 'bright'
        : gameState.morale < 30 ? 'dim'
        : 'normal',

      activity: gameState.velocity > 1.5 ? 'high'
        : gameState.velocity < 0.7 ? 'low'
        : 'medium',

      mood: gameState.morale > 70 ? 'positive'
        : gameState.morale < 40 ? 'negative'
        : 'neutral',

      timeOfDay: this.getTimeOfDay(gameState.week)
    };
  }

  private getTimeOfDay(week: number): 'morning' | 'afternoon' | 'evening' | 'night' {
    const cycle = week % 4;
    return ['morning', 'afternoon', 'evening', 'morning'][cycle] as any;
  }

  // ==========================================================================
  // AREAS
  // ==========================================================================

  private getAreas(
    layout: OfficeLayout,
    furniture: Furniture[],
    team: TeamMember[]
  ): OfficeArea[] {
    const areas: OfficeArea[] = [];

    // Work area (desks)
    const desks = furniture.filter(f => f.type === FurnitureType.Desk);
    if (desks.length > 0) {
      areas.push({
        type: AreaType.WorkArea,
        tiles: desks.map(d => d.position),
        capacity: desks.length,
        furniture: desks,
        characters: team.map(m => m.id)
      });
    }

    // Meeting area
    const meetingFurniture = furniture.filter(f =>
      f.type === FurnitureType.MeetingTable
    );

    if (meetingFurniture.length > 0) {
      areas.push({
        type: AreaType.MeetingArea,
        tiles: meetingFurniture.map(f => f.position),
        capacity: 6,
        furniture: meetingFurniture,
        characters: []
      });
    }

    return areas;
  }

  // ==========================================================================
  // UTILITY
  // ==========================================================================

  /**
   * Reset for new game
   */
  reset(): void {
    this.teamManager.reset();
    this.currentLayout = 'tiny';
    this.tileCache.clear();
    this.furnitureCache.clear();
  }

  /**
   * Get team manager
   */
  getTeamManager(): TeamManager {
    return this.teamManager;
  }
}
