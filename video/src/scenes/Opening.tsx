import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { c, sans, serif, useLayout } from '../look';
import { T } from '../timing';
import { LOCKUP, Lockup, lockupX } from '../ui/App';
import { enter, glide, leave, lerp, rise } from '../ui/motion';

// 0:00 The Camí logo: the mark draws its path, then the name settles in.
export const Presents = () => {
  const f = useCurrentFrame();
  const { cx, cy } = useLayout();
  const out = leave(f, 168, 30);
  const dots = enter(f, 8, 30);
  const draw = glide(f, 24, 40);
  const word = enter(f, 52, 34);
  const S = 0.8;
  return (
    <AbsoluteFill
      style={{
        background: c.cream,
        opacity: 1 - out * 0.6,
        transform: `translateY(${-out * 60}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: cx - (LOCKUP.width * S) / 2,
          top: cy - LOCKUP.mark / 2,
          height: LOCKUP.mark,
          opacity: dots,
          transform: `scale(${S * lerp(dots, 0.94, 1)})`,
          transformOrigin: 'left center',
        }}
      >
        <Lockup color={c.ink} draw={draw} textOpacity={word} />
      </div>
    </AbsoluteFill>
  );
};

const LINES = [
  {
    from: 215,
    to: 395,
    text: 'Universities around the world open places and scholarships for Palestinian students.',
  },
  {
    from: 415,
    to: 595,
    text: 'But the information is scattered, and it changes every academic year.',
  },
  {
    from: 615,
    to: 790,
    text: 'Finding the right path should not be one more barrier.',
  },
];

const FRAGMENTS = [
  'Admissions 2027-2028',
  'Deadline: to be confirmed',
  'Scholarship call (PDF)',
  'Fwd: is this still open?',
  'Requirements may change',
  'Language certificate?',
  'Call closed',
  'Documents required: see annex',
  'Next call: unknown',
  'Link not found',
  'Eligibility criteria',
  'Expected in July?',
];

// Where each fragment drifts, kept out of the central text band.
const fragmentSpot = (i: number, vertical: boolean) => {
  const top = i % 2 === 0;
  const col = Math.floor(i / 2);
  // Neighbouring scraps sit on alternate heights and every scrap in a row
  // drifts at the same speed, so no two ever run into each other.
  if (vertical) {
    const x = 70 + (col % 2) * 470 + random(`fx${i}`) * 50;
    const y = (top ? 170 : 1290) + Math.floor(col / 2) * 160 + (col % 2) * 70;
    return { x, y, rot: (random(`fr${i}`) - 0.5) * 8, drift: 0.2 };
  }
  const x = 110 + col * 300 + random(`fx${i}`) * 60;
  const lane = (col % 2) * 130 + random(`fy${i}`) * 40;
  const y = top ? 90 + lane : 770 + lane;
  return { x, y, rot: (random(`fr${i}`) - 0.5) * 8, drift: 0.25 };
};

// The context: the serious part, on ink. Global frames (this sits in a
// Sequence from T.context.from - 30, so local + offset = global).
export const Context = ({ offset }: { offset: number }) => {
  const g = useCurrentFrame() + offset;
  const { H, V } = useLayout();
  const ground = glide(g, 170, 44);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: c.ink,
          transform: `translateY(${(1 - ground) * H}px)`,
          borderTopLeftRadius: (1 - ground) * 600,
          borderTopRightRadius: (1 - ground) * 600,
        }}
      />
      <Fragments g={g} />
      {LINES.map((l) => (
        <AbsoluteFill key={l.from} style={{ alignItems: 'center', justifyContent: 'center', padding: V ? '0 90px' : '0 240px' }}>
          <div
            style={{
              ...rise(g, l.from, l.to, 30),
              fontFamily: serif,
              fontSize: V ? 66 : 64,
              lineHeight: 1.22,
              textAlign: 'center',
              color: c.cream,
              maxWidth: 1360,
            }}
          >
            {l.text}
          </div>
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

// Scraps of information, scattered. At the turn they gather into the mark.
const Fragments = ({ g }: { g: number }) => {
  if (g < 400 || g > 880) return null;
  const gather = glide(g, 800, 50);
  const { cx, cy, V } = useLayout();
  return (
    <AbsoluteFill>
      {FRAGMENTS.map((text, i) => {
        const s = fragmentSpot(i, V);
        const show = enter(g, 420 + i * 9, 30);
        const dim = lerp(enter(g, 600, 40), 1, 0.35);
        const x = s.x + (g - 400) * s.drift * (i % 2 === 0 ? 1 : -1);
        const y = s.y + Math.sin((g + i * 40) / 60) * 6;
        const gx = lerp(gather, x, cx - 80);
        const gy = lerp(gather, y, cy - 20);
        return (
          <div
            key={text}
            style={{
              position: 'absolute',
              left: gx,
              top: gy,
              opacity: show * dim * (1 - enter(g, 830, 20)),
              transform: `rotate(${s.rot * (1 - gather)}deg) scale(${1 - gather * 0.85})`,
              background: c.inkSoft,
              border: '1px solid #3B362E',
              borderRadius: 10,
              padding: '12px 18px',
              fontFamily: sans,
              fontSize: 20,
              color: '#A79E8D',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 0:27 The turn: the scraps gather into the mark, the path draws, and the
// light arrives from the green point.
export const Reveal = () => {
  const f = useCurrentFrame();
  const g = f + T.reveal.from;
  const dots = enter(g, 822, 30);
  const draw = glide(g, 846, 40);
  const slide = glide(g, 892, 34);
  const word = enter(g, 906, 30);
  const light = glide(g, 952, 52);
  const subOut = leave(g, 1046, 14);
  const { W, cx, cy, V } = useLayout();

  // The mark sits centred, then slides into its place in the lockup.
  const lockLeft = lerp(slide, cx - LOCKUP.mark / 2, lockupX(W));
  const greenX = lockLeft + LOCKUP.mark * (5 / 30);
  const hidden = g >= T.app.from - 40;

  const lockup = (color: string) => (
    <div
      style={{
        position: 'absolute',
        left: lockLeft,
        top: cy - LOCKUP.mark / 2,
        height: LOCKUP.mark,
        opacity: hidden ? 0 : dots,
        transform: `scale(${dots < 1 ? lerp(dots, 0.6, 1) : 1})`,
        transformOrigin: `${LOCKUP.mark / 2}px center`,
      }}
    >
      <Lockup color={color} draw={draw} textOpacity={word} />
    </div>
  );

  const sub = (color: string, faint: string) => (
    <div
      style={{
        position: 'absolute',
        top: cy + 140,
        left: V ? 90 : 0,
        right: V ? 90 : 0,
        textAlign: 'center',
        opacity: 1 - subOut,
      }}
    >
      <div style={{ ...rise(g, 972), fontFamily: serif, fontStyle: 'italic', fontSize: 36, color: faint }}>
        Valencian for “path”
      </div>
      <div style={{ ...rise(g, 996), fontFamily: sans, fontSize: V ? 36 : 30, lineHeight: 1.4, color, marginTop: 22 }}>
        One directory of university admission and scholarship programmes for Palestinian students.
      </div>
    </div>
  );

  const r = light * 2300;
  return (
    <AbsoluteFill style={{ background: c.ink }}>
      {lockup(c.cream)}
      <AbsoluteFill
        style={{
          background: c.cream,
          clipPath: `circle(${r}px at ${greenX}px ${cy}px)`,
        }}
      >
        {lockup(c.ink)}
        {sub(c.muted, c.faint)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
