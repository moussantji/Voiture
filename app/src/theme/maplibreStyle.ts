// 🎨 Style MapLibre « Niger Royal » — tuiles OpenStreetMap/CARTO dark + filtre
// émeraude-or appliqué nativement (raster-hue-rotate). 100 % gratuit, aucune clé.
// ⚠️ MapLibre : raster-hue-rotate 90 = identité → notre 118 CSS vaut 118 ici pour
// décaler le bleu CARTO vers l'émeraude Niger Royal.
export const nigerRoyalMaplibreStyle = {
  version: 8 as const,
  name: 'Niger Royal',
  metadata: { 'nr:brand': true },
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors · © CARTO · Niger Royal',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'nr-background',
      type: 'background',
      paint: { 'background-color': '#0B1E1A' },
    },
    {
      id: 'nr-carto',
      type: 'raster',
      source: 'carto-dark',
      paint: {
        'raster-hue-rotate': 118, // bleu → émeraude Niger Royal
        'raster-saturation': -0.08,
        'raster-brightness-min': 0.3,
        'raster-brightness-max': 0.93,
        'raster-contrast': 0.06,
        'raster-opacity': 1,
        'raster-fade-duration': 300,
      },
    },
  ],
};
