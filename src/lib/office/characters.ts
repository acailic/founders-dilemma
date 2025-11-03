/**
 * Character System
 *
 * Team member generation, persistence, and management
 */

import type { TeamMember, GridPosition } from '../../types/office';
import { Role, Seniority, Mood, ActionType, Direction } from '../../types/office';

export type RandomFn = () => number;

const fallbackRng: RandomFn = () => Math.random();

function randomItem<T>(rng: RandomFn, items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('randomItem called with empty array');
  }

  const index = Math.floor(rng() * items.length);
  const safeIndex = Math.max(0, Math.min(items.length - 1, index));
  return items[safeIndex];
}

// ============================================================================
// NAME GENERATION
// ============================================================================

const FIRST_NAMES = [
  // Gender-neutral tech names
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie',
  'Sam', 'Chris', 'Pat', 'Drew', 'Quinn', 'Avery', 'Reese',
  // Tech-inspired
  'Ada', 'Grace', 'Alan', 'Linus', 'Dennis', 'Bjarne', 'Ken',
  'Thompson', 'Ritchie', 'Kernighan', 'Stroustrup', 'Torvalds'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King'
];

function generateName(rng: RandomFn = fallbackRng): string {
  const firstName = randomItem(rng, FIRST_NAMES);
  const lastName = randomItem(rng, LAST_NAMES);
  return `${firstName} ${lastName}`;
}

// ============================================================================
// ROLE DISTRIBUTION
// ============================================================================

/**
 * Determine role distribution based on team size and composition
 */
export function getRoleDistribution(teamSize: number): Role[] {
  const roles: Role[] = [];

  // Founder always present
  roles.push(Role.Founder);

  if (teamSize === 1) {
    return roles;
  }

  // Distribution ratios for different team sizes
  if (teamSize <= 3) {
    // Early team: Founder + Engineer(s)
    for (let i = 1; i < teamSize; i++) {
      roles.push(Role.Engineer);
    }
  } else if (teamSize <= 7) {
    // Small team: Founder + 60% Eng + 30% Sales + 10% Designer
    roles.push(Role.Engineer);
    roles.push(Role.Engineer);
    roles.push(Role.Sales);

    if (teamSize > 4) roles.push(Role.Engineer);
    if (teamSize > 5) roles.push(Role.Designer);
    if (teamSize > 6) roles.push(Role.Engineer);
  } else if (teamSize <= 12) {
    // Medium team: More balanced
    const engCount = Math.ceil(teamSize * 0.5);
    const salesCount = Math.ceil(teamSize * 0.25);
    const designerCount = Math.ceil(teamSize * 0.15);
    const opsCount = teamSize - engCount - salesCount - designerCount - 1; // -1 for founder

    for (let i = 0; i < engCount; i++) roles.push(Role.Engineer);
    for (let i = 0; i < salesCount; i++) roles.push(Role.Sales);
    for (let i = 0; i < designerCount; i++) roles.push(Role.Designer);
    for (let i = 0; i < opsCount; i++) roles.push(Role.Operations);
  } else {
    // Large team: Full distribution
    const engCount = Math.ceil(teamSize * 0.45);
    const salesCount = Math.ceil(teamSize * 0.25);
    const designerCount = Math.ceil(teamSize * 0.15);
    const marketingCount = Math.ceil(teamSize * 0.08);
    const opsCount = teamSize - engCount - salesCount - designerCount - marketingCount - 1;

    for (let i = 0; i < engCount; i++) roles.push(Role.Engineer);
    for (let i = 0; i < salesCount; i++) roles.push(Role.Sales);
    for (let i = 0; i < designerCount; i++) roles.push(Role.Designer);
    for (let i = 0; i < marketingCount; i++) roles.push(Role.Marketing);
    for (let i = 0; i < opsCount; i++) roles.push(Role.Operations);
  }

  return roles.slice(0, teamSize); // Ensure exact count
}

/**
 * Determine seniority based on role and team composition
 */
export function determineSeniority(
  role: Role,
  teamSize: number,
  rng: RandomFn = fallbackRng
): Seniority {
  if (role === Role.Founder) {
    return Seniority.Founder;
  }

  if (teamSize <= 5) {
    return rng() < 0.6 ? Seniority.Senior : Seniority.Mid;
  }

  if (teamSize <= 10) {
    const roll = rng();
    if (roll < 0.3) return Seniority.Senior;
    if (roll < 0.7) return Seniority.Mid;
    return Seniority.Junior;
  }

  const roll = rng();
  if (roll < 0.2) return Seniority.Senior;
  if (roll < 0.5) return Seniority.Mid;
  return Seniority.Junior;
}

// ============================================================================
// MOOD MAPPING
// ============================================================================

/**
 * Map morale value to mood enum
 */
export function moraleToMood(morale: number): Mood {
  if (morale >= 80) return Mood.Thriving;
  if (morale >= 60) return Mood.Happy;
  if (morale >= 40) return Mood.Neutral;
  if (morale >= 20) return Mood.Stressed;
  return Mood.Exhausted;
}

/**
 * Get mood color
 */
export function getMoodColor(mood: Mood): string {
  switch (mood) {
    case Mood.Thriving: return '#48bb78';    // Green
    case Mood.Happy: return '#4299e1';       // Blue
    case Mood.Neutral: return '#718096';     // Gray
    case Mood.Stressed: return '#ed8936';    // Orange
    case Mood.Exhausted: return '#f56565';   // Red
  }
}

// ============================================================================
// ACTION SELECTION
// ============================================================================

/**
 * Select appropriate action based on role and context
 */
export function selectAction(role: Role, week: number): ActionType {
  // Cycle through actions based on week and role
  const cycle = week % 4;

  switch (role) {
    case Role.Founder:
      // Founders do everything
      return [ActionType.Coding, ActionType.Meeting, ActionType.Calling, ActionType.Idle][cycle];

    case Role.Engineer:
      return cycle === 3 ? ActionType.Meeting : ActionType.Coding;

    case Role.Sales:
      return cycle === 3 ? ActionType.Meeting : ActionType.Calling;

    case Role.Designer:
      return cycle === 3 ? ActionType.Meeting : ActionType.Designing;

    case Role.Marketing:
      return cycle === 3 ? ActionType.Meeting : ActionType.Writing;

    case Role.Operations:
      return cycle === 3 ? ActionType.Meeting : ActionType.Idle;

    default:
      return ActionType.Idle;
  }
}

// ============================================================================
// TEAM GENERATION
// ============================================================================

/**
 * Generate a team member
 */
export function generateTeamMember(
  role: Role,
  week: number,
  position: GridPosition,
  teamSize: number,
  rng: RandomFn = fallbackRng
): TeamMember {
  const seniority = determineSeniority(role, teamSize, rng);
  const randomSuffix = Math.floor(rng() * 1e9).toString(36);
  const id = `member-${week}-${role}-${randomSuffix}`;

  return {
    id,
    name: generateName(rng),
    role,
    seniority,
    joinedWeek: week,

    // Visual state
    position,
    currentAction: selectAction(role, week),
    mood: Mood.Happy,  // Default, will be updated
    facingDirection: Direction.South,

    // Animation
    animationState: 'idle',
    animationFrame: 0,

    // Stats
    productivity: 70 + Math.round(rng() * 20),  // 70-90
    satisfaction: 70 + Math.round(rng() * 20),   // 70-90
    velocity: 1.0
  };
}

/**
 * Generate entire team based on size
 */
export function generateTeam(
  teamSize: number,
  week: number,
  availablePositions: GridPosition[],
  rng: RandomFn = fallbackRng
): TeamMember[] {
  const roles = getRoleDistribution(teamSize);
  const team: TeamMember[] = [];

  for (let i = 0; i < roles.length && i < availablePositions.length; i++) {
    const member = generateTeamMember(
      roles[i],
      week,
      availablePositions[i],
      teamSize,
      rng
    );
    team.push(member);
  }

  return team;
}

// ============================================================================
// TEAM PERSISTENCE
// ============================================================================

interface TeamHistory {
  members: Map<string, TeamMember>;  // All members ever
  activeIds: Set<string>;             // Currently active
  leftIds: Set<string>;               // Left the company
}

export class TeamManager {
  private history: TeamHistory = {
    members: new Map(),
    activeIds: new Set(),
    leftIds: new Set()
  };

  /**
   * Update team based on new size
   */
  updateTeam(
    targetSize: number,
    week: number,
    morale: number,
    availablePositions: GridPosition[],
    rng: RandomFn = fallbackRng
  ): TeamMember[] {
    const currentSize = this.history.activeIds.size;

    if (targetSize > currentSize) {
      // Hire new members
      this.hire(targetSize - currentSize, week, availablePositions, rng);
    } else if (targetSize < currentSize) {
      // Let people go (layoffs/churn)
      this.layoff(currentSize - targetSize, week);
    }

    // Update existing members
    return this.getActiveTeam(morale, week);
  }

  private hire(
    count: number,
    week: number,
    availablePositions: GridPosition[],
    rng: RandomFn
  ): void {
    const currentSize = this.history.activeIds.size;
    const roles = getRoleDistribution(currentSize + count).slice(currentSize);

    const occupiedPositions = this.getActiveTeam(70, week).map(m => m.position);
    const freePositions = availablePositions.filter(
      pos => !occupiedPositions.some(
        occ => occ.x === pos.x && occ.y === pos.y
      )
    );

    for (let i = 0; i < count && i < roles.length && i < freePositions.length; i++) {
      const member = generateTeamMember(
        roles[i],
        week,
        freePositions[i],
        currentSize + count,
        rng
      );

      this.history.members.set(member.id, member);
      this.history.activeIds.add(member.id);
    }
  }

  private layoff(count: number, week: number): void {
    // Select members to let go (prefer juniors, recent hires)
    const activeMembers = this.getActiveTeam(70, week);

    // Never let founder go
    const candidates = activeMembers
      .filter(m => m.role !== Role.Founder)
      .sort((a, b) => {
        // Sort by: Junior > Mid > Senior, Recent > Old
        const seniorityWeight = {
          [Seniority.Junior]: 3,
          [Seniority.Mid]: 2,
          [Seniority.Senior]: 1,
          [Seniority.Founder]: 0
        };

        const aScore = seniorityWeight[a.seniority] * 100 - a.joinedWeek;
        const bScore = seniorityWeight[b.seniority] * 100 - b.joinedWeek;

        return bScore - aScore;  // Higher score = more likely to be let go
      });

    for (let i = 0; i < count && i < candidates.length; i++) {
      const member = candidates[i];
      member.leftWeek = week;
      this.history.activeIds.delete(member.id);
      this.history.leftIds.add(member.id);
    }
  }

  private getActiveTeam(morale: number, week: number): TeamMember[] {
    const mood = moraleToMood(morale);
    const team: TeamMember[] = [];

    for (const id of this.history.activeIds) {
      const member = this.history.members.get(id);
      if (member) {
        // Update mood and action
        member.mood = mood;
        member.currentAction = selectAction(member.role, week);
        member.satisfaction = morale;

        team.push(member);
      }
    }

    return team;
  }

  /**
   * Get specific member by ID
   */
  getMember(id: string): TeamMember | undefined {
    return this.history.members.get(id);
  }

  /**
   * Get all members who left
   */
  getAlumni(): TeamMember[] {
    const alumni: TeamMember[] = [];

    for (const id of this.history.leftIds) {
      const member = this.history.members.get(id);
      if (member) alumni.push(member);
    }

    return alumni.sort((a, b) => (b.leftWeek || 0) - (a.leftWeek || 0));
  }

  /**
   * Get team size history
   */
  getTeamSizeHistory(): { week: number; size: number }[] {
    // TODO: Track this properly
    return [];
  }

  /**
   * Reset team (for new game)
   */
  reset(): void {
    this.history = {
      members: new Map(),
      activeIds: new Set(),
      leftIds: new Set()
    };
  }
}
