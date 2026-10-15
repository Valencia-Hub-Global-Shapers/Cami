import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from 'remotion';
import { c } from './look';
import { T, TOTAL } from './timing';
import { Fonts, Grain } from './ui/Base';
import { Context, Presents, Reveal } from './scenes/Opening';
import { Showcase, SHOWCASE_FROM } from './scenes/Showcase';
import { End, Possibilities } from './scenes/Closing';

const CONTEXT_FROM = 160;
const POSSIBLE_FROM = T.possible.from - 30;

export const Main = ({ music = true }: { music?: boolean }) => (
  <AbsoluteFill style={{ background: c.cream }}>
    <Fonts />
    <Sequence from={T.presents.from} durationInFrames={T.presents.to + 20}>
      <Presents />
    </Sequence>
    <Sequence from={CONTEXT_FROM} durationInFrames={T.context.to + 80 - CONTEXT_FROM}>
      <Context offset={CONTEXT_FROM} />
    </Sequence>
    <Sequence from={T.reveal.from} durationInFrames={T.reveal.to - T.reveal.from}>
      <Reveal />
    </Sequence>
    <Sequence from={SHOWCASE_FROM} durationInFrames={T.app.to - SHOWCASE_FROM + 20}>
      <Showcase />
    </Sequence>
    <Sequence from={POSSIBLE_FROM} durationInFrames={T.possible.to - POSSIBLE_FROM}>
      <Possibilities offset={POSSIBLE_FROM} />
    </Sequence>
    <Sequence from={T.end.from} durationInFrames={T.end.to - T.end.from}>
      <End />
    </Sequence>
    <Grain />
    {music && (
      <Audio
        src={staticFile('music.wav')}
        volume={(f) => interpolate(f, [TOTAL - 45, TOTAL - 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    )}
  </AbsoluteFill>
);
