/**
 * MapLibre GL v6 resolves its web worker as a sibling file of its own module
 * URL (`new URL('./maplibre-gl-worker.mjs', import.meta.url)`). In a Vite
 * production build maplibre is bundled into an app chunk and that sibling file
 * is never emitted, so the request resolves to `/assets/maplibre-gl-worker.mjs`
 * and the SPA fallback answers with `index.html` (HTTP 200, text/html). The
 * worker then fails to start silently: the map mounts, DOM markers and the
 * attribution render, but NOTHING that needs worker-parsed data (vector tiles,
 * GeoJSON sources → choropleth, state borders, india outline) ever paints.
 *
 * Fix: let Vite bundle and emit the worker itself and point MapLibre at it.
 * Must be imported before any map instance is created.
 */
import { setWorkerUrl } from 'maplibre-gl';
// eslint-disable-next-line import/no-unresolved
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

setWorkerUrl(maplibreWorkerUrl);

export { maplibreWorkerUrl };
