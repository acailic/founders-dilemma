# Office Visualization - Technical Design Document

## Overview

Full office visualization system that transforms abstract startup metrics into a realistic, animated workspace. Players see their decisions come to life through spatial positioning, character animations, environmental changes, and ambient details.

## Current Implementation Snapshot

- Deterministic office layouts generated via `mulberry32` seeded RNG (`src/lib/office/stateMapper.ts`) using `${game_id}-${week}` seeds for team and clutter streams.
- Canvas renderer (`OfficeRenderer`) with keyboard and mouse controls: drag to pan, scroll or +/- to zoom, Arrow keys to pan, Space to pause, and `R` to reset.
- Camera controller enforces zoom bounds of `0.5-2.0`, easing via `easeInOutCubic`, and cleans up animation state through `dispose()`.
- Accessibility surface: focusable canvas wrapper with `role="img"`, descriptive `aria-label`, and keyboard shortcuts mirrored in the dashboard help modal.
- Layout/furniture caches pending (see TODO); clutter and team updates rely on deterministic seeds to avoid frame-to-frame jitter.

## Architecture

### Component Hierarchy

```
OfficeTab (Main Container)
├── OfficeControls (Camera, time-lapse, filters)
├── OfficeCanvas (Main rendering surface)
│   ├── OfficeRenderer (Core rendering engine)
│   │   ├── SpaceManager (Layout & positioning)
│   │   ├── CharacterManager (Team members)
│   │   ├── EnvironmentManager (Furniture, clutter)
│   │   └── AnimationManager (All animations)
│   └── OfficeOverlay (UI elements on canvas)
│       ├── CharacterTooltips
│       ├── AreaLabels
│       └── InteractiveElements
└── OfficeInspector (Selected entity details)
```

### Data Flow

```
GameState → OfficeState Mapper → Renderer → Canvas
                ↓
         Character System
                ↓
         Animation Queue
                ↓
         Visual Output
```

### Deterministic Rendering Strategy

- `OfficeStateMapper` seeds independent RNG streams for team composition and clutter placement with `${game_id}-${week}` prefixes to guarantee reproducible layouts.
- `mulberry32` provides fast 32-bit pseudo-random numbers with low memory overhead and consistent cross-platform output.
- Separate RNG instances prevent team updates from influencing clutter layout, ensuring stable visuals when only one subsystem changes.
- Helper `estimateTeamSizeFromBurn` (exported for widget reuse) clamps team size between 1 and 12 to keep furniture layouts predictable.

## Core Systems

### 1. Spatial System (Isometric Grid)

**Grid Layout**: 10x8 isometric grid (80 tiles)

```typescript
interface OfficeGrid {
  width: number; // 10 tiles
  height: number; // 8 tiles
  tileSize: number; // 64px
  perspective: "isometric" | "top-down";
}

interface Tile {
  x: number; // Grid X (0-9)
  y: number; // Grid Y (0-7)
  type: TileType; // Floor, Desk, Meeting, Kitchen, etc.
  occupied: boolean;
  entity?: Entity; // What's on this tile
}

enum TileType {
  Floor = "floor",
  Desk = "desk",
  MeetingTable = "meeting",
  Kitchen = "kitchen",
  Reception = "reception",
  ServerRack = "server",
  Whiteboard = "whiteboard",
  Plants = "plants",
  Empty = "empty",
}
```

**Coordinate Conversion**:

```typescript
// Grid to screen (isometric projection)
function gridToScreen(x: number, y: number): Point {
  return {
    x: (x - y) * (TILE_WIDTH / 2),
    y: (x + y) * (TILE_HEIGHT / 2),
  };
}

// Screen to grid (inverse projection)
function screenToGrid(screenX: number, screenY: number): Point {
  const x = (screenX / (TILE_WIDTH / 2) + screenY / (TILE_HEIGHT / 2)) / 2;
  const y = (screenY / (TILE_HEIGHT / 2) - screenX / (TILE_WIDTH / 2)) / 2;
  return { x: Math.floor(x), y: Math.floor(y) };
}
```

### 2. Character System

**Team Member Model**:

```typescript
interface TeamMember {
  id: string; // Persistent ID
  name: string; // Generated name
  role: Role; // Engineer, Sales, Designer, Ops, Founder
  joinedWeek: number; // When hired
  seniority: Seniority; // Junior, Mid, Senior

  // Visual state
  position: GridPosition;
  currentAction: Action;
  mood: Mood; // Happy, Neutral, Stressed, Burnt

  // Animation state
  animationState: AnimationState;
  facingDirection: Direction;

  // Stats
  productivity: number; // 0-100 (affects animation speed)
  satisfaction: number; // 0-100 (from morale)
}

enum Role {
  Founder = "founder",
  Engineer = "engineer",
  Sales = "sales",
  Designer = "designer",
  Marketing = "marketing",
  Operations = "ops",
}

enum Mood {
  Thriving = "thriving", // >80 morale
  Happy = "happy", // 60-80
  Neutral = "neutral", // 40-60
  Stressed = "stressed", // 20-40
  Exhausted = "exhausted", // <20
}

enum Action {
  Coding = "coding",
  Meeting = "meeting",
  Calling = "calling",
  Designing = "designing",
  Writing = "writing",
  Break = "break",
  Idle = "idle",
  Celebrating = "celebrating",
}
```

**Character Sprites**: SVG-based for scalability

```typescript
interface CharacterSprite {
  role: Role;
  mood: Mood;
  action: Action;

  // SVG paths/components
  body: SVGElement;
  head: SVGElement;
  arms: SVGElement;
  legs: SVGElement;

  // Animation frames
  frames: Frame[];
  currentFrame: number;
}
```

### 3. Animation System

**Animation Types**:

```typescript
interface Animation {
  id: string;
  type: AnimationType;
  target: Entity;
  duration: number; // ms
  startTime: number;
  easing: EasingFunction;
  onComplete?: () => void;
}

enum AnimationType {
  // Character animations
  Walk = "walk",
  Type = "type",
  Talk = "talk",
  Gesture = "gesture",
  Celebrate = "celebrate",
  Slump = "slump",

  // Environment animations
  ClutterAccumulate = "clutter_accumulate",
  ClutterClear = "clutter_clear",
  PlantGrow = "plant_grow",
  PlantWilt = "plant_wilt",

  // Camera animations
  ZoomIn = "zoom_in",
  ZoomOut = "zoom_out",
  Pan = "pan",

  // UI animations
  FadeIn = "fade_in",
  FadeOut = "fade_out",
  Pulse = "pulse",
}
```

**Animation Manager**:

```typescript
class AnimationManager {
  private activeAnimations: Map<string, Animation>;
  private animationQueue: Animation[];

  // Core methods
  addAnimation(animation: Animation): void;
  removeAnimation(id: string): void;
  update(deltaTime: number): void;
  clear(): void;

  // Character-specific
  playCharacterAction(member: TeamMember, action: Action): void;
  updateMood(member: TeamMember, mood: Mood): void;

  // Environment
  animateClutter(tiles: Tile[], intensity: number): void;
  animatePlants(tiles: Tile[], health: number): void;

  // Camera
  animateCamera(from: CameraState, to: CameraState, duration: number): void;
}
```

### 4. Environment System

**Office Areas**:

```typescript
interface OfficeArea {
  type: AreaType;
  tiles: GridPosition[];
  capacity: number; // Max people
  furniture: Furniture[];
  clutter: ClutterItem[];
}

enum AreaType {
  WorkArea = "work", // Desks
  MeetingArea = "meeting", // Tables, chairs
  Kitchen = "kitchen", // Coffee, fridge
  Reception = "reception", // Entrance
  ServerRoom = "server", // Tech infra
  Lounge = "lounge", // Break area
}

interface Furniture {
  type: FurnitureType;
  position: GridPosition;
  quality: Quality; // Affects visuals
  occupied: boolean;
}

enum FurnitureType {
  Desk = "desk",
  Chair = "chair",
  Computer = "computer",
  Monitor = "monitor",
  Whiteboard = "whiteboard",
  MeetingTable = "meeting_table",
  CoffeeTable = "coffee_table",
  Plant = "plant",
  BookShelf = "bookshelf",
  ServerRack = "server_rack",
}
```

**Clutter System** (Tech Debt Visualization):

```typescript
interface ClutterItem {
  type: ClutterType;
  position: GridPosition;
  intensity: number; // 0-100
  age: number; // Weeks since appeared
}

enum ClutterType {
  Papers = "papers",
  Cables = "cables",
  Boxes = "boxes",
  PizzaBoxes = "pizza",
  CoffeeCups = "coffee",
  PostIts = "postits",
  Equipment = "equipment",
}

function calculateClutterDistribution(techDebt: number): ClutterItem[] {
  const count = Math.floor(techDebt / 10); // 10 items per 10% tech debt

  return generateClutterItems(count, {
    papers: 0.3, // 30% papers
    cables: 0.2, // 20% cables
    boxes: 0.15, // 15% boxes
    pizza: 0.15, // 15% pizza boxes (high burn/crunch)
    coffee: 0.1, // 10% coffee cups
    postits: 0.1, // 10% post-its
  });
}
```

### 5. Rendering Engine

**Render Layers** (bottom to top):

1. Floor layer (tiles, carpet)
2. Furniture layer (desks, chairs)
3. Clutter layer (papers, boxes)
4. Character layer (team members)
5. Effects layer (animations, particles)
6. UI layer (tooltips, labels)

```typescript
class OfficeRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;

  // Layer management
  private layers: Map<LayerType, Layer>;

  render(state: OfficeState): void {
    this.clear();

    // Render each layer in order
    this.renderLayer("floor", state);
    this.renderLayer("furniture", state);
    this.renderLayer("clutter", state);
    this.renderLayer("characters", state);
    this.renderLayer("effects", state);
    this.renderLayer("ui", state);
  }

  private renderLayer(type: LayerType, state: OfficeState): void {
    const layer = this.layers.get(type);
    if (!layer) return;

    // Apply camera transform
    this.ctx.save();
    this.applyCamera();

    // Render entities in layer
    layer.entities.forEach((entity) => {
      this.renderEntity(entity, state);
    });

    this.ctx.restore();
  }
}
```

**Camera System**:

```typescript
interface Camera {
  position: Point; // Center point
  zoom: number; // 0.5 - 2.0
  rotation: number; // 0-360 (for future 3D)
  bounds: Rectangle; // Viewport bounds
}

class CameraController {
  constructor(
    camera: Camera,
    minZoom: number = 0.5,
    maxZoom: number = 2.0,
    panSpeed: number = 1.0,
    zoomSpeed: number = 0.1
  );

  pan(dx: number, dy: number): void;
  zoom(factor: number, center?: Point): void;
  focusOn(worldPos: Point, zoom?: number, duration?: number): void;
  animateTo(target: CameraTarget): void;
  update(currentTime: number): boolean; // Uses easeInOutCubic easing
  reset(): void;
  dispose(): void; // Stops animations and clears references
}
```

### 6. Game State Integration

**State Mapper**:

```typescript
class OfficeStateMapper {
  constructor(rngFactory?: (seed: string) => RandomFn) {
    /* default uses mulberry32 */
  }

  mapToOfficeState(gameState: GameState): OfficeState {
    const baseSeed = `${gameState.game_id}-${gameState.week}`;
    const teamSize = estimateTeamSizeFromBurn(gameState.burn); // 1-12 clamp
    const layout = this.getLayoutForTeamSize(teamSize);

    const tiles = this.generateTiles(layout); // TODO: memoize per layout
    const furniture = this.generateFurniture(layout, teamSize, gameState); // TODO: memoize

    const deskPositions = furniture
      .filter((item) => item.type === FurnitureType.Desk)
      .map((item) => item.position);

    const team = this.teamManager.updateTeam(
      teamSize,
      gameState.week,
      gameState.morale,
      deskPositions,
      this.rngFactory(`${baseSeed}-team`)
    );

    const clutter = this.generateClutter(
      gameState.tech_debt,
      tiles,
      this.rngFactory(`${baseSeed}-clutter`)
    );

    const ambiance = this.getAmbiance(gameState);

    return {
      grid: this.grid,
      layout,
      tiles,
      furniture,
      team,
      clutter,
      areas: this.getAreas(layout, furniture, team),
      ambiance,
      week: gameState.week,
      lastUpdate: Date.now(),
    };
  }
}
```

## Future Implementation Plan (Backlog)

The MVP currently ships the Day 1 deliverables (core renderer, seeded mapper, camera controls). The remaining items below are retained as backlog tasks for future iterations.

### Day 1: Core Architecture + Spatial System

- [x] Create component structure
- [x] Implement isometric grid system
- [x] Build coordinate conversion
- [x] Create basic renderer
- [x] Test spatial positioning

### Day 2: Character System

- [ ] Design character sprites (SVG)
- [ ] Implement TeamMember model
- [ ] Build character persistence
- [ ] Create role-based visuals
- [ ] Add mood system

### Day 3: Animation Engine

- [ ] Build AnimationManager
- [ ] Implement character animations
  - Walking
  - Typing
  - Talking
  - Celebrating
- [ ] Add easing functions
- [ ] Test animation queue

### Day 4: Environment System

- [ ] Create furniture catalog
- [ ] Implement clutter system
- [ ] Build layout generator
- [ ] Add environmental animations
- [ ] Test layout scaling

### Day 5: Advanced Rendering

- [ ] Implement layer system
- [ ] Add camera controls
- [ ] Build interaction system
- [ ] Add tooltips and labels
- [ ] Performance optimization

### Day 6: Integration + Polish

- [ ] Integrate with GameState
- [ ] Add Office tab to dashboard
- [ ] Implement time-lapse mode
- [ ] Add office photos
- [ ] Sound effects

### Day 7: Testing + Documentation

- [ ] Comprehensive testing
- [ ] Performance profiling
- [ ] Bug fixes
- [ ] Documentation
- [ ] Demo scenarios

## Technical Decisions

### Rendering Technology: Canvas vs SVG vs WebGL

**Decision**: **HTML5 Canvas with SVG sprites**

**Rationale**:

- Canvas: Best performance for 60fps animations
- SVG sprites: Scalable, easy to style
- Hybrid approach: Render SVG to canvas

**Alternative considered**:

- Pure SVG: Too slow for complex animations
- WebGL: Overkill for 2D isometric
- React Three Fiber: Wrong abstraction level

### Animation Framework

**Decision**: **Custom frame-based animation system**

**Rationale**:

- Full control over timing
- Lightweight (no heavy libraries)
- Game-specific optimizations

**Libraries considered**:

- GSAP: Too heavy, generic
- Framer Motion: React-focused, not canvas
- Three.js: 3D focused

### State Management

**Decision**: **Local component state + React Context**

**Rationale**:

- Office state derived from GameState
- No need for Redux/Zustand
- Simple, performant

## Performance Targets

- **60 FPS** sustained during animations (`DEFAULT_OFFICE_CONFIG.rendering.targetFPS`)
- **< 100ms** render time per frame
- **< 500ms** state update when action taken
- **< 50MB** memory footprint
- **< 2s** initial render

## Accessibility

- Focusable canvas wrapper with `role="img"` and descriptive `aria-label`
- Keyboard navigation: Arrow keys pan, `+`/`-` zoom, Space toggles pause, `R` resets camera
- Mouse support: drag-to-pan, scroll-to-zoom, Mantine tooltips for controls
- Modal parity: Enter/Space open the Office Cam modal, Escape closes it
- Future: screen reader entity descriptions, high contrast and reduced motion toggles

## Visual Style Guide

### Color Palette

**Office Theme**: Modern, professional, warm

```css
/* Floor */
--floor-light: #f5f5f7;
--floor-dark: #e8e8ea;

/* Furniture */
--wood: #8b7355;
--metal: #b0b0b0;
--fabric: #4a5568;

/* Character skin tones (diverse) */
--skin-1: #f5d0a9;
--skin-2: #c68642;
--skin-3: #8d5524;
--skin-4: #4a312c;

/* Mood colors */
--mood-thriving: #48bb78;
--mood-happy: #4299e1;
--mood-neutral: #718096;
--mood-stressed: #ed8936;
--mood-exhausted: #f56565;

/* Clutter */
--clutter-paper: #fefefe;
--clutter-cable: #2d3748;
--clutter-box: #d69e2e;
--clutter-pizza: #f6ad55;
```

### Typography

- **Character names**: 12px, sans-serif, medium
- **Tooltips**: 14px, sans-serif, regular
- **Area labels**: 16px, sans-serif, bold
- **UI controls**: 14px, sans-serif, medium

## Future Enhancements (Post-MVP)

### Phase 2 (After initial release)

- [ ] Individual character personalities
- [ ] Character skill levels visualization
- [ ] Office customization (themes)
- [ ] Day/night cycle
- [ ] Weather effects (visible through windows)

### Phase 3 (Long-term)

- [ ] 3D perspective toggle
- [ ] VR mode exploration
- [ ] Character dialogue bubbles
- [ ] Mini-games (water cooler chat)
- [ ] Historical replays (watch any week)

---

**Status**: Design complete, ready for implementation
**Estimated time**: 5-7 days
**Complexity**: Medium-High
**Risk**: Low (incremental implementation, testable at each stage)
