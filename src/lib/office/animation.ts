/**
 * Animation System Utilities
 *
 * Easing functions, animation helpers, and timing utilities
 */

import type { EasingFunction, Animation, Entity, AnimationType } from '../../types/office';

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

export const Easing = {
  // Linear
  linear: (t: number): number => t,

  // Quadratic
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  // Cubic
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => (--t) * t * t + 1,
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Quartic
  easeInQuart: (t: number): number => t * t * t * t,
  easeOutQuart: (t: number): number => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number): number =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,

  // Quintic
  easeInQuint: (t: number): number => t * t * t * t * t,
  easeOutQuint: (t: number): number => 1 + (--t) * t * t * t * t,
  easeInOutQuint: (t: number): number =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,

  // Sine
  easeInSine: (t: number): number => -Math.cos(t * Math.PI / 2) + 1,
  easeOutSine: (t: number): number => Math.sin(t * Math.PI / 2),
  easeInOutSine: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2,

  // Exponential
  easeInExpo: (t: number): number => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t: number): number => t === 1 ? 1 : -Math.pow(2, -10 * t) + 1,
  easeInOutExpo: (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },

  // Circular
  easeInCirc: (t: number): number => -Math.sqrt(1 - t * t) + 1,
  easeOutCirc: (t: number): number => Math.sqrt(1 - (t = t - 1) * t),
  easeInOutCirc: (t: number): number =>
    t < 0.5
      ? -(Math.sqrt(1 - (2 * t) * (2 * t)) - 1) / 2
      : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2,

  // Elastic
  easeInElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },

  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  easeInOutElastic: (t: number): number => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },

  // Back
  easeInBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },

  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  easeInOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  // Bounce
  easeInBounce: (t: number): number => 1 - Easing.easeOutBounce(1 - t),

  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },

  easeInOutBounce: (t: number): number =>
    t < 0.5
      ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
      : (1 + Easing.easeOutBounce(2 * t - 1)) / 2
};

// ============================================================================
// ANIMATION HELPERS
// ============================================================================

/**
 * Create a new animation
 */
export function createAnimation(
  type: AnimationType,
  target: Entity,
  duration: number,
  properties: Record<string, any>,
  easing: EasingFunction = Easing.easeInOutQuad,
  onComplete?: () => void
): Animation {
  return {
    id: `${type}-${target.id}-${Date.now()}`,
    type,
    target,
    duration,
    startTime: Date.now(),
    progress: 0,
    easing,
    properties,
    onComplete
  };
}

/**
 * Update animation progress
 */
export function updateAnimation(animation: Animation, currentTime: number): boolean {
  const elapsed = currentTime - animation.startTime;
  const rawProgress = Math.min(elapsed / animation.duration, 1);
  animation.progress = animation.easing(rawProgress);

  // Return true if animation is complete
  return rawProgress >= 1;
}

/**
 * Interpolate between two values using animation progress
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Interpolate between two points
 */
export function lerpPoint(
  start: { x: number; y: number },
  end: { x: number; y: number },
  t: number
): { x: number; y: number } {
  return {
    x: lerp(start.x, end.x, t),
    y: lerp(start.y, end.y, t)
  };
}

/**
 * Interpolate color (hex format)
 */
export function lerpColor(startColor: string, endColor: string, t: number): string {
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);

  if (!start || !end) return startColor;

  const r = Math.round(lerp(start.r, end.r, t));
  const g = Math.round(lerp(start.g, end.g, t));
  const b = Math.round(lerp(start.b, end.b, t));

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

export const AnimationPresets = {
  // Character animations
  walk: {
    duration: 500,
    easing: Easing.linear
  },

  type: {
    duration: 2000,
    easing: Easing.linear
  },

  celebrate: {
    duration: 1500,
    easing: Easing.easeOutBounce
  },

  slump: {
    duration: 1000,
    easing: Easing.easeInQuad
  },

  // Environment animations
  clutterAccumulate: {
    duration: 2000,
    easing: Easing.easeOutQuad
  },

  clutterClear: {
    duration: 1500,
    easing: Easing.easeInOutQuad
  },

  plantGrow: {
    duration: 3000,
    easing: Easing.easeOutCubic
  },

  // Camera animations
  cameraZoom: {
    duration: 600,
    easing: Easing.easeInOutQuad
  },

  cameraPan: {
    duration: 800,
    easing: Easing.easeInOutCubic
  },

  // UI animations
  fadeIn: {
    duration: 300,
    easing: Easing.easeOutQuad
  },

  fadeOut: {
    duration: 300,
    easing: Easing.easeInQuad
  },

  pulse: {
    duration: 1000,
    easing: Easing.easeInOutSine
  }
};

// ============================================================================
// FRAME TIMING
// ============================================================================

export class FrameTimer {
  private lastFrameTime: number = 0;
  private deltaTime: number = 0;
  private fps: number = 60;
  private frameCount: number = 0;
  private fpsUpdateInterval: number = 1000;
  private lastFpsUpdate: number = 0;

  update(currentTime: number): void {
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = currentTime;
      return;
    }

    this.deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Update FPS counter
    this.frameCount++;

    if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastFpsUpdate)
      );
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }
  }

  getDeltaTime(): number {
    return this.deltaTime;
  }

  getFPS(): number {
    return this.fps;
  }

  getDeltaSeconds(): number {
    return this.deltaTime / 1000;
  }
}

// ============================================================================
// ANIMATION SEQUENCES
// ============================================================================

export class AnimationSequence {
  private animations: Animation[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private loop: boolean = false;

  constructor(animations: Animation[], loop: boolean = false) {
    this.animations = animations;
    this.loop = loop;
  }

  start(): void {
    this.isPlaying = true;
    this.currentIndex = 0;
  }

  stop(): void {
    this.isPlaying = false;
  }

  reset(): void {
    this.currentIndex = 0;
    this.isPlaying = false;
  }

  update(currentTime: number): boolean {
    if (!this.isPlaying || this.animations.length === 0) {
      return false;
    }

    const current = this.animations[this.currentIndex];
    const isComplete = updateAnimation(current, currentTime);

    if (isComplete) {
      current.onComplete?.();

      this.currentIndex++;

      if (this.currentIndex >= this.animations.length) {
        if (this.loop) {
          this.currentIndex = 0;
        } else {
          this.isPlaying = false;
          return true;  // Sequence complete
        }
      }
    }

    return false;
  }

  getCurrentAnimation(): Animation | null {
    if (!this.isPlaying || this.currentIndex >= this.animations.length) {
      return null;
    }

    return this.animations[this.currentIndex];
  }

  isComplete(): boolean {
    return !this.isPlaying;
  }
}

// ============================================================================
// SPRING PHYSICS (for natural movement)
// ============================================================================

export class SpringPhysics {
  private value: number;
  private velocity: number = 0;
  private target: number;

  private stiffness: number;
  private damping: number;
  private mass: number;

  constructor(
    initialValue: number,
    stiffness: number = 200,
    damping: number = 20,
    mass: number = 1
  ) {
    this.value = initialValue;
    this.target = initialValue;
    this.stiffness = stiffness;
    this.damping = damping;
    this.mass = mass;
  }

  setTarget(target: number): void {
    this.target = target;
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;  // Convert to seconds

    // Spring force
    const springForce = -this.stiffness * (this.value - this.target);

    // Damping force
    const dampingForce = -this.damping * this.velocity;

    // Total force
    const force = springForce + dampingForce;

    // Acceleration
    const acceleration = force / this.mass;

    // Update velocity and position
    this.velocity += acceleration * dt;
    this.value += this.velocity * dt;
  }

  getValue(): number {
    return this.value;
  }

  setValue(value: number): void {
    this.value = value;
    this.velocity = 0;
  }

  isAtRest(threshold: number = 0.01): boolean {
    return (
      Math.abs(this.value - this.target) < threshold &&
      Math.abs(this.velocity) < threshold
    );
  }
}
