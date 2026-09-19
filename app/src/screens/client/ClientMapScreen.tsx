// 📱 APP CLIENT — carte plein écran + voitures disponibles + destination
// Design validé : palette-2-niger-royal-final-v3.png
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapView, { Marker, Polyline } from '../../components/PlatformMap';
import { nigerRoyalMapStyle } from '../../theme/mapStyle';
import { colors } from '../../theme/colors';
import {
  Avatar,
  FieldRow,
  FloatingIcon,
  GoldButton,
  InfoBlock,
  Sheet,
} from '../../components/ui';
import { NotificationsPanel, SideMenu } from '../../components/modals';
import { RootStackParamList } from '../../navigation/RootNavigator';
import {
  BAMAKO_REGION,
  CARS,
  Car,
  QUARTIERS,
  Quartier,
  USER_POSITION,
  distanceKm,
  estimateDurationMin,
  estimatePrice,
  formatFCFA,
  LatLng,
} from '../../data/mock';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientMap'>;
type Phase = 'idle' | 'searching' | 'found';

// 🚗 Voiture dorée sur la carte
function CarDot({ heading }: { heading: number }) {
  return (
    <View style={[styles.carDot, { transform: [{ rotate: `${heading}deg` }] }]}>
      <Text style={styles.carEmoji}>🚕</Text>
    </View>
  );
}

// 📍 Pin utilisateur lumineux (halo or)
function UserPin({ anim }: { anim: Animated.Value }) {
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });
  return (
    <View style={styles.pinWrap}>
      <Animated.View style={[styles.pulse, { transform: [{ scale }], opacity }]} />
      <View style={styles.pin}>
        <View style={styles.pinInner} />
      </View>
      <View style={styles.pinStem} />
    </View>
  );
}

export default function ClientMapScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [cars, setCars] = useState<Car[]>(CARS);
  const [userPos] = useState<LatLng>(USER_POSITION);
  const [destination, setDestination] = useState<Quartier | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');

  const pulse = useRef(new Animated.Value(0)).current;

  // ✨ Animation du halo du pin
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: false }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // 🚕 Les voitures bougent légèrement (simulation temps réel)
  useEffect(() => {
    const t = setInterval(() => {
      setCars((prev) =>
        prev.map((c) => ({
          ...c,
          latitude: c.latitude + (Math.random() - 0.5) * 0.0022,
          longitude: c.longitude + (Math.random() - 0.5) * 0.0022,
          heading: (c.heading + Math.round((Math.random() - 0.5) * 60) + 360) % 360,
        })),
      );
    }, 1800);
    return () => clearInterval(t);
  }, []);

  // 🔍 Simulation recherche chauffeur
  useEffect(() => {
    if (phase !== 'searching') return;
    const t = setTimeout(() => setPhase('found'), 2600);
    return () => clearTimeout(t);
  }, [phase]);

  const km = destination ? distanceKm(userPos, destination) * 1.35 : 0; // ×1.35 trajet routier
  const price = estimatePrice(km);
  const duration = estimateDurationMin(km);

  // Itinéraire doré (courbe légère)
  const route = useMemo(() => {
    if (!destination) return null;
    const mid1: LatLng = {
      latitude: userPos.latitude + (destination.latitude - userPos.latitude) * 0.35 + 0.004,
      longitude: userPos.longitude + (destination.longitude - userPos.longitude) * 0.35,
    };
    const mid2: LatLng = {
      latitude: userPos.latitude + (destination.latitude - userPos.latitude) * 0.7,
      longitude: userPos.longitude + (destination.longitude - userPos.longitude) * 0.7 + 0.003,
    };
    return [userPos, mid1, mid2, { latitude: destination.latitude, longitude: destination.longitude }];
  }, [destination, userPos]);

  const resetTrip = () => {
    setPhase('idle');
    setDestination(null);
  };

  return (
    <View style={styles.root}>
      {/* 🗺️ Carte plein écran */}
      <MapView style={StyleSheet.absoluteFill} region={BAMAKO_REGION} customMapStyle={nigerRoyalMapStyle}>
        {cars.map((c) => (
          <Marker key={c.id} coordinate={{ latitude: c.latitude, longitude: c.longitude }}>
            <CarDot heading={c.heading} />
          </Marker>
        ))}
        <Marker coordinate={userPos}>
          <UserPin anim={pulse} />
        </Marker>
        {route && <Polyline coordinates={route} strokeColor={colors.accent} strokeWidth={4} />}
      </MapView>

      {/* ☰ 🔔 Icônes flottantes (pas de barre / pas de titre) */}
      <View style={[styles.topBar, { top: insets.top + 12 }]}>
        <FloatingIcon icon="☰" onPress={() => setMenuVisible(true)} />
        <View style={{ flex: 1 }} />
        <FloatingIcon icon="🔔" badge={2} onPress={() => setNotifVisible(true)} />
      </View>

      {/* 🧭 Bottom sheet */}
      <View style={{ paddingBottom: insets.bottom + 6 }}>
        <Sheet>
          {phase !== 'found' && (
            <>
              <FieldRow
                icon="⚑"
                label="Destination"
                value={destination?.name}
                placeholder="Où allez-vous ?"
                onPress={() => setPickerVisible(true)}
              />
              {destination && (
                <View style={styles.estimateRow}>
                  <InfoBlock label="Distance" value={`${km.toFixed(1)} km`} />
                  <InfoBlock label="Durée" value={`~${duration} min`} />
                  <InfoBlock label="Prix estimé" value={formatFCFA(price)} highlight />
                </View>
              )}
              {km > 0 && <View style={{ height: 10 }} />}
              <GoldButton
                title={phase === 'searching' ? 'Recherche d’un chauffeur…' : 'Rechercher une voiture'}
                loading={phase === 'searching'}
                disabled={!destination || phase === 'searching'}
                onPress={() => setPhase('searching')}
              />
            </>
          )}

          {phase === 'found' && (
            <View>
              <Text style={styles.foundTitle}>✅ Chauffeur trouvé !</Text>
              <View style={styles.driverRow}>
                <Avatar emoji="👨🏾" size={52} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.driverName}>Mamadou K. ⭐ 4,9 (128)</Text>
                  <Text style={styles.driverCar}>Toyota Camry noire · ML 4521</Text>
                  <Text style={styles.driverEta}>🕒 Arrivée dans 3 min · {formatFCFA(price)}</Text>
                </View>
                <TouchableOpacity style={styles.callBtn} activeOpacity={0.85}>
                  <Text style={styles.callIcon}>📞</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 12 }} />
              <GoldButton title="Annuler la course" variant="outline" onPress={resetTrip} />
            </View>
          )}
        </Sheet>
      </View>

      {/* ⚑ Sélecteur de destination */}
      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.pickerBackdrop}>
          <View style={[styles.pickerCard, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.pickerTitle}>📍 Où allez-vous ?</Text>
            <ScrollView bounces={false} style={{ maxHeight: 420 }}>
              {QUARTIERS.map((q) => {
                const d = distanceKm(userPos, q) * 1.35;
                return (
                  <TouchableOpacity
                    key={q.name}
                    style={styles.pickerItem}
                    activeOpacity={0.8}
                    onPress={() => {
                      setDestination(q);
                      setPickerVisible(false);
                      setPhase('idle');
                    }}
                  >
                    <Text style={styles.pickerIcon}>⚑</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickerName}>{q.name}</Text>
                      <Text style={styles.pickerDist}>à {d.toFixed(1)} km · {formatFCFA(estimatePrice(d))}</Text>
                    </View>
                    <Text style={styles.chevr}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <GoldButton title="Fermer" variant="outline" onPress={() => setPickerVisible(false)} />
          </View>
        </View>
      </Modal>

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        title="NIGER ROYAL"
        role="Espace Client"
        items={[
          { icon: '🗺️', label: 'Accueil', onPress: () => {} },
          { icon: '📜', label: 'Mes trajets', onPress: () => navigation.navigate('ClientHistory') },
          { icon: '👤', label: 'Mon profil', onPress: () => {} },
          { icon: '🔄', label: 'Changer de rôle', onPress: () => navigation.replace('RoleSelect') },
        ]}
      />
      <NotificationsPanel visible={notifVisible} onClose={() => setNotifVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, justifyContent: 'flex-end' },
  topBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  carDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0B1E1A',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 6,
  },
  carEmoji: { fontSize: 16 },
  pinWrap: { alignItems: 'center', width: 64, height: 64, justifyContent: 'center' },
  pulse: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent,
  },
  pin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#0B1E1A',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
  pinInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#12251F' },
  pinStem: {
    width: 3,
    height: 10,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginTop: -2,
  },
  estimateRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    backgroundColor: colors.panelLight,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(227,185,78,0.15)',
  },
  foundTitle: { color: colors.success, fontWeight: '800', fontSize: 15, marginBottom: 10 },
  driverRow: { flexDirection: 'row', alignItems: 'center' },
  driverName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  driverCar: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  driverEta: { color: colors.accent, fontSize: 12, marginTop: 3, fontWeight: '700' },
  callBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIcon: { fontSize: 18 },
  pickerBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  pickerCard: {
    backgroundColor: colors.panel,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 18,
    borderTopWidth: 1,
    borderColor: colors.panelBorder,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(227,185,78,0.45)',
    marginBottom: 12,
  },
  pickerTitle: { color: colors.accent, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(227,185,78,0.1)',
  },
  pickerIcon: { fontSize: 15, color: colors.accent, width: 30 },
  pickerName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  pickerDist: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  chevr: { color: colors.accent, fontSize: 20 },
});
