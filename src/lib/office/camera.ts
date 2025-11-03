/**
 * Camera System
 *
 * Camera controls, transformations, and viewport management
 */

import type { Camera, Point, Rectangle, GridPosition, CameraTarget } from '../../types/office';
import { gridToScreen } from './spatial';
import type { OfficeGrid } from '../../types/office';
import { Easing } from './animation';

// ============================================================================
// CAMERA CREATION
// ============================================================================

export function createCamera(viewportWidth: number, viewportHeight: number): Camera {
  return {
    position: { x: 0, y: 0 },
    zoom: 1.0,
    rotation: 0,
    bounds: {
      x: 0,
      y: 0,
      width: viewportWidth,
      height: viewportHeight
    }
  };
}

// ============================================================================
// CAMERA TRANSFORMATIONS
// ============================================================================

/**
 * Apply camera transformation to canvas context
 */
export function applyCamera(ctx: CanvasRenderingContext2D, camera: Camera): void {
  const centerX = camera.bounds.width / 2;
  const centerY = camera.bounds.height / 2;

  // Reset transform
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Move to center, zoom, rotate, move to camera position
  ctx.translate(centerX, centerY);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.rotate((camera.rotation * Math.PI) / 180);
  ctx.translate(-camera.position.x, -camera.position.y);
}

/**
 * Convert screen coordinates to world coordinates
 */
export function screenToWorld(screenPos: Point, camera: Camera): Point {
  const centerX = camera.bounds.width / 2;
  const centerY = camera.bounds.height / 2;

  // Reverse camera transform
  const x = (screenPos.x - centerX) / camera.zoom + camera.position.x;
  const y = (screenPos.y - centerY) / camera.zoom + camera.position.y;

  return { x, y };
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(worldPos: Point, camera: Camera): Point {
  const centerX = camera.bounds.width / 2;
  const centerY = camera.bounds.height / 2;

  const x = (worldPos.x - camera.position.x) * camera.zoom + centerX;
  const y = (worldPos.y - camera.position.y) * camera.zoom + centerY;

  return { x, y };
}

/**
 * Check if a world position is visible in camera
 */
export function isVisible(worldPos: Point, camera: Camera, margin: number = 100): boolean {
  const screenPos = worldToScreen(worldPos, camera);

  return (
    screenPos.x >= -margin &&
    screenPos.x <= camera.bounds.width + margin &&
    screenPos.y >= -margin &&
    screenPos.y <= camera.bounds.height + margin
  );
}

/**
 * Get visible world bounds
 */
export function getVisibleBounds(camera: Camera): Rectangle {
  const topLeft = screenToWorld({ x: 0, y: 0 }, camera);
  const bottomRight = screenToWorld(
    { x: camera.bounds.width, y: camera.bounds.height },
    camera
  );

  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y
  };
}

// ============================================================================
// CAMERA CONTROLLER
// ============================================================================

export class CameraController {
  private camera: Camera;
  private minZoom: number;
  private maxZoom: number;
  private panSpeed: number;
  private zoomSpeed: number;

  // Animation state
  private isAnimating: boolean = false;
  private animationStart: number = 0;
  private animationDuration: number = 0;
  private startState: Camera | null = null;
  private targetState: CameraTarget | null = null;

  constructor(
    camera: Camera,
    minZoom: number = 0.5,
    maxZoom: number = 2.0,
    panSpeed: number = 1.0,
    zoomSpeed: number = 0.1
  ) {
    this.camera = camera;
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
    this.panSpeed = panSpeed;
    this.zoomSpeed = zoomSpeed;
  }

  /**
   * Get current camera
   */
  getCamera(): Camera {
    return this.camera;
  }

  /**
   * Pan camera by delta
   */
  pan(dx: number, dy: number): void {
    this.camera.position.x += dx * this.panSpeed / this.camera.zoom;
    this.camera.position.y += dy * this.panSpeed / this.camera.zoom;
  }

  /**
   * Zoom camera
   */
  zoom(factor: number, center?: Point): void {
    const oldZoom = this.camera.zoom;
    const newZoom = Math.max(
      this.minZoom,
      Math.min(this.maxZoom, this.camera.zoom * (1 + factor * this.zoomSpeed))
    );

    this.camera.zoom = newZoom;

    // Zoom towards a point
    if (center) {
      const worldPos = screenToWorld(center, { ...this.camera, zoom: oldZoom });
      const newWorldPos = screenToWorld(center, this.camera);

      this.camera.position.x += worldPos.x - newWorldPos.x;
      this.camera.position.y += worldPos.y - newWorldPos.y;
    }
  }

  /**
   * Set zoom level
   */
  setZoom(zoom: number): void {
    this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
  }

  /**
   * Focus on a world position
   */
  focusOn(worldPos: Point, zoom?: number, duration?: number): void {
    if (duration && duration > 0) {
      // Animated focus
      this.animateTo(
        {
          position: worldPos,
          zoom: zoom || this.camera.zoom,
          duration
        }
      );
    } else {
      // Instant focus
      this.camera.position = { ...worldPos };
      if (zoom !== undefined) {
        this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
      }
    }
  }

  /**
   * Focus on a grid position
   */
  focusOnGrid(gridPos: GridPosition, grid: OfficeGrid, zoom?: number, duration?: number): void {
    const worldPos = gridToScreen(gridPos, grid);
    this.focusOn(worldPos, zoom, duration);
  }

  /**
   * Fit all entities in view
   */
  fitToView(worldPositions: Point[], padding: number = 50): void {
    if (worldPositions.length === 0) return;

    // Calculate bounding box
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const pos of worldPositions) {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x);
      maxY = Math.max(maxY, pos.y);
    }

    const boundsWidth = maxX - minX + padding * 2;
    const boundsHeight = maxY - minY + padding * 2;

    // Calculate zoom to fit
    const zoomX = this.camera.bounds.width / boundsWidth;
    const zoomY = this.camera.bounds.height / boundsHeight;
    const zoom = Math.min(zoomX, zoomY);

    // Center on bounding box
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    this.focusOn({ x: centerX, y: centerY }, zoom);
  }

  /**
   * Reset camera to default
   */
  reset(): void {
    this.camera.position = { x: 0, y: 0 };
    this.camera.zoom = 1.0;
    this.camera.rotation = 0;
    this.isAnimating = false;
  }

  /**
   * Animate camera to target
   */
  animateTo(target: CameraTarget): void {
    this.isAnimating = true;
    this.animationStart = Date.now();
    this.animationDuration = target.duration || 800;
    this.startState = { ...this.camera };
    this.targetState = target;
  }

  /**
   * Update camera animation
   */
  update(currentTime: number): boolean {
    if (!this.isAnimating || !this.startState || !this.targetState) {
      return false;
    }

    const elapsed = currentTime - this.animationStart;
    const progress = Math.min(elapsed / this.animationDuration, 1);
    const t = Easing.easeInOutCubic(progress);

    // Interpolate position
    this.camera.position.x =
      this.startState.position.x +
      (this.targetState.position.x - this.startState.position.x) * t;

    this.camera.position.y =
      this.startState.position.y +
      (this.targetState.position.y - this.startState.position.y) * t;

    // Interpolate zoom
    if (this.targetState.zoom !== undefined) {
      this.camera.zoom =
        this.startState.zoom + (this.targetState.zoom - this.startState.zoom) * t;
    }

    // Check if complete
    if (progress >= 1) {
      this.isAnimating = false;
      return true;
    }

    return false;
  }

  /**
   * Check if camera is animating
   */
  isInAnimation(): boolean {
    return this.isAnimating;
  }

  /**
   * Stop current animation
   */
  stopAnimation(): void {
    this.isAnimating = false;
    this.startState = null;
    this.targetState = null;
  }

  dispose(): void {
    this.stopAnimation();
    this.startState = null;
    this.targetState = null;
  }
}
