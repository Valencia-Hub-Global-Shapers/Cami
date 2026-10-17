import React from 'react';
import { Composition } from 'remotion';
import { Main } from './Main';
import { video } from './look';
import { TOTAL } from './timing';

export const Root = () => (
  <>
  <Composition
    id="Main"
    component={Main}
    width={video.width}
    height={video.height}
    fps={video.fps}
    durationInFrames={TOTAL}
    defaultProps={{ music: true }}
  />
  {/* The same film, laid out for 9:16 (phones, stories, reels). */}
  <Composition
    id="Vertical"
    component={Main}
    width={video.height}
    height={video.width}
    fps={video.fps}
    durationInFrames={TOTAL}
    defaultProps={{ music: true }}
  />
  </>
);
