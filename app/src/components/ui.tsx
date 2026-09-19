// 👑 Composants UI partagés — thème Niger Royal
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../theme/colors';

// ---------- Bouton or principal ----------
export function GoldButton({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
}: {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'danger';
}) {
  const bg = variant === 'primary' ? colors.accent : 'transparent';
  const borderColor = variant === 'danger' ? colors.danger : colors.accent;
  const textColor = variant === 'primary' ? '#12251F' : variant === 'danger' ? colors.danger : colors.accent;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.goldBtn,
        { backgroundColor: bg, borderColor, opacity: disabled ? 0.45 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#12251F' : colors.accent} />
      ) : (
        <Text style={[styles.goldBtnText, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// ---------- Icône flottante (☰ / 🔔) ----------
export function FloatingIcon({
  icon,
  onPress,
  badge,
}: {
  icon: string;
  onPress?: () => void;
  badge?: number;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.floatingIcon}>
      <Text style={styles.floatingIconText}>{icon}</Text>
      {!!badge && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ---------- Pilule statut (● En service) ----------
export function StatusPill({ online, onPress }: { online: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.pill}>
      <View style={[styles.pillDot, { backgroundColor: online ? colors.success : colors.textMuted }]} />
      <Text style={styles.pillText}>{online ? 'En service' : 'Hors ligne'}</Text>
    </TouchableOpacity>
  );
}

// ---------- Bottom sheet premium ----------
export function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.sheet}>
      <View style={styles.sheetHandle} />
      {children}
    </View>
  );
}

// ---------- Ligne de champ (Destination…) ----------
export function FieldRow({
  icon,
  label,
  value,
  placeholder,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  placeholder: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.fieldRow}>
      <Text style={styles.fieldIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={[styles.fieldValue, !value && { color: colors.textMuted }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
      </View>
      <Text style={styles.fieldChevron}>›</Text>
    </TouchableOpacity>
  );
}

// ---------- Bloc info (Destination / Prix estimé) ----------
export function InfoBlock({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && { color: colors.accent }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

// ---------- Avatar rond ----------
export function Avatar({ emoji, size = 46 }: { emoji: string; size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  goldBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  goldBtnText: { fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  floatingIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.panelBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingIconText: { fontSize: 20, color: colors.accent },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.danger,
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.panel,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  pillDot: { width: 9, height: 9, borderRadius: 5, marginRight: 8 },
  pillText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  sheet: {
    backgroundColor: colors.panel,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderColor: colors.panelBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 14,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(227,185,78,0.45)',
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panelLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(227,185,78,0.22)',
  },
  fieldIcon: { fontSize: 17, marginRight: 10 },
  fieldLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' },
  fieldValue: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 2 },
  fieldChevron: { color: colors.accent, fontSize: 22, fontWeight: '300' },
  infoBlock: { flex: 1, paddingVertical: 4 },
  infoLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase' },
  infoValue: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 3 },
  avatar: {
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
