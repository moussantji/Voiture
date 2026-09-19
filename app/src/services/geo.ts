// 🌍 STACK CARTE 100 % GRATUITE — "Google Maps sans clé ni carte bancaire"
// ────────────────────────────────────────────────────────────────────────
// • Recherche de lieux ......... Nominatim (OpenStreetMap) — comme Google Places
// • Itinéraires réels (rues) ... OSRM — comme Google Directions
// • Carte ...................... MapLibre + OSM (voir src/config/maps.ts)
// ⚖️ Usage équitable : ces serveurs publics sont gratuits sous conditions de
//    fair-use (~1 requête/seconde). Pour la prod à grande échelle, on pourra
//    auto-héberger OSRM/Nominatim (toujours 0 licence) — voir ROADMAP.md.
import type { LatLng } from '../data/mock';

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const OSRM = 'https://router.project-osm.org';

// 📌 Requis par la politique d'usage de Nominatim (identification de l'app)
const HEADERS = { Accept: 'application/json', 'User-Agent': 'NigerRoyalApp/1.0 (contact niger-royal)' };

export type GeoResult = { name: string; latitude: number; longitude: number };

// 🔍 Recherche de lieux (équivalent gratuit de Google Places Autocomplete)
export async function searchPlaces(
  query: string,
  near?: LatLng,
  signal?: AbortSignal,
): Promise<GeoResult[]> {
  if (!query || query.trim().length < 3) return [];
  const viewbox = near
    ? `&viewbox=${near.longitude - 0.3},${near.latitude + 0.3},${near.longitude + 0.3},${near.latitude - 0.3}`
    : '';
  const url =
    `${NOMINATIM}/search?format=jsonv2&limit=6&accept-language=fr&countrycodes=ml,ne` +
    `&q=${encodeURIComponent(query.trim())}${viewbox}`;
  try {
    const r = await fetch(url, { headers: HEADERS, signal });
    if (!r.ok) return [];
    const j: any[] = await r.json();
    return (j || []).map((p) => ({
      name: String(p.display_name || '').split(',').slice(0, 2).join(',').trim(),
      latitude: +p.lat,
      longitude: +p.lon,
    }));
  } catch {
    return [];
  }
}

// 📍 Nom d'un point touché sur la carte (reverse geocoding)
export async function reverseName(lat: number, lng: number): Promise<string | null> {
  const url = `${NOMINATIM}/reverse?format=jsonv2&accept-language=fr&zoom=17&lat=${lat}&lon=${lng}`;
  try {
    const r = await fetch(url, { headers: HEADERS });
    if (!r.ok) return null;
    const j: any = await r.json();
    const a = j?.address || {};
    const named =
      j?.name ||
      a.neighbourhood ||
      a.suburb ||
      a.quarter ||
      a.road ||
      a.village ||
      a.town ||
      a.city_district;
    return named ? String(named) : null;
  } catch {
    return null;
  }
}

// 🛣️ Itinéraire réel qui suit les rues (équivalent gratuit de Google Directions)
export type RouteInfo = { points: LatLng[]; km: number; min: number };

export async function fetchRoute(from: LatLng, to: LatLng): Promise<RouteInfo | null> {
  const url =
    `${OSRM}/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
    `?overview=full&geometries=geojson&steps=false`;
  try {
    const r = await fetch(url, { headers: HEADERS });
    if (!r.ok) return null;
    const j: any = await r.json();
    const rt = j?.routes?.[0];
    if (!rt?.geometry?.coordinates?.length) return null;
    return {
      points: rt.geometry.coordinates.map((c: number[]) => ({
        latitude: c[1],
        longitude: c[0],
      })),
      km: rt.distance / 1000,
      min: Math.max(2, Math.round(rt.duration / 60)),
    };
  } catch {
    return null;
  }
}
