/**
 * Character Sprite Component
 *
 * SVG-based character rendering with role-specific visuals and mood indicators
 */

import type { TeamMember } from '../../types/office';
import { Role, Mood, ActionType } from '../../types/office';
import { getMoodColor } from '../../lib/office/characters';

interface CharacterSpriteProps {
  member: TeamMember;
  size?: number;
  showLabel?: boolean;
  showMood?: boolean;
}

export default function CharacterSprite({
  member,
  size = 32,
  showLabel = true,
  showMood = true
}: CharacterSpriteProps) {
  const moodColor = getMoodColor(member.mood);

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size + (showLabel ? 20 : 0)}px`,
        display: 'inline-block'
      }}
    >
      {/* Character SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        style={{
          display: 'block'
        }}
      >
        {/* Shadow */}
        <ellipse
          cx="16"
          cy="30"
          rx="8"
          ry="2"
          fill="rgba(0,0,0,0.2)"
        />

        {/* Body */}
        <CharacterBody role={member.role} mood={member.mood} action={member.currentAction} />

        {/* Mood indicator (glow) */}
        {showMood && (
          <circle
            cx="16"
            cy="12"
            r="14"
            fill="none"
            stroke={moodColor}
            strokeWidth="1"
            opacity="0.3"
          />
        )}
      </svg>

      {/* Label */}
      {showLabel && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.9)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        >
          {member.name.split(' ')[0]}
        </div>
      )}

      {/* Role badge */}
      <div
        style={{
          position: 'absolute',
          top: -4,
          right: -4,
          fontSize: '12px'
        }}
      >
        {getRoleEmoji(member.role)}
      </div>
    </div>
  );
}

// ============================================================================
// CHARACTER BODY RENDERING
// ============================================================================

interface CharacterBodyProps {
  role: Role;
  mood: Mood;
  action: ActionType;
}

function CharacterBody({ role, mood, action }: CharacterBodyProps) {
  const bodyColor = getRoleColor(role);
  const skinTone = getSkinTone();

  return (
    <g>
      {/* Head */}
      <circle
        cx="16"
        cy="12"
        r="6"
        fill={skinTone}
        stroke="#4a5568"
        strokeWidth="0.5"
      />

      {/* Face expression */}
      <FaceExpression mood={mood} />

      {/* Body/Torso */}
      <rect
        x="11"
        y="17"
        width="10"
        height="10"
        rx="2"
        fill={bodyColor}
        stroke="#4a5568"
        strokeWidth="0.5"
      />

      {/* Arms */}
      <ActionPose action={action} skinTone={skinTone} />

      {/* Legs */}
      <g>
        <rect x="13" y="26" width="3" height="4" fill="#2d3748" />
        <rect x="16" y="26" width="3" height="4" fill="#2d3748" />
      </g>

      {/* Role-specific accessory */}
      <RoleAccessory role={role} />
    </g>
  );
}

// ============================================================================
// FACE EXPRESSIONS
// ============================================================================

function FaceExpression({ mood }: { mood: Mood }) {
  switch (mood) {
    case Mood.Thriving:
      return (
        <g>
          {/* Happy eyes */}
          <path d="M 13 11 Q 13 12 13.5 12 T 14 11" stroke="#000" strokeWidth="0.8" fill="none" />
          <path d="M 18 11 Q 18 12 18.5 12 T 19 11" stroke="#000" strokeWidth="0.8" fill="none" />
          {/* Big smile */}
          <path d="M 12 14 Q 16 16 20 14" stroke="#000" strokeWidth="0.8" fill="none" />
        </g>
      );

    case Mood.Happy:
      return (
        <g>
          {/* Normal eyes */}
          <circle cx="13.5" cy="11" r="0.8" fill="#000" />
          <circle cx="18.5" cy="11" r="0.8" fill="#000" />
          {/* Smile */}
          <path d="M 13 14 Q 16 15 19 14" stroke="#000" strokeWidth="0.8" fill="none" />
        </g>
      );

    case Mood.Neutral:
      return (
        <g>
          {/* Normal eyes */}
          <circle cx="13.5" cy="11" r="0.8" fill="#000" />
          <circle cx="18.5" cy="11" r="0.8" fill="#000" />
          {/* Straight mouth */}
          <line x1="13" y1="14" x2="19" y2="14" stroke="#000" strokeWidth="0.8" />
        </g>
      );

    case Mood.Stressed:
      return (
        <g>
          {/* Worried eyes */}
          <circle cx="13.5" cy="11" r="0.8" fill="#000" />
          <circle cx="18.5" cy="11" r="0.8" fill="#000" />
          <path d="M 12 9 Q 13 10 14 9" stroke="#000" strokeWidth="0.6" fill="none" />
          <path d="M 18 9 Q 19 10 20 9" stroke="#000" strokeWidth="0.6" fill="none" />
          {/* Frown */}
          <path d="M 13 15 Q 16 14 19 15" stroke="#000" strokeWidth="0.8" fill="none" />
        </g>
      );

    case Mood.Exhausted:
      return (
        <g>
          {/* Tired eyes (half-closed) */}
          <line x1="12" y1="11" x2="15" y2="11" stroke="#000" strokeWidth="0.8" />
          <line x1="17" y1="11" x2="20" y2="11" stroke="#000" strokeWidth="0.8" />
          {/* Tired mouth */}
          <ellipse cx="16" cy="14" rx="2" ry="1" fill="none" stroke="#000" strokeWidth="0.6" />
        </g>
      );
  }
}

// ============================================================================
// ACTION POSES (Arms)
// ============================================================================

function ActionPose({ action, skinTone }: { action: ActionType; skinTone: string }) {
  switch (action) {
    case ActionType.Coding:
      // Arms forward (typing)
      return (
        <g>
          <rect x="9" y="19" width="2" height="6" fill={skinTone} />
          <rect x="21" y="19" width="2" height="6" fill={skinTone} />
        </g>
      );

    case ActionType.Calling:
      // One arm up (phone)
      return (
        <g>
          <rect x="9" y="20" width="2" height="5" fill={skinTone} />
          <rect
            x="21"
            y="15"
            width="2"
            height="5"
            fill={skinTone}
            transform="rotate(-30 22 17)"
          />
          {/* Phone */}
          <rect x="22" y="13" width="2" height="3" fill="#4a5568" rx="0.5" />
        </g>
      );

    case ActionType.Meeting:
      // Arms relaxed
      return (
        <g>
          <rect x="9" y="20" width="2" height="6" fill={skinTone} />
          <rect x="21" y="20" width="2" height="6" fill={skinTone} />
        </g>
      );

    case ActionType.Celebrating:
      // Arms up
      return (
        <g>
          <rect
            x="8"
            y="14"
            width="2"
            height="6"
            fill={skinTone}
            transform="rotate(-45 9 17)"
          />
          <rect
            x="22"
            y="14"
            width="2"
            height="6"
            fill={skinTone}
            transform="rotate(45 23 17)"
          />
        </g>
      );

    case ActionType.Designing:
    case ActionType.Writing:
      // One arm forward
      return (
        <g>
          <rect x="9" y="20" width="2" height="5" fill={skinTone} />
          <rect x="20" y="19" width="2" height="6" fill={skinTone} />
        </g>
      );

    default:
      // Idle - arms at sides
      return (
        <g>
          <rect x="9" y="20" width="2" height="7" fill={skinTone} />
          <rect x="21" y="20" width="2" height="7" fill={skinTone} />
        </g>
      );
  }
}

// ============================================================================
// ROLE ACCESSORIES
// ============================================================================

function RoleAccessory({ role }: { role: Role }) {
  switch (role) {
    case Role.Founder:
      // Crown
      return (
        <g>
          <polygon
            points="12,7 14,9 16,7 18,9 20,7 19,11 13,11"
            fill="#ffd700"
            stroke="#000"
            strokeWidth="0.3"
          />
        </g>
      );

    case Role.Engineer:
      // Headphones
      return (
        <g>
          <path
            d="M 10 12 Q 10 8 16 8 Q 22 8 22 12"
            stroke="#4a5568"
            strokeWidth="1.5"
            fill="none"
          />
          <rect x="9" y="11" width="2" height="3" fill="#4a5568" rx="1" />
          <rect x="21" y="11" width="2" height="3" fill="#4a5568" rx="1" />
        </g>
      );

    case Role.Designer:
      // Glasses
      return (
        <g>
          <circle cx="13.5" cy="11" r="2" fill="none" stroke="#000" strokeWidth="0.5" />
          <circle cx="18.5" cy="11" r="2" fill="none" stroke="#000" strokeWidth="0.5" />
          <line x1="15.5" y1="11" x2="16.5" y2="11" stroke="#000" strokeWidth="0.5" />
        </g>
      );

    case Role.Sales:
      // Tie
      return (
        <g>
          <polygon
            points="15,17 17,17 17,23 16,25 15,23"
            fill="#e53e3e"
            stroke="#000"
            strokeWidth="0.3"
          />
        </g>
      );

    case Role.Marketing:
      // Megaphone (small)
      return (
        <g>
          <path
            d="M 24 20 L 26 19 L 26 21 Z"
            fill="#ed8936"
            stroke="#000"
            strokeWidth="0.3"
          />
        </g>
      );

    case Role.Operations:
      // Clipboard
      return (
        <g>
          <rect x="24" y="19" width="3" height="4" fill="#fff" stroke="#000" strokeWidth="0.3" />
          <line x1="25" y1="20" x2="26" y2="20" stroke="#000" strokeWidth="0.2" />
          <line x1="25" y1="21" x2="26" y2="21" stroke="#000" strokeWidth="0.2" />
        </g>
      );

    default:
      return null;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRoleColor(role: Role): string {
  switch (role) {
    case Role.Founder: return '#805ad5';      // Purple
    case Role.Engineer: return '#3182ce';     // Blue
    case Role.Sales: return '#38a169';        // Green
    case Role.Designer: return '#d53f8c';     // Pink
    case Role.Marketing: return '#dd6b20';    // Orange
    case Role.Operations: return '#718096';   // Gray
    default: return '#4a5568';
  }
}

function getRoleEmoji(role: Role): string {
  switch (role) {
    case Role.Founder: return '👑';
    case Role.Engineer: return '💻';
    case Role.Sales: return '📞';
    case Role.Designer: return '🎨';
    case Role.Marketing: return '📢';
    case Role.Operations: return '⚙️';
    default: return '👤';
  }
}

function getSkinTone(): string {
  // Rotate through diverse skin tones
  const tones = ['#f5d0a9', '#c68642', '#8d5524', '#4a312c'];
  return tones[Math.floor(Math.random() * tones.length)];
}
