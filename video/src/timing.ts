// The cut list, in frames at 30 fps. The score runs at 72 BPM, so one bar is
// exactly 100 frames and every scene starts on a bar line (music/score.py
// reads the same numbers).
export const BAR = 100;

export const T = {
  presents: { from: 0, to: 200 },
  context: { from: 200, to: 800 },
  reveal: { from: 800, to: 1100 },
  app: { from: 1100, to: 2900 },
  possible: { from: 2900, to: 3400 },
  end: { from: 3400, to: 3900 },
};

export const TOTAL = T.end.to;

// Inside the app showcase, local to T.app.from.
export const APP = {
  directory: 0,
  filters: 300,
  map: 600,
  detail: 900,
  submit: 1200,
  review: 1500,
  out: 1800,
};
