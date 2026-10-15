import { Easing, interpolate } from 'remotion';

const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const inCubic = Easing.bezier(0.55, 0, 1, 0.45);

const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

// 0 -> 1 over [start, start + dur], fast in, soft landing (entrances).
export const enter = (frame: number, start: number, dur = 24) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: outExpo });

// 0 -> 1, eased both ends (camera moves, carried objects).
export const glide = (frame: number, start: number, dur = 30) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: inOut });

// 0 -> 1, accelerating (exits).
export const leave = (frame: number, start: number, dur = 18) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: inCubic });

export const lerp = (t: number, a: number, b: number) => a + (b - a) * t;

// An element that rises in and, optionally, eases out.
export const rise = (
  frame: number,
  start: number,
  out?: number,
  distance = 24,
) => {
  const i = enter(frame, start, 26);
  const o = out === undefined ? 0 : leave(frame, out, 16);
  return {
    opacity: i * (1 - o),
    transform: `translateY(${(1 - i) * distance - o * distance * 0.5}px)`,
  };
};

// Characters typed in at a steady rate, starting at `start`.
export const typed = (text: string, frame: number, start: number, cps = 22) => {
  const n = Math.max(0, Math.floor(((frame - start) / 30) * cps));
  return text.slice(0, n);
};
