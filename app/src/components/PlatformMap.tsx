// 🗺️ Carte multi-plateforme :
// - iOS/Android → react-native-maps (Google Maps + style Niger Royal)
// - Web (preview) → rendu vectoriel SVG imitant la carte (fleuve, routes, quartiers)
import React, { createContext, useContext, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { QUARTIERS } from '../data/mock';

export type LatLng = { latitude: number; longitude: number };
export type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };

const isNative = Platform.OS !== 'web';
// require paresseux : jamais exécuté sur le web
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RNMaps: any = isNative ? require('react-native-maps') : null;

export const PROVIDER_GOOGLE: any = RNMaps ? RNMaps.PROVIDER_GOOGLE : undefined;

// ---------- Projection lat/lng → pixels (fallback web) ----------
type Px = { x: number; y: number };
type Ctx = { region: Region; width: number; height: number };
const WebCtx = createContext<Ctx | null>(null);

function project(region: Region, width: number, height: number, p: LatLng): Px {
  const x = ((p.longitude - (region.longitude - region.longitudeDelta / 2)) / region.longitudeDelta) * width;
  const y = ((region.latitude + region.latitudeDelta / 2 - p.latitude) / region.latitudeDelta) * height;
  return { x, y };
}

// ---------- Décor de carte web (SVG) ----------
function WebMapDecor({ region, width, height }: Ctx) {
  const road = '#14503F';
  const roadMain = '#1A5B48';
  const v = (lat: number, lng: number) => project(region, width, height, { latitude: lat, longitude: lng });

  // Quelques routes principales (simplifiées) — côté RN jamais exécuté
  const roads: { d: string; w: number }[] = [
    { d: `M ${v(12.668, -8.06).y * 0 + 60} ${0} ` + '', w: 3 }, // placeholder retiré ci-dessous
  ];
  roads.length = 0;
  const p1 = v(12.668, -8.06); const p2 = v(12.62, -7.95); const p3 = v(12.5785, -7.92);
  const p4 = v(12.60, -8.07); const p5 = v(12.63, -8.0); const p6 = v(12.66, -7.94);
  const p7 = v(12.575, -8.04); const p8 = v(12.640, -8.07);
  const p9 = v(12.627, -8.035); const p10 = v(12.6536, -7.9576);
  const d1 = `M ${p1.x} ${p1.y} L ${p5.x} ${p5.y} L ${p2.x} ${p2.y}`;
  const d2 = `M ${p4.x} ${p4.y} L ${p5.x} ${p5.y} L ${p6.x} ${p6.y}`;
  const d3 = `M ${p7.x} ${p7.y} L ${p9.x} ${p9.y} L ${p10.x} ${p10.y}`;
  const d4 = `M ${p8.x} ${p8.y} L ${p9.x} ${p9.y} L ${p3.x} ${p3.y}`;

  // Fleuve Niger : courbe qui traverse Bamako (Sud-Ouest → Nord-Est)
  const r1 = v(12.648, -8.065);
  const r2 = v(12.622, -8.015);
  const r3 = v(12.608, -7.965);
  const r4 = v(12.612, -7.915);

  return (
    // @ts-ignore — JSX intrinsèque SVG uniquement utilisé côté web
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 } as any}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="90%">
          <stop offset="0%" stopColor="#0E3B2D" />
          <stop offset="100%" stopColor="#0B1E1A" />
        </radialGradient>
        <filter id="glowRoute" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="0" width={width} height={height} fill="url(#bg)" />
      {/* quadrillage urbain */}
      {Array.from({ length: Math.ceil(width / 42) }, (_, i) => (
        <line key={'vx' + i} x1={i * 42} y1={0} x2={i * 42} y2={height} stroke="#103829" strokeWidth={1} />
      ))}
      {Array.from({ length: Math.ceil(height / 42) }, (_, i) => (
        <line key={'hz' + i} x1={0} y1={i * 42} x2={width} y2={i * 42} stroke="#103829" strokeWidth={1} />
      ))}
      {Array.from({ length: Math.ceil(width / 42) }, (_, i) => (
        <line key={'dg' + i} x1={i * 42 - height} y1={0} x2={i * 42} y2={height} stroke="#0F3126" strokeWidth={1} />
      ))}
      {/* fleuve Niger */}
      <path
        d={`M ${r1.x} ${r1.y} Q ${r2.x} ${r2.y} ${r3.x} ${r3.y} T ${r4.x} ${r4.y}`}
        stroke="#1E8A8A"
        strokeWidth={34}
        strokeLinecap="round"
        fill="none"
        opacity={0.85}
      />
      {/* routes principales */}
      <path d={d1} stroke={roadMain} strokeWidth={5} fill="none" />
      <path d={d2} stroke={roadMain} strokeWidth={5} fill="none" />
      <path d={d3} stroke={road} strokeWidth={4} fill="none" />
      <path d={d4} stroke={road} strokeWidth={4} fill="none" />
      {/* parcs */}
      <circle cx={width * 0.32} cy={height * 0.62} r={26} fill="#103B2D" />
      <circle cx={width * 0.72} cy={height * 0.28} r={20} fill="#103B2D" />
    </svg>
  );
}

function WebLabels({ region, width, height }: Ctx) {
  const shown = QUARTIERS.filter((_, i) => i % 2 === 0).slice(0, 8);
  return (
    <>
      {shown.map((q) => {
        const { x, y } = project(region, width, height, q);
        if (x < -40 || y < -20 || x > width + 40 || y > height + 20) return null;
        return (
          <Text key={q.name} style={[styles.label, { left: x, top: y }]}>
            {q.name.toUpperCase()}
          </Text>
        );
      })}
      <Text style={[styles.city, { left: width * 0.5 - 50, top: height * 0.36 }]}>Bamako</Text>
    </>
  );
}

function WebMarker({ coordinate, children }: any) {
  const ctx = useContext(WebCtx);
  if (!ctx) return null;
  const { x, y } = project(ctx.region, ctx.width, ctx.height, coordinate);
  if (x < -60 || y < -60 || x > ctx.width + 60 || y > ctx.height + 60) return null;
  return <View style={[styles.marker, { left: x, top: y }]}>{children ?? <View style={styles.dot} />}</View>;
}

function WebPolyline({ coordinates = [], strokeColor = '#E3B94E', strokeWidth = 4 }: any) {
  const ctx = useContext(WebCtx);
  if (!ctx || coordinates.length < 2) return null;
  const pts = coordinates
    .map((c: LatLng) => project(ctx.region, ctx.width, ctx.height, c))
    .map((p: Px) => `${p.x},${p.y}`)
    .join(' ');
  return (
    // @ts-ignore — SVG web uniquement
    <svg width={ctx.width} height={ctx.height} style={{ position: 'absolute', top: 0, left: 0 } as any}>
      {/* @ts-ignore */}
      <polyline
        points={pts}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#glowRoute)"
      />
      {/* point départ / arrivée */}
      {coordinates.map((c: LatLng, i: number) => {
        const p = project(ctx.region, ctx.width, ctx.height, c);
        return i === coordinates.length - 1 ? (
          <text key={i} x={p.x} y={p.y - 10} fontSize={20} textAnchor="middle">📍</text>
        ) : (
          <circle key={i} cx={p.x} cy={p.y} r={5} fill={strokeColor} />
        );
      })}
    </svg>
  );
}

function WebMap({ children, style, region, customMapStyle: _ }: any) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <View
      style={[styles.webMap, style]}
      onLayout={(e) =>
        setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
      }
    >
      {size.width > 0 && (
        <WebCtx.Provider value={{ region, ...size }}>
          <WebMapDecor region={region} width={size.width} height={size.height} />
          <WebLabels region={region} width={size.width} height={size.height} />
          {children}
        </WebCtx.Provider>
      )}
      <Text style={styles.google}>Google</Text>
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
  label: {
    position: 'absolute',
    color: '#CBB98A',
    fontSize: 9,
    letterSpacing: 1,
    transform: [{ translateX: -30 }],
    opacity: 0.9,
  },
  city: {
    position: 'absolute',
    color: '#F4EFE3',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.95,
    zIndex: 0,
  },
  google: { position: 'absolute', left: 10, bottom: 8, color: '#D8D2C0', fontSize: 13, opacity: 0.8 },
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
