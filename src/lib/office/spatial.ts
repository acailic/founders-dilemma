/**
 * Spatial System Utilities
 *
 * Handles coordinate conversions, grid operations, and spatial queries
 */

import type { Point, GridPosition, Rectangle, OfficeGrid, Tile } from '../../types/office';

// ============================================================================
// CONSTANTS
// ============================================================================

// Stardew-inspired tile proportions: slightly taller for a cozy 3/4 perspective
export const TILE_WIDTH = 64;   // Tile width keeps 2:1 ratio for smooth staggering
export const TILE_HEIGHT = 40;  // Taller tiles give a softer tilt reminiscent of Stardew Valley
export const TILE_DEPTH = 20;   // Extra depth for stacking shadows/highlights

// ============================================================================
// COORDINATE CONVERSION
// ============================================================================

/**
 * Convert grid coordinates to screen coordinates (isometric projection)
 */
export function gridToScreen(gridPos: GridPosition, grid: OfficeGrid): Point {
  const tileW = TILE_WIDTH;
  const tileH = TILE_HEIGHT;

  // Isometric projection formula
  const screenX = (gridPos.x - gridPos.y) * (tileW / 2);
  const screenY = (gridPos.x + gridPos.y) * (tileH / 2);

  return { x: screenX, y: screenY };
}

/**
 * Convert screen coordinates to grid coordinates (inverse projection)
 */
export function screenToGrid(screenPos: Point, grid: OfficeGrid): GridPosition {
  const tileW = TILE_WIDTH;
  const tileH = TILE_HEIGHT;

  // Inverse isometric projection
  const gridX = (screenPos.x / (tileW / 2) + screenPos.y / (tileH / 2)) / 2;
  const gridY = (screenPos.y / (tileH / 2) - screenPos.x / (tileW / 2)) / 2;

  return {
    x: Math.floor(gridX),
    y: Math.floor(gridY)
  };
}

/**
 * Convert grid position to center point in screen coordinates
 */
export function gridToScreenCenter(gridPos: GridPosition, grid: OfficeGrid): Point {
  const corner = gridToScreen(gridPos, grid);

  return {
    x: corner.x,
    y: corner.y + TILE_HEIGHT / 2
  };
}

/**
 * Check if grid position is within bounds
 */
export function isInBounds(pos: GridPosition, grid: OfficeGrid): boolean {
  return (
    pos.x >= 0 &&
    pos.x < grid.width &&
    pos.y >= 0 &&
    pos.y < grid.height
  );
}

// ============================================================================
// DISTANCE & NAVIGATION
// ============================================================================

/**
 * Manhattan distance between two grid positions
 */
export function manhattanDistance(from: GridPosition, to: GridPosition): number {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}

/**
 * Euclidean distance between two grid positions
 */
export function euclideanDistance(from: GridPosition, to: GridPosition): number {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get neighboring grid positions (4-directional)
 */
export function getNeighbors(pos: GridPosition, grid: OfficeGrid): GridPosition[] {
  const neighbors: GridPosition[] = [];

  const deltas = [
    { x: 0, y: -1 },  // North
    { x: 1, y: 0 },   // East
    { x: 0, y: 1 },   // South
    { x: -1, y: 0 }   // West
  ];

  for (const delta of deltas) {
    const newPos = {
      x: pos.x + delta.x,
      y: pos.y + delta.y
    };

    if (isInBounds(newPos, grid)) {
      neighbors.push(newPos);
    }
  }

  return neighbors;
}

/**
 * Get diagonal neighbors (8-directional)
 */
export function getAllNeighbors(pos: GridPosition, grid: OfficeGrid): GridPosition[] {
  const neighbors: GridPosition[] = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;

      const newPos = {
        x: pos.x + dx,
        y: pos.y + dy
      };

      if (isInBounds(newPos, grid)) {
        neighbors.push(newPos);
      }
    }
  }

  return neighbors;
}

/**
 * Check if two grid positions are adjacent
 */
export function isAdjacent(pos1: GridPosition, pos2: GridPosition): boolean {
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);

  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

// ============================================================================
// AREA OPERATIONS
// ============================================================================

/**
 * Get all tiles in a rectangular area
 */
export function getTilesInRect(
  topLeft: GridPosition,
  width: number,
  height: number,
  grid: OfficeGrid
): GridPosition[] {
  const tiles: GridPosition[] = [];

  for (let y = topLeft.y; y < topLeft.y + height; y++) {
    for (let x = topLeft.x; x < topLeft.x + width; x++) {
      const pos = { x, y };
      if (isInBounds(pos, grid)) {
        tiles.push(pos);
      }
    }
  }

  return tiles;
}

/**
 * Get all tiles in a circular area
 */
export function getTilesInRadius(
  center: GridPosition,
  radius: number,
  grid: OfficeGrid
): GridPosition[] {
  const tiles: GridPosition[] = [];

  const minX = Math.max(0, Math.floor(center.x - radius));
  const maxX = Math.min(grid.width - 1, Math.ceil(center.x + radius));
  const minY = Math.max(0, Math.floor(center.y - radius));
  const maxY = Math.min(grid.height - 1, Math.ceil(center.y + radius));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const pos = { x, y };
      const dist = euclideanDistance(center, pos);

      if (dist <= radius) {
        tiles.push(pos);
      }
    }
  }

  return tiles;
}

/**
 * Check if a rectangle contains a point
 */
export function rectContains(rect: Rectangle, point: Point): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

// ============================================================================
// PATHFINDING (Simple A*)
// ============================================================================

interface PathNode {
  pos: GridPosition;
  g: number;  // Cost from start
  h: number;  // Heuristic to goal
  f: number;  // Total cost
  parent?: PathNode;
}

/**
 * Find path from start to goal using A* algorithm
 */
export function findPath(
  start: GridPosition,
  goal: GridPosition,
  grid: OfficeGrid,
  isWalkable: (pos: GridPosition) => boolean
): GridPosition[] | null {
  // Early exit if goal is not walkable
  if (!isWalkable(goal)) {
    return null;
  }

  const openSet: PathNode[] = [];
  const closedSet = new Set<string>();

  const startNode: PathNode = {
    pos: start,
    g: 0,
    h: manhattanDistance(start, goal),
    f: manhattanDistance(start, goal)
  };

  openSet.push(startNode);

  while (openSet.length > 0) {
    // Get node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    const currentKey = `${current.pos.x},${current.pos.y}`;

    // Reached goal
    if (current.pos.x === goal.x && current.pos.y === goal.y) {
      return reconstructPath(current);
    }

    closedSet.add(currentKey);

    // Check neighbors
    const neighbors = getNeighbors(current.pos, grid);

    for (const neighborPos of neighbors) {
      const neighborKey = `${neighborPos.x},${neighborPos.y}`;

      if (closedSet.has(neighborKey)) continue;
      if (!isWalkable(neighborPos)) continue;

      const g = current.g + 1;
      const h = manhattanDistance(neighborPos, goal);
      const f = g + h;

      // Check if already in open set
      const existing = openSet.find(
        n => n.pos.x === neighborPos.x && n.pos.y === neighborPos.y
      );

      if (existing) {
        if (g < existing.g) {
          existing.g = g;
          existing.f = f;
          existing.parent = current;
        }
      } else {
        openSet.push({
          pos: neighborPos,
          g,
          h,
          f,
          parent: current
        });
      }
    }
  }

  // No path found
  return null;
}

function reconstructPath(node: PathNode): GridPosition[] {
  const path: GridPosition[] = [];
  let current: PathNode | undefined = node;

  while (current) {
    path.unshift(current.pos);
    current = current.parent;
  }

  return path;
}

// ============================================================================
// SORTING & Z-INDEX
// ============================================================================

/**
 * Calculate z-index for rendering order (isometric)
 * Objects further back should render first
 */
export function calculateZIndex(pos: GridPosition): number {
  // In isometric view, render back to front
  // Higher x+y = further back = lower z-index
  return pos.x + pos.y;
}

/**
 * Sort positions for proper isometric rendering order
 */
export function sortIsometric(positions: GridPosition[]): GridPosition[] {
  return [...positions].sort((a, b) => {
    const zIndexA = calculateZIndex(a);
    const zIndexB = calculateZIndex(b);
    return zIndexA - zIndexB;
  });
}

// ============================================================================
// RANDOM POSITIONING
// ============================================================================

/**
 * Get random position within bounds
 */
export function getRandomPosition(grid: OfficeGrid): GridPosition {
  return {
    x: Math.floor(Math.random() * grid.width),
    y: Math.floor(Math.random() * grid.height)
  };
}

/**
 * Get random empty position
 */
export function getRandomEmptyPosition(
  grid: OfficeGrid,
  isOccupied: (pos: GridPosition) => boolean
): GridPosition | null {
  const maxAttempts = 100;

  for (let i = 0; i < maxAttempts; i++) {
    const pos = getRandomPosition(grid);

    if (!isOccupied(pos)) {
      return pos;
    }
  }

  return null;  // No empty position found
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if two positions are equal
 */
export function positionsEqual(pos1: GridPosition, pos2: GridPosition): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * Create a position key for Map/Set operations
 */
export function positionKey(pos: GridPosition): string {
  return `${pos.x},${pos.y}`;
}

/**
 * Parse position key back to GridPosition
 */
export function keyToPosition(key: string): GridPosition {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

/**
 * Clamp position to grid bounds
 */
export function clampPosition(pos: GridPosition, grid: OfficeGrid): GridPosition {
  return {
    x: Math.max(0, Math.min(grid.width - 1, pos.x)),
    y: Math.max(0, Math.min(grid.height - 1, pos.y))
  };
}
