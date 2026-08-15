#!/usr/bin/env node
/**
 * Build-time snapshot generator for public/basemap/compliant-style.json
 *
 * Fetches the CARTO positron + dark-matter GL styles, strips every
 * third-party political boundary / state-province label layer (Survey of
 * India compliance), prefixes layers l-/d-, merges sources, appends our own
 * compliant sources + layers, and writes the merged StyleSpecification.
 *
 * Regenerate with:  node scripts/generate-basemap-style.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';
const ESRI_ATTRIBUTION =
  'Imagery &copy; <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community';

const STATES_GEOJSON = '/geo/india_states_simplified.geojson';
const COUNTRY_OUTLINE_GEOJSON = '/geo/india_country_outline.geojson';

const CARTO_LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const CARTO_DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const LIGHT_PREFIX = 'l-';
const DARK_PREFIX = 'd-';

const isNonCompliantLayer = (layer) => {
  const id = layer.id.toLowerCase();
  const sourceLayer = (layer['source-layer'] || '').toLowerCase();
  if (sourceLayer === 'boundary') return true;
  if (id.includes('boundary') || id.includes('admin')) return true;
  if (id.includes('place_state') || id.includes('place-state') || id.includes('province')) return true;
  const filter = JSON.stringify(layer.filter ?? '');
  if (sourceLayer === 'place' && /"(state|province|region)"/.test(filter)) return true;
  return false;
};

const prefixLayer = (layer, prefix, spriteId, visible) => {
  const next = JSON.parse(JSON.stringify(layer));
  next.id = `${prefix}${layer.id}`;
  const layout = { ...(next.layout ?? {}) };
  if (typeof layout['icon-image'] === 'string' && layout['icon-image'] !== '') {
    if (spriteId) layout['icon-image'] = `${spriteId}:${layout['icon-image']}`;
    else delete layout['icon-image'];
  }
  layout.visibility = visible ? 'visible' : 'none';
  next.layout = layout;
  return next;
};

const usesSprite = (layer) =>
  typeof ((layer.layout ?? {})['icon-image']) !== 'undefined';

const ownSources = () => ({
  'esri-satellite': {
    type: 'raster',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ],
    tileSize: 256,
    attribution: ESRI_ATTRIBUTION,
  },
  'india-states': { type: 'geojson', data: STATES_GEOJSON, promoteId: 'STNAME_SH' },
  'india-outline': { type: 'geojson', data: COUNTRY_OUTLINE_GEOJSON },
});

const ownLayers = () => [
  { id: 'esri-satellite', type: 'raster', source: 'esri-satellite', layout: { visibility: 'none' } },
  {
    id: 'state-fills',
    type: 'fill',
    source: 'india-states',
    paint: {
      'fill-color': '#94a3b8',
      'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.45, 0.15],
    },
  },
  {
    id: 'state-borders',
    type: 'line',
    source: 'india-states',
    paint: {
      'line-color': '#64748b',
      'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 1.6, 0.7],
      'line-opacity': 0.8,
    },
  },
  {
    id: 'india-outline',
    type: 'line',
    source: 'india-outline',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#0f172a', 'line-width': 1.8, 'line-opacity': 0.95 },
  },
];

const getJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
};

const spriteReachable = async (spriteUrl) => {
  if (!spriteUrl) return false;
  try {
    const res = await fetch(`${spriteUrl}.json`);
    return res.ok;
  } catch {
    return false;
  }
};

const main = async () => {
  const [light, dark] = await Promise.all([getJson(CARTO_LIGHT_STYLE), getJson(CARTO_DARK_STYLE)]);
  const [lightSprite, darkSprite] = await Promise.all([
    spriteReachable(light.sprite),
    spriteReachable(dark.sprite),
  ]);

  const sources = {};
  Object.entries(light.sources).forEach(([key, src]) => {
    sources[key] = { ...src, attribution: CARTO_ATTRIBUTION };
  });
  Object.assign(sources, ownSources());

  const glyphsOk = Boolean(light.glyphs);

  const prepare = (style, prefix, spriteId, visible) =>
    style.layers
      .filter((l) => !isNonCompliantLayer(l))
      .filter((l) => (spriteId ? true : !usesSprite(l)))
      .filter((l) => (glyphsOk ? true : l.type !== 'symbol'))
      .map((l) => prefixLayer(l, prefix, spriteId, visible));

  const layers = [
    ...prepare(light, LIGHT_PREFIX, lightSprite ? 'light' : null, true),
    ...prepare(dark, DARK_PREFIX, darkSprite ? 'dark' : null, false),
    ...ownLayers(),
  ];

  const sprite = [];
  if (lightSprite) sprite.push({ id: 'light', url: light.sprite });
  if (darkSprite) sprite.push({ id: 'dark', url: dark.sprite });

  const style = {
    version: 8,
    name: 'khel-drishti-compliant',
    metadata: {
      'khel-drishti:note':
        'PROCESSED SNAPSHOT — generated by scripts/generate-basemap-style.mjs from CARTO positron + dark-matter styles. All third-party political boundary and state/province label layers are stripped (Survey of India compliance). Do not edit by hand; regenerate with `node scripts/generate-basemap-style.mjs`.',
      'khel-drishti:generated_at': new Date().toISOString(),
    },
    sources,
    layers,
  };
  if (sprite.length) style.sprite = sprite;
  if (glyphsOk) style.glyphs = light.glyphs;

  // ---- validation ----
  const fail = (msg) => {
    throw new Error(`SNAPSHOT VALIDATION FAILED: ${msg}`);
  };
  const bad = style.layers.filter((l) => isNonCompliantLayer(l));
  if (bad.length) fail(`non-compliant layers present: ${bad.map((l) => l.id).join(', ')}`);
  for (const id of ['state-fills', 'state-borders', 'india-outline']) {
    if (!style.layers.some((l) => l.id === id)) fail(`missing own layer ${id}`);
  }
  if (!style.sources['esri-satellite']) fail('missing esri-satellite source');
  if (!style.layers.some((l) => l.id.startsWith('l-'))) fail('no light layers');
  if (!style.layers.some((l) => l.id.startsWith('d-'))) fail('no dark layers');
  for (const s of sprite) {
    if (!/^https:\/\//.test(s.url)) fail(`sprite url not absolute: ${s.url}`);
  }
  if (style.glyphs && !/^https:\/\//.test(style.glyphs)) fail(`glyphs url not absolute: ${style.glyphs}`);

  const out = resolve(__dirname, '../public/basemap/compliant-style.json');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(style));
  console.log(
    `OK — wrote ${out}\n  layers: ${style.layers.length} (l-: ${style.layers.filter((l) => l.id.startsWith('l-')).length}, d-: ${style.layers.filter((l) => l.id.startsWith('d-')).length})\n  sprite: ${JSON.stringify(sprite)}\n  glyphs: ${style.glyphs}`
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
