// 🗺️ Configuration du fournisseur de cartes — bascule en UNE ligne
//
//   'maplibre' → OpenStreetMap/CARTO via MapLibre — GRATUIT à vie, zéro clé API ✅ (V1)
//   'google'   → Google Maps natif — gratuit illimité mais nécessite la clé dans app.json
//
// Quand tu as ta clé Google Maps :
//   1. Colle-la dans app/app.json (ios.config.googleMapsApiKey + android.config.googleMaps.apiKey)
//   2. Change la ligne ci-dessous en 'google'
//   3. npm run android / ios — c'est tout !
export const MAP_PROVIDER: 'maplibre' | 'google' = 'maplibre';

// 🎨 Style Google Maps Niger Royal (utilisé quand provider = 'google')
export { nigerRoyalMapStyle } from '../theme/mapStyle';
