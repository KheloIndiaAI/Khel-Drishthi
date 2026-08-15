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
 *
 * Resilience: the CARTO style.json fetches are retried with backoff, cached in
 * module scope, and — if they ultimately fail — we fall back to a minimal
 * self-hosted style. We NEVER fall back to a basemap that draws third-party
 * political boundaries.
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

export interface CompliantStyleResult {
  style: StyleSpecification;
  /** true when the CARTO street basemap could not be loaded */
  degraded: boolean;
}

/** Any layer that draws an administrative boundary or a state/province label. */
const isNonCompliantLayer = (layer: LayerSpecification): boolean => {
  const id = layer.id.toLowerCase();
  const sourceLayer = ((layer as { 'source-layer'?: string })['source-layer'] || '').toLowerCase();
  if (sourceLayer === 'boundary') return true;
  if (id.includes('boundary') || id.includes('admin')) return true;
  // OSM labels disputed regions as foreign states/provinces
  if (id.includes('place_state') || id.includes('place-state') || id.includes('province')) return true;
  const filter = JSON.stringify((layer as { filter?: unknown }).filter ?? '');
  if (sourceLayer === 'place' && /"(state|province|region)"/.test(filter)) return true;
  return false;
};

const prefixLayer = (
  layer: LayerSpecification,
  prefix: string,
  spriteId: string | null,
  visible: boolean
): LayerSpecification => {
  const next = JSON.parse(JSON.stringify(layer)) as LayerSpecification & {
    layout?: Record<string, unknown>;
  };
  next.id = `${prefix}${layer.id}`;
  const layout = { ...(next.layout ?? {}) } as Record<string, unknown>;
  if (typeof layout['icon-image'] === 'string' && layout['icon-image'] !== '') {
    if (spriteId) layout['icon-image'] = `${spriteId}:${layout['icon-image'] as string}`;
    else delete layout['icon-image'];
  }
  layout.visibility = visible ? 'visible' : 'none';
  next.layout = layout as never;
  return next;
};

const usesSprite = (layer: LayerSpecification): boolean => {
  const layout = ((layer as { layout?: Record<string, unknown> }).layout ?? {}) as Record<
    string,
    unknown
  >;
  return typeof layout['icon-image'] !== 'undefined';
};

// ---------------------------------------------------------------------------
// Resilient fetching
// ---------------------------------------------------------------------------

const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, timeout = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJsonWithRetry<T>(url: string, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetchWithTimeout(url);
      return (await res.json()) as T;
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** i));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`Failed to fetch ${url}`);
}

/** HEAD-ish probe: a sprite is usable when its .json manifest is reachable. */
async function spriteReachable(spriteUrl: string | undefined): Promise<boolean> {
  if (!spriteUrl) return false;
  try {
    await fetchWithTimeout(`${spriteUrl}.json`, 5000);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Our own (always-compliant) sources + layers
// ---------------------------------------------------------------------------

const ownSources = (): Record<string, SourceSpecification> => ({
  'esri-satellite': {
    type: 'raster',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ],
    tileSize: 256,
    attribution: ESRI_ATTRIBUTION,
  },
  'india-states': {
    type: 'geojson',
    data: STATES_GEOJSON,
    promoteId: 'STNAME_SH',
  },
  'india-outline': {
    type: 'geojson',
    data: COUNTRY_OUTLINE_GEOJSON,
  },
});

const ownLayers = (): LayerSpecification[] => [
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

/**
 * Minimal, fully self-hosted, compliant style — used when CARTO is unreachable.
 * Plain background + our own polygons/lines + the Esri imagery source.
 */
export function buildDegradedMapStyle(): StyleSpecification {
  return {
    version: 8,
    name: 'khel-drishti-degraded',
    sources: ownSources(),
    layers: [
      {
        id: 'degraded-background',
        type: 'background',
        paint: { 'background-color': '#e6eaef' },
      },
      ...ownLayers(),
    ],
  } as StyleSpecification;
}

// ---------------------------------------------------------------------------
// Full style — self-hosted processed snapshot
// ---------------------------------------------------------------------------

/**
 * The compliance stripping (boundary/admin/state-label removal, layer
 * prefixing, source merging) happens ONCE at build time in
 * scripts/generate-basemap-style.mjs, producing
 * public/basemap/compliant-style.json. At runtime we only fetch that
 * same-origin, browser-cacheable static asset — no third-party dependency
 * for style assembly.
 */
export const COMPLIANT_STYLE_URL = '/basemap/compliant-style.json';

async function buildFullMapStyle(): Promise<StyleSpecification> {
  return fetchJsonWithRetry<StyleSpecification>(COMPLIANT_STYLE_URL, 2);
}


// ---------------------------------------------------------------------------
// Module-level promise singleton
// ---------------------------------------------------------------------------

let stylePromise: Promise<CompliantStyleResult> | null = null;

function load(): Promise<CompliantStyleResult> {
  return buildFullMapStyle()
    .then((style) => ({ style, degraded: false }))
    .catch((err) => {
      console.warn('[map] CARTO basemap unavailable — using compliant degraded style', err);
      return { style: buildDegradedMapStyle(), degraded: true };
    });
}

/** One build per page load, reused forever (unless it degraded and we retry). */
export function getCompliantMapStyle(): Promise<CompliantStyleResult> {
  if (!stylePromise) {
    stylePromise = load();
    // A degraded result must not be cached permanently against a retry.
    stylePromise = stylePromise.then((result) => {
      if (result.degraded) stylePromise = null;
      return result;
    });
  }
  return stylePromise;
}

/** Re-attempt the full CARTO style (used by the "Retry" chip). */
export async function retryCompliantMapStyle(): Promise<CompliantStyleResult | null> {
  try {
    const style = await buildFullMapStyle();
    const result: CompliantStyleResult = { style, degraded: false };
    stylePromise = Promise.resolve(result);
    return result;
  } catch (err) {
    console.warn('[map] retry of CARTO basemap failed', err);
    return null;
  }
}

/** Back-compat alias. */
export const buildCompliantMapStyle = async (): Promise<StyleSpecification> =>
  (await getCompliantMapStyle()).style;
