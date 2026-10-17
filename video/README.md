# Camí showcase video

A 1:27 horizontal (1920x1080, 30 fps) showcase of Camí for the event with the
Global Shapers Ramallah Hub. No voiceover, an original score.

**The finished videos:**
- Horizontal 16:9: [`out/cami-showcase.mp4`](out/cami-showcase.mp4)
- Vertical 9:16: [`out/cami-showcase-vertical.mp4`](out/cami-showcase-vertical.mp4)
  (the `Vertical` composition: same scenes, laid out for phones)

The brief, look and script are in [`design/BRIEF.md`](design/BRIEF.md). It was
made with the method of [Mortiflix](https://github.com/GTKottman/mortiflix-oss):
a look system first, scenes built in [Remotion](https://www.remotion.dev/),
every cut carried by an element on screen (the Camí mark, the browser, the
network node), a score written to the picture's timing, then a QC pass.

## Layout

- `src/timing.ts`: the cut list. 72 BPM, so one bar of music is exactly 100
  frames and every scene starts on a bar line.
- `src/look.ts`: the app's palette and type (Fraunces, IBM Plex Sans).
- `src/scenes/`: Opening (presents, context, reveal), Showcase (the app:
  directory, filters, map, programme page, submit, review), Closing
  (possibilities, end card).
- `src/data.ts`: the real programmes from `supabase/seed`.
- `music/score.py`: the score, synthesised with numpy and scipy.
  `music/master.sh` renders it and masters it to -14 LUFS into
  `public/music.wav`.
- `public/logos/`: the Bridging Futures, Ramallah Hub and Valencia Hub logos
  (copied from the app's `public/logos`).

## Rebuild

```sh
npm install
./music/master.sh                 # needs python3 with numpy and scipy, and ffmpeg
npx remotion studio src/index.ts  # preview
npx remotion render src/index.ts Main out/render-1x.mp4 --codec=h264 --crf=16 --audio-bitrate=320k
# the delivered cut plays at 1.5x (2:10 -> 1:27), music pitch kept
ffmpeg -i out/render-1x.mp4 -filter_complex "[0:v]setpts=PTS/1.5,fps=30[v];[0:a]atempo=1.5[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 256k -movflags +faststart out/cami-showcase.mp4
# vertical: render the Vertical composition, then the same speed-up
npx remotion render src/index.ts Vertical out/vertical-1x.mp4 --codec=h264 --crf=16 --audio-bitrate=320k
```

Remotion is free for individuals and small non-profit teams; check its licence
if that changes.
