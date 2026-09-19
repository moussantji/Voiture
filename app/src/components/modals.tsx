// 🪟 Modales partagées : Menu latéral (☰) et Notifications (🔔)
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { NOTIFICATIONS } from '../data/mock';

// ---------- ☰ Menu latéral flottant ----------
export type MenuItem = { icon: string; label: string; onPress: () => void };

export function SideMenu({
  visible,
  onClose,
  title,
  role,
  items,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  role: string;
  items: MenuItem[];
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={[styles.drawer, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.brand}>{title}</Text>
          <Text style={styles.role}>{role}</Text>
          <View style={styles.divider} />
          {items.map((it) => (
            <TouchableOpacity
              key={it.label}
              style={styles.menuItem}
              activeOpacity={0.8}
              onPress={() => {
                onClose();
                it.onPress();
              }}
            >
              <Text style={styles.menuIcon}>{it.icon}</Text>
              <Text style={styles.menuLabel}>{it.label}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
          <View style={{ flex: 1 }} />
          <Text style={styles.footer}>V1 · Bamako, Mali 🇲🇱</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ---------- 🔔 Panneau notifications ----------
export function NotificationsPanel({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[styles.notifPanel, { marginTop: insets.top + 64 }]}>
          <View style={styles.notifHeader}>
            <Text style={styles.notifTitle}>Notifications</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          </View>
          <ScrollView bounces={false} style={{ maxHeight: 380 }}>
            {NOTIFICATIONS.map((n) => (
              <View key={n.id} style={styles.notifItem}>
                <View style={styles.notifIconWrap}>
                  <Text style={styles.notifIcon}>{n.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifItemTitle}>{n.title}</Text>
                  <Text style={styles.notifBody} numberOfLines={2}>
                    {n.body}
                  </Text>
                  <Text style={styles.notifTime}>{n.time}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  drawer: {
    width: 288,
    height: '100%',
    backgroundColor: colors.panel,
    borderRightWidth: 1,
    borderColor: colors.panelBorder,
    paddingHorizontal: 22,
  },
  crown: { fontSize: 30, textAlign: 'center' },
  brand: {
    textAlign: 'center',
    color: colors.accent,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 6,
    fontFamily: fonts.display,
  } as any,
  role: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: 4, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: colors.panelBorder, marginVertical: 18 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(227,185,78,0.12)',
  },
  menuIcon: { fontSize: 19, width: 34 },
  menuLabel: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '600' },
  chevron: { color: colors.accent, fontSize: 20 },
  footer: { color: colors.textMuted, textAlign: 'center', fontSize: 11, paddingBottom: 26 },
  notifPanel: {
    marginHorizontal: 16,
    backgroundColor: colors.panel,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    padding: 14,
  },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  notifTitle: { color: colors.accent, fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  closeText: { color: colors.textMuted, fontSize: 13 },
  notifItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(227,185,78,0.12)',
    gap: 10,
  },
  notifIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: { fontSize: 18 },
  notifItemTitle: { color: colors.text, fontWeight: '700', fontSize: 14 },
  notifBody: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  notifTime: { color: colors.accent, fontSize: 10, marginTop: 4 },
});
