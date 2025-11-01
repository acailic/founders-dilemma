import { CSSProperties } from 'react';

interface AppIconProps {
  size?: number;
  style?: CSSProperties;
}

export default function AppIcon({ size = 48, style }: AppIconProps) {
  const dimension = `${size}px`;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 512 512"
      role="img"
      aria-label="Founder's Dilemma emblem"
      style={style}
    >
      <defs>
        <linearGradient id="fd-bg" x1="17%" y1="12%" x2="83%" y2="88%">
          <stop offset="0%" stopColor="#23B0F5" />
          <stop offset="38%" stopColor="#1F7FD8" />
          <stop offset="100%" stopColor="#0D2A4B" />
        </linearGradient>
        <linearGradient id="fd-flame" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FEE7A1" />
          <stop offset="45%" stopColor="#FFB95B" />
          <stop offset="100%" stopColor="#FF7043" />
        </linearGradient>
        <radialGradient id="fd-window" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#6FD2FF" />
          <stop offset="100%" stopColor="#1B6DD6" />
        </radialGradient>
      </defs>
      <circle cx="256" cy="256" r="228" fill="url(#fd-bg)" />
      <path
        d="M96 246c62-8 110-45 150-112 40 67 88 104 150 112"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse
        cx="256"
        cy="218"
        rx="192"
        ry="160"
        transform="rotate(-14 256 218)"
        stroke="rgba(255,255,255,0.24)"
        strokeWidth="22"
        fill="none"
        strokeLinecap="round"
      />
      <g transform="translate(170 82)">
        <path
          d="M86 0c9 0 18 4 23 11 41 50 64 109 64 170 0 20-2 42-6 65-2 14-14 24-28 24h-3v46c0 12-10 22-22 22H58c-12 0-22-10-22-22v-46h-3c-14 0-26-10-28-25-4-22-6-44-6-64 0-61 23-120 64-170C68 4 77 0 86 0z"
          fill="#fff"
        />
        <ellipse cx="86" cy="132" rx="34" ry="34" fill="url(#fd-window)" />
        <path
          d="M55 204h62c8 0 14 6 14 14v30c0 8-6 14-14 14H55c-8 0-14-6-14-14v-30c0-8 6-14 14-14z"
          fill="#fff"
        />
        <path d="M86 246l60 132H26z" fill="url(#fd-flame)" />
        <path d="M86 246l34 74H52z" fill="#FF8A50" opacity="0.7" />
        <path d="M86 280l18 38H68z" fill="#FFE4B2" opacity="0.8" />
      </g>
      <path
        d="M120 284c54 14 98 14 132 0 34-14 76-14 126 0"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="18"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M336 176c3-7 10-10 16-7 7 3 10 10 7 17-24 50-59 86-107 112-48 26-103 36-167 30-8-1-13-8-12-15 1-8 8-13 16-12 58 6 107-3 150-25 43-23 74-54 97-100z"
        fill="rgba(255,255,255,0.1)"
      />
    </svg>
  );
}
