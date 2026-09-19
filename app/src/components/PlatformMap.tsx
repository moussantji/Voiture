// 🗺️ Carte multi-plateforme :
// - iOS/Android → react-native-maps (Google Maps + style Niger Royal)
// - Web (preview) → VRAIE carte de Bamako (tuiles CartoDB dark basées sur
//   OpenStreetMap) + filtre CSS émeraude → rendu proche de la maquette validée
import React, { createContext, useContext, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

export type LatLng = { latitude: number; longitude: number };
export type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };

const isNative = Platform.OS !== 'web';
// require paresseux : jamais exécuté sur le web
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RNMaps: any = isNative ? require('react-native-maps') : null;

export const PROVIDER_GOOGLE: any = RNMaps ? RNMaps.PROVIDER_GOOGLE : undefined;

// ---------- Projection Web Mercator (identique aux tuiles) ----------
type Px = { x: number; y: number };
type Proj = (p: LatLng) => Px;

const WebCtx = createContext<Proj | null>(null);

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function lngToWorldX(lng: number, worldSize: number) {
  return ((lng + 180) / 360) * worldSize;
}
function latToWorldY(lat: number, worldSize: number) {
  const s = Math.sin((clamp(lat, -85, 85) * Math.PI) / 180);
  return ((1 - Math.log((1 + s) / (1 - s)) / Math.PI) / 2) * worldSize;
}

function buildProjection(region: Region, width: number, height: number) {
  const zoom = Math.log2(360 / region.longitudeDelta);
  const worldSize = 256 * Math.pow(2, zoom);
  const cx = lngToWorldX(region.longitude, worldSize);
  const cy = latToWorldY(region.latitude, worldSize);
  const ox = cx - width / 2;
  const oy = cy - height / 2;
  return (p: LatLng): Px => ({
    x: lngToWorldX(p.longitude, worldSize) - ox,
    y: latToWorldY(p.latitude, worldSize) - oy,
  });
}

// ---------- Tuiles raster (web) ----------
function tileUrl(z: number, x: number, y: number, s: string) {
  return `https://${s}.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`;
}

function WebTiles({ region, width, height }: { region: Region; width: number; height: number }) {
  const zoom = Math.log2(360 / region.longitudeDelta);
  const tz = clamp(Math.round(zoom), 12, 18);
  const scale = Math.pow(2, zoom - tz); // facteur entre pixels projetés et tuiles
  const worldT = 256 * Math.pow(2, tz);

  const zoomW = Math.log2(360 / region.longitudeDelta);
  const worldSize = 256 * Math.pow(2, zoomW);
  const ox = lngToWorldX(region.longitude, worldSize) - width / 2;
  const oy = latToWorldY(region.latitude, worldSize) - height / 2;

  const x0 = Math.floor(ox / scale / 256);
  const x1 = Math.floor((ox + width) / scale / 256);
  const y0 = Math.floor(oy / scale / 256);
  const y1 = Math.floor((oy + height) / scale / 256);

  const subs = ['a', 'b', 'c', 'd'];
  const tiles: React.ReactNode[] = [];
  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      const n = Math.pow(2, tz);
      const wrapped = ((x % n) + n) % n;
      if (y < 0 || y >= n) continue;
      // @ts-ignore — image brute uniquement côté web
      tiles.push(
        <img
          key={`${tz}-${wrapped}-${y}`}
          src={tileUrl(tz, wrapped, y, subs[(wrapped + y) % subs.length])}
          draggable={false}
          style={
            {
              position: 'absolute',
              left: wrapped * 256 * scale - ox + (x < 0 || x >= n ? (x - wrapped) * worldT * scale : 0),
              top: y * 256 * scale - oy,
              width: 256 * scale,
              height: 256 * scale,
              userSelect: 'none',
              pointerEvents: 'none',
            } as any
          }
          alt=""
        />,
      );
    }
  }
  return (
    // @ts-ignore — div brute uniquement côté web (garantit l'application du filtre CSS)
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // Filtre qui transforme la carte CARTO "dark" en thème émeraude Niger Royal
        filter: 'hue-rotate(115deg) saturate(0.85) brightness(0.92) contrast(1.05)',
      }}
    >
      {tiles}
    </div>
  );
}

function WebMarker({ coordinate, children }: any) {
  const project = useContext(WebCtx);
  if (!project) return null;
  const { x, y } = project(coordinate);
  return <View style={[styles.marker, { left: x, top: y }]}>{children ?? <View style={styles.dot} />}</View>;
}

function WebPolyline({ coordinates = [], strokeColor = '#E3B94E', strokeWidth = 5 }: any) {
  const project = useContext(WebCtx);
  if (!project || coordinates.length < 2) return null;
  const pts = coordinates.map((c: LatLng) => project(c));
  const maxX = Math.max(...pts.map((p: Px) => p.x)) + 20;
  const maxY = Math.max(...pts.map((p: Px) => p.y)) + 20;
  const points = pts.map((p: Px) => `${p.x},${p.y}`).join(' ');
  return (
    // @ts-ignore — SVG web uniquement
    <svg width={maxX} height={maxY} style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' } as any}>
      <defs>
        <filter id="glowRoute" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* @ts-ignore */}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#glowRoute)"
      />
      {pts.map((p: Px, i: number) =>
        i === pts.length - 1 ? (
          <text key={i} x={p.x} y={p.y - 8} fontSize={20} textAnchor="middle">
            📍
          </text>
        ) : (
          <circle key={i} cx={p.x} cy={p.y} r={5} fill={strokeColor} />
        ),
      )}
    </svg>
  );
}

function WebMap({ children, style, region, customMapStyle: _ }: any) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const project = buildProjection(region, size.width || 1, size.height || 1);
  return (
    <View
      style={[styles.webMap, style]}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {size.width > 0 && (
        <>
          <WebTiles region={region} width={size.width} height={size.height} />
          <View style={[StyleSheet.absoluteFill, styles.brandTint]} pointerEvents="none" />
          <WebCtx.Provider value={project}>{children}</WebCtx.Provider>
        </>
      )}
      <Text style={styles.attribution}>© OpenStreetMap · © CARTO</Text>
    </View>
  );
}

// ---------- API exportée (identique sur les 2 plateformes) ----------
export const Marker = (props: any) => {
  if (RNMaps) return <RNMaps.Marker {...props} />;
  return <WebMarker {...props} />;
};

export const Polyline = (props: any) => {
  if (RNMaps) return <RNMaps.Polyline {...props} />;
  return <WebPolyline {...props} />;
};

const MapView = (props: any) => {
  if (RNMaps) {
    const Native = RNMaps.default;
    return (
      <Native
        provider={PROVIDER_GOOGLE}
        style={props.style}
        initialRegion={props.region}
        region={undefined}
        customMapStyle={props.customMapStyle}
        showsCompass={false}
        showsUserLocation={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {props.children}
      </Native>
    );
  }
  return <WebMap {...props} />;
};

export const isWebPreview = !isNative;
export default MapView;

const styles = StyleSheet.create({
  webMap: { overflow: 'hidden', backgroundColor: '#0B1E1A' },
  brandTint: {
    backgroundColor: 'rgba(11, 30, 26, 0.18)',
  },
  attribution: {
    position: 'absolute',
    right: 8,
    bottom: 6,
    color: 'rgba(216, 210, 192, 0.55)',
    fontSize: 9,
  },
  marker: { position: 'absolute', transform: [{ translateX: -16 }, { translateY: -16 }], zIndex: 5 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E3B94E',
    borderWidth: 2,
    borderColor: '#0B1E1A',
  },
});
