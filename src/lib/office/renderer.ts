/**
 * Office Renderer
 *
 * Core canvas-based rendering engine with layer system
 */

import {
  FurnitureType,
  ClutterType,
  ActionType,
  type OfficeState,
  type Camera,
  type RenderContext,
  type Tile,
  type TeamMember,
  type Furniture,
  type ClutterItem,
  type GridPosition,
  type Point
} from '../../types/office';
import {
  gridToScreen,
  calculateZIndex,
  TILE_HEIGHT,
  TILE_WIDTH,
  isInBounds
} from './spatial';
import { applyCamera } from './camera';
import { getMoodColor } from './characters';
import {
  OfficeAnimationManager,
  type CharacterAnimationSample
} from './animationManager';

// Cozy Stardew-inspired palette
const PALETTE = {
  floorLight: '#f8e7b5',
  floorShadow: '#e0c27a',
  floorHighlight: '#fff3d4',
  gridLine: '#c6a15c',
  shadow: 'rgba(0,0,0,0.18)',
  outline: '#3b2d1b',
  deskTop: '#d8a15d',
  deskEdge: '#9b6c3b',
  deskHighlight: '#f1c686',
  chairSeat: '#4d4f73',
  chairEdge: '#2c2f51',
  chairHighlight: '#6a6e9d',
  computerBody: '#323c52',
  monitorGlow: '#9fd1ff',
  plantLeaf: '#5a9c53',
  plantShadow: '#3f6f3a',
  whiteboard: '#f5f1db',
  whiteboardEdge: '#bfb287',
  clutterBox: '#d39c54',
  clutterPaper: '#fff9e6',
  clutterCoffee: '#7a5535'
} as const;

// ============================================================================
// RENDERER CLASS
// ============================================================================

interface InteractionState {
  hoveredTeamId: string | null;
  selectedTeamId: string | null;
}

export class OfficeRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lastFrameTime: number = 0;
  private animationManager: OfficeAnimationManager;
  private interactionState: InteractionState = {
    hoveredTeamId: null,
    selectedTeamId: null
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    this.ctx = ctx;
    this.setupCanvas();
    this.animationManager = new OfficeAnimationManager();
  }

  setInteractionState(state: InteractionState): void {
    this.interactionState = state;
  }

  dispose(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private setupCanvas(): void {
    // Set canvas size to match display size
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);

    // Set default rendering properties
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
  }

  /**
   * Resize canvas
   */
  resize(width: number, height: number): void {
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.setupCanvas();
  }

  /**
   * Main render function
   */
  render(state: OfficeState, camera: Camera): void {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    const context: RenderContext = {
      canvas: this.canvas,
      ctx: this.ctx,
      camera,
      deltaTime,
      timestamp: currentTime
    };

    this.animationManager.update(state);

    // Clear canvas
    this.clear();

    // Apply camera transform
    applyCamera(this.ctx, camera);

    // Render layers in order
    this.renderFloor(state, context);
    this.renderFurniture(state, context);
    this.renderClutter(state, context);
    this.renderCharacters(state, context);
    this.renderEffects(state, context);

    // Reset transform for UI layer
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.renderUI(state, context);
  }

  /**
   * Clear canvas
   */
  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background color
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#fdebc9');
    gradient.addColorStop(1, '#f6d391');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // ==========================================================================
  // LAYER RENDERING
  // ==========================================================================

  /**
   * Render floor layer
   */
  private renderFloor(state: OfficeState, context: RenderContext): void {
    const { grid, tiles } = state;

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        if (!tiles[y]) {
          continue;
        }

        const tile = tiles[y][x];
        if (!tile || !isInBounds({ x, y }, grid)) {
          continue;
        }
        const screenPos = gridToScreen({ x, y }, grid);

        this.drawTile(tile, screenPos, context, (x + y) % 2 === 0);
      }
    }
  }

  /**
   * Render furniture layer
   */
  private renderFurniture(state: OfficeState, context: RenderContext): void {
    // Sort furniture by z-index for proper isometric rendering
    const sorted = [...state.furniture].sort((a, b) =>
      calculateZIndex(a.position) - calculateZIndex(b.position)
    );

    for (const furniture of sorted) {
      if (!isInBounds(furniture.position, state.grid)) {
        continue;
      }
      const screenPos = gridToScreen(furniture.position, state.grid);
      this.drawFurniture(furniture, screenPos, context);
    }
  }

  /**
   * Render clutter layer
   */
  private renderClutter(state: OfficeState, context: RenderContext): void {
    const sorted = [...state.clutter].sort((a, b) =>
      calculateZIndex(a.position) - calculateZIndex(b.position)
    );

    for (const clutter of sorted) {
      if (!isInBounds(clutter.position, state.grid)) {
        continue;
      }
      const screenPos = gridToScreen(clutter.position, state.grid);
      this.drawClutter(clutter, screenPos, context);
  }
  }

  /**
   * Render characters layer
   */
  private renderCharacters(state: OfficeState, context: RenderContext): void {
    const sorted = [...state.team].sort((a, b) =>
      calculateZIndex(a.position) - calculateZIndex(b.position)
    );

    for (const member of sorted) {
      if (!isInBounds(member.position, state.grid)) {
        continue;
      }
      const screenPos = gridToScreen(member.position, state.grid);
      const animationSample = this.animationManager.getCharacterSample(member, context.timestamp);
      const interaction = {
        hovered: this.interactionState.hoveredTeamId === member.id,
        selected: this.interactionState.selectedTeamId === member.id
      };
      this.drawCharacter(member, screenPos, context, animationSample, interaction);
    }
  }

  /**
   * Render effects layer
   */
  private renderEffects(state: OfficeState, context: RenderContext): void {
    // TODO: Particle effects, animations, etc.
  }

  /**
   * Render UI layer (not affected by camera)
   */
  private renderUI(state: OfficeState, context: RenderContext): void {
    // Grid indicator (optional)
    if (false) {  // Debug mode
      this.drawGridOverlay(state, context);
    }
  }

  // ==========================================================================
  // DRAWING PRIMITIVES
  // ==========================================================================

  /**
   * Draw a single tile with warm Stardew-inspired shading
   */
  private drawTile(tile: Tile, screenPos: Point, context: RenderContext, isHighlight: boolean): void {
    const { ctx } = context;
    const halfW = TILE_WIDTH / 2;
    const halfH = TILE_HEIGHT / 2;

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);

    // Subtle drop shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    ctx.moveTo(0, 0);               // top
    ctx.lineTo(halfW, halfH);       // right
    ctx.lineTo(0, TILE_HEIGHT);     // bottom
    ctx.lineTo(-halfW, halfH);      // left
    ctx.closePath();

    const fill = ctx.createLinearGradient(-halfW, 0, halfW, TILE_HEIGHT);
    if (isHighlight) {
      fill.addColorStop(0, PALETTE.floorHighlight);
      fill.addColorStop(0.6, PALETTE.floorLight);
      fill.addColorStop(1, PALETTE.floorShadow);
    } else {
      fill.addColorStop(0, PALETTE.floorLight);
      fill.addColorStop(1, PALETTE.floorShadow);
    }
    ctx.fillStyle = fill;
    ctx.fill();

    // Outline
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = PALETTE.gridLine;
    ctx.stroke();

    // Texture: faint cross-hatch
    if (!tile.occupied) {
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(-halfW + 6, halfH - 6);
      ctx.lineTo(0, TILE_HEIGHT - 6);
      ctx.lineTo(halfW - 6, halfH - 6);
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.beginPath();
      ctx.ellipse(0, TILE_HEIGHT * 0.75, halfW * 0.6, halfH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draw furniture
   */
  private drawFurniture(furniture: Furniture, screenPos: Point, context: RenderContext): void {
    const { ctx } = context;

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y + TILE_HEIGHT / 2);

    // Different furniture types
    switch (furniture.type) {
      case FurnitureType.Desk:
        this.drawDesk(furniture, ctx);
        break;
      case FurnitureType.Chair:
        this.drawChair(furniture, ctx);
        break;
      case FurnitureType.Computer:
        this.drawComputer(furniture, ctx);
        break;
      case FurnitureType.Plant:
        this.drawPlant(furniture, ctx);
        break;
      case FurnitureType.Whiteboard:
        this.drawWhiteboard(furniture, ctx);
        break;
      default:
        this.drawGenericFurniture(furniture, ctx);
    }

    ctx.restore();
  }

  /**
   * Draw character
   */
  private drawCharacter(
    member: TeamMember,
    screenPos: Point,
    context: RenderContext,
    animation: CharacterAnimationSample,
    interaction: { hovered: boolean; selected: boolean }
  ): void {
    const { ctx } = context;

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y - TILE_HEIGHT / 4);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(0, TILE_HEIGHT * 0.55, TILE_WIDTH * 0.18, TILE_HEIGHT * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(animation.jitter, animation.bobOffset);

    // Character body (simplified)
    const moodColor = getMoodColor(member.mood);

    // Glow (mood indicator)
    ctx.strokeStyle = moodColor;
    ctx.lineWidth = 2;
    const glowScale = animation.glowScale * (interaction.selected ? 1.45 : interaction.hovered ? 1.18 : 1);
    const glowAlpha = Math.min(
      0.9,
      animation.glowAlpha + (interaction.selected ? 0.35 : interaction.hovered ? 0.18 : 0)
    );

    ctx.globalAlpha = glowAlpha;
    ctx.beginPath();
    ctx.arc(0, -8, 20 * glowScale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Body
    ctx.fillStyle = this.getRoleColor(member.role);
    ctx.beginPath();
    this.roundedRectPath(ctx, -8, 0, 16, 20, 6);
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = interaction.selected
      ? 'rgba(255,255,255,0.65)'
      : interaction.hovered
        ? 'rgba(255,255,255,0.35)'
        : 'rgba(0,0,0,0.25)';
    ctx.stroke();

    this.drawCharacterArms(ctx, member, animation);

    // Head
    ctx.fillStyle = '#f5d0a9';
    ctx.beginPath();
    ctx.arc(0, -10, 9, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-3, -11, 1.2, 0, Math.PI * 2);
    ctx.arc(3, -11, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.quadraticCurveTo(0, -4, 4, -6);
    ctx.stroke();

    ctx.restore();

    // Name label (static, no bob) - keep readable
    ctx.fillStyle = '#000';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(member.name.split(' ')[0], 0, TILE_HEIGHT * 0.75);

    ctx.restore();
  }

  private drawCharacterArms(
    ctx: CanvasRenderingContext2D,
    member: TeamMember,
    animation: CharacterAnimationSample
  ): void {
    const skinTone = '#f5d0a9';
    const config = this.getArmConfig(member.currentAction);

    const leftAngle = config.baseLeft + animation.armSwing * config.leftAmplitude;
    const rightAngle = config.baseRight - animation.armSwing * config.rightAmplitude;

    this.drawArm(ctx, -7.5, 4, leftAngle, config.length, skinTone);
    this.drawArm(ctx, 7.5, 4, rightAngle, config.length, skinTone);

    if (member.currentAction === ActionType.Calling) {
      ctx.save();
      ctx.translate(7.5, 4);
      ctx.rotate(rightAngle);
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(config.length - 3, -3, 3, 6);
      ctx.restore();
    }
  }

  private drawArm(
    ctx: CanvasRenderingContext2D,
    pivotX: number,
    pivotY: number,
    angle: number,
    length: number,
    skinTone: string
  ): void {
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(angle);
    ctx.fillStyle = skinTone;
    this.roundedRectPath(ctx, -1.6, 0, 3.2, length, 1.6);
    ctx.fill();
    ctx.restore();
  }

  private getArmConfig(action: ActionType): {
    baseLeft: number;
    baseRight: number;
    leftAmplitude: number;
    rightAmplitude: number;
    length: number;
  } {
    switch (action) {
      case ActionType.Coding:
        return {
          baseLeft: -0.8,
          baseRight: 0.8,
          leftAmplitude: 0.35,
          rightAmplitude: 0.35,
          length: 12
        };
      case ActionType.Calling:
        return {
          baseLeft: -0.15,
          baseRight: -1.2,
          leftAmplitude: 0.25,
          rightAmplitude: 0.3,
          length: 13
        };
      case ActionType.Celebrating:
        return {
          baseLeft: -1.6,
          baseRight: 1.6,
          leftAmplitude: 0.45,
          rightAmplitude: 0.45,
          length: 14
        };
      case ActionType.Designing:
      case ActionType.Writing:
        return {
          baseLeft: -0.45,
          baseRight: 0.45,
          leftAmplitude: 0.25,
          rightAmplitude: 0.25,
          length: 12
        };
      case ActionType.Walking:
        return {
          baseLeft: 0.3,
          baseRight: -0.3,
          leftAmplitude: 0.6,
          rightAmplitude: 0.6,
          length: 13
        };
      case ActionType.Break:
        return {
          baseLeft: -0.1,
          baseRight: 0.1,
          leftAmplitude: 0.18,
          rightAmplitude: 0.18,
          length: 11
        };
      default:
        return {
          baseLeft: 0.1,
          baseRight: -0.1,
          leftAmplitude: 0.25,
          rightAmplitude: 0.25,
          length: 12
        };
    }
  }

  /**
   * Draw clutter
   */
  private drawClutter(clutter: ClutterItem, screenPos: Point, context: RenderContext): void {
    const { ctx } = context;

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);

    ctx.globalAlpha = 1;
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 3;

    ctx.beginPath();
    switch (clutter.type) {
      case ClutterType.Papers:
        ctx.fillStyle = PALETTE.clutterPaper;
        ctx.strokeStyle = 'rgba(107, 70, 35, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.moveTo(-6, -2);
        ctx.lineTo(6, -2);
        ctx.lineTo(4, 4);
        ctx.lineTo(-4, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case ClutterType.Cables:
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.quadraticCurveTo(0, 5, 6, 0);
        ctx.stroke();
        break;

      case ClutterType.Boxes:
        ctx.fillStyle = PALETTE.clutterBox;
        ctx.strokeStyle = 'rgba(99,48,13,0.45)';
        ctx.lineWidth = 1.2;
        ctx.moveTo(-7, -4);
        ctx.lineTo(7, -4);
        ctx.lineTo(5, 6);
        ctx.lineTo(-5, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.moveTo(-5, -2);
        ctx.lineTo(5, -2);
        ctx.stroke();
        break;

      case ClutterType.PizzaBoxes:
        ctx.fillStyle = '#f7b267';
        ctx.strokeStyle = '#d47a30';
        ctx.lineWidth = 1;
        ctx.moveTo(-6, -2);
        ctx.lineTo(6, 0);
        ctx.lineTo(4, 5);
        ctx.lineTo(-6, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case ClutterType.CoffeeCups:
        ctx.fillStyle = PALETTE.clutterCoffee;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3e2514';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -1, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f4dfc5';
        ctx.fill();
        break;

      default:
        ctx.fillStyle = '#cbd5e0';
        ctx.fillRect(-3, -3, 6, 6);
    }

    ctx.globalAlpha = 1.0;
    ctx.shadowColor = 'transparent';
    ctx.restore();
  }

  // ==========================================================================
  // FURNITURE DRAWING HELPERS
  // ==========================================================================

  private drawDesk(_: Furniture, ctx: CanvasRenderingContext2D): void {
    const topWidth = TILE_WIDTH * 0.7;
    const topDepth = TILE_HEIGHT * 0.5;

    ctx.save();
    ctx.shadowColor = PALETTE.shadow;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 6;

    // Desktop (top face)
    ctx.beginPath();
    ctx.moveTo(-topWidth / 2, -topDepth * 0.4);
    ctx.lineTo(topWidth / 2, -topDepth * 0.4);
    ctx.lineTo(topWidth / 2 - 12, topDepth * 0.5);
    ctx.lineTo(-topWidth / 2 + 12, topDepth * 0.5);
    ctx.closePath();
    ctx.fillStyle = PALETTE.deskTop;
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke();

    // Front face
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.moveTo(-topWidth / 2 + 12, topDepth * 0.5);
    ctx.lineTo(topWidth / 2 - 12, topDepth * 0.5);
    ctx.lineTo(topWidth / 2 - 18, topDepth * 1.1);
    ctx.lineTo(-topWidth / 2 + 18, topDepth * 1.1);
    ctx.closePath();
    ctx.fillStyle = PALETTE.deskEdge;
    ctx.fill();
    ctx.stroke();

    // Highlight strip
    ctx.strokeStyle = PALETTE.deskHighlight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-topWidth / 2 + 16, topDepth * 0.7);
    ctx.lineTo(topWidth / 2 - 16, topDepth * 0.7);
    ctx.stroke();

    // Drawer handles
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-topWidth / 2 + 26, topDepth * 0.85);
    ctx.lineTo(-topWidth / 2 + 36, topDepth * 0.85);
    ctx.moveTo(topWidth / 2 - 36, topDepth * 0.85);
    ctx.lineTo(topWidth / 2 - 26, topDepth * 0.85);
    ctx.stroke();

    ctx.restore();
  }

  private drawChair(_: Furniture, ctx: CanvasRenderingContext2D): void {
    const seatWidth = TILE_WIDTH * 0.32;
    const seatDepth = TILE_HEIGHT * 0.35;

    ctx.save();
    ctx.shadowColor = PALETTE.shadow;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 5;

    // Seat cushion
    ctx.beginPath();
    ctx.moveTo(-seatWidth / 2, -seatDepth * 0.2);
    ctx.lineTo(seatWidth / 2, -seatDepth * 0.2);
    ctx.lineTo(seatWidth / 2 - 4, seatDepth * 0.6);
    ctx.lineTo(-seatWidth / 2 + 4, seatDepth * 0.6);
    ctx.closePath();
    ctx.fillStyle = PALETTE.chairSeat;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = PALETTE.chairEdge;
    ctx.stroke();

    // Highlight
    ctx.strokeStyle = PALETTE.chairHighlight;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-seatWidth / 2 + 4, seatDepth * 0.05);
    ctx.lineTo(seatWidth / 2 - 4, seatDepth * 0.05);
    ctx.stroke();

    // Backrest
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.moveTo(-seatWidth / 2 + 2, -seatDepth * 0.25);
    ctx.lineTo(seatWidth / 2 - 2, -seatDepth * 0.25);
    ctx.lineTo(seatWidth / 2 - 6, -seatDepth * 0.95);
    ctx.lineTo(-seatWidth / 2 + 6, -seatDepth * 0.95);
    ctx.closePath();
    ctx.fillStyle = PALETTE.chairSeat;
    ctx.fill();
    ctx.strokeStyle = PALETTE.chairEdge;
    ctx.stroke();

    ctx.restore();
  }

  private drawComputer(_: Furniture, ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 4;

    // Stand
    ctx.fillStyle = '#2a3144';
    ctx.fillRect(-3, 10, 6, 6);
    ctx.fillRect(-8, 16, 16, 3);

    // Screen
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = PALETTE.computerBody;
    ctx.beginPath();
    this.roundedRectPath(ctx, -14, -18, 28, 22, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = PALETTE.monitorGlow;
    const gradient = ctx.createLinearGradient(-12, -14, 12, 0);
    gradient.addColorStop(0, '#bde0fe');
    gradient.addColorStop(1, '#5aa0d6');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    this.roundedRectPath(ctx, -11, -13, 22, 17, 3);
    ctx.fill();

    ctx.restore();
  }

  private drawPlant(_: Furniture, ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.shadowColor = PALETTE.shadow;
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 4;

    // Pot
    ctx.beginPath();
    ctx.moveTo(-8, 6);
    ctx.lineTo(-6, -2);
    ctx.lineTo(6, -2);
    ctx.lineTo(8, 6);
    ctx.closePath();
    ctx.fillStyle = '#c98947';
    ctx.fill();
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Soil
    ctx.fillStyle = '#4f2f16';
    ctx.beginPath();
    ctx.ellipse(0, -2, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Leaves
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = PALETTE.plantLeaf;
    ctx.strokeStyle = PALETTE.plantShadow;
    ctx.lineWidth = 1;

    const leafShapes = [
      { x: -4, y: -10, w: 6, h: 10 },
      { x: 4, y: -9, w: 6, h: 10 },
      { x: 0, y: -14, w: 8, h: 12 }
    ];

    for (const leaf of leafShapes) {
      ctx.beginPath();
      ctx.ellipse(leaf.x, leaf.y, leaf.w, leaf.h, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawWhiteboard(_: Furniture, ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 5;

    const width = TILE_WIDTH * 0.8;
    const height = TILE_HEIGHT;

    ctx.beginPath();
    this.roundedRectPath(ctx, -width / 2, -height, width, height * 0.75, 6);
    ctx.fillStyle = PALETTE.whiteboard;
    ctx.fill();
    ctx.strokeStyle = PALETTE.whiteboardEdge;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#2b5cb3';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-width / 2 + 12, -height * 0.75 + 12);
    ctx.lineTo(-width / 2 + 36, -height * 0.75 + 16);
    ctx.moveTo(-width / 2 + 12, -height * 0.75 + 26);
    ctx.lineTo(-width / 2 + 28, -height * 0.75 + 24);
    ctx.stroke();

    ctx.restore();
  }

  private drawGenericFurniture(_: Furniture, ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.shadowColor = PALETTE.shadow;
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(10, -6);
    ctx.lineTo(8, 8);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fillStyle = '#9aa6b4';
    ctx.fill();
    ctx.strokeStyle = '#5c6472';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#bcc5d3';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.moveTo(0, -6);
    ctx.lineTo(-2, 8);
    ctx.stroke();

    ctx.restore();
  }

  private roundedRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    const r = Math.min(radius, width / 2, height / 2);

    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ==========================================================================
  // DEBUG HELPERS
  // ==========================================================================

  private drawGridOverlay(state: OfficeState, context: RenderContext): void {
    const { ctx } = context;
    const { grid } = state;

    ctx.save();
    applyCamera(ctx, context.camera);

    ctx.strokeStyle = 'rgba(255,0,0,0.2)';
    ctx.lineWidth = 1;

    for (let y = 0; y <= grid.height; y++) {
      for (let x = 0; x <= grid.width; x++) {
        const pos = gridToScreen({ x, y }, grid);
        ctx.fillStyle = 'rgba(255,0,0,0.5)';
        ctx.fillRect(pos.x - 2, pos.y - 2, 4, 4);
      }
    }

    ctx.restore();
  }

  // ==========================================================================
  // UTILITY
  // ==========================================================================

  private getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      founder: '#805ad5',
      engineer: '#3182ce',
      sales: '#38a169',
      designer: '#d53f8c',
      marketing: '#dd6b20',
      ops: '#718096'
    };

    return colors[role] || '#4a5568';
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
