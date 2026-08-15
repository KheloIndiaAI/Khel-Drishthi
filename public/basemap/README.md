# Self-hosted compliant basemap style

`compliant-style.json` is a **processed build-time snapshot**, not a hand-written file.

It is generated from the CARTO `positron-gl-style` and `dark-matter-gl-style`
style.json files with the Survey of India compliance pipeline applied once,
verifiably, at build time instead of on every user's device:

- every layer with `source-layer: boundary`, or an id containing
  `boundary` / `admin` / `place_state` / `province`, is removed
- light layers are prefixed `l-` (visible), dark layers `d-` (hidden)
- sources are merged, CARTO attribution attached
- our own compliant sources/layers are appended: `india-states`,
  `india-outline`, `esri-satellite`, plus `state-fills`, `state-borders`,
  `india-outline` layers
- sprite/glyph URLs stay absolute CARTO URLs (tiles/sprites/glyphs are still
  fetched from CARTO at runtime; per-tile failures degrade gracefully)

Regenerate:

```bash
node scripts/generate-basemap-style.mjs
```

The script fails loudly if the snapshot would contain any non-compliant layer
or is missing our own layers/sources.
