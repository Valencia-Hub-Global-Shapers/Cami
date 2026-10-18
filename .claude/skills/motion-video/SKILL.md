---
name: motion-video
description: Make a motion design video (product showcase, explainer, promo, event film, logo sting) from code with Remotion, an original score synthesised in Python, and an ffmpeg QC pass. Use when asked to create, edit, re-time, re-format (vertical 9:16, square) or re-render a video. Distilled from the Mortiflix studio method, so there is no need to read that repo.
---

# Motion video

A video is a sequence of designed frames that move. Design the frames first,
motion connects them. Work in this order, and look at real frames at every
stage. The worked example is `video/` in this repo (the Camí showcase): copy
its structure instead of starting from nothing.

```
brief -> look -> script (beats) -> cut list -> scenes -> stills check
      -> music -> render -> variants (speed, 9:16) -> QC -> deliver
```

## 1. Brief (write `design/BRIEF.md` first)

Three lines: what it is, for whom, **the one thing the viewer remembers**.
Then format (16:9 1920x1080, 9:16 1080x1920, 1:1 1080x1080, 30 fps),
length, tone, voiceover or music only, credits and who must or must not be
named. Ask only questions that change the video, each with a default.

Defaults learned from this user (keep unless told otherwise):
- The product is the subject from the first frame: open on the product's own
  logo, not on "X presents". Credit the makers on the end card only.
- Pace: they chose 1.5x of a calm first cut. Design tighter from the start
  (holds of about `words / 4.5 + 0.7` s) or plan the speed-up (section 9).
- Keep third parties anonymous inside diagrams (no hub or city labels on
  network nodes) unless asked.
- Serious topics: calm, respectful, quiet hope. No hype words.
- Floating decorative elements must never crowd or overlap each other.
- Never use em dashes in on-screen text or docs.

## 2. Look (in the brief, then `src/look.ts`)

- Take the brand's own palette and fonts from the codebase (tailwind config,
  CSS, layout fonts). Palette: 1 background, 1-2 neutrals, 1 accent that marks
  the one thing to look at. Use the brand's logo files as given, never redraw.
- Type: one headline family, one body family. Headlines at least 5% of frame
  height (16:9), larger in 9:16. Body on screen never below about 24 px at
  1080p (30 px in 9:16).
- Grid: title-safe margin 5% (120 px at 1920). One focal point per frame.
  Text contrast at least 4.5:1, never on a busy area without a plate.
- Shape language: pick the brand's motif (for Camí, the two dots and dashed
  path) and make it the carrier of the cuts.
- A tonal arc helps: a dark ground for the problem, light arrives with the
  product.

## 3. Script as beats

A table: time, beat, exact on-screen words, one-line visual note. One idea per
beat. Read time rule: on-screen text stays at least `words / 3 + 1` seconds
after it lands (at 1x). Use real data from the repo (seed files, docs), never
invented facts. Anything illustrative but not real (dates, a demo
submission) gets told to the user when you deliver.

## 4. Cut list (`src/timing.ts`)

All timing in frames, in one file, never scattered magic numbers. Trick: score
the music at 72 BPM so **one bar = exactly 100 frames at 30 fps**; start every
scene on a bar line and the music hits land on cuts for free.

## 5. Build in Remotion

Setup (versions known to work):

```sh
mkdir video && cd video
npm init -y && npm pkg set type=module
npm install remotion@4.0.532 @remotion/cli@4.0.532 react@19.3.0 react-dom@19.3.0 \
  @fontsource/<family> typescript @types/react
# maps: d3-geo topojson-client world-atlas @types/d3-geo @types/topojson-client
```

- `tsconfig.json`: `"jsx": "react-jsx"`, `"moduleResolution": "bundler"`,
  `"resolveJsonModule": true` (for world-atlas JSON).
- Fonts offline: copy woff2 files from `node_modules/@fontsource/<family>/files/`
  into `public/fonts/` and declare `@font-face` with `staticFile()` (see
  `video/src/ui/Base.tsx`). Logos and images into `public/`, load with
  `<Img src={staticFile(...)} />`.
- Frames are a pure function of the frame number: no timers, no
  `Math.random` (use `random('seed')` from remotion), no network at render.
- One component per scene in `src/scenes/`, placed with
  `<Sequence from durationInFrames>`. Overlap sequences by 20-40 frames so the
  next scene can take over the carrier.
- Motion helpers (`video/src/ui/motion.ts`): `enter` (expo-out entrances),
  `glide` (in-out for carried objects and camera), `leave` (accelerating
  exits), `rise` (fade plus 24 px lift), `typed` (typewriter text). Always
  clamp `interpolate`.
- Craft: ease everything except mechanical motion; stagger related elements
  2-4 frames (or 5-8 for words); overlap actions; hold the key idea still for
  a beat; faster middle, slower landing.
- **Transitions are carried, never blank.** For every cut name the carrier
  already on screen (a logo that flies into a header, scraps that gather into
  a mark, a circle that grows from a dot to reveal the next ground, a window
  that shrinks into a diagram node). No dips to black or flashes to white.
  Crossfade only when nothing connects the two ideas. Use 2-4 kinds of cut
  across the film, consistently.
- Product UI: rebuild screens as React components in the brand's styles
  (cards, badges, filters, forms) inside a browser frame, rather than
  recording the live site. Animate a cursor along waypoints with click pulses,
  type into fields with `typed`, and change the URL bar per step. Clip any
  scrolling region with an `overflow: hidden` wrapper so it never slides over
  headers.
- SVG `clipPath` ids must be unique per instance (`React.useId()`), or
  several marks on screen share one clip.
- Several formats from one codebase: a `useLayout()` hook
  (`{W, H, V: H > W, cx, cy}` from `useVideoConfig`) and a second
  `<Composition id="Vertical" width={1080} height={1920}>` with the same
  component. Scenes branch on `V`: captions above the UI instead of beside it,
  stacked end card, decorative elements in bands above and below the text.
  Scale the 16:9 browser by about 0.94 instead of redesigning it.

## 6. Look before rendering

Render stills, never trust the code:

```sh
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/*/ | head -1)headless_shell
npx remotion still src/index.ts Main out/f.png --frame=450 \
  --props='{"music":false}' --browser-executable=$B --log=error
```

Render 8 key frames per pass (start, middle, settled of each scene and every
cut), tile them with ffmpeg `xstack` into one sheet, and view it. Check:
alignment, overlaps, text cut off at edges, things scrolling over headers,
cursor tips landing on the right control (measure and correct offsets), the
lockup centred. In this cloud container use the preinstalled headless shell
(`--browser-executable`); never download Chrome.

## 7. Music (original, no licence questions)

Synthesise in numpy and scipy (worked example: `video/music/score.py`; keep
Python PEP 8):
- Write a dramatic reading first: e.g. weight -> recognition -> quiet
  confidence. A chord per bar, sections aligned to the cut list.
- Instruments: felt piano (inharmonic partials, exponential decay), warm pad
  (3 detuned additive saws per side, 1.4 s swell), sine bass, a soft kick
  for builds, a band-passed noise riser into the main turn, a low "bloom"
  hit on the reveal and on the end card.
- Minor under the problem, relative major at the turn, I-V-vi-IV with an
  eighth-note piano pulse under the product, fuller build near the end, a
  held chord under the end card, 3 s fade.
- Gotchas: normalise each pad chord by RMS (overtones line up on some chords
  and jump out); send only the band above about 220 Hz into a noise-IR
  reverb, keep the bass dry (a random IR has narrow peaks that make single
  bass notes boom). Check per-second RMS, not just the waveform picture. You
  cannot listen: say so and ask the user to check by ear.
- Master: two-pass `loudnorm` to -14 LUFS, true peak -1.5 dBTP (see
  `video/music/master.sh`), into `public/music.wav`, played with
  `<Audio src={staticFile('music.wav')} />` and a fade at the end.

## 8. Render

```sh
npx remotion render src/index.ts Main out/render-1x.mp4 --codec=h264 --crf=16 \
  --audio-codec=aac --audio-bitrate=320k --browser-executable=$B --concurrency=4 --log=error
```

About 8-9 minutes for 2 minutes of 1080p on 4 cores: run it in the
background and keep working. `--audio-codec=pcm-16` fails in MP4. Remotion's
output can be `yuvj420p`: always finish with an ffmpeg pass to `yuv420p`.

## 9. Variants

Speed change without a re-render (keeps music pitch):

```sh
ffmpeg -i out/render-1x.mp4 -filter_complex \
  "[0:v]setpts=PTS/1.5,fps=30[v];[0:a]atempo=1.5[a]" -map "[v]" -map "[a]" \
  -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k \
  -movflags +faststart out/final.mp4
```

Keep `render-1x.mp4` around (gitignored) so later speed requests are seconds,
not a full render. Vertical: render the `Vertical` composition the same way.

## 10. QC and deliver

```sh
.claude/skills/motion-video/qc.sh out/final.mp4 1920x1080 30 <seconds>
```

Fix every FAIL. Frozen stretches are notes: fine when they are designed
reading holds, say so. Open the frame sheet it writes and look at it, then
grab and read 2-3 full-size frames at the busiest moments.

Deliver: commit the source and the final MP4 (gitignore `node_modules`,
`out/*` with `!out/<final>.mp4` exceptions, `checks`), push, and send the file
with `SendUserFile` (display `render`). If the video lives inside a web app
repo, exclude it from the app build: add the folder to the root
`tsconfig.json` `exclude` and to `.vercelignore`. Tell the user what is
illustrative rather than real, and anything you could not verify (the music
by ear).
