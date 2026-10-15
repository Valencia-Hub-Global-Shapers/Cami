import React from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-50m.json';
import { c } from '../look';

export const MAP = { w: 1036, h: 500 };

const countries = feature(
  world as never,
  (world as never as { objects: { countries: never } }).objects.countries,
) as unknown as GeoJSON.FeatureCollection;

const frame: GeoJSON.Feature = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'MultiPoint',
    coordinates: [
      [-10.5, 36.0],
      [10.5, 46.2],
    ],
  },
};

export const projection = geoMercator().fitExtent(
  [
    [0, 0],
    [MAP.w, MAP.h],
  ],
  frame,
);

const path = geoPath(projection);
const shapes = countries.features.map((f) => path(f)).filter(Boolean) as string[];

// A quiet basemap in the app's palette, so the pins carry the frame.
export const Basemap = () => (
  <svg width={MAP.w} height={MAP.h} style={{ position: 'absolute', left: 0, top: 0 }}>
    <rect width={MAP.w} height={MAP.h} fill="#E7ECE9" />
    {shapes.map((d, i) => (
      <path key={i} d={d} fill={c.sand} stroke="#D9CEB8" strokeWidth={1} />
    ))}
  </svg>
);

export const project = (lon: number, lat: number) => {
  const p = projection([lon, lat]) ?? [0, 0];
  return { x: p[0], y: p[1] };
};
