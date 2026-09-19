// 🎨 Art cartographique "Niger Royal" — Bamako dessiné à la main (web preview)
// Géométrie stylisée mais fidèle aux grandes lignes de Bamako :
// le fleuve Niger traverse la ville, deux ponts or, artères radiales,
// quartiers réels positionnés par lat/lng → alignement exact avec les markers.
import { QUARTIERS, LatLng } from '../data/mock';

// Boîte de la région (doit correspondre à BAMAKO_REGION)
export const ART_BOUNDS = {
  lonMin: -8.0435,
  lonMax: -7.9585,
  latMin: 12.5830,
  latMax: 12.6680,
};

// PRNG déterministe (rendu stable à chaque chargement)
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type L = LatLng;
const p = (latitude: number, longitude: number): L => ({ latitude, longitude });

// 🌊 Le fleuve Niger (courbe maîtresse — chemin cubique)
export const RIVER_PATH: { start: L; c1: L; c2: L; end: L }[] = [
  { start: p(12.6415, -8.0475), c1: p(12.6390, -8.0280), c2: p(12.6310, -8.0160), end: p(12.6260, -8.0025) },
  { start: p(12.6260, -8.0025), c1: p(12.6215, -7.9900), c2: p(12.6200, -7.9720), end: p(12.6145, -7.9535) },
];

// 🌉 Les deux ponts (or) — Pont des Martyrs & Pont du Roi Fahd
export const BRIDGES: L[][] = [
  [p(12.6328, -8.0020), p(12.6192, -8.0015)], // Martyrs (centre ↔ Badalabougou)
  [p(12.6238, -7.9678), p(12.6108, -7.9652)], // Roi Fahd (vers Sotuba)
];

// 🛣️ Grands axes (couche "highway" — émeraude clair)
export const HIGHWAYS: L[][] = [
  // Axe Est-Ouest rive nord (Hamdallaye ↔ centre ↔ ouest)
  [p(12.6445, -8.0470), p(12.6438, -8.0320), p(12.6428, -8.0180), p(12.6420, -8.0050), p(12.6430, -7.9920), p(12.6442, -7.9780), p(12.6462, -7.9660), p(12.6482, -7.9560)],
  // Avenue centrale → Pont des Martyrs → sud (Magnambougou)
  [p(12.6460, -8.0035), p(12.6380, -8.0028), p(12.6328, -8.0020), p(12.6192, -8.0015), p(12.6120, -8.0008), p(12.6035, -8.0015), p(12.5945, -8.0030)],
  // Centre → Pont Roi Fahd → Sotuba
  [p(12.6445, -7.9920), p(12.6380, -7.9770), p(12.6325, -7.9705), p(12.6238, -7.9678), p(12.6108, -7.9652), p(12.6030, -7.9620), p(12.5950, -7.9560)],
  // Axe ouest (Banconi → Baco)
  [p(12.6395, -8.0035), p(12.6320, -8.0140), p(12.6270, -8.0230), p(12.6228, -8.0330), p(12.6188, -8.0460)],
  // Rive sud : Badalabougou → ACI 2000 → Sotuba ACI
  [p(12.6035, -8.0015), p(12.6030, -7.9900), p(12.6070, -7.9790), p(12.6110, -7.9660), p(12.6140, -7.9560)],
  // Nord : Medina Coura → Hamdallaye ACI
  [p(12.6460, -8.0035), p(12.6515, -8.0005), p(12.6558, -7.9930), p(12.6598, -7.9820), p(12.6640, -7.9700), p(12.6662, -7.9600)],
  // Diagonale NW (vers Faladié)
  [p(12.6395, -8.0035), p(12.6440, -8.0120), p(12.6480, -8.0210), p(12.6520, -8.0310), p(12.6555, -8.0410)],
];

// 🛤️ Artères secondaires (courbes douces entre quartiers)
export function buildArterials(): L[][] {
  const anchors = [
    p(12.6536, -7.9576), // Hamdallaye ACI
    p(12.6500, -7.9950), // Médina Coura
    p(12.6310, -7.9870), // Niarela
    p(12.6342, -8.0189), // Hippodrome
    p(12.6273, -8.0346), // Kalabancoura
    p(12.6144, -8.0047), // Badalabougou
    p(12.6233, -7.9846), // ACI 2000
    p(12.6066, -7.9850), // ACI sud
  ];
  const links: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [1, 3], [2, 6], [6, 5], [5, 7], [4, 5], [1, 5], [3, 5], [0, 6], [2, 5], [4, 3],
  ];
  const rnd = mulberry32(42);
  return links.map(([a, b]) => {
    const A = anchors[a], B = anchors[b];
    const mid: L = {
      latitude: (A.latitude + B.latitude) / 2 + (rnd() - 0.5) * 0.004,
      longitude: (A.longitude + B.longitude) / 2 + (rnd() - 0.5) * 0.004,
    };
    return [A, mid, B];
  });
}

// 🏘️ Mini-grilles locales autour de chaque quartier (détail premium)
export function buildLocalStreets(): L[][] {
  const rnd = mulberry32(7);
  const lines: L[][] = [];
  for (const q of QUARTIERS) {
    if (
      q.longitude < ART_BOUNDS.lonMin || q.longitude > ART_BOUNDS.lonMax ||
      q.latitude < ART_BOUNDS.latMin || q.latitude > ART_BOUNDS.latMax
    ) continue;
    const angle = rnd() * Math.PI;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const len = 0.0065, gap = 0.0019;
    for (let i = -2; i <= 2; i++) {
      // verticales locales
      lines.push([
        p(q.latitude + (i * gap) * cos - len * sin, q.longitude + (i * gap) * sin + len * cos),
        p(q.latitude + (i * gap) * cos + len * sin, q.longitude + (i * gap) * sin - len * cos),
      ]);
      // horizontales locales
      lines.push([
        p(q.latitude - len * cos / 1.4 + (i * gap) * sin, q.longitude + len * sin / 1.4 + (i * gap) * cos),
        p(q.latitude + len * cos / 1.4 + (i * gap) * sin, q.longitude - len * sin / 1.4 + (i * gap) * cos),
      ]);
    }
  }
  return lines;
}

// ✨ Texture subtile (poussière d'émeraude sur les terres)
export function buildTexture(): { c: L; r: number }[] {
  const rnd = mulberry32(99);
  const dots: { c: L; r: number }[] = [];
  for (let i = 0; i < 130; i++) {
    dots.push({
      c: p(
        ART_BOUNDS.latMin + rnd() * (ART_BOUNDS.latMax - ART_BOUNDS.latMin),
        ART_BOUNDS.lonMin + rnd() * (ART_BOUNDS.lonMax - ART_BOUNDS.lonMin),
      ),
      r: 0.6 + rnd() * 2.2,
    });
  }
  return dots;
}

// 🏷️ Quartiers affichés (dans la boîte uniquement)
export function labeledQuartiers() {
  return QUARTIERS.filter(
    (q) =>
      q.longitude > ART_BOUNDS.lonMin + 0.002 && q.longitude < ART_BOUNDS.lonMax - 0.004 &&
      q.latitude > ART_BOUNDS.latMin + 0.003 && q.latitude < ART_BOUNDS.latMax - 0.004,
  );
}

// 🏙️ Position du nom de la ville (comme la maquette : grand, rive nord)
export const CITY_LABEL = p(12.6490, -8.0125);
export const RIVER_LABELS: L[] = [p(12.6325, -8.0215), p(12.6180, -7.9795)];
