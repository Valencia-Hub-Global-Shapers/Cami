import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { c, sans, serif, SAFE_X } from '../look';
import { T } from '../timing';
import { LabelCaps, Mark } from '../ui/Base';
import { LOCKUP, Lockup } from '../ui/App';
import { enter, glide, leave, lerp, rise } from '../ui/motion';

const CX = 1250;
const CY = 520;
const HUBS = Array.from({ length: 8 }, (_, i) => {
  const ang = (-90 + i * 45 + 22.5) * (Math.PI / 180);
  return { x: CX + Math.cos(ang) * 230, y: CY + Math.sin(ang) * 230 };
});
const STUDENTS = Array.from({ length: 14 }, (_, i) => {
  const ang = (-90 + i * (360 / 14)) * (Math.PI / 180);
  return { x: CX + Math.cos(ang) * 400, y: CY + Math.sin(ang) * 380 };
});

const POINTS = [
  { at: 3010, text: 'Students find programmes they can actually apply to.' },
  { at: 3080, text: 'Hubs share what they find in one place, instead of scattered lists.' },
  { at: 3150, text: 'Mentors and trainers point to one checked source.' },
];

// A dashed line drawn from (x1, y1) to (x2, y2) by `t`, with a travelling
// pulse once drawn.
const Route = ({
  x1,
  y1,
  x2,
  y2,
  t,
  color,
  g,
  phase,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  t: number;
  color: string;
  g: number;
  phase: number;
}) => {
  const x = lerp(t, x1, x2);
  const y = lerp(t, y1, y2);
  const k = ((g + phase) % 75) / 75;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={color} strokeWidth={2.5} strokeDasharray="5 8" strokeLinecap="round" opacity={0.75} />
      {t >= 1 && <circle cx={lerp(k, x1, x2)} cy={lerp(k, y1, y2)} r={4.5} fill={color} opacity={Math.sin(k * Math.PI)} />}
    </g>
  );
};

// 1:37 What it opens up. Starts 30 frames early to take the shrinking browser.
export const Possibilities = ({ offset }: { offset: number }) => {
  const g = useCurrentFrame() + offset;
  const out = leave(g, 3370, 30);
  const node = enter(g, 2905, 30);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        {HUBS.map((h, i) => (
          <Route key={i} x1={h.x} y1={h.y} x2={CX} y2={CY} t={glide(g, 2940 + i * 7, 30)} color={c.terracotta} g={g} phase={i * 23} />
        ))}
        {STUDENTS.map((s, i) => {
          const h = HUBS[i % HUBS.length];
          return <Route key={i} x1={CX} y1={CY} x2={s.x} y2={s.y} t={glide(g, 3060 + i * 5, 34)} color={c.route} g={g} phase={i * 31} />;
        })}
        {HUBS.map((h, i) => {
          const t = enter(g, 2925 + i * 7, 20);
          return <circle key={i} cx={h.x} cy={h.y} r={13 * t} fill={c.terracotta} />;
        })}
        {STUDENTS.map((s, i) => {
          const t = enter(g, 3080 + i * 5, 20);
          return <circle key={i} cx={s.x} cy={s.y} r={10 * t} fill={c.route} />;
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: CX - 75,
          top: CY - 75,
          width: 150,
          height: 150,
          borderRadius: 34,
          background: c.white,
          boxShadow: '0 20px 50px rgba(33,30,25,0.14), 0 0 0 1px rgba(33,30,25,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: node,
          transform: `scale(${lerp(node, 0.7, 1)})`,
        }}
      >
        <Mark size={110} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: CX - 330,
          top: 975,
          width: 660,
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
          fontFamily: sans,
          fontSize: 19,
          color: c.muted,
          opacity: enter(g, 3120, 24),
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: c.terracotta }} /> Hubs share programmes
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: c.route }} /> Students find them
        </span>
      </div>

      <div style={{ position: 'absolute', left: SAFE_X, top: 250, width: 560 }}>
        <div style={rise(g, 2915)}>
          <LabelCaps size={17} color={c.route} style={{ letterSpacing: 3 }}>
            What it opens up
          </LabelCaps>
        </div>
        <div
          style={{
            ...rise(g, 2925),
            fontFamily: serif,
            fontWeight: 600,
            fontSize: 54,
            lineHeight: 1.12,
            color: c.ink,
            marginTop: 20,
          }}
        >
          One shared directory, kept current by many hubs.
        </div>
        <div style={{ marginTop: 40, display: 'grid', gap: 24 }}>
          {POINTS.map((p) => (
            <div key={p.at} style={{ ...rise(g, p.at), display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <div style={{ marginTop: 2, flexShrink: 0 }}>
                <Mark size={34} draw={glide(g, p.at + 6, 20)} />
              </div>
              <div style={{ fontFamily: sans, fontSize: 25, lineHeight: 1.45, color: c.muted }}>{p.text}</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CLOSING = 'Every programme listed is a path a student can take.';

const LOGOS = [
  { file: 'bridging-futures.png', w: 355, role: 'The initiative' },
  { file: 'global-shapers-ramallah.png', w: 229, role: 'Leads Bridging Futures' },
  { file: 'global-shapers-valencia.png', w: 231, role: 'Built Camí' },
];

// 1:53 The closing line, then the end card with the collaboration.
export const End = () => {
  const g = useCurrentFrame() + T.end.from;
  const lineOut = leave(g, 3522, 24);
  const words = CLOSING.split(' ');
  const S = 0.42;
  return (
    <AbsoluteFill style={{ background: c.cream }}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 - lineOut, transform: `translateY(${-lineOut * 30}px)` }}>
        <div style={{ fontFamily: serif, fontSize: 66, color: c.ink, textAlign: 'center', maxWidth: 1400, lineHeight: 1.2 }}>
          {words.map((w, i) => {
            const t = enter(g, 3412 + i * 5, 26);
            const key = w === 'path';
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  marginRight: '0.26em',
                  opacity: t,
                  transform: `translateY(${(1 - t) * 18}px)`,
                  color: key ? c.terracotta : c.ink,
                  fontStyle: key ? 'italic' : 'normal',
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: 960 - (LOCKUP.width * S) / 2,
          top: 230 - (LOCKUP.mark * S) / 2,
          height: LOCKUP.mark,
          transform: `scale(${S})`,
          transformOrigin: 'left center',
          opacity: enter(g, 3550, 30),
        }}
      >
        <Lockup color={c.ink} draw={glide(g, 3550, 36)} />
      </div>
      <div style={{ position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ ...rise(g, 3572), fontFamily: sans, fontSize: 28, color: c.muted }}>
          University admission and scholarship programmes for Palestinian students.
        </div>
        <div style={{ ...rise(g, 3586), marginTop: 26 }}>
          <span
            style={{
              display: 'inline-block',
              border: `1.5px solid ${c.terracotta}`,
              borderRadius: 999,
              padding: '10px 30px',
              fontFamily: sans,
              fontWeight: 500,
              fontSize: 28,
              color: c.terracotta,
            }}
          >
            cami-gs.vercel.app
          </span>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 590, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ ...rise(g, 3614), display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 120, height: 1, background: c.border }} />
          <LabelCaps size={17} style={{ letterSpacing: 4 }}>
            A collaboration between
          </LabelCaps>
          <div style={{ width: 120, height: 1, background: c.border }} />
        </div>
        <div style={{ display: 'flex', gap: 110, marginTop: 44, alignItems: 'flex-start' }}>
          {LOGOS.map((l, i) => (
            <div key={l.file} style={{ ...rise(g, 3632 + i * 14), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
              <div style={{ height: 170, display: 'flex', alignItems: 'center' }}>
                <Img src={staticFile(`logos/${l.file}`)} style={{ height: 170, width: (l.w * 170) / 200 }} />
              </div>
              <div style={{ fontFamily: sans, fontSize: 19, color: c.faint }}>{l.role}</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
