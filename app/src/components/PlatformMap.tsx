// 🗺️ Carte multi-plateforme :
// - iOS/Android → react-native-maps (Google Maps + style Niger Royal)
// - Web (preview) → carte de Bamako dessinée « Niger Royal » (SVG or/émeraude),
//   géometrie réelle approximative (fleuve, ponts, quartiers) → markers parfaitement alignés
import React, { createContext, useContext, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
  ART_BOUNDS,
  BRIDGES,
  CITY_LABEL,
  HIGHWAYS,
  RIVER_LABELS,
  RIVER_PATH,
  buildArterials,
  buildLocalStreets,
  buildTexture,
  labeledQuartiers,
} from './mapArt';

export type LatLng = { latitude: number; longitude: number };
export type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };

const isNative = Platform.OS !== 'web';
// require paresseux : jamais exécuté sur le web
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RNMaps: any = isNative ? require('react-native-maps') : null;

export const PROVIDER_GOOGLE: any = RNMaps ? RNMaps.PROVIDER_GOOGLE : undefined;

// ---------- Projection lat/lng → pixels (linéaire — échelle ville) ----------
type Px = { x: number; y: number };
type Proj = (p: LatLng) => Px;
const WebCtx = createContext<Proj | null>(null);

function buildProjection(region: Region, width: number, height: number): Proj {
  return (p: LatLng): Px => ({
    x: ((p.longitude - (region.longitude - region.longitudeDelta / 2)) / region.longitudeDelta) * width,
    y: ((region.latitude + region.latitudeDelta / 2 - p.latitude) / region.latitudeDelta) * height,
  });
}

const toPath = (pts: LatLng[], proj: Proj) =>
  pts.map((c, i) => `${i === 0 ? 'M' : 'L'} ${proj(c).x} ${proj(c).y}`).join(' ');

// ---------- 🎨 La carte dessinée Niger Royal ----------
function WebMapArt({ region, width, height }: { region: Region; width: number; height: number }) {
  const proj = buildProjection(region, width, height);
  const arterials = buildArterials();
  const locals = buildLocalStreets();
  const texture = buildTexture();

  const riverD = RIVER_PATH.map((seg, i) => {
    const s = proj(seg.start), c1 = proj(seg.c1), c2 = proj(seg.c2), e = proj(seg.end);
    return `${i === 0 ? `M ${s.x} ${s.y}` : ''} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${e.x} ${e.y}`;
  }).join(' ');

  // Parcs (grands ensembles verts)
  const park = proj({ latitude: 12.6330, longitude: -8.0270 });
  const park2 = proj({ latitude: 12.6525, longitude: -7.9745 });

  return (
    // @ts-ignore — SVG web uniquement
    <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 } as any}>
      <defs>
        <radialGradient id="nr-bg" cx="46%" cy="38%" r="95%">
          <stop offset="0%" stopColor="#0E3B2D" />
          <stop offset="55%" stopColor="#0C2A21" />
          <stop offset="100%" stopColor="#0B1E1A" />
        </radialGradient>
        <linearGradient id="nr-river" x1="0%" y1="0%" x2="100%" y2="30%">
          <stop offset="0%" stopColor="#1E8A8A" />
          <stop offset="55%" stopColor="#1D7C84" />
          <stop offset="100%" stopColor="#1E8A8A" />
        </linearGradient>
        <filter id="nr-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* fond */}
      <rect x={0} y={0} width={width} height={height} fill="url(#nr-bg)" />

      {/* texture d'émeraude */}
      {texture.map((t, i) => {
        const q = proj(t.c);
        return <circle key={i} cx={q.x} cy={q.y} r={t.r} fill="#165B45" opacity={0.07} />;
      })}

      {/* parcs */}
      <polygon points={`${park.x - 70},${park.y - 30} ${park.x + 40},${park.y - 55} ${park.x + 75},${park.y + 25} ${park.x - 20},${park.y + 50}`} fill="#103B2D" opacity={0.8} />
      <polygon points={`${park2.x - 45},${park2.y - 25} ${park2.x + 50},${park2.y - 40} ${park2.x + 60},${park2.y + 30} ${park2.x - 30},${park2.y + 42}`} fill="#103B2D" opacity={0.7} />

      {/* berges (berges vert foncé sous le fleuve) */}
      <path d={riverD} stroke="#0E3B33" strokeWidth={46} strokeLinecap="round" fill="none" opacity={0.9} />
      {/* fleuve Niger */}
      <path d={riverD} stroke="url(#nr-river)" strokeWidth={34} strokeLinecap="round" fill="none" opacity={0.95} />
      {/* reflet central */}

      {/* rues locales */}
      {locals.map((l, i) => (
        <path key={'l' + i} d={toPath(l, proj)} stroke="#14503F" strokeWidth={1} fill="none" opacity={0.85} />
      ))}

      {/* artères */}
      {arterials.map((l, i) => (
        <path key={'a' + i} d={toPath(l, proj)} stroke="#1A5B48" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      ))}

      {/* grands axes */}
      {HIGHWAYS.map((l, i) => (
        <g key={'h' + i}>
          <path d={toPath(l, proj)} stroke="#2A6B4F" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={toPath(l, proj)} stroke="#3E8A6C" strokeWidth={1.1} fill="none" opacity={0.5} strokeLinecap="round" />
        </g>
      ))}

      {/* ponts or */}
      {BRIDGES.map((b, i) => (
        <g key={'b' + i} filter="url(#nr-glow)">
          <path d={toPath(b, proj)} stroke="#E3B94E" strokeWidth={5} strokeLinecap="round" fill="none" />
          {b.map((c, j) => {
            const q = proj(c);
            return <circle key={j} cx={q.x} cy={q.y} r={3.4} fill="#E3B94E" />;
          })}
        </g>
      ))}
    </svg>
  );
}

// ---------- 🏷️ Labels (serif premium) ----------
function WebLabels({ region, width, height }: { region: Region; width: number; height: number }) {
  const proj = buildProjection(region, width, height);
  const city = proj(CITY_LABEL);
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 2, pointerEvents: 'none' } as any]}>
      {labeledQuartiers().map((q) => {
        const qm = proj(q);
        return (
          <Text key={q.name} style={[styles.qLabel, { left: qm.x, top: qm.y - 6 }]}>
            {q.name.toUpperCase()}
          </Text>
        );
      })}
      <Text style={[styles.cityLabel, { left: city.x, top: city.y }]}>Bamako</Text>
      {RIVER_LABELS.map((r, i) => {
        const qm = proj(r);
        return (
          <Text key={i} style={[styles.riverLabel, { left: qm.x, top: qm.y - 6 }]}>
            Niger
          </Text>
        );
      })}
    </View>
  );
}

function WebMarker({ coordinate, children }: any) {
  const project = useContext(WebCtx);
  if (!project) return null;
  const { x, y } = project(coordinate);
  return <View style={[styles.marker, { left: x, top: y }]}>{children ?? <View style={styles.dot} />}</View>;
}

function WebPolyline({ coordinates = [], strokeColor = '#E3B94E', strokeWidth = 4 }: any) {
  const project = useContext(WebCtx);
  if (!project || coordinates.length < 2) return null;
  const pts = coordinates.map((c: LatLng) => project(c));
  const maxX = Math.max(...pts.map((p: Px) => p.x)) + 30;
  const maxY = Math.max(...pts.map((p: Px) => p.y)) + 30;
  const points = pts.map((p: Px) => `${p.x},${p.y}`).join(' ');
  return (
    // @ts-ignore — SVG web uniquement
    <svg width={maxX} height={maxY} style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', zIndex: 4 } as any}>
      <defs>
        <filter id="nr-route-glow" x="-80%" y="-80%" width="260%" height="260%">
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
        filter="url(#nr-route-glow)"
      />
      {pts.map((p: Px, i: number) =>
        i === pts.length - 1 ? (
          <text key={i} x={p.x} y={p.y - 10} fontSize={18} textAnchor="middle">📍</text>
        ) : (
          <circle key={i} cx={p.x} cy={p.y} r={4.5} fill={strokeColor} />
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
          <WebMapArt region={region} width={size.width} height={size.height} />
          <WebLabels region={region} width={size.width} height={size.height} />
          <WebCtx.Provider value={project}>{children}</WebCtx.Provider>
        </>
      )}
      <Text style={styles.attribution}>Carte stylisée · Niger Royal</Text>
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

const SERIF = Platform.select({ web: 'Georgia, "Times New Roman", serif', default: 'serif' });

const styles = StyleSheet.create({
  webMap: { overflow: 'hidden', backgroundColor: '#0B1E1A' },
  qLabel: {
    position: 'absolute',
    color: '#B8CCBE',
    fontSize: 8.5,
    letterSpacing: 1.6,
    transform: [{ translateX: -26 }],
    opacity: 0.85,
  },
  cityLabel: {
    position: 'absolute',
    color: '#F4EFE3',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: SERIF,
    transform: [{ translateX: -48 }],
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
  } as any,
  riverLabel: {
    position: 'absolute',
    color: '#9FD6D2',
    fontSize: 10,
    fontStyle: 'italic',
    fontFamily: SERIF,
    transform: [{ rotate: '-7deg' }],
    opacity: 0.9,
    textShadowColor: 'rgba(11,30,26,0.9)',
    textShadowRadius: 4,
  } as any,
  attribution: {
    position: 'absolute',
    right: 8,
    bottom: 6,
    color: 'rgba(216, 210, 192, 0.45)',
    fontSize: 8.5,
    letterSpacing: 0.4,
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
