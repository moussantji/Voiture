// 👑 Icônes or dessinées en Views — rendu identique sur toutes les plateformes
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

// ☰ Menu hamburger
export function GoldMenuIcon({ size = 18 }: { size?: number }) {
  const w = size;
  const h = size * 0.72;
  const bar = {
    width: w,
    height: Math.max(2, size * 0.14),
    borderRadius: 2,
    backgroundColor: colors.accent,
  };
  return (
    <View style={{ width: w, height: h + Math.max(2, size * 0.14), justifyContent: 'space-between' }}>
      <View style={bar} />
      <View style={[bar, { width: w * 0.72 }]} />
      <View style={bar} />
    </View>
  );
}

// 🔔 Cloche
export function GoldBellIcon({ size = 19 }: { size?: number }) {
  const body = size * 0.72;
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={styles.bellKnob} />
      <View
        style={{
          width: body,
          height: size * 0.62,
          backgroundColor: colors.accent,
          borderTopLeftRadius: body / 2,
          borderTopRightRadius: body / 2,
        }}
      />
      <View style={styles.bellSkirt} />
      <View style={styles.bellClapper} />
    </View>
  );
}

// ⚑ Drapeau destination
export function GoldFlagIcon({ size = 16 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      <View style={{ width: 2, height: size, backgroundColor: colors.accent, borderRadius: 1 }} />
      <View
        style={{
          width: 0,
          height: 0,
          borderTopWidth: size * 0.28,
          borderBottomWidth: size * 0.28,
          borderLeftWidth: size * 0.6,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: colors.accent,
          marginLeft: 1,
        }}
      />
    </View>
  );
}

// ● Point vert/état
export function StatusDot({ color, size = 9 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

// ⌕ Loupe
export function GoldSearchIcon({ size = 16 }: { size?: number }) {
  const s = size * 0.6;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          width: s,
          height: s,
          borderRadius: s / 2,
          borderWidth: 2,
          borderColor: colors.accent,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 2.4,
          height: size * 0.48,
          backgroundColor: colors.accent,
          borderRadius: 1.2,
          right: 1.5,
          bottom: 0,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bellKnob: { width: 5, height: 3.4, borderRadius: 2, backgroundColor: colors.accent, marginBottom: 1 },
  bellSkirt: {
    width: 20,
    height: 3.2,
    borderRadius: 1.8,
    backgroundColor: colors.accent,
    marginTop: 1.6,
  },
  bellClapper: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent, marginTop: 1.6 },
});
