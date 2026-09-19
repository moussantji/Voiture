# 👑 NIGER ROYAL — Roadmap V1

Application VTC premium à Bamako 🇲🇱 · **Palette validée : Niger Royal** (`design/palettes/palette-2-niger-royal-final-v3.png`)

## 🎨 Thème (src/theme/colors.ts)
| Rôle | Couleur | Hex |
|---|---|---|
| Fond | Onyx profond | `#0B1E1A` |
| Marque | Émeraude royale | `#0E5C46` |
| Accent | Or champagne | `#E3B94E` |
| Surface | Beige sable | `#EFE3CC` |
| Info | Bleu lagon | `#1E8A8A` |

## ✅ V1 — Livrable front (ce repo)
### 📱 App Client
- [x] Carte Google Maps plein écran (style Niger Royal)
- [x] Icônes flottantes ☰ + 🔔 (sans barre ni titre)
- [x] Voitures disponibles (markers dorés animés)
- [x] Pin position client (halo or)
- [x] Bottom sheet : **Destination** + estimation (distance/durée/prix FCFA)
- [x] Recherche chauffeur → fiche chauffeur (nom, note, véhicule, appel)
- [x] Historique des trajets
### 🚗 App Chauffeur
- [x] Statut **● En service / Hors ligne**
- [x] Demande de course : prise en charge → **destination** + **prix estimé**, compte à rebours 15 s, Accepter/Refuser
- [x] Course : itinéraire or + **ARRIVÉE CLIENT → DÉMARRER → TERMINER**
- [x] Panneau client (nom, note, appel, **destination + prix estimé**)
- [x] Écran gains du jour + stats

## 🗺️ Fournisseur de carte — choix fait : les DEUX (option C)
- [x] **MapLibre + OpenStreetMap/CARTO** (défaut) — gratuit à vie, zéro clé
- [x] Architecture prête pour **Google Maps** : 1 clé dans `app.json` + 1 ligne dans `src/config/maps.ts`

## 🔜 V1.1 — Backend
- [ ] Dev build native (MapLibre) : `npx expo prebuild && npx expo run:android`
- [ ] Firebase Auth : connexion par téléphone (OTP SMS +223)
- [ ] Firestore / Realtime DB : positions chauffeurs temps réel
- [ ] Geocoding OSM (Nominatim) ou Google Places : recherche « Où allez-vous ? » réelle
- [ ] OSRM / OpenRouteService / Google Directions : itinéraire + prix réels
- [ ] Notifications push (Expo / FCM)
- [ ] (Option) Clé Google Maps → remplacer `YOUR_GOOGLE_MAPS_API_KEY` + `MAP_PROVIDER='google'`

## 👑 V1.2 — Admin & paiements
- [ ] Console admin web : validation chauffeurs, courses, grille tarifaire
- [ ] Orange Money / Moov Money / Wave
- [ ] Notation bilatérale + partage de trajet
