import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { c, sans } from '../look';

const faces = [
  ['Fraunces', 400, 'normal', 'fraunces-latin-400-normal.woff2'],
  ['Fraunces', 600, 'normal', 'fraunces-latin-600-normal.woff2'],
  ['Fraunces', 400, 'italic', 'fraunces-latin-400-italic.woff2'],
  ['IBM Plex Sans', 400, 'normal', 'ibm-plex-sans-latin-400-normal.woff2'],
  ['IBM Plex Sans', 500, 'normal', 'ibm-plex-sans-latin-500-normal.woff2'],
  ['IBM Plex Sans', 600, 'normal', 'ibm-plex-sans-latin-600-normal.woff2'],
] as const;

export const Fonts = () => (
  <style>
    {faces
      .map(
        ([family, weight, style, file]) =>
          `@font-face{font-family:"${family}";font-weight:${weight};` +
          `font-style:${style};src:url(${staticFile(`fonts/${file}`)}) format("woff2");}`,
      )
      .join('\n')}
  </style>
);

// Fine static grain over everything, so flat colour reads as paper.
export const Grain = ({ opacity = 0.05 }: { opacity?: number }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity }}>
    <svg width="100%" height="100%">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

// The Camí mark: two points joined by a dashed line. `draw` (0..1) draws the
// line from the green point to the terracotta one.
export const Mark = ({
  size,
  draw = 1,
  dots = 1,
}: {
  size: number;
  draw?: number;
  dots?: number;
}) => {
  const id = `mark-${React.useId().replace(/:/g, '')}`;
  return (
  <svg width={size} height={size} viewBox="0 0 30 30" fill="none">
    <clipPath id={id}>
      <rect x="0" y="0" width={8 + 14 * draw} height="30" />
    </clipPath>
    <line
      x1="8"
      y1="15"
      x2="22"
      y2="15"
      stroke={c.terracotta}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="3 4"
      clipPath={`url(#${id})`}
    />
    <circle cx="5" cy="15" r={3.5 * dots} fill={c.route} />
    <circle cx="25" cy="15" r={3.5 * Math.min(1, Math.max(0, draw * 1.4 - 0.4)) * dots} fill={c.terracotta} />
  </svg>
  );
};

export const LabelCaps = ({
  children,
  color = c.faint,
  size = 15,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      fontFamily: sans,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: size * 0.08,
      textTransform: 'uppercase',
      color,
      ...style,
    }}
  >
    {children}
  </div>
);
