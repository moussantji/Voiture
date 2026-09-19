// 🗺️ Configuration du fournisseur de cartes — bascule en UNE ligne
//
//   'google'   → Google Maps natif (react-native-maps) — ✅ DÉFAUT
//                • Expo Go (Android) : fonctionne SANS clé (clé interne d'Expo) →
//                  teste l'app sur ton téléphone tout de suite !
//                • APK de production : clé Google Cloud requise dans app.json
//                  (compte de facturation exigé par Google, mais les cartes natives
//                   mobiles ne sont pas facturées ; recherche/itinéraires chez nous =
//                   Nominatim/OSRM gratuits, donc 0 € chez Google)
//   'maplibre' → OpenStreetMap via MapLibre — 100 % gratuit, zéro clé, jamais de CB.
//                Nécessite un dev build (pas Expo Go).
export const MAP_PROVIDER: 'maplibre' | 'google' = 'google';

// 🎨 Style Google Maps Niger Royal (utilisé quand provider = 'google')
export { nigerRoyalMapStyle } from '../theme/mapStyle';
