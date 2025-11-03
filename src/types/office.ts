/**
 * Office Visualization Type Definitions
 *
 * Core types for the office simulation and rendering system
 */

// ============================================================================
// SPATIAL SYSTEM
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface GridPosition {
  x: number;  // Grid column (0-9)
  y: number;  // Grid row (0-7)
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OfficeGrid {
  width: number;        // Tiles wide (10)
  height: number;       // Tiles tall (8)
  tileSize: number;     // Pixels per tile (64)
  perspective: 'isometric' | 'top-down';
}

export enum TileType {
  Floor = 'floor',
  Desk = 'desk',
  MeetingTable = 'meeting',
  Kitchen = 'kitchen',
  Reception = 'reception',
  ServerRack = 'server',
  Whiteboard = 'whiteboard',
  Plants = 'plants',
  Empty = 'empty'
}

export interface Tile {
  position: GridPosition;
  type: TileType;
  occupied: boolean;
  entity?: Entity;
  walkable: boolean;
}

// ============================================================================
// CHARACTER SYSTEM
// ============================================================================

export enum Role {
  Founder = 'founder',
  Engineer = 'engineer',
  Sales = 'sales',
  Designer = 'designer',
  Marketing = 'marketing',
  Operations = 'ops'
}

export enum Seniority {
  Founder = 'founder',
  Senior = 'senior',
  Mid = 'mid',
  Junior = 'junior'
}

export enum Mood {
  Thriving = 'thriving',    // >80 morale
  Happy = 'happy',          // 60-80
  Neutral = 'neutral',      // 40-60
  Stressed = 'stressed',    // 20-40
  Exhausted = 'exhausted'   // <20
}

export enum ActionType {
  Coding = 'coding',
  Meeting = 'meeting',
  Calling = 'calling',
  Designing = 'designing',
  Writing = 'writing',
  Break = 'break',
  Idle = 'idle',
  Celebrating = 'celebrating',
  Walking = 'walking'
}

export enum Direction {
  North = 'north',
  South = 'south',
  East = 'east',
  West = 'west',
  NorthEast = 'ne',
  NorthWest = 'nw',
  SouthEast = 'se',
  SouthWest = 'sw'
}

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  seniority: Seniority;
  joinedWeek: number;
  leftWeek?: number;

  // Visual state
  position: GridPosition;
  currentAction: ActionType;
  mood: Mood;
  facingDirection: Direction;

  // Animation
  animationState: string;
  animationFrame: number;

  // Stats
  productivity: number;    // 0-100
  satisfaction: number;    // 0-100
  velocity: number;        // Multiplier
}

// ============================================================================
// ENVIRONMENT SYSTEM
// ============================================================================

export enum AreaType {
  WorkArea = 'work',
  MeetingArea = 'meeting',
  Kitchen = 'kitchen',
  Reception = 'reception',
  ServerRoom = 'server',
  Lounge = 'lounge',
  Storage = 'storage'
}

export interface OfficeArea {
  type: AreaType;
  tiles: GridPosition[];
  capacity: number;
  furniture: Furniture[];
  characters: string[];  // Team member IDs
}

export enum FurnitureType {
  Desk = 'desk',
  Chair = 'chair',
  Computer = 'computer',
  Monitor = 'monitor',
  Whiteboard = 'whiteboard',
  MeetingTable = 'meeting_table',
  CoffeeTable = 'coffee_table',
  Plant = 'plant',
  BookShelf = 'bookshelf',
  ServerRack = 'server_rack',
  WaterCooler = 'water_cooler',
  Printer = 'printer'
}

export enum Quality {
  Basic = 'basic',      // Minimal budget
  Standard = 'standard', // Normal
  Premium = 'premium'    // High budget
}

export interface Furniture {
  id: string;
  type: FurnitureType;
  position: GridPosition;
  quality: Quality;
  occupied: boolean;
  occupant?: string;  // Team member ID
}

export enum ClutterType {
  Papers = 'papers',
  Cables = 'cables',
  Boxes = 'boxes',
  PizzaBoxes = 'pizza',
  CoffeeCups = 'coffee',
  PostIts = 'postits',
  Equipment = 'equipment',
  Trash = 'trash'
}

export interface ClutterItem {
  id: string;
  type: ClutterType;
  position: GridPosition;
  intensity: number;  // 0-1 (visual size)
  age: number;       // Weeks old
}

// ============================================================================
// ANIMATION SYSTEM
// ============================================================================

export enum AnimationType {
  // Character
  Walk = 'walk',
  Type = 'type',
  Talk = 'talk',
  Gesture = 'gesture',
  Celebrate = 'celebrate',
  Slump = 'slump',

  // Environment
  ClutterAccumulate = 'clutter_accumulate',
  ClutterClear = 'clutter_clear',
  PlantGrow = 'plant_grow',
  PlantWilt = 'plant_wilt',

  // Camera
  ZoomIn = 'zoom_in',
  ZoomOut = 'zoom_out',
  Pan = 'pan',

  // UI
  FadeIn = 'fade_in',
  FadeOut = 'fade_out',
  Pulse = 'pulse'
}

export type EasingFunction = (t: number) => number;

export interface Animation {
  id: string;
  type: AnimationType;
  target: Entity;
  duration: number;      // ms
  startTime: number;     // ms (Date.now())
  progress: number;      // 0-1
  easing: EasingFunction;
  properties: Record<string, any>;
  onComplete?: () => void;
}

export type Entity = TeamMember | Furniture | ClutterItem;

// ============================================================================
// CAMERA SYSTEM
// ============================================================================

export interface Camera {
  position: Point;       // Center point (world coords)
  zoom: number;          // 0.5 - 2.0
  rotation: number;      // 0-360 degrees
  bounds: Rectangle;     // Viewport bounds
}

export interface CameraTarget {
  position: Point;
  zoom: number;
  duration?: number;     // Animation duration (ms)
}

// ============================================================================
// RENDERING
// ============================================================================

export enum LayerType {
  Floor = 'floor',
  Furniture = 'furniture',
  Clutter = 'clutter',
  Characters = 'characters',
  Effects = 'effects',
  UI = 'ui'
}

export interface Layer {
  type: LayerType;
  zIndex: number;
  visible: boolean;
  opacity: number;
  entities: Entity[];
}

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  camera: Camera;
  deltaTime: number;     // ms since last frame
  timestamp: number;     // Current timestamp
}

// ============================================================================
// OFFICE STATE
// ============================================================================

export type OfficeLayout = 'tiny' | 'small' | 'medium' | 'large';

export interface Ambiance {
  lighting: 'bright' | 'normal' | 'dim' | 'dark';
  activity: 'high' | 'medium' | 'low';
  mood: 'positive' | 'neutral' | 'negative';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface OfficeState {
  // Spatial
  grid: OfficeGrid;
  tiles: Tile[][];       // 2D array
  layout: OfficeLayout;

  // Entities
  team: TeamMember[];
  furniture: Furniture[];
  clutter: ClutterItem[];
  areas: OfficeArea[];

  // Environment
  ambiance: Ambiance;

  // Metadata
  week: number;
  lastUpdate: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface OfficeConfig {
  grid: {
    width: number;
    height: number;
    tileSize: number;
    perspective: 'isometric' | 'top-down';
  };

  rendering: {
    targetFPS: number;
    enableAnimations: boolean;
    enableShadows: boolean;
    enableParticles: boolean;
    quality: 'low' | 'medium' | 'high';
  };

  camera: {
    minZoom: number;
    maxZoom: number;
    panSpeed: number;
    zoomSpeed: number;
  };

  characters: {
    enableNames: boolean;
    enableTooltips: boolean;
    showMood: boolean;
    showRole: boolean;
  };
}

export const DEFAULT_OFFICE_CONFIG: OfficeConfig = {
  grid: {
    width: 10,
    height: 8,
    tileSize: 64,
    perspective: 'isometric'
  },

  rendering: {
    targetFPS: 60,
    enableAnimations: true,
    enableShadows: true,
    enableParticles: true,
    quality: 'high'
  },

  camera: {
    minZoom: 0.5,
    maxZoom: 2.0,
    panSpeed: 1.0,
    zoomSpeed: 0.1
  },

  characters: {
    enableNames: true,
    enableTooltips: true,
    showMood: true,
    showRole: true
  }
};
