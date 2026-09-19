// 💰 Gains du chauffeur — App Chauffeur V1
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { DRIVER_TODAY, formatFCFA } from '../../data/mock';

type Props = NativeStackScreenProps<RootStackParamList, 'DriverEarnings'>;

export default function EarningsScreen({ navigation }: Props) {
  const d = DRIVER_TODAY;
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mes gains</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.todayLabel}>AUJOURD'HUI</Text>
        <View style={styles.totalCard}>
          <Text style={styles.total}>{formatFCFA(d.total)}</Text>
          <Text style={styles.totalSub}>Gains du jour · ⭐ {d.rating}</Text>
        </View>

        <View style={styles.statsGrid}>
          <Stat value={String(d.trips)} label="Courses" />
          <Stat value={`${d.km} km`} label="Distance" />
          <Stat value={d.onlineTime} label="En ligne" />
          <Stat value={`${d.acceptance}%`} label="Acceptation" />
        </View>

        <Text style={styles.sectionTitle}>Courses du jour</Text>
        {d.rides.map((r) => (
          <View key={r.id} style={styles.rideCard}>
            <View style={styles.rideIcon}>
              <Text>🧍🏾</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rideClient}>{r.client}</Text>
              <Text style={styles.rideTo}>⚑ {r.to} · {r.time}</Text>
            </View>
            <Text style={styles.ridePrice}>+ {formatFCFA(r.price)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: colors.accent, fontSize: 24, marginTop: -2 },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: fonts.display,
  } as any,
  content: { padding: 16, gap: 14 },
  todayLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 2, textAlign: 'center' },
  totalCard: {
    backgroundColor: colors.panel,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  total: { color: colors.accent, fontSize: 38, fontWeight: '700', fontFamily: fonts.display } as any,
  totalSub: { color: colors.textMuted, fontSize: 13, marginTop: 6 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47.5%',
    backgroundColor: colors.panel,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },
  statValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  sectionTitle: { color: colors.accent, fontSize: 15, fontWeight: '800', marginTop: 6, letterSpacing: 0.5 },
  rideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    gap: 12,
  },
  rideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rideClient: { color: colors.text, fontSize: 14, fontWeight: '700' },
  rideTo: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  ridePrice: { color: colors.success, fontSize: 13, fontWeight: '800' },
});
