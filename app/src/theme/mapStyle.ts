// 🗺️ Style Google Maps personnalisé — thème "Niger Royal" (vert nuit + or)
// Utilisé avec <MapView customMapStyle={nigerRoyalMapStyle} />
export const nigerRoyalMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0B1E1A' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#EFE3CC' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B1E1A' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1E6B52' }, { weight: 0.8 }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#F4EFE3' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#D9C27A' }],
  },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#D9C27A' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#103B2D' }],
  },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#14503F' }] },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0A3528' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#CBB98A' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#17624B' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1F7559' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0E5C46' }],
  },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1E8A8A' }] },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1D7C84' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#EFE3CC' }],
  },
];
