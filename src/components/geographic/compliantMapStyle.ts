import type {
  LayerSpecification,
  SourceSpecification,
  StyleSpecification,
} from 'maplibre-gl';

/**
 * Survey of India compliance:
 * No third-party political boundary or state/province label may ever render.
 * The only borders on the map come from our own GeoJSON files
 * (official state polygons + dissolved official country outline).
 */

export const CARTO_ATTRIBUTION =
  '&copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';
export const ESRI_ATTRIBUTION =
  'Imagery &copy; <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community';

export const STATES_GEOJSON = '/geo/india_states_simplified.geojson';
export const DISTRICTS_GEOJSON = '/geo/india_district_simplified.geojson';
export const COUNTRY_OUTLINE_GEOJSON = '/geo/india_country_outline.geojson';

const CARTO_LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const CARTO_DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const LIGHT_PREFIX = 'l-';
export const DARK_PREFIX = 'd-';

/** Any layer that draws an administrative boundary or a state/province label. */
const isNonCompliantLayer = (layer: LayerSpecification): boolean => {
  const id = layer.id.toLowerCase();
  const sourceLayer = ((layer as { 'source-layer'?: string })['source-layer'] || '').toLowerCase();
  if (sourceLayer === 'boundary') return true;
  if (id.includes('boundary') || id.includes('admin')) return true;
  // OSM labels disputed regions as foreign states/provinces
  if (id.includes('place_state') || id.includes('place-state') || id.includes('province')) return true;
  const filter = JSON.stringify(layer.filter ?? '');
  if (sourceLayer === 'place' && /"(state|province|region)"/.test(filter)) return true;
  return false;
};

const prefixLayer = (
  layer: LayerSpecification,
  prefix: string,
  spriteId: string,
  visible: boolean
): LayerSpecification => {
  const next = JSON.parse(JSON.stringify(layer)) as LayerSpecification & {
    layout?: Record<string, unknown>;
  };
  next.id = `${prefix}${layer.id}`;
  const layout = { ...(next.layout ?? {}) } as Record<string, unknown>;
  if (typeof layout['icon-image'] === 'string' && layout['icon-image'] !== '') {
    layout['icon-image'] = `${spriteId}:${layout['icon-image'] as string}`;
  }
  layout.visibility = visible ? 'visible' : 'none';
  next.layout = layout as never;
  return next;
};

/**
 * Builds ONE persistent style object containing both CARTO vector basemaps
 * (boundary/state-label layers stripped), Esri imagery and our own layers.
 * setStyle() is never called, so custom sources/layers always survive
 * theme / satellite switching.
 */
export async function buildCompliantMapStyle(): Promise<StyleSpecification> {
  const [light, dark] = await Promise.all([
    fetch(CARTO_LIGHT_STYLE).then((r) => r.json() as Promise<StyleSpecification>),
    fetch(CARTO_DARK_STYLE).then((r) => r.json() as Promise<StyleSpecification>),
  ]);

  const sources: Record<string, SourceSpecification> = {};

  // Both CARTO styles share the same vector source name/url
  Object.entries(light.sources).forEach(([key, src]) => {
    sources[key] = { ...(src as SourceSpecification), attribution: CARTO_ATTRIBUTION } as SourceSpecification;
  });

  sources['esri-satellite'] = {
    type: 'raster',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ],
    tileSize: 256,
    attribution: ESRI_ATTRIBUTION,
  };

  sources['india-states'] = {
    type: 'geojson',
    data: STATES_GEOJSON,
    promoteId: 'STNAME_SH',
  };

  sources['india-outline'] = {
    type: 'geojson',
    data: COUNTRY_OUTLINE_GEOJSON,
  };

  const lightLayers = light.layers
    .filter((l) => !isNonCompliantLayer(l))
    .map((l) => prefixLayer(l, LIGHT_PREFIX, 'light', true));
  const darkLayers = dark.layers
    .filter((l) => !isNonCompliantLayer(l))
    .map((l) => prefixLayer(l, DARK_PREFIX, 'dark', false));

  const layers: LayerSpecification[] = [
    ...lightLayers,
    ...darkLayers,
    {
      id: 'esri-satellite',
      type: 'raster',
      source: 'esri-satellite',
      layout: { visibility: 'none' },
    },
    {
      id: 'state-fills',
      type: 'fill',
      source: 'india-states',
      paint: {
        'fill-color': '#94a3b8',
        'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.45, 0.15],
      },
    },
    // 'district-lines' is inserted here lazily (before state-borders)
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
      paint: {
        'line-color': '#0f172a',
        'line-width': 1.8,
        'line-opacity': 0.95,
      },
    },
  ];

  return {
    version: 8,
    name: 'khel-drishti-compliant',
    // maplibre-gl v6 supports sprite arrays
    sprite: [
      { id: 'light', url: (light.sprite as string) ?? '' },
      { id: 'dark', url: (dark.sprite as string) ?? '' },
    ],
    glyphs: light.glyphs,
    sources,
    layers,
  } as StyleSpecification;
}
