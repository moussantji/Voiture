// scripts/gen-preview.ts
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// src/data/mock.ts
var BAMAKO_REGION = {
  latitude: 12.6255,
  longitude: -8.001,
  latitudeDelta: 0.085,
  longitudeDelta: 0.085
};
var USER_POSITION = { latitude: 12.6255, longitude: -8.001 };
var CARS = [
  { id: "c1", latitude: 12.641, longitude: -8.012, heading: 40 },
  { id: "c2", latitude: 12.6536, longitude: -7.9576, heading: 300 },
  // Hamdallaye
  { id: "c3", latitude: 12.6144, longitude: -8.0147, heading: 120 },
  // Badalabougou
  { id: "c4", latitude: 12.6365, longitude: -7.972, heading: 210 },
  { id: "c5", latitude: 12.6273, longitude: -8.0346, heading: 80 },
  // Kalabancoura
  { id: "c6", latitude: 12.65, longitude: -7.995, heading: 160 },
  // Médina Coura
  { id: "c7", latitude: 12.6233, longitude: -7.9846, heading: 350 },
  // ACI 2000
  { id: "c8", latitude: 12.6066, longitude: -7.94, heading: 25 },
  // Sotuba
  { id: "c9", latitude: 12.599, longitude: -8.02, heading: 285 }
];
var QUARTIERS = [
  { name: "ACI 2000", latitude: 12.6233, longitude: -7.9846 },
  { name: "Hamdallaye ACI", latitude: 12.6536, longitude: -7.9576 },
  { name: "Badalabougou", latitude: 12.6144, longitude: -8.0047 },
  { name: "Baco-Djicoroni Golf", latitude: 12.5785, longitude: -8.038 },
  { name: "Sotuba ACI", latitude: 12.6066, longitude: -7.92 },
  { name: "Kalabancoura", latitude: 12.6273, longitude: -8.0346 },
  { name: "M\xE9dina Coura", latitude: 12.65, longitude: -7.995 },
  { name: "Hippodrome", latitude: 12.6342, longitude: -8.0189 },
  { name: "Magnambougou", latitude: 12.5879, longitude: -8.0224 },
  { name: "Niarela", latitude: 12.631, longitude: -7.987 },
  { name: "Faladi\xE9", latitude: 12.6094, longitude: -8.084 },
  { name: "A\xE9roport Modibo Ke\xEFta", latitude: 12.5335, longitude: -7.9499 }
];
var DRIVER_POSITION = { latitude: 12.5785, longitude: -8.038 };
var INCOMING_REQUEST = {
  id: "req-1",
  clientName: "Aminata Traor\xE9",
  clientRating: 4.9,
  pickup: { name: "Baco-Djicoroni Golf", latitude: 12.5785, longitude: -8.038 },
  destination: { name: "ACI 2000", latitude: 12.6233, longitude: -7.9846 },
  price: 2500,
  distanceToClient: 1.2
};
function distanceKm(a, b) {
  const R2 = 6371;
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLng = (b.longitude - a.longitude) * Math.PI / 180;
  const la1 = a.latitude * Math.PI / 180;
  const la2 = b.latitude * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R2 * Math.asin(Math.sqrt(h));
}
function estimatePrice(km) {
  return Math.round((300 + km * 250) / 25) * 25;
}
function estimateDurationMin(km) {
  return Math.max(3, Math.round(km * 3.2));
}
function formatFCFA(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
}

// src/components/mapArt.ts
var ART_BOUNDS = {
  lonMin: -8.0435,
  lonMax: -7.9585,
  latMin: 12.583,
  latMax: 12.668
};
function mulberry32(seed) {
  return function() {
    seed |= 0;
    seed = seed + 1831565813 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var p = (latitude, longitude) => ({ latitude, longitude });
var RIVER_PATH = [
  { start: p(12.6415, -8.0475), c1: p(12.639, -8.028), c2: p(12.631, -8.016), end: p(12.626, -8.0025) },
  { start: p(12.626, -8.0025), c1: p(12.6215, -7.99), c2: p(12.62, -7.972), end: p(12.6145, -7.9535) }
];
var BRIDGES = [
  [p(12.6328, -8.002), p(12.6192, -8.0015)],
  // Martyrs (centre ↔ Badalabougou)
  [p(12.6238, -7.9678), p(12.6108, -7.9652)]
  // Roi Fahd (vers Sotuba)
];
var HIGHWAYS = [
  // Axe Est-Ouest rive nord (Hamdallaye ↔ centre ↔ ouest)
  [p(12.6445, -8.047), p(12.6438, -8.032), p(12.6428, -8.018), p(12.642, -8.005), p(12.643, -7.992), p(12.6442, -7.978), p(12.6462, -7.966), p(12.6482, -7.956)],
  // Avenue centrale → Pont des Martyrs → sud (Magnambougou)
  [p(12.646, -8.0035), p(12.638, -8.0028), p(12.6328, -8.002), p(12.6192, -8.0015), p(12.612, -8.0008), p(12.6035, -8.0015), p(12.5945, -8.003)],
  // Centre → Pont Roi Fahd → Sotuba
  [p(12.6445, -7.992), p(12.638, -7.977), p(12.6325, -7.9705), p(12.6238, -7.9678), p(12.6108, -7.9652), p(12.603, -7.962), p(12.595, -7.956)],
  // Axe ouest (Banconi → Baco)
  [p(12.6395, -8.0035), p(12.632, -8.014), p(12.627, -8.023), p(12.6228, -8.033), p(12.6188, -8.046)],
  // Rive sud : Badalabougou → ACI 2000 → Sotuba ACI
  [p(12.6035, -8.0015), p(12.603, -7.99), p(12.607, -7.979), p(12.611, -7.966), p(12.614, -7.956)],
  // Nord : Medina Coura → Hamdallaye ACI
  [p(12.646, -8.0035), p(12.6515, -8.0005), p(12.6558, -7.993), p(12.6598, -7.982), p(12.664, -7.97), p(12.6662, -7.96)],
  // Diagonale NW (vers Faladié)
  [p(12.6395, -8.0035), p(12.644, -8.012), p(12.648, -8.021), p(12.652, -8.031), p(12.6555, -8.041)]
];
function buildArterials() {
  const anchors = [
    p(12.6536, -7.9576),
    // Hamdallaye ACI
    p(12.65, -7.995),
    // Médina Coura
    p(12.631, -7.987),
    // Niarela
    p(12.6342, -8.0189),
    // Hippodrome
    p(12.6273, -8.0346),
    // Kalabancoura
    p(12.6144, -8.0047),
    // Badalabougou
    p(12.6233, -7.9846),
    // ACI 2000
    p(12.6066, -7.985)
    // ACI sud
  ];
  const links = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [1, 3],
    [2, 6],
    [6, 5],
    [5, 7],
    [4, 5],
    [1, 5],
    [3, 5],
    [0, 6],
    [2, 5],
    [4, 3]
  ];
  const rnd = mulberry32(42);
  return links.map(([a, b]) => {
    const A = anchors[a], B = anchors[b];
    const mid = {
      latitude: (A.latitude + B.latitude) / 2 + (rnd() - 0.5) * 4e-3,
      longitude: (A.longitude + B.longitude) / 2 + (rnd() - 0.5) * 4e-3
    };
    return [A, mid, B];
  });
}
function buildLocalStreets() {
  const rnd = mulberry32(7);
  const lines = [];
  for (const q of QUARTIERS) {
    if (q.longitude < ART_BOUNDS.lonMin || q.longitude > ART_BOUNDS.lonMax || q.latitude < ART_BOUNDS.latMin || q.latitude > ART_BOUNDS.latMax) continue;
    const angle = rnd() * Math.PI;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const len = 65e-4, gap = 19e-4;
    for (let i = -2; i <= 2; i++) {
      lines.push([
        p(q.latitude + i * gap * cos - len * sin, q.longitude + i * gap * sin + len * cos),
        p(q.latitude + i * gap * cos + len * sin, q.longitude + i * gap * sin - len * cos)
      ]);
      lines.push([
        p(q.latitude - len * cos / 1.4 + i * gap * sin, q.longitude + len * sin / 1.4 + i * gap * cos),
        p(q.latitude + len * cos / 1.4 + i * gap * sin, q.longitude - len * sin / 1.4 + i * gap * cos)
      ]);
    }
  }
  return lines;
}
function buildTexture() {
  const rnd = mulberry32(99);
  const dots = [];
  for (let i = 0; i < 130; i++) {
    dots.push({
      c: p(
        ART_BOUNDS.latMin + rnd() * (ART_BOUNDS.latMax - ART_BOUNDS.latMin),
        ART_BOUNDS.lonMin + rnd() * (ART_BOUNDS.lonMax - ART_BOUNDS.lonMin)
      ),
      r: 0.6 + rnd() * 2.2
    });
  }
  return dots;
}
function labeledQuartiers() {
  return QUARTIERS.filter(
    (q) => q.longitude > ART_BOUNDS.lonMin + 2e-3 && q.longitude < ART_BOUNDS.lonMax - 4e-3 && q.latitude > ART_BOUNDS.latMin + 3e-3 && q.latitude < ART_BOUNDS.latMax - 4e-3
  );
}
var CITY_LABEL = p(12.649, -8.0125);
var RIVER_LABELS = [p(12.6325, -8.0215), p(12.618, -7.9795)];

// scripts/gen-preview.ts
var W = 402;
var H = 734;
var R = BAMAKO_REGION;
var proj = (p2) => ({
  x: (p2.longitude - (R.longitude - R.longitudeDelta / 2)) / R.longitudeDelta * W,
  y: (R.latitude + R.latitudeDelta / 2 - p2.latitude) / R.latitudeDelta * H
});
var path = (pts) => pts.map((p2, i) => `${i === 0 ? "M" : "L"} ${proj(p2).x.toFixed(1)} ${proj(p2).y.toFixed(1)}`).join(" ");
function mapSVG() {
  const arterials = buildArterials();
  const locals = buildLocalStreets();
  const texture = buildTexture();
  const riverD = RIVER_PATH.map((s, i) => {
    const a = proj(s.start), c1 = proj(s.c1), c2 = proj(s.c2), e = proj(s.end);
    return `${i === 0 ? `M ${a.x.toFixed(1)} ${a.y.toFixed(1)}` : ""} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${e.x.toFixed(1)} ${e.y.toFixed(1)}`;
  }).join(" ");
  const pk = proj({ latitude: 12.633, longitude: -8.027 });
  const pk2 = proj({ latitude: 12.6525, longitude: -7.9745 });
  return `<svg class="map-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="bg" cx="46%" cy="38%" r="95%"><stop offset="0%" stop-color="#0E3B2D"/><stop offset="55%" stop-color="#0C2A21"/><stop offset="100%" stop-color="#0B1E1A"/></radialGradient>
    <linearGradient id="river" x1="0%" y1="0%" x2="100%" y2="30%"><stop offset="0%" stop-color="#1E8A8A"/><stop offset="55%" stop-color="#1D7C84"/><stop offset="100%" stop-color="#1E8A8A"/></linearGradient>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${texture.map((t) => {
    const q = proj(t.c);
    return `<circle cx="${q.x.toFixed(0)}" cy="${q.y.toFixed(0)}" r="${t.r.toFixed(1)}" fill="#165B45" opacity="0.07"/>`;
  }).join("")}
  <polygon points="${pk.x - 70},${pk.y - 30} ${pk.x + 40},${pk.y - 55} ${pk.x + 75},${pk.y + 25} ${pk.x - 20},${pk.y + 50}" fill="#103B2D" opacity="0.8"/>
  <polygon points="${pk2.x - 45},${pk2.y - 25} ${pk2.x + 50},${pk2.y - 40} ${pk2.x + 60},${pk2.y + 30} ${pk2.x - 30},${pk2.y + 42}" fill="#103B2D" opacity="0.7"/>
  <path d="${riverD}" stroke="#0E3B33" stroke-width="46" stroke-linecap="round" fill="none" opacity="0.9"/>
  <path d="${riverD}" stroke="url(#river)" stroke-width="34" stroke-linecap="round" fill="none" opacity="0.95"/>
  ${locals.map((l) => `<path d="${path(l)}" stroke="#14503F" stroke-width="1" fill="none" opacity="0.85"/>`).join("")}
  ${arterials.map((l) => `<path d="${path(l)}" stroke="#1A5B48" stroke-width="2.2" fill="none" stroke-linecap="round"/>`).join("")}
  ${HIGHWAYS.map((l) => `<path d="${path(l)}" stroke="#2A6B4F" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${path(l)}" stroke="#3E8A6C" stroke-width="1.1" fill="none" opacity="0.5" stroke-linecap="round"/>`).join("")}
  ${BRIDGES.map((b) => `<path d="${path(b)}" stroke="#E3B94E" stroke-width="5" stroke-linecap="round" fill="none" filter="url(#glow)"/>${b.map((c) => {
    const q = proj(c);
    return `<circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="3.4" fill="#E3B94E"/>`;
  }).join("")}`).join("")}
</svg>`;
}
function staticLabels() {
  const city = proj(CITY_LABEL);
  const qs = labeledQuartiers().map((q) => {
    const p2 = proj(q);
    return `<span class="q" style="left:${p2.x.toFixed(0)}px;top:${(p2.y - 6).toFixed(0)}px">${q.name.toUpperCase()}</span>`;
  }).join("");
  const rivers = RIVER_LABELS.map((r) => {
    const p2 = proj(r);
    return `<span class="river-lbl" style="left:${p2.x.toFixed(0)}px;top:${(p2.y - 6).toFixed(0)}px">Niger</span>`;
  }).join("");
  return `${qs}<span class="city" style="left:${(city.x - 48).toFixed(0)}px;top:${city.y.toFixed(0)}px">Bamako</span>${rivers}`;
}
function staticCars() {
  return `<div class="cars">${CARS.map((c, i) => {
    const p2 = proj(c);
    return `<div class="car" style="left:${p2.x.toFixed(0)}px;top:${p2.y.toFixed(0)}px;transform:rotate(${c.heading}deg);animation-delay:${i * 0.7 % 3}s"><span>\u{1F695}</span></div>`;
  }).join("")}</div>`;
}
function staticPin() {
  const user = proj(USER_POSITION);
  return `<div class="user-pin" style="left:${user.x.toFixed(0)}px;top:${user.y.toFixed(0)}px"><i></i><b><u></u></b><s></s></div>`;
}
function clientScreen() {
  const items = QUARTIERS.slice(0, 9).map((q) => {
    const km = distanceKm(USER_POSITION, q) * 1.35;
    return `<div class="qi" data-name="${q.name}" data-km="${km.toFixed(1)}" data-price="${formatFCFA(estimatePrice(km))}" data-min="${estimateDurationMin(km)}" data-lat="${q.latitude}" data-lng="${q.longitude}">
      <span class="qi-flag"></span>
      <span class="qi-txt"><b>${q.name}</b><small>\xE0 ${km.toFixed(1)} km \xB7 ${formatFCFA(estimatePrice(km))}</small></span>
      <span class="qi-chevr">\u203A</span>
    </div>`;
  }).join("");
  return `<div class="scr" id="screenClient">
  <div class="leaflet-host" id="mapC"></div>
  <div class="static-map" id="staticC">${mapSVG()}${staticLabels()}${staticCars()}${staticPin()}<svg class="route-svg" viewBox="0 0 ${W} ${H}"><polyline id="polyC" points="" fill="none" stroke="#E3B94E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="topbar">
    <button class="fbtn" data-menu><span class="menu-i"><i></i><i></i><i></i></span></button>
    <span style="flex:1"></span>
    <button class="fbtn" data-notif><span class="bell-i"></span><i class="rdot">2</i></button>
  </div>
  <div class="hint-pill" id="hintDest">\u{1F4CD} Touchez la carte pour placer votre destination</div>
  <div class="sheet" id="sheetC">
    <div class="handle"></div>
    <div id="cIdle">
      <div class="field" id="destField">
        <span class="flag-i"></span>
        <span class="field-txt"><small>DESTINATION</small><b id="destVal">O\xF9 allez-vous ?</b></span>
        <span class="chevr">\u203A</span>
      </div>
      <div class="est" id="estRow" style="display:none">
        <div class="inf"><small>DISTANCE</small><b id="estKm">\u2014</b></div>
        <div class="inf"><small>DUR\xC9E</small><b id="estMin">\u2014</b></div>
        <div class="inf"><small>PRIX ESTIM\xC9</small><b class="gold" id="estPrice">\u2014</b></div>
      </div>
      <button class="gbtn" id="btnSearch" disabled>Rechercher une voiture</button>
    </div>
    <div id="cFound" style="display:none">
      <div class="found-t">\u2713 Chauffeur trouv\xE9</div>
      <div class="crow">
        <span class="avatar">\u{1F468}\u{1F3FE}</span>
        <span class="cinfo"><b>Mamadou K. \u2B50 4,9 (128)</b><small>Toyota Camry noire \xB7 ML 4521</small><small class="gold">Arriv\xE9e dans 3 min \xB7 <span id="foundPrice"></span></small></span>
        <span class="callb">\u{1F4DE}</span>
      </div>
      <button class="gbtn outline" id="btnCancel">Annuler la course</button>
    </div>
  </div>
  <div class="popover" id="popover">
    <div class="pop-card"><div class="handle"></div><div class="pop-title">O\xF9 allez-vous ?</div><div class="qi qi-map" id="qiMap"><span class="qi-flag"></span><span class="qi-txt"><b>Choisir sur la carte</b><small>Touchez un point directement sur la carte</small></span><span class="qi-chevr">\u203A</span></div>${items}<button class="gbtn outline" id="popClose">Fermer</button></div>
  </div>
</div>`;
}
function driverScreen() {
  const req = INCOMING_REQUEST;
  return `<div class="scr hidden" id="screenDriver">
  <div class="leaflet-host" id="mapD"></div>
  <div class="static-map" id="staticD">${mapSVG()}${staticLabels()}<div class="car big" style="left:${proj(DRIVER_POSITION).x.toFixed(0)}px;top:${proj(DRIVER_POSITION).y.toFixed(0)}px"><span>\u{1F697}</span></div><svg class="route-svg" viewBox="0 0 ${W} ${H}"><path id="routeDStatic" d="" stroke="#E3B94E" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="topbar">
    <button class="fbtn" data-menu><span class="menu-i"><i></i><i></i><i></i></span></button>
    <button class="pill" id="pill"><i class="pdot"></i>En service</button>
    <button class="fbtn" data-notif><span class="bell-i"></span><i class="rdot">1</i></button>
  </div>
  <div class="sheet" id="sheetD">
    <div class="handle"></div>
    <div class="crow" id="dClient" style="display:none">
      <span class="avatar">\u{1F469}\u{1F3FE}</span>
      <span class="cinfo"><b>${req.clientName}</b><small>\u2B50 ${req.clientRating} \xB7 Paiement cash</small></span>
      <span class="callb">\u{1F4DE}</span>
    </div>
    <div class="est" id="dInfo" style="display:none">
      <div class="inf"><small id="dInfoLbl">DESTINATION</small><b id="dInfoVal">${req.destination.name}</b></div>
      <div class="vsep"></div>
      <div class="inf"><small>PRIX ESTIM\xC9</small><b class="gold">${formatFCFA(req.price)}</b></div>
    </div>
    <button class="gbtn" id="btnDrive" style="display:none">ARRIV\xC9E CLIENT</button>
    <div id="dIdle"><div class="idle"><div class="idle-i">\u{1F4E1}</div><b>En attente de courses\u2026</b><small>Restez dans les zones chaudes : ACI 2000, Hippodrome, A\xE9roport.</small></div></div>
  </div>
  <div class="overlay" id="reqModal">
    <div class="req-card">
      <div class="req-t">Nouvelle course !</div>
      <div class="req-route">
        <div class="rr"><span class="rdot-g"></span><span class="rr-t"><small>PRISE EN CHARGE</small><b>${req.pickup.name}</b></span><b class="gold-km">${req.distanceToClient} km</b></div>
        <div class="rline"></div>
        <div class="rr"><span class="flag-i"></span><span class="rr-t"><small>DESTINATION</small><b>${req.destination.name}</b></span></div>
      </div>
      <div class="req-price"><small>PRIX ESTIM\xC9</small><b>${formatFCFA(req.price)}</b><span>\u{1F464} ${req.clientName} \xB7 \u2B50 ${req.clientRating}</span></div>
      <div class="cnt-track"><div class="cnt-fill" id="cntFill"></div></div>
      <div class="cnt-t" id="cntLbl">15s pour accepter</div>
      <div class="req-actions"><button class="gbtn outline" id="btnRefuse">Refuser</button><button class="gbtn" id="btnAccept">\u2713 Accepter</button></div>
    </div>
  </div>
  <div class="overlay hidden" id="doneModal">
    <div class="req-card">
      <div class="done-i">\u{1F3C1}</div>
      <div class="req-t">Course termin\xE9e !</div>
      <div class="est">
        <div class="inf"><small>DESTINATION</small><b>${req.destination.name}</b></div>
        <div class="inf"><small>GAIN</small><b class="gold">${formatFCFA(req.price)}</b></div>
      </div>
      <div class="done-cash">\u{1F4B5} Confirmez le paiement cash avec le client</div>
      <button class="gbtn" id="btnCash">Encaisser et continuer</button>
    </div>
  </div>
</div>`;
}
var CSS = `
:root{--bg:#0B1E1A;--pri:#0E5C46;--gold:#E3B94E;--sand:#EFE3CC;--info:#1E8A8A;--panel:#0D2A22;--panelL:#123B30;--border:rgba(227,185,78,.35);--txt:#F4EFE3;--mut:#9FB8AE;--ok:#2ECC71;--serif:Georgia,'Playfair Display','Times New Roman',serif}
*{box-sizing:border-box;margin:0;padding:0}
body{background:radial-gradient(1200px 800px at 50% 20%,#0E3B2D,#051A15 70%);min-height:100vh;position:relative;font-family:system-ui,-apple-system,sans-serif;color:var(--txt);overflow:hidden}
#board{position:absolute;left:50%;top:6px;width:min(402px,96vw);transform:translateX(-50%) scale(1);transform-origin:top center;display:flex;flex-direction:column;align-items:stretch}
.crown{font-size:26px;text-align:center}
.brand{font-family:var(--serif);color:var(--gold);font-size:26px;letter-spacing:6px;text-align:center;margin-top:4px}
.sub{color:var(--mut);font-size:11px;letter-spacing:2px;text-align:center;margin:5px 0 14px}
.tabs{display:flex;gap:10px;margin-bottom:14px;justify-content:center}
.tab{background:var(--panel);border:1px solid var(--border);color:var(--mut);padding:10px 18px;border-radius:22px;font-weight:700;font-size:13px;cursor:pointer;transition:.2s}
.tab.on{background:var(--gold);color:#12251F;border-color:var(--gold)}
.phone{width:100%;height:760px;border-radius:44px;border:2px solid rgba(227,185,78,.55);background:#0A1512;overflow:hidden;box-shadow:0 0 60px rgba(227,185,78,.22),0 30px 60px rgba(0,0,0,.6);position:relative}
.notch{height:26px;display:flex;align-items:center;justify-content:center}
.notch::after{content:'';width:110px;height:18px;border-radius:9px;background:#000}
.screen{position:relative;height:calc(100% - 26px);overflow:hidden;border-radius:0 0 42px 42px}
.scr{position:absolute;inset:0}
.hidden{display:none!important}
/* ---- Leaflet ---- */
.leaflet-host{position:absolute;inset:0;z-index:1;display:none;background:#0B1E1A}
.leaflet-container{background:#0B1E1A;font-family:inherit;outline:none}
.leaflet-tile-pane{filter:hue-rotate(118deg) saturate(.85) brightness(.93) contrast(1.05)}
.leaflet-control-attribution{background:rgba(13,42,34,.75)!important;color:rgba(216,210,192,.7)!important;font-size:8px!important;padding:2px 6px!important}
.leaflet-control-attribution a{color:#9FD6D2!important}
path.glowRoute{filter:drop-shadow(0 0 6px rgba(227,185,78,.85))}
.nrmk{background:none;border:none}
/* ---- carte statique (repli) ---- */
.static-map{position:absolute;inset:0;z-index:1;display:none}
.static-map.show{display:block}
.map-svg{position:absolute;inset:0;width:100%;height:100%}
.q{position:absolute;font-size:8.5px;letter-spacing:1.5px;color:#B8CCBE;opacity:.87;transform:translateX(-24px);text-shadow:0 1px 4px rgba(11,30,26,.9)}
.city{position:absolute;font-family:var(--serif);font-size:26px;font-weight:700;letter-spacing:1.5px;color:#F4EFE3;text-shadow:0 2px 8px rgba(0,0,0,.65)}
.river-lbl{position:absolute;font-family:var(--serif);font-style:italic;font-size:10px;color:#9FD6D2;transform:rotate(-7deg);text-shadow:0 1px 4px rgba(11,30,26,.9)}
.car{position:absolute;width:34px;height:34px;border-radius:50%;background:var(--gold);border:2px solid #0B1E1A;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 12px rgba(227,185,78,.7);transform-origin:center;animation:float 3.2s ease-in-out infinite;z-index:3}
.car span{transform:translateY(-1px)}
.car.big{width:42px;height:42px;font-size:20px}
@keyframes float{0%,100%{margin-top:0}50%{margin-top:-4px}}
.route-svg{position:absolute;inset:0;width:100%;height:100%}
.user-pin{position:absolute;width:8px;height:8px;transform:translate(-50%,-50%);z-index:4}
.user-pin i{position:absolute;left:50%;top:50%;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;background:var(--gold);opacity:.55;animation:pulse 1.6s ease-out infinite}
@keyframes pulse{to{transform:scale(2.3);opacity:0}}
.user-pin b{position:absolute;left:50%;top:50%;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;background:var(--gold);border:2.5px solid #0B1E1A;box-shadow:0 0 10px rgba(227,185,78,.9);display:flex;align-items:center;justify-content:center}
.user-pin u{width:8px;height:8px;border-radius:50%;background:#12251F;text-decoration:none}
.user-pin s{position:absolute;left:50%;top:11px;width:3px;height:10px;margin-left:-1.5px;background:var(--gold);border-radius:2px;text-decoration:none}
/* markers leaflet */
.lcar{width:34px;height:34px;border-radius:50%;background:var(--gold);border:2px solid #0B1E1A;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 12px rgba(227,185,78,.75)}
.lpin{position:relative;width:8px;height:8px}
.lpin i{position:absolute;left:50%;top:50%;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;background:var(--gold);opacity:.55;animation:pulse 1.6s ease-out infinite}
.lpin b{position:absolute;left:50%;top:50%;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;background:var(--gold);border:2.5px solid #0B1E1A;box-shadow:0 0 10px rgba(227,185,78,.9)}
.lpin b::after{content:'';position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#12251F}
/* ---- chrome UI ---- */
.topbar{position:absolute;top:14px;left:14px;right:14px;display:flex;align-items:center;gap:8px;z-index:600}
.fbtn{width:46px;height:46px;border-radius:50%;background:var(--panel);border:1px solid var(--border);box-shadow:0 4px 8px rgba(0,0,0,.35);cursor:pointer;position:relative;display:flex;align-items:center;justify-content:center}
.menu-i{display:flex;flex-direction:column;gap:3.6px;justify-content:center}
.menu-i i{display:block;width:17px;height:2.4px;border-radius:2px;background:var(--gold)}
.menu-i i:nth-child(2){width:12px}
.bell-i{position:relative;display:block;width:16px;height:16px}
.bell-i::before{content:'';position:absolute;left:1.5px;top:2px;width:13px;height:11px;background:var(--gold);border-radius:7px 7px 0 0}
.bell-i::after{content:'';position:absolute;left:-1px;top:13px;width:18px;height:3px;border-radius:2px;background:var(--gold)}
.rdot{position:absolute;top:1px;right:1px;min-width:16px;height:16px;border-radius:9px;background:#E85D5D;color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 4px;border:1.5px solid var(--panel);font-style:normal}
.pill{background:var(--panel);border:1px solid var(--border);border-radius:20px;color:var(--txt);font-size:14px;font-weight:700;padding:11px 18px;display:flex;align-items:center;gap:8px;cursor:pointer;box-shadow:0 4px 8px rgba(0,0,0,.35);margin:0 auto}
.pdot{width:9px;height:9px;border-radius:50%;background:var(--ok)}
.sheet{position:absolute;left:12px;right:12px;bottom:14px;background:var(--panel);border:1px solid var(--border);border-radius:24px;padding:12px 16px 16px;box-shadow:0 -6px 18px rgba(0,0,0,.4);z-index:600}
.handle{width:44px;height:4px;border-radius:2px;background:rgba(227,185,78,.45);margin:0 auto 12px}
.field{display:flex;align-items:center;gap:12px;background:var(--panelL);border:1px solid rgba(227,185,78,.22);border-radius:14px;padding:12px 14px;cursor:pointer}
.field-txt{flex:1;display:flex;flex-direction:column}
.field-txt small,.inf small{font-size:10px;letter-spacing:1.1px;color:var(--mut)}
.field-txt b{font-size:16px;font-weight:800;margin-top:2px}
.chevr{color:var(--gold);font-size:22px;font-weight:300}
.flag-i{position:relative;display:inline-block;width:16px;height:16px}
.flag-i::before{content:'';position:absolute;left:0;top:0;width:2px;height:16px;background:var(--gold);border-radius:1px}
.flag-i::after{content:'';position:absolute;left:2px;top:0;border-top:4.5px solid transparent;border-bottom:4.5px solid transparent;border-left:9px solid var(--gold)}
.est{display:flex;align-items:center;background:var(--panelL);border:1px solid rgba(227,185,78,.15);border-radius:14px;padding:9px 14px;margin-top:11px}
.inf{flex:1;display:flex;flex-direction:column;gap:3px}
.inf b{font-size:15px;font-weight:800}
.gold{color:var(--gold)}
.vsep{width:1px;height:34px;background:var(--border);margin:0 12px}
.gbtn{width:100%;margin-top:11px;background:var(--gold);color:#12251F;border:1.5px solid var(--gold);border-radius:14px;padding:15px;font-size:16.5px;font-weight:800;letter-spacing:.3px;cursor:pointer;transition:.15s}
.gbtn:hover{filter:brightness(1.06)}
.gbtn:disabled{opacity:.45;cursor:not-allowed}
.gbtn.outline{background:transparent;color:var(--gold)}
.found-t{color:var(--ok);font-weight:800;font-size:15px;margin-bottom:10px}
.crow{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.avatar{width:50px;height:50px;border-radius:50%;background:var(--pri);border:1.5px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:24px}
.cinfo{flex:1;display:flex;flex-direction:column;gap:3px}
.cinfo b{font-size:16px;font-weight:800}
.cinfo small{color:var(--mut);font-size:12px}
.cinfo small.gold{color:var(--gold);font-weight:700}
.callb{width:46px;height:46px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer}
.popover{position:absolute;inset:0;background:rgba(5,14,12,.72);display:none;align-items:flex-end;z-index:700}
.popover.open{display:flex}
.pop-card{width:100%;background:var(--panel);border-top:1px solid var(--border);border-radius:26px 26px 0 0;padding:12px 18px 18px;max-height:74%;overflow:auto}
.pop-title{font-family:var(--serif);color:var(--gold);font-size:20px;font-weight:700;margin-bottom:8px}
.qi{display:flex;align-items:center;gap:11px;padding:12px 2px;border-bottom:1px solid rgba(227,185,78,.1);cursor:pointer}
.qi:hover{background:rgba(227,185,78,.06)}
.qi-flag{width:30px;height:30px;border-radius:50%;background:var(--panelL);border:1px solid rgba(227,185,78,.3);position:relative;flex-shrink:0}
.qi-flag::before{content:'';position:absolute;left:8px;top:8px;width:1.6px;height:14px;background:var(--gold)}
.qi-flag::after{content:'';position:absolute;left:9.6px;top:8px;border-top:3.6px solid transparent;border-bottom:3.6px solid transparent;border-left:7.5px solid var(--gold)}
.qi-txt{flex:1;display:flex;flex-direction:column;gap:2px}
.qi-txt b{font-size:15px;font-weight:700}
.qi-txt small{color:var(--mut);font-size:11px}
.qi-chevr{color:var(--gold);font-size:20px}
.idle{text-align:center;padding:14px 8px}
.idle-i{font-size:32px}
.idle b{display:block;font-size:16.5px;font-weight:800;margin-top:8px}
.idle small{display:block;color:var(--mut);font-size:12.5px;margin-top:6px;line-height:1.5}
.overlay{position:absolute;inset:0;background:rgba(5,14,12,.72);display:flex;align-items:flex-end;z-index:800;padding:14px 14px 24px}
.req-card{width:100%;background:var(--panel);border:1.5px solid var(--gold);border-radius:24px;padding:20px}
.req-t{font-family:var(--serif);color:var(--txt);font-size:21px;font-weight:700;text-align:center}
.req-route{background:var(--panelL);border-radius:16px;padding:14px;margin-top:14px}
.rr{display:flex;align-items:center;gap:11px}
.rr-t{flex:1;display:flex;flex-direction:column;gap:2px}
.rr-t small{font-size:9.5px;letter-spacing:1px;color:var(--mut)}
.rr-t b{font-size:16px;font-weight:800}
.rdot-g{width:10px;height:10px;border-radius:50%;background:var(--gold);margin:0 3px}
.rline{width:2px;height:16px;background:var(--border);margin:3px 0 3px 29px}
.gold-km{color:var(--gold);font-size:12px}
.req-price{text-align:center;margin-top:16px;display:flex;flex-direction:column;gap:3px}
.req-price small{font-size:10.5px;letter-spacing:1px;color:var(--mut)}
.req-price b{font-family:var(--serif);color:var(--gold);font-size:33px;font-weight:700}
.req-price span{color:var(--mut);font-size:12px}
.cnt-track{height:5px;border-radius:3px;background:var(--panelL);margin-top:16px;overflow:hidden}
.cnt-fill{height:5px;background:var(--gold);border-radius:3px;width:100%;transition:width 1s linear}
.cnt-t{color:var(--mut);font-size:11px;text-align:center;margin:7px 0 14px}
.req-actions{display:flex;gap:12px}
.done-i{font-size:42px;text-align:center}
.done-cash{color:var(--mut);font-size:13px;text-align:center;margin:12px 0 6px}
.hint-pill{position:absolute;top:74px;left:50%;transform:translateX(-50%);background:var(--panel);border:1px solid var(--gold);color:var(--txt);font-size:12px;font-weight:700;padding:10px 15px;border-radius:19px;box-shadow:0 4px 12px rgba(0,0,0,.45),0 0 14px rgba(227,185,78,.35);z-index:590;white-space:nowrap;animation:hintPulse 2.2s ease-in-out infinite;pointer-events:none;transition:opacity .3s}
.hint-pill.hidden{opacity:0}
@keyframes hintPulse{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-4px)}}
.qi-map{background:linear-gradient(90deg,rgba(227,185,78,.12),transparent);border-radius:12px;padding-left:8px}
.qi-map b{color:var(--gold)}
@media(max-width:440px){.phone{height:100vh;border-radius:0;border:none}}
`;
var JS = `
const W=${W},H=${H};
const R={latitude:${R.latitude},longitude:${R.longitude},latitudeDelta:${R.latitudeDelta},longitudeDelta:${R.longitudeDelta}};
const pj=p=>({x:((p.longitude-(R.longitude-R.longitudeDelta/2))/R.longitudeDelta)*W,y:((R.latitude+R.latitudeDelta/2-p.latitude)/R.latitudeDelta)*H});
const U=[${USER_POSITION.latitude},${USER_POSITION.longitude}];
const byId=id=>document.getElementById(id);
// \u{1F4D0} fit auto
function fit(){const b=byId('board');if(!b)return;b.style.transform='translateX(-50%) scale(1)';const h=b.scrollHeight,w=b.offsetWidth||402;const s=Math.min(1,(window.innerHeight-10)/h,(window.innerWidth-10)/w);b.style.transform='translateX(-50%) scale('+s+')';}
window.addEventListener('resize',fit);window.addEventListener('load',fit);setTimeout(fit,50);
document.querySelectorAll('[data-menu]').forEach(b=>b.onclick=()=>alert('Menu \u2630 (d\xE9mo)'));
document.querySelectorAll('[data-notif]').forEach(b=>b.onclick=()=>alert('\u{1F514} Notifications (d\xE9mo)'));
// ---- Leaflet ----
let mc=null,md=null,routeC=null,routeD=null,cars=[],tileErr={c:0,d:0};
function mkMap(el,which){
  const host=byId(el);host.style.display='block';
  const map=L.map(el,{zoomControl:false,attributionControl:true,center:U,zoom:12.6,scrollWheelZoom:true,doubleClickZoom:true});
  const tiles=L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{attribution:'\xA9 OpenStreetMap \xB7 \xA9 CARTO',maxZoom:19,subdomains:'abcd'});
  tiles.on('tileerror',()=>{tileErr[which]++;if(tileErr[which]>6){fallback(which=== 'c'?'staticC':'staticD',host);}});
  tiles.addTo(map);return map;
}
function fallback(staticId,host){const s=byId(staticId);hostsDel(host);s&&s.classList.add('show');}
function hostsDel(h){try{h.style.display='none'}catch(e){}}
function carIcon(){return L.divIcon({className:'nrmk',html:'<div class="lcar">\u{1F695}</div>',iconSize:[34,34],iconAnchor:[17,17]});}
function pinIcon(){return L.divIcon({className:'nrmk',html:'<div class="lpin"><i></i><b></b></div>',iconSize:[8,8],iconAnchor:[4,4]});}
function flagIcon(){return L.divIcon({className:'nrmk',html:'<div style="font-size:20px;transform:translate(-50%,-100%)">\u{1F4CD}</div>',iconSize:[20,20],iconAnchor:[10,20]});}
function bigCarIcon(){return L.divIcon({className:'nrmk',html:'<div class="lcar" style="width:42px;height:42px;font-size:20px">\u{1F697}</div>',iconSize:[42,42],iconAnchor:[21,21]});}
function drawRoute(map,which,pts){
  const arr=pts.map(p=>p.length?p:[p.latitude,p.longitude]);
  if(which==='c'){if(routeC)routeC.remove();routeC=L.polyline(arr,{color:'#E3B94E',weight:4,className:'glowRoute'}).addTo(map);}
  else{if(routeD)routeD.remove();routeD=L.polyline(arr,{color:'#E3B94E',weight:4.5,className:'glowRoute'}).addTo(map);}
}
function initMaps(){
  if(typeof L==='undefined'){byId('staticC').classList.add('show');byId('staticD').classList.add('show');return false;}
  try{
    mc=mkMap('mapC','c');
    L.marker(U,{icon:pinIcon()}).addTo(mc);
    ${CARS.map((c) => `cars.push(L.marker([${c.latitude},${c.longitude}],{icon:carIcon()}).addTo(mc));`).join("\n    ")}
    setInterval(()=>{cars.forEach(m=>{const [a,b]=[m.getLatLng().lat,m.getLatLng().lng];m.setLatLng([a+(Math.random()-.5)*0.0022,b+(Math.random()-.5)*0.0022]);});},1800);
    md=mkMap('mapD','d');
    L.marker(${`[${DRIVER_POSITION.latitude},${DRIVER_POSITION.longitude}]`},{icon:bigCarIcon()}).addTo(md);
  }catch(e){byId('staticC').classList.add('show');byId('staticD').classList.add('show');return false;}
  return true;
}
const ok=initMaps();
// ---- \u{1F4CD} S\xE9lection de destination EN TOUCHANT LA CARTE ----
let curDest=null;
const havKm=(a,b)=>{const R2=6371,dLa=(b[0]-a[0])*Math.PI/180,dLo=(b[1]-a[1])*Math.PI/180,la1=a[0]*Math.PI/180,la2=b[0]*Math.PI/180,h=Math.sin(dLa/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLo/2)**2;return 2*R2*Math.asin(Math.sqrt(h));};
const priceOf=km=>Math.round((300+km*250)/25)*25;
const fmt=n=>n.toString().replace(/B(?=(d{3})+(?!d))/g,' ')+' FCFA';
function drawCurved(lat,lng){
  const u={latitude:U[0],longitude:U[1]};
  const d={latitude:lat,longitude:lng};
  const m1={latitude:u.latitude+(d.latitude-u.latitude)*0.35+0.004,longitude:u.longitude+(d.longitude-u.longitude)*0.35};
  const m2={latitude:u.latitude+(d.latitude-u.latitude)*0.7,longitude:u.longitude+(d.longitude-u.longitude)*0.7+0.003};
  if(ok){drawRoute(mc,'c',[u,m1,m2,d]);if(destMk)destMk.remove();destMk=L.marker([lat,lng],{icon:flagIcon()}).addTo(mc);}
  else{const pts=[u,m1,m2,d].map(pj);byId('polyC').setAttribute('points',pts.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' '));}
}
function setDest(lat,lng,name){
  curDest={lat,lng,name:name||'Point sur la carte'};
  byId('destVal').textContent=curDest.name;
  const km=havKm(U,[lat,lng])*1.35;
  byId('estRow').style.display='flex';
  byId('estKm').textContent=km.toFixed(1)+' km';
  byId('estMin').textContent='~'+Math.max(3,Math.round(km*3.2))+' min';
  byId('estPrice').textContent=fmt(priceOf(km));
  byId('btnSearch').disabled=false;
  byId('hintDest').classList.add('hidden');
  drawCurved(lat,lng);
}
let destMk=null;
if(ok){mc.on('click',e=>setDest(e.latlng.lat,e.latlng.lng,null));}
else{const sm=byId('staticC');sm.addEventListener('click',e=>{const r=sm.getBoundingClientRect();const lng=(R.longitude-R.longitudeDelta/2)+(e.clientX-r.left)/r.width*R.longitudeDelta;const lat=(R.latitude+R.latitudeDelta/2)-(e.clientY-r.top)/r.height*R.latitudeDelta;setDest(lat,lng,null);});}
function clearDest(){curDest=null;byId('destVal').textContent='O\xF9 allez-vous ?';byId('estRow').style.display='none';byId('hintDest').classList.remove('hidden');if(ok){if(routeC){routeC.remove();routeC=null;}if(destMk){destMk.remove();destMk=null;}}else{byId('polyC').setAttribute('points','');}}
// onglets
const tabC=byId('tabC'),tabD=byId('tabD');
function show(name){byId('screenClient').classList.toggle('hidden',name!=='c');byId('screenDriver').classList.toggle('hidden',name!=='d');tabC.classList.toggle('on',name==='c');tabD.classList.toggle('on',name==='d');setTimeout(()=>{if(ok)(name==='c'?mc:md).invalidateSize();},60);if(name==='d')armRequest();}
tabC.onclick=()=>show('c');tabD.onclick=()=>show('d');
// ---- CLIENT ----
byId('destField').onclick=()=>byId('popover').classList.add('open');
byId('popClose').onclick=()=>byId('popover').classList.remove('open');
document.querySelectorAll('.qi:not(.qi-map)').forEach(it=>it.onclick=()=>{
  setDest(+it.dataset.lat,+it.dataset.lng,it.dataset.name);
  if(ok){mc.flyToBounds(L.polyline([U,[+it.dataset.lat,+it.dataset.lng]]).getBounds(),{padding:[40,60]});}
  byId('popover').classList.remove('open');
});
byId('qiMap').onclick=()=>{byId('popover').classList.remove('open');byId('hintDest').classList.remove('hidden');};
byId('btnSearch').onclick=e=>{const b=e.currentTarget;b.disabled=true;b.textContent='Recherche d\u2019un chauffeur\u2026';setTimeout(()=>{byId('cIdle').style.display='none';byId('foundPrice').textContent=byId('estPrice').textContent;byId('cFound').style.display='block';},1600);};
byId('btnCancel').onclick=()=>{byId('cFound').style.display='none';byId('cIdle').style.display='block';const b=byId('btnSearch');b.disabled=false;b.textContent='Rechercher une voiture';clearDest();};
// ---- CHAUFFEUR ----
const PK=[${INCOMING_REQUEST.pickup.latitude},${INCOMING_REQUEST.pickup.longitude}];
const DS=[${INCOMING_REQUEST.destination.latitude},${INCOMING_REQUEST.destination.longitude}];
const DR=[${DRIVER_POSITION.latitude},${DRIVER_POSITION.longitude}];
const dstat={toStatic:null,ridingStatic:null};
dstat.toStatic='M '+[DR,[ (DR[0]+PK[0])/2+0.01,(DR[1]+PK[1])/2+0.012 ],PK].map(p=>{const q=pj({latitude:p[0],longitude:p[1]});return q.x.toFixed(1)+' '+q.y.toFixed(1)}).join(' L ');
dstat.ridingStatic='M '+[PK,[ (PK[0]+DS[0])/2+0.008,(PK[1]+DS[1])/2+0.015 ],DS].map(p=>{const q=pj({latitude:p[0],longitude:p[1]});return q.x.toFixed(1)+' '+q.y.toFixed(1)}).join(' L ');
let armed=false,accepted=false,timer=null;
function armRequest(){if(armed||accepted)return;armed=true;setTimeout(()=>{if(!accepted)showReq();},1200);}
function showReq(){byId('reqModal').classList.remove('hidden');let s=15;const fill=byId('cntFill');fill.style.width='100%';byId('cntLbl').textContent=s+'s pour accepter';timer=setInterval(()=>{s--;fill.style.width=(s/15*100)+'%';byId('cntLbl').textContent=s+'s pour accepter';if(s<=0){clearInterval(timer);byId('reqModal').classList.add('hidden');}},1000);}
function stopTimer(){if(timer)clearInterval(timer);}
byId('btnRefuse').onclick=()=>{stopTimer();byId('reqModal').classList.add('hidden');armed=true;setTimeout(()=>{if(!accepted)showReq();},4000);};
byId('btnAccept').onclick=()=>{
  stopTimer();accepted=true;byId('reqModal').classList.add('hidden');
  byId('dIdle').style.display='none';byId('dClient').style.display='flex';byId('dInfo').style.display='flex';
  byId('dInfoLbl').textContent='PRISE EN CHARGE';byId('dInfoVal').textContent='${INCOMING_REQUEST.pickup.name}';
  byId('btnDrive').style.display='block';
  if(ok){const m1=[(DR[0]+PK[0])/2+0.01,(DR[1]+PK[1])/2+0.012];drawRoute(md,'d',[DR,m1,PK]);md.flyToBounds(L.polyline([DR,PK]).getBounds(),{padding:[50,80]});}
  else{byId('routeDStatic').setAttribute('d',dstat.toStatic);}
};
const stages=['ARRIV\xC9E CLIENT','D\xC9MARRER LA COURSE','TERMINER LA COURSE'];let st=0;
byId('btnDrive').onclick=e=>{st++;const b=e.currentTarget;
  if(st===1){b.textContent=stages[1];byId('dInfoLbl').textContent='DESTINATION';byId('dInfoVal').textContent='${INCOMING_REQUEST.destination.name}';
    if(ok){const m2=[(PK[0]+DS[0])/2+0.008,(PK[1]+DS[1])/2+0.015];drawRoute(md,'d',[PK,m2,DS]);md.flyToBounds(L.polyline([PK,DS]).getBounds(),{padding:[50,80]});}
    else{byId('routeDStatic').setAttribute('d',dstat.ridingStatic);}}
  else if(st===2){b.textContent=stages[2];}
  else{byId('doneModal').classList.remove('hidden');st=0;b.textContent=stages[0];}};
byId('btnCash').onclick=()=>{byId('doneModal').classList.add('hidden');accepted=false;armed=false;
  if(ok){if(routeD){routeD.remove();routeD=null;}}else{byId('routeDStatic').setAttribute('d','');}
  byId('dClient').style.display='none';byId('dInfo').style.display='none';byId('btnDrive').style.display='none';byId('dIdle').style.display='block';};
`;
var html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Niger Royal \u2014 Bamako</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>${CSS}</style>
</head>
<body>
<div id="board">
<div class="crown">\u{1F451}</div>
<div class="brand">NIGER ROYAL</div>
<div class="sub">PREVIEW \xB7 BAMAKO \u{1F1F2}\u{1F1F1}</div>
<div class="tabs"><button class="tab on" id="tabC">\u{1F4F1} App Client</button><button class="tab" id="tabD">\u{1F697} App Chauffeur</button></div>
<div class="phone"><div class="notch"></div><div class="screen">${clientScreen()}${driverScreen()}</div></div>
</div>
<script>${JS}</script>
</body>
</html>`;
var out = join(process.cwd(), "web-preview");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "index.html"), html);
console.log("\u2705 web-preview/index.html g\xE9n\xE9r\xE9 (" + (html.length / 1024).toFixed(1) + " Ko)");
