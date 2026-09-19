// 🚗 APP CHAUFFEUR — en service, demandes de course, destination + prix estimé
// Design validé : palette-2-niger-royal-final-v3.png
import React, { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapView, { Marker, Polyline } from '../../components/PlatformMap';
import { nigerRoyalMapStyle } from '../../theme/mapStyle';
import { colors } from '../../theme/colors';
import { Avatar, FloatingIcon, GoldButton, InfoBlock, Sheet, StatusPill } from '../../components/ui';
import { NotificationsPanel, SideMenu } from '../../components/modals';
import { GoldBellIcon, GoldFlagIcon, GoldMenuIcon, StatusDot } from '../../components/goldIcons';
import { fonts } from '../../theme/fonts';
import { RootStackParamList } from '../../navigation/RootNavigator';
import {
  BAMAKO_REGION,
  DRIVER_POSITION,
  INCOMING_REQUEST,
  RideRequest,
  formatFCFA,
  LatLng,
} from '../../data/mock';

type Props = NativeStackScreenProps<RootStackParamList, 'DriverMap'>;
type Stage = 'idle' | 'toClient' | 'atClient' | 'riding' | 'done';

const REQUEST_DELAY_MS = 3500;
const COUNTDOWN_S = 15;

export default function DriverMapScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [online, setOnline] = useState(false);
  const [request, setRequest] = useState<RideRequest | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [countdown, setCountdown] = useState(COUNTDOWN_S);
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 🟢 Passage en ligne → simulation d'une demande entrante
  useEffect(() => {
    if (!online || stage !== 'idle' || request) return;
    const t = setTimeout(() => {
      setRequest(INCOMING_REQUEST);
      setCountdown(COUNTDOWN_S);
    }, REQUEST_DELAY_MS);
    return () => clearTimeout(t);
  }, [online, stage, request]);

  // ⏱️ Compte à rebours de la demande
  useEffect(() => {
    if (!request || stage !== 'idle') return;
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          refuseRequest();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, stage]);

  const refuseRequest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRequest(null);
    setCountdown(COUNTDOWN_S);
  };

  const acceptRequest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStage('toClient');
  };

  const finishAndReset = () => {
    setStage('idle');
    setRequest(null);
    setCountdown(COUNTDOWN_S);
  };

  // 🛣️ Itinéraire doré selon l'étape
  const route: LatLng[] | null = (() => {
    if (!request || stage === 'idle') return null;
    const pick = { latitude: request.pickup.latitude, longitude: request.pickup.longitude };
    const dest = { latitude: request.destination.latitude, longitude: request.destination.longitude };
    if (stage === 'toClient') {
      const mid: LatLng = {
        latitude: (DRIVER_POSITION.latitude + pick.latitude) / 2 + 0.01,
        longitude: (DRIVER_POSITION.longitude + pick.longitude) / 2 + 0.012,
      };
      return [DRIVER_POSITION, mid, pick];
    }
    const mid: LatLng = {
      latitude: (pick.latitude + dest.latitude) / 2 + 0.008,
      longitude: (pick.longitude + dest.longitude) / 2 + 0.015,
    };
    return [pick, mid, dest];
  })();

  const mainAction = (() => {
    switch (stage) {
      case 'toClient':
        return { label: 'ARRIVÉE CLIENT', onPress: () => setStage('atClient') };
      case 'atClient':
        return { label: 'DÉMARRER LA COURSE', onPress: () => setStage('riding') };
      case 'riding':
        return { label: 'TERMINER LA COURSE', onPress: () => setStage('done') };
      default:
        return null;
    }
  })();

  return (
    <View style={styles.root}>
      <MapView style={StyleSheet.absoluteFill} region={BAMAKO_REGION} customMapStyle={nigerRoyalMapStyle}>
        {/* 🚕 Ma voiture */}
        <Marker variant="car" coordinate={DRIVER_POSITION}>
          <View style={styles.myCar}>
            <Text style={styles.myCarEmoji}>🚗</Text>
          </View>
        </Marker>
        {route && <Polyline coordinates={route} strokeColor={colors.accent} strokeWidth={4} />}
      </MapView>

      {/* ☰ ●En service 🔔 — icônes flottantes */}
      <View style={[styles.topBar, { top: insets.top + 12 }]}>
        <FloatingIcon onPress={() => setMenuVisible(true)}>
          <GoldMenuIcon />
        </FloatingIcon>
        <View style={styles.pillWrap}>
          <StatusPill online={online} onPress={() => setOnline(!online)} />
        </View>
        <FloatingIcon badge={1} onPress={() => setNotifVisible(true)}>
          <GoldBellIcon />
        </FloatingIcon>
      </View>

      {/* 🧭 Bottom sheet */}
      <View style={{ paddingBottom: insets.bottom + 6, zIndex: 10 }}>
        <Sheet>
          {!request && (
            <View style={styles.offlineWrap}>
              <Text style={styles.offlineIcon}>{online ? '📡' : '🌙'}</Text>
              <Text style={styles.offlineTitle}>
                {online ? 'En attente de courses…' : 'Vous êtes hors ligne'}
              </Text>
              <Text style={styles.offlineBody}>
                {online
                  ? 'Restez dans les zones chaudes : ACI 2000, Hippodrome, Aéroport.'
                  : 'Passez « En service » pour recevoir des demandes de course.'}
              </Text>
            </View>
          )}

          {request && stage !== 'idle' && stage !== 'done' && (
            <View>
              <View style={styles.clientRow}>
                <Avatar emoji="👩🏾" size={50} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.clientName}>{request.clientName}</Text>
                  <Text style={styles.clientMeta}>⭐ {request.clientRating.toFixed(1)} · Paiement cash</Text>
                </View>
                <TouchableOpacity style={styles.callBtn} activeOpacity={0.85}>
                  <Text style={{ fontSize: 18 }}>📞</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <InfoBlock
                  label={stage === 'toClient' ? 'Prise en charge' : 'Destination'}
                  value={stage === 'toClient' ? request.pickup.name : request.destination.name}
                />
                <View style={styles.infoDivider} />
                <InfoBlock label="Prix estimé" value={formatFCFA(request.price)} highlight />
              </View>

              {mainAction && <GoldButton title={mainAction.label} onPress={mainAction.onPress} />}
            </View>
          )}

          {request && stage === 'idle' && (
            <Text style={styles.incomingHint}>⬆️ Nouvelle demande en cours…</Text>
          )}
        </Sheet>
      </View>

      {/* 🔔 Demande de course entrante */}
      <Modal visible={!!request && stage === 'idle'} transparent animationType="slide">
        <View style={styles.reqBackdrop}>
          <View style={styles.reqCard}>
            <Text style={styles.reqTitle}>🔔 Nouvelle course !</Text>

            <View style={styles.reqRoute}>
              <View style={styles.reqRouteRow}>
                <View style={styles.reqIconWrap}>
                  <StatusDot color={colors.accent} size={10} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reqLabel}>Prise en charge</Text>
                  <Text style={styles.reqValue}>{request?.pickup.name}</Text>
                </View>
                <Text style={styles.reqKm}>{request?.distanceToClient} km</Text>
              </View>
              <View style={styles.reqLine} />
              <View style={styles.reqRouteRow}>
                <View style={styles.reqIconWrap}>
                  <GoldFlagIcon size={15} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reqLabel}>Destination</Text>
                  <Text style={styles.reqValue}>{request?.destination.name}</Text>
                </View>
              </View>
            </View>

            <View style={styles.reqPriceWrap}>
              <Text style={styles.reqPriceLabel}>Prix estimé</Text>
              <Text style={styles.reqPrice}>{request ? formatFCFA(request.price) : ''}</Text>
              <Text style={styles.reqClient}>👤 {request?.clientName} · ⭐ {request?.clientRating.toFixed(1)}</Text>
            </View>

            {/* ⏱️ Compte à rebours */}
            <View style={styles.countdownTrack}>
              <View style={[styles.countdownFill, { width: `${(countdown / COUNTDOWN_S) * 100}%` }]} />
            </View>
            <Text style={styles.countdownText}>{countdown}s pour accepter</Text>

            <View style={styles.reqActions}>
              <View style={{ flex: 1 }}>
                <GoldButton title="Refuser" variant="outline" onPress={refuseRequest} />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1.6 }}>
                <GoldButton title="✓ Accepter" onPress={acceptRequest} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🏁 Récap fin de course */}
      <Modal visible={stage === 'done'} transparent animationType="fade">
        <View style={styles.reqBackdrop}>
          <View style={styles.doneCard}>
            <Text style={styles.doneIcon}>🏁</Text>
            <Text style={styles.doneTitle}>Course terminée !</Text>
            <View style={styles.doneRow}>
              <InfoBlock label="Destination" value={request?.destination.name ?? '—'} />
              <InfoBlock label="Gain" value={formatFCFA(request?.price ?? 0)} highlight />
            </View>
            <Text style={styles.doneCash}>💵 Confirmez le paiement cash avec le client</Text>
            <GoldButton title="Encaisser et continuer" onPress={finishAndReset} />
          </View>
        </View>
      </Modal>

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        title="NIGER ROYAL"
        role="Espace Chauffeur"
        items={[
          { icon: '🗺️', label: 'Accueil', onPress: () => {} },
          { icon: '💰', label: 'Mes gains', onPress: () => navigation.navigate('DriverEarnings') },
          { icon: '🚘', label: 'Mon véhicule', onPress: () => {} },
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
  pillWrap: { flex: 1, alignItems: 'center' },
  myCar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#0B1E1A',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  myCarEmoji: { fontSize: 20 },
  offlineWrap: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12 },
  offlineIcon: { fontSize: 34 },
  offlineTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 8 },
  offlineBody: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  clientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  clientName: { color: colors.text, fontSize: 17, fontWeight: '800' },
  clientMeta: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  callBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panelLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(227,185,78,0.15)',
  },
  infoDivider: { width: 1, height: 34, backgroundColor: colors.panelBorder, marginHorizontal: 12 },
  incomingHint: { textAlign: 'center', color: colors.textMuted, fontSize: 13, paddingVertical: 8 },
  reqBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 30,
  },
  reqCard: {
    backgroundColor: colors.panel,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  reqTitle: { color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  reqRoute: {
    backgroundColor: colors.panelLight,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
  },
  reqRouteRow: { flexDirection: 'row', alignItems: 'center' },
  reqIconWrap: { width: 26, alignItems: 'center' },
  reqLabel: { color: colors.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  reqValue: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 2 },
  reqKm: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  reqLine: { height: 16, width: 2, backgroundColor: colors.panelBorder, marginLeft: 31, marginVertical: 3 },
  reqPriceWrap: { alignItems: 'center', marginTop: 16 },
  reqPriceLabel: { color: colors.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  reqPrice: {
    color: colors.accent,
    fontSize: 34,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: fonts.display,
  } as any,
  reqClient: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  countdownTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.panelLight,
    marginTop: 16,
    overflow: 'hidden',
  },
  countdownFill: { height: 5, backgroundColor: colors.accent, borderRadius: 3 },
  countdownText: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 6, marginBottom: 14 },
  reqActions: { flexDirection: 'row' },
  doneCard: {
    backgroundColor: colors.panel,
    borderRadius: 24,
    padding: 24,
    alignItems: 'stretch',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  doneIcon: { fontSize: 44, textAlign: 'center' },
  doneTitle: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginVertical: 12 },
  doneRow: {
    flexDirection: 'row',
    backgroundColor: colors.panelLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  doneCash: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginVertical: 14 },
});
