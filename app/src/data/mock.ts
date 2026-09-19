// 🇲🇱 Données de démo V1 — Bamako (Firebase branchera ici en V1.1)
export type LatLng = { latitude: number; longitude: number };
export type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };

export type Car = { id: string; latitude: number; longitude: number; heading: number };
export type Quartier = { name: string; latitude: number; longitude: number };

// Centre de Bamako
export const BAMAKO_REGION: Region = {
  latitude: 12.6255,
  longitude: -8.001,
  latitudeDelta: 0.085,
  longitudeDelta: 0.085,
};

export const USER_POSITION: LatLng = { latitude: 12.6255, longitude: -8.001 };

// 🛻 Voitures disponibles (markers dorés sur la carte client)
export const CARS: Car[] = [
  { id: 'c1', latitude: 12.641, longitude: -8.012, heading: 40 },
  { id: 'c2', latitude: 12.6536, longitude: -7.9576, heading: 300 }, // Hamdallaye
  { id: 'c3', latitude: 12.6144, longitude: -8.0147, heading: 120 }, // Badalabougou
  { id: 'c4', latitude: 12.6365, longitude: -7.972, heading: 210 },
  { id: 'c5', latitude: 12.6273, longitude: -8.0346, heading: 80 }, // Kalabancoura
  { id: 'c6', latitude: 12.65, longitude: -7.995, heading: 160 }, // Médina Coura
  { id: 'c7', latitude: 12.6233, longitude: -7.9846, heading: 350 }, // ACI 2000
  { id: 'c8', latitude: 12.6066, longitude: -7.94, heading: 25 }, // Sotuba
  { id: 'c9', latitude: 12.599, longitude: -8.02, heading: 285 },
];

// 📍 Quartiers de Bamako (recherche destination)
export const QUARTIERS: Quartier[] = [
  { name: 'ACI 2000', latitude: 12.6233, longitude: -7.9846 },
  { name: 'Hamdallaye ACI', latitude: 12.6536, longitude: -7.9576 },
  { name: 'Badalabougou', latitude: 12.6144, longitude: -8.0047 },
  { name: 'Baco-Djicoroni Golf', latitude: 12.5785, longitude: -8.038 },
  { name: 'Sotuba ACI', latitude: 12.6066, longitude: -7.92 },
  { name: 'Kalabancoura', latitude: 12.6273, longitude: -8.0346 },
  { name: 'Médina Coura', latitude: 12.65, longitude: -7.995 },
  { name: 'Hippodrome', latitude: 12.6342, longitude: -8.0189 },
  { name: 'Magnambougou', latitude: 12.5879, longitude: -8.0224 },
  { name: 'Niarela', latitude: 12.631, longitude: -7.987 },
  { name: 'Faladié', latitude: 12.6094, longitude: -8.084 },
  { name: 'Aéroport Modibo Keïta', latitude: 12.5335, longitude: -7.9499 },
];

// 👩🏾 Course entrante côté chauffeur
export type RideRequest = {
  id: string;
  clientName: string;
  clientRating: number;
  pickup: Quartier;
  destination: Quartier;
  price: number;
  distanceToClient: number;
};

export const DRIVER_POSITION: LatLng = { latitude: 12.5785, longitude: -8.038 }; // Baco-Djicoroni

export const INCOMING_REQUEST: RideRequest = {
  id: 'req-1',
  clientName: 'Aminata Traoré',
  clientRating: 4.9,
  pickup: { name: 'Baco-Djicoroni Golf', latitude: 12.5785, longitude: -8.038 },
  destination: { name: 'ACI 2000', latitude: 12.6233, longitude: -7.9846 },
  price: 2500,
  distanceToClient: 1.2,
};

// 📜 Historique client (démo)
export const TRIP_HISTORY = [
  { id: 't1', from: 'Badalabougou', to: 'ACI 2000', date: 'Hier · 18:42', price: 2500, rating: 5 },
  { id: 't2', from: 'Hamdallaye ACI', to: 'Aéroport Modibo Keïta', date: '17 sept. · 09:10', price: 4500, rating: 5 },
  { id: 't3', from: 'Kalabancoura', to: 'Hippodrome', date: '15 sept. · 14:25', price: 1500, rating: 4 },
  { id: 't4', from: 'ACI 2000', to: 'Sotuba ACI', date: '12 sept. · 20:03', price: 1750, rating: 5 },
];

// 💰 Gains chauffeur (démo)
export const DRIVER_TODAY = {
  total: 45000,
  rating: 4.9,
  trips: 8,
  km: 210,
  onlineTime: '5h 45',
  acceptance: 92,
  rides: [
    { id: 'r1', client: 'Aminata Traoré', to: 'ACI 2000', price: 2500, time: '14:32' },
    { id: 'r2', client: 'Sékou Diarra', to: 'Aéroport M. Keïta', price: 4500, time: '13:05' },
    { id: 'r3', client: 'Fatou Sangaré', to: 'Hippodrome', price: 1750, time: '11:47' },
  ],
};

// 🔔 Notifications (démo)
export const NOTIFICATIONS = [
  { id: 'n1', icon: '🚗', title: 'Chauffeur trouvé', body: 'Mamadou arrive dans 3 minutes.', time: 'Il y a 2 h' },
  { id: 'n2', icon: '⭐', title: 'Merci pour votre note !', body: 'Merci d’avoir noté votre course d’hier.', time: 'Hier' },
  { id: 'n3', icon: '👑', title: 'Bienvenue sur Niger Royal', body: 'Votre trajet, notre excellence — à Bamako.', time: '18 sept.' },
];

// 📏 Utilitaires
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const la1 = (a.latitude * Math.PI) / 180;
  const la2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// 💵 Grille tarifaire V1 : prise en charge 300 F + 250 F/km, arrondi à 25 F
export function estimatePrice(km: number): number {
  return Math.round((300 + km * 250) / 25) * 25;
}

export function estimateDurationMin(km: number): number {
  return Math.max(3, Math.round(km * 3.2));
}

export function formatFCFA(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
}
