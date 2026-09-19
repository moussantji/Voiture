// 👑 Écran d'accueil V1 — choix du rôle (remplacé par OTP + profil en V1.1)
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelect'>;

export default function RoleSelectScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.crown}>👑</Text>
        <Text style={styles.brand}>NIGER ROYAL</Text>
        <View style={styles.rule} />
        <Text style={styles.tagline}>Votre trajet, notre excellence.</Text>
        <Text style={styles.city}>BAMAKO · MALI 🇲🇱</Text>
      </View>

      <View style={styles.cards}>
        <RoleCard
          emoji="🧍🏾"
          title="Je suis Client"
          subtitle="Commander une voiture en 30 secondes"
          onPress={() => navigation.replace('ClientMap')}
        />
        <RoleCard
          emoji="🚘"
          title="Je suis Chauffeur"
          subtitle="Gagner de l'argent avec ma voiture"
          onPress={() => navigation.replace('DriverMap')}
        />
      </View>

      <Text style={styles.version}>V1 · Démo design validée</Text>
    </SafeAreaView>
  );
}

function RoleCard({ emoji, title, subtitle, onPress }: { emoji: string; title: string; subtitle: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
      <View style={styles.cardIconWrap}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.cardChevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  hero: { alignItems: 'center', marginTop: 70 },
  crown: { fontSize: 46 },
  brand: {
    color: colors.accent,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 6,
    marginTop: 14,
    fontFamily: fonts.display,
  } as any,
  rule: {
    width: 120,
    height: 1,
    backgroundColor: colors.panelBorder,
    marginVertical: 16,
  },
  tagline: { color: colors.text, fontSize: 15, fontStyle: 'italic' },
  city: { color: colors.textMuted, fontSize: 11, letterSpacing: 3, marginTop: 10 },
  cards: { gap: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },
  cardIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardEmoji: { fontSize: 26 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  cardSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  cardChevron: { color: colors.accent, fontSize: 26, fontWeight: '300' },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 11, marginBottom: 18, letterSpacing: 1 },
});
