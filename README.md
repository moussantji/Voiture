# 👑 Niger Royal — VTC premium à Bamako

Deux apps en un seul projet **React Native (Expo, TypeScript)** :
📱 **Client** (commander une voiture) & 🚗 **Chauffeur** (accepter des courses) — Google Maps, palette **Niger Royal** (émeraude + or).

## 🚀 Lancer l'app
```bash
cd app
npm install
npm start          # puis : a (Android) · i (iOS) · w (web)
```

## 🗺️ Carte : MapLibre gratuit + option Google (1 ligne)
Le fournisseur de carte se change dans **`app/src/config/maps.ts`** :
| `MAP_PROVIDER` | Coût | Clé requise |
|---|---|---|
| `'google'` (défaut) — **Google Maps natif** (react-native-maps) + style sombre Niger Royal. **Expo Go Android : fonctionne SANS clé** (clé interne d'Expo). APK prod : clé Google Cloud (cartes natives non facturées) | 0 F | ✅ clé dans `app/app.json` (prod uniquement) |
| `'maplibre'` — OpenStreetMap/CARTO, style Niger Royal | **0 F à vie, sans CB** | ❌ aucune (mais dev build requis, pas Expo Go) |

> ⚠️ MapLibre est un module natif → il faut un **dev build** (pas Expo Go) :
> `npx expo prebuild && npx expo run:android` (ou `npx expo run:ios`).

## 📂 Structure
```
design/palettes/   → maquettes validées (5 images)
app/               → projet Expo
  src/theme/       → couleurs + style Google Maps Niger Royal
  src/components/  → carte multi-plateforme, UI, modales
  src/screens/     → RoleSelect, Client (Map, Historique), Chauffeur (Map, Gains)
  src/data/mock.ts → données démo Bamako (brancher Firebase ici)
ROADMAP.md         → fonctionnalités V1 / V1.1 / V1.2
```

> 🗝️ Pour Google Maps sur mobile : ajouter votre clé API dans `app/app.json` (`YOUR_GOOGLE_MAPS_API_KEY`).
> 🌐 La preview web affiche la **vraie carte de Bamako** (tuiles OpenStreetMap/CARTO + filtre émeraude) dans un cadre smartphone premium — le vrai Google Maps reste réservé aux builds Android/iOS.
