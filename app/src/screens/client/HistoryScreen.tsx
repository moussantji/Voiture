// 📜 Historique des trajets — App Client V1
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { TRIP_HISTORY, formatFCFA } from '../../data/mock';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientHistory'>;

export default function HistoryScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mes trajets</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {TRIP_HISTORY.map((t) => (
          <View key={t.id} style={styles.card}>
            <View style={styles.iconWrap}>
              <Text style={{ fontSize: 18 }}>🚕</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.route}>
                {t.from} <Text style={styles.arrow}>→</Text> {t.to}
              </Text>
              <Text style={styles.date}>{t.date}</Text>
              <Text style={styles.stars}>{'⭐'.repeat(t.rating)}</Text>
            </View>
            <Text style={styles.price}>{formatFCFA(t.price)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  route: { color: colors.text, fontSize: 14, fontWeight: '700' },
  arrow: { color: colors.accent },
  date: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  stars: { fontSize: 10, marginTop: 4 },
  price: { color: colors.accent, fontSize: 14, fontWeight: '800' },
});
