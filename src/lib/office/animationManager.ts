/**
 * Office Animation Manager
 *
 * Produces deterministic animation samples for office entities so the renderer
 * can keep visuals lively without storing per-frame state in React.
 */

import {
  ActionType,
  Mood,
  type OfficeState,
  type TeamMember
} from '../../types/office';

export interface CharacterAnimationSample {
  bobOffset: number;        // Vertical bob in pixels
  armSwing: number;         // Normalised -1..1 swing value
  glowScale: number;        // Radius multiplier for mood halo
  glowAlpha: number;        // Alpha multiplier for mood halo
  jitter: number;           // Tiny jitter for outlines so characters feel alive
}

interface MemberAnimationProfile {
  bobPhase: number;
  armPhase: number;
  glowPhase: number;
  baseSpeed: number;
}

const TWO_PI = Math.PI * 2;

const ACTION_SETTINGS: Record<ActionType, { speed: number; bob: number; arm: number }> = {
  [ActionType.Coding]: { speed: 1.3, bob: 3.5, arm: 1.0 },
  [ActionType.Meeting]: { speed: 0.8, bob: 2.0, arm: 0.4 },
  [ActionType.Calling]: { speed: 1.0, bob: 2.5, arm: 1.2 },
  [ActionType.Designing]: { speed: 1.1, bob: 3.0, arm: 0.9 },
  [ActionType.Writing]: { speed: 1.0, bob: 2.8, arm: 0.7 },
  [ActionType.Celebrating]: { speed: 1.8, bob: 6.0, arm: 1.8 },
  [ActionType.Break]: { speed: 0.6, bob: 1.5, arm: 0.3 },
  [ActionType.Idle]: { speed: 0.7, bob: 1.8, arm: 0.4 },
  [ActionType.Walking]: { speed: 1.6, bob: 4.0, arm: 1.5 }
};

const MOOD_GLOW: Record<Mood, { scale: number; alpha: number }> = {
  [Mood.Thriving]: { scale: 1.12, alpha: 0.55 },
  [Mood.Happy]: { scale: 1.08, alpha: 0.45 },
  [Mood.Neutral]: { scale: 1.02, alpha: 0.35 },
  [Mood.Stressed]: { scale: 0.96, alpha: 0.28 },
  [Mood.Exhausted]: { scale: 0.92, alpha: 0.18 }
};

/**
 * The animation manager is intentionally stateless with respect to frames.
 * It only caches per-entity randomisation so animations are reproducible.
 */
export class OfficeAnimationManager {
  private profiles: Map<string, MemberAnimationProfile> = new Map();
  private reusableSample: CharacterAnimationSample = {
    bobOffset: 0,
    armSwing: 0,
    glowScale: 1,
    glowAlpha: 0.3,
    jitter: 0
  };

  update(state: OfficeState): void {
    const activeIds = new Set(state.team.map(member => member.id));

    // Register new members with deterministic profiles.
    for (const member of state.team) {
      if (!this.profiles.has(member.id)) {
        this.profiles.set(member.id, this.createProfile(member.id));
      }
    }

    // Remove profiles of people who left the team.
    for (const id of this.profiles.keys()) {
      if (!activeIds.has(id)) {
        this.profiles.delete(id);
      }
    }
  }

  getCharacterSample(member: TeamMember, timestamp: number): CharacterAnimationSample {
    const profile = this.profiles.get(member.id) ?? this.createAndStoreProfile(member.id);

    const settings = ACTION_SETTINGS[member.currentAction] ?? ACTION_SETTINGS[ActionType.Idle];
    const glowSettings = MOOD_GLOW[member.mood] ?? MOOD_GLOW[Mood.Neutral];

    const timeSeconds = timestamp / 1000;

    const primaryPhase = (timeSeconds * settings.speed + profile.bobPhase) * TWO_PI;
    const armPhase = (timeSeconds * settings.speed * 1.15 + profile.armPhase) * TWO_PI;
    const glowPhase = (timeSeconds * 0.4 + profile.glowPhase) * TWO_PI;

    const moraleFactor = clamp(member.satisfaction / 100, 0.35, 1.15);

    this.reusableSample.bobOffset = Math.sin(primaryPhase) * settings.bob * moraleFactor;
    this.reusableSample.armSwing = Math.sin(armPhase) * settings.arm;
    this.reusableSample.glowScale = glowSettings.scale + Math.sin(glowPhase) * 0.06;
    this.reusableSample.glowAlpha = glowSettings.alpha + Math.sin(glowPhase) * 0.05;
    this.reusableSample.jitter = Math.sin(primaryPhase * 2 + profile.baseSpeed) * 0.6;

    return this.reusableSample;
  }

  private createAndStoreProfile(id: string): MemberAnimationProfile {
    const profile = this.createProfile(id);
    this.profiles.set(id, profile);
    return profile;
  }

  private createProfile(id: string): MemberAnimationProfile {
    return {
      bobPhase: this.hashToUnit(id, 17),
      armPhase: this.hashToUnit(id, 41),
      glowPhase: this.hashToUnit(id, 73),
      baseSpeed: 0.7 + this.hashToUnit(id, 123) * 0.6
    };
  }

  private hashToUnit(input: string, salt: number): number {
    let hash = 2166136261 ^ salt;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967296;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
