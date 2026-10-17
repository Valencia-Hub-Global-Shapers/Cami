import React from 'react';
import { c, sans, serif } from '../look';
import { CHECKED, Programme, STATUS_LABEL, Status } from '../data';
import { LabelCaps, Mark } from './Base';
import { enter, glide, lerp } from './motion';

// Browser window geometry on the 1920x1080 frame. The app lives inside it.
export const BROWSER = { x: 700, y: 120, w: 1100, h: 840, bar: 46, header: 66 };
export const CONTENT_TOP = BROWSER.bar + BROWSER.header;

// The Camí lockup: mark + wordmark. At scale 1 it is the hero; the app header
// uses the same component at HEADER_SCALE so the two match exactly.
export const LOCKUP = { mark: 200, gap: 22, text: 150, width: 560 };
export const HEADER_SCALE = 0.17;
// Left edge of the centred hero lockup in a frame of width W.
export const lockupX = (W: number) => W / 2 - LOCKUP.width / 2;

export const Lockup = ({
  color,
  draw = 1,
  textOpacity = 1,
}: {
  color: string;
  draw?: number;
  textOpacity?: number;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: LOCKUP.gap }}>
    <Mark size={LOCKUP.mark} draw={draw} />
    <div
      style={{
        fontFamily: serif,
        fontWeight: 600,
        fontSize: LOCKUP.text,
        lineHeight: 1,
        color,
        opacity: textOpacity,
        marginTop: -LOCKUP.text * 0.08,
      }}
    >
      Camí
    </div>
  </div>
);

export const Browser = ({
  url,
  children,
  style,
  navActive,
  hideLogo,
  overlay,
}: {
  url: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  navActive?: 'submit' | 'directory';
  hideLogo?: boolean;
  overlay?: React.ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      left: BROWSER.x,
      top: BROWSER.y,
      width: BROWSER.w,
      height: BROWSER.h,
      borderRadius: 18,
      overflow: 'hidden',
      background: c.cream,
      boxShadow: '0 30px 80px rgba(33,30,25,0.16), 0 0 0 1px rgba(33,30,25,0.08)',
      ...style,
    }}
  >
    <div
      style={{
        height: BROWSER.bar,
        background: c.sand,
        display: 'flex',
        alignItems: 'center',
        padding: '0 18px',
        gap: 8,
        borderBottom: `1px solid ${c.border}`,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 12, height: 12, borderRadius: 6, background: '#DCD2BF' }} />
      ))}
      <div
        style={{
          marginLeft: 22,
          flex: 1,
          maxWidth: 760,
          height: 28,
          borderRadius: 14,
          background: c.cream,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          fontFamily: sans,
          fontSize: 15,
          color: c.muted,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {url}
      </div>
    </div>
    <div
      style={{
        height: BROWSER.header,
        borderBottom: `1px solid ${c.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'relative',
      }}
    >
      <div
        style={{
          transform: `scale(${HEADER_SCALE})`,
          transformOrigin: 'left center',
          height: LOCKUP.mark,
          opacity: hideLogo ? 0 : 1,
        }}
      >
        <Lockup color={c.ink} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 30, fontFamily: sans, fontSize: 16, fontWeight: 500 }}>
        <span style={{ color: c.ink }}>About</span>
        <span
          style={{
            color: navActive === 'submit' ? c.terracotta : c.ink,
            borderBottom: navActive === 'submit' ? `2px solid ${c.terracotta}` : '2px solid transparent',
            paddingBottom: 2,
          }}
        >
          Submit a programme
        </span>
        <span
          style={{
            background: c.terracotta,
            color: c.cream,
            borderRadius: 999,
            padding: '8px 20px',
          }}
        >
          Directory
        </span>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: CONTENT_TOP, bottom: 0, overflow: 'hidden' }}>
      {children}
    </div>
    {overlay}
  </div>
);

const BADGE: Record<Status, { bg: string; fg: string }> = {
  open: { bg: c.routeTint, fg: c.route },
  expected: { bg: c.sand, fg: c.expected },
  renewal_only: { bg: '#EAE6DC', fg: c.faint },
  monitor: { bg: '#EAE6DC', fg: c.faint },
};

export const Badge = ({ status, size = 14 }: { status: Status; size?: number }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      whiteSpace: 'nowrap',
      borderRadius: 999,
      padding: `${size * 0.35}px ${size * 0.9}px`,
      fontFamily: sans,
      fontWeight: 600,
      fontSize: size,
      background: BADGE[status].bg,
      color: BADGE[status].fg,
    }}
  >
    {status === 'open' && <span style={{ width: 7, height: 7, borderRadius: 4, background: c.route }} />}
    {STATUS_LABEL[status]}
  </span>
);

export const Pill = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      border: `1px solid ${c.border}`,
      borderRadius: 999,
      padding: '3px 11px',
      fontFamily: sans,
      fontSize: 13,
      color: c.muted,
    }}
  >
    {children}
  </span>
);

export const Card = ({
  p,
  style,
  extra,
}: {
  p: Programme;
  style?: React.CSSProperties;
  extra?: React.ReactNode;
}) => (
  <div
    style={{
      background: c.white,
      border: `1px solid ${c.border}`,
      borderRadius: 16,
      padding: 22,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      fontFamily: sans,
      ...style,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: c.muted }}>{p.university}</div>
        <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 21, lineHeight: 1.25, color: c.ink, marginTop: 4 }}>
          {p.name}
        </div>
        <div style={{ fontSize: 14, color: c.faint, marginTop: 4 }}>{p.place}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <Badge status={p.status} size={12} />
        {extra}
      </div>
    </div>
    <div style={{ display: 'flex', gap: 6 }}>
      {p.levels.map((l) => (
        <Pill key={l}>{l}</Pill>
      ))}
    </div>
    {p.covers && (
      <div>
        <LabelCaps size={11}>Covers</LabelCaps>
        <div style={{ fontSize: 14, lineHeight: 1.5, color: c.muted, marginTop: 3 }}>{p.covers}</div>
      </div>
    )}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        background: c.cream,
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: c.ink,
      }}
    >
      <div>
        <LabelCaps size={11}>Opens</LabelCaps>
        <div style={{ marginTop: 2 }}>{p.opens}</div>
      </div>
      <div>
        <LabelCaps size={11}>Deadline</LabelCaps>
        <div style={{ marginTop: 2 }}>{p.deadline}</div>
      </div>
    </div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: `1px solid ${c.border}`,
        paddingTop: 12,
        fontSize: 14,
      }}
    >
      <span style={{ color: c.terracotta, fontWeight: 500 }}>Official page ↗</span>
      <span style={{ fontSize: 12, color: c.faint }}>Last checked {CHECKED}</span>
    </div>
  </div>
);

// A pointer that travels between waypoints and pulses on clicks.
export type Waypoint = { f: number; x: number; y: number; click?: boolean };

export const Cursor = ({ frame, path }: { frame: number; path: Waypoint[] }) => {
  if (frame < path[0].f - 12) return null;
  let x = path[0].x;
  let y = path[0].y;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const dur = Math.min(26, b.f - a.f);
    const t = glide(frame, b.f - dur, dur);
    if (frame >= b.f - dur) {
      x = lerp(t, a.x, b.x);
      y = lerp(t, a.y, b.y);
    }
  }
  const appear = enter(frame, path[0].f - 12, 12);
  const clicks = path.filter((p) => p.click);
  let press = 0;
  let ring = -1;
  for (const p of clicks) {
    const d = frame - p.f;
    if (d >= 0 && d < 8) press = Math.sin((d / 8) * Math.PI);
    if (d >= 0 && d < 18) ring = d / 18;
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: appear, zIndex: 50 }}>
      {ring >= 0 && (
        <div
          style={{
            position: 'absolute',
            left: -22 * (0.4 + ring),
            top: -22 * (0.4 + ring),
            width: 44 * (0.4 + ring),
            height: 44 * (0.4 + ring),
            borderRadius: '50%',
            border: `2px solid ${c.terracotta}`,
            opacity: 1 - ring,
          }}
        />
      )}
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        style={{ transform: `scale(${1 - press * 0.15})`, transformOrigin: '2px 2px', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))' }}
      >
        <path d="M3 2 L3 19 L7.5 14.8 L10.6 21.5 L13.4 20.3 L10.4 13.7 L16.5 13.7 Z" fill={c.ink} stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export const Select = ({
  label,
  value,
  active,
  width = 200,
}: {
  label: string;
  value: string;
  active?: boolean;
  width?: number;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width }}>
    <LabelCaps size={11}>{label}</LabelCaps>
    <div
      style={{
        height: 40,
        borderRadius: 9,
        border: `1px solid ${active ? c.terracotta : c.border}`,
        background: c.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 13px',
        fontFamily: sans,
        fontSize: 15,
        color: c.ink,
        boxShadow: active ? `0 0 0 3px rgba(193,101,47,0.15)` : 'none',
      }}
    >
      <span>{value}</span>
      <span style={{ color: c.faint, fontSize: 12 }}>▾</span>
    </div>
  </div>
);

export const Field = ({
  label,
  value,
  focus,
  width,
  placeholder,
}: {
  label: string;
  value: string;
  focus?: boolean;
  width?: number | string;
  placeholder?: string;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: width ?? '100%' }}>
    <span style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: c.ink }}>{label}</span>
    <div
      style={{
        height: 42,
        borderRadius: 9,
        border: `1px solid ${focus ? c.terracotta : c.border}`,
        background: c.white,
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        fontFamily: sans,
        fontSize: 15,
        color: value ? c.ink : c.faint,
        boxShadow: focus ? `0 0 0 3px rgba(193,101,47,0.15)` : 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {value || placeholder}
      {focus && <span style={{ width: 1.5, height: 20, background: c.ink, marginLeft: 1 }} />}
    </div>
  </div>
);
