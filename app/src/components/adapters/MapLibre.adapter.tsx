// 🆓 Adaptateur MapLibre + OpenStreetMap/CARTO — GRATUIT à vie, zéro clé API
// (SDK @maplibre/maplibre-react-native v11 — API Map / Camera / Marker / GeoJSONSource / Layer)
// Implémente la même API que l'adaptateur Google (MapView / Marker / Polyline)
import React, { useMemo } from 'react';
import {
  Map,
  Camera,
  Marker as MLMarker,
  GeoJSONSource,
  Layer,
} from '@maplibre/maplibre-react-native';
import { nigerRoyalMaplibreStyle } from '../../theme/maplibreStyle';

export const PROVIDER_GOOGLE = undefined; // concept inexistant côté MapLibre

let uid = 0;

// ---------- Marqueur (vue RN ancrée aux coordonnées) ----------
export const Marker = ({ coordinate, children }: any) => {
  if (!coordinate) return null;
  return (
    <MLMarker lngLat={[coordinate.longitude, coordinate.latitude]} anchor="center">
      {children}
    </MLMarker>
  );
};

// ---------- Itinéraire (ligne or + halo) ----------
export const Polyline = ({ coordinates = [], strokeColor = '#E3B94E', strokeWidth = 4 }: any) => {
  const id = useMemo(() => 'pl' + ++uid, []);
  if (coordinates.length < 2) return null;
  return (
    <GeoJSONSource
      id={id}
      data={{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates.map((c: any) => [c.longitude, c.latitude]),
        },
      }}
    >
      <Layer
        id={id + '-glow'}
        type="line"
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{
          'line-color': strokeColor,
          'line-width': strokeWidth + 8,
          'line-blur': 5,
          'line-opacity': 0.45,
        }}
      />
      <Layer
        id={id + '-core'}
        type="line"
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{ 'line-color': strokeColor, 'line-width': strokeWidth }}
      />
    </GeoJSONSource>
  );
};

// ---------- Carte ----------
const DEFAULT_CENTER: [number, number] = [-8.001, 12.6255]; // Bamako [lng, lat]

const MapView = ({ style, region, children }: any) => {
  const zoom = region?.latitudeDelta
    ? Math.min(15, Math.max(0, Math.log2(360 / region.latitudeDelta)) - 0.5)
    : 12.2;
  const center: [number, number] = region
    ? [region.longitude, region.latitude]
    : DEFAULT_CENTER;
  return (
    <Map
      style={style}
      mapStyle={nigerRoyalMaplibreStyle as any}
      attribution
      attributionPosition={{ bottom: 8, left: 8 }}
    >
      <Camera initialViewState={{ center, zoom, pitch: 0, bearing: 0 }} />
      {children}
    </Map>
  );
};

export default MapView;
