// 👑 NIGER ROYAL — App racine (Client & Chauffeur) · V1
import React from 'react';
import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';
import { fonts } from './src/theme/fonts';

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.panelBorder,
  },
};

// 📱 Sur le web : l'app est présentée dans un cadre "smartphone" premium
//    (comme sur la maquette validée design/palettes/palette-2-niger-royal-final-v3.png)
// 📐 Le cadre s'adapte automatiquement : zoom-out propre si la fenêtre est petite.
function WebPhoneFrame({ children }: { children: React.ReactNode }) {
  const { width: winW, height: winH } = useWindowDimensions();
  // 📱 Sur un VRAI téléphone (petit écran) → app plein écran native, sans cadre
  if (winW <= 520) {
    return <View style={{ flex: 1, backgroundColor: colors.background }}>{children}</View>;
  }
  const CONTENT_W = 402;
  const CONTENT_H = 900; // couronne + marque + sous-titre + téléphone (760) + hint
  const scale = Math.min(1, (winH - 12) / CONTENT_H, (winW - 12) / (CONTENT_W + 20));
  const offX = -(CONTENT_W - CONTENT_W * scale) / 2;
  const offY = -(CONTENT_H - CONTENT_H * scale) / 2;
  return (
    <View style={frameStyles.stage}>
      <View style={{ width: CONTENT_W * scale, height: CONTENT_H * scale }}>
        <View
          style={[
            frameStyles.inner,
            {
              left: offX,
              top: offY,
              transform: [{ scale }],
            } as any,
          ]}
        >
          <Text style={frameStyles.crown}>👑</Text>
          <Text style={frameStyles.brand}>NIGER ROYAL</Text>
          <Text style={frameStyles.sub}>Bamako · Mali 🇲🇱</Text>
          <View style={frameStyles.phone}>
            <View style={frameStyles.notchBar}>
              <View style={frameStyles.notch} />
            </View>
            <View style={frameStyles.screen}>{children}</View>
          </View>
          <Text style={frameStyles.hint}>Preview web · Sur Android/iOS : la vraie Google Maps 🗺️</Text>
        </View>
      </View>
    </View>
  );
}

export default function App() {
  const content = (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="light" />
      <RootNavigator />
    </NavigationContainer>
  );

  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaProvider>
      {isWeb ? <WebPhoneFrame>{content}</WebPhoneFrame> : content}
    </SafeAreaProvider>
  );
}

const frameStyles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: '#051A15',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    overflow: 'hidden',
  },
  inner: {
    position: 'absolute',
    width: 402,
    height: 900,
    alignItems: 'center',
  },
  crown: { fontSize: 26 },
  brand: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 5,
    marginTop: 6,
    fontFamily: fonts.display,
  } as any,
  sub: { color: colors.textMuted, fontSize: 11, letterSpacing: 2, marginTop: 4, marginBottom: 12 },
  phone: {
    width: 402,
    height: 762,
    borderRadius: 44,
    backgroundColor: '#0A1512',
    borderWidth: 2,
    borderColor: 'rgba(227,185,78,0.5)',
    overflow: 'hidden',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 30,
  },
  notchBar: { height: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A1512' },
  notch: { width: 110, height: 20, borderRadius: 10, backgroundColor: '#000000' },
  screen: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  hint: { color: colors.textMuted, fontSize: 10, marginTop: 10, letterSpacing: 0.5 },
});
