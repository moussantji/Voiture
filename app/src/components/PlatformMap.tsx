// 🗺️ Carte multi-plateforme :
// - iOS/Android → react-native-maps (Google Maps + style Niger Royal)
// - Web → VRAIE carte interactive Leaflet + tuiles Google Maps (mode sombre),
//   repli auto : tuiles OSM/CARTO → carte dessinée Niger Royal (SVG) si hors-ligne
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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
// 🗺️ Sélection du fournisseur natif (MapLibre gratuit / Google Maps) — config/maps.ts
// require paresseux : l'autre SDK natif n'est jamais chargé, jamais rien sur le web
// eslint-disable-next-line @typescript-eslint/no-var-requires
const adapter: any = isNative
  ? require('../config/maps').MAP_PROVIDER === 'maplibre'
    ? require('./adapters/MapLibre.adapter')
    : require('./adapters/GoogleMaps.adapter')
  : null;
const RNMaps = adapter;

export const PROVIDER_GOOGLE: any = adapter ? adapter.PROVIDER_GOOGLE : undefined;

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

function WebMap({ children, style, region, customMapStyle: _, onPress }: any) {
  return <LeafletWebMap children={children} style={style} region={region} onPress={onPress} />;
}

// ---------- 🗺️ Vraie carte web : Leaflet + tuiles Google Maps (mode sombre) ----------
const G: any = globalThis as any;
let leafletPromise: Promise<any> | null = null;

function loadLeaflet(): Promise<any> {
  const d = G.document;
  if (!d) return Promise.reject(new Error('no dom'));
  if (G.L) return Promise.resolve(G.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    if (!d.getElementById('nr-leaflet-css')) {
      const l = d.createElement('link');
      l.id = 'nr-leaflet-css';
      l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      d.head.appendChild(l);
    }
    if (!d.getElementById('nr-leaflet-style')) {
      const s = d.createElement('style');
      s.id = 'nr-leaflet-style';
      s.textContent =
        '.nr-gdark .leaflet-tile-pane{filter:invert(100%) hue-rotate(180deg) saturate(.75) brightness(.92) contrast(1.04)}' +
        '.nr-emerald .leaflet-tile-pane{filter:hue-rotate(118deg) saturate(.85) brightness(.93) contrast(1.05)}' +
        '.leaflet-container{background:#0B1E1A;font-family:inherit;outline:none}' +
        '.leaflet-control-attribution{background:rgba(13,42,34,.78)!important;color:rgba(216,210,192,.7)!important;font-size:8px!important;padding:2px 6px!important}' +
        '.leaflet-control-attribution a{color:#9FD6D2!important}' +
        'path.nr-route{filter:drop-shadow(0 0 6px rgba(227,185,78,.85))}' +
        '@keyframes nrpulse{from{transform:scale(1);opacity:.55}to{transform:scale(2.4);opacity:0}}';
      d.head.appendChild(s);
    }
    const sc = d.createElement('script');
    sc.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    sc.onload = () => resolve(G.L);
    sc.onerror = () => {
      leafletPromise = null;
      reject(new Error('leaflet cdn unreachable'));
    };
    d.head.appendChild(sc);
  });
  return leafletPromise;
}

// 🎨 Icônes Niger Royal (variant: car | user | dest | défaut=point or)
function nrIcon(L: any, variant?: string) {
  if (variant === 'user') {
    return L.divIcon({
      className: 'nr-mk',
      html:
        '<div style="position:relative;width:10px;height:10px">' +
        '<i style="position:absolute;left:50%;top:50%;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;background:#E3B94E;opacity:.55;animation:nrpulse 1.6s ease-out infinite"></i>' +
        '<b style="position:absolute;left:50%;top:50%;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;background:#E3B94E;border:2.5px solid #0B1E1A;box-shadow:0 0 10px rgba(227,185,78,.9)"></b></div>',
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    });
  }
  if (variant === 'dest') {
    return L.divIcon({
      className: 'nr-mk',
      html: '<div style="font-size:26px">📍</div>',
      iconSize: [26, 30],
      iconAnchor: [13, 28],
    });
  }
  if (variant === 'car') {
    return L.divIcon({
      className: 'nr-mk',
      html:
        '<div style="width:34px;height:34px;border-radius:50%;background:#E3B94E;border:2px solid #0B1E1A;' +
        'display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 12px rgba(227,185,78,.75)">🚕</div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }
  return L.divIcon({
    className: 'nr-mk',
    html:
      '<div style="width:16px;height:16px;border-radius:8px;background:#E3B94E;border:2px solid #0B1E1A;' +
      'box-shadow:0 0 8px rgba(227,185,78,.6)"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function LeafletWebMap({ children, style: _style, region, onPress }: any) {
  const hostRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;
  const [state, setState] = useState<'loading' | 'ready' | 'fallback'>('loading');

  // 🚀 Chargement de Leaflet + init de la carte (tuiles Google → repli OSM/CARTO)
  useEffect(() => {
    let alive = true;
    loadLeaflet()
      .then((L) => {
        if (!alive || !hostRef.current) return;
        LRef.current = L;
        const map = L.map(hostRef.current, { zoomControl: false, attributionControl: true });
        const cont = map.getContainer();
        const google = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=fr', {
          subdomains: '0123',
          maxZoom: 20,
          attribution: '© Google Maps',
        });
        let tileErrors = 0;
        google.on('tileerror', () => {
          tileErrors += 1;
          if (tileErrors > 3) {
            try {
              map.removeLayer(google);
            } catch {}
            cont.classList.remove('nr-gdark');
            cont.classList.add('nr-emerald');
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
              subdomains: 'abcd',
              maxZoom: 19,
              attribution: '© OpenStreetMap · © CARTO',
            }).addTo(map);
          }
        });
        google.addTo(map);
        cont.classList.add('nr-gdark');
        map.on('click', (e: any) =>
          onPressRef.current?.({ latitude: e.latlng.lat, longitude: e.latlng.lng }),
        );
        mapRef.current = map;
        if (alive) setState('ready');
        // 📐 Corrige l'affichage : recalcule la taille réelle après montage
        const fix = () => {
          try {
            map.invalidateSize(true);
          } catch {}
        };
        fix();
        setTimeout(fix, 200);
        setTimeout(fix, 800);
        if (G.addEventListener) G.addEventListener('resize', fix);
      })
      .catch(() => {
        if (alive) setState('fallback');
      });
    return () => {
      alive = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 🎯 Centrage / zoom à partir de la région
  useEffect(() => {
    const map = mapRef.current;
    if (state !== 'ready' || !map) return;
    const zoom = Math.max(3, Math.min(18, Math.round(Math.log2(360 / region.latitudeDelta))));
    map.setView([region.latitude, region.longitude], zoom, { animate: false });
  }, [state, region.latitude, region.longitude, region.latitudeDelta]);

  // 📍 Markers + 🛣️ itinéraires (consommés depuis les children RN-like)
  useEffect(() => {
    const map = mapRef.current;
    const L = LRef.current;
    if (state !== 'ready' || !map || !L) return;
    const layers: any[] = [];
    React.Children.forEach(children, (ch: any) => {
      if (!React.isValidElement(ch)) return;
      const p: any = ch.props;
      if (p?.coordinate && ch.type === (WebMarker as any)) {
        const mk = L.marker([p.coordinate.latitude, p.coordinate.longitude], {
          icon: nrIcon(L, p.variant),
        }).addTo(map);
        layers.push(mk);
      } else if (p?.coordinates && ch.type === (WebPolyline as any)) {
        const pl = L.polyline(
          p.coordinates.map((c: LatLng) => [c.latitude, c.longitude]),
          { color: p.strokeColor || '#E3B94E', weight: p.strokeWidth || 4, className: 'nr-route' },
        ).addTo(map);
        layers.push(pl);
      }
    });
    return () => {
      layers.forEach((l) => {
        try {
          l.remove();
        } catch {}
      });
    };
  }, [state, children]);

  if (state === 'fallback') {
    return <SvgWebMap children={children} region={region} onPress={onPress} />;
  }
  if (G.document) {
    return React.createElement('div', {
      ref: hostRef,
      // 🧱 z-index 0 + contexte d'empilement propre : les couches internes de
      //    Leaflet (200+) restent confinées et ne passent JAMAIS au-dessus
      //    des boutons/panneaux de l'app (qui viennent après dans le DOM)
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        backgroundColor: '#0B1E1A',
      },
    });
  }
  return <View style={styles.webMap} />;
}

// ---------- 🧯 Repli : carte dessinée Niger Royal (SVG) si la carte en ligne échoue ----------
function SvgWebMap({ children, style: _style, region, onPress }: any) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const project = buildProjection(region, size.width || 1, size.height || 1);
  const handlePress = onPress
    ? (e: any) => {
        const lx = e?.nativeEvent?.locationX ?? 0;
        const ly = e?.nativeEvent?.locationY ?? 0;
        if (!size.width) return;
        onPress({
          latitude: region.latitude + region.latitudeDelta / 2 - (ly / size.height) * region.latitudeDelta,
          longitude: region.longitude - region.longitudeDelta / 2 + (lx / size.width) * region.longitudeDelta,
        });
      }
    : undefined;
  return (
    <View
      style={styles.webMap}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      onStartShouldSetResponder={handlePress ? () => true : undefined}
      onResponderGrant={handlePress}
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
    // L'adaptateur (MapLibre / Google) gère provider, style et région en interne
    const Native = RNMaps.default;
    return <Native {...props}>{props.children}</Native>;
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
