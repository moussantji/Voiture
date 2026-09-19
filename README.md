# 👑 Niger Royal — VTC premium à Bamako

Deux apps en un seul projet **React Native (Expo, TypeScript)** :
📱 **Client** (commander une voiture) & 🚗 **Chauffeur** (accepter des courses) — Google Maps, palette **Niger Royal** (émeraude + or).

## 🚀 Lancer l'app
```bash
cd app
npm install
npm start          # puis : a (Android) · i (iOS) · w (web)
```

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
> 🌐 La preview web affiche un rendu vectoriel simulé de la carte (react-native-maps est natif uniquement).
