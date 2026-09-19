// 👑 NIGER ROYAL — App racine (Client & Chauffeur) · V1
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
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
function WebPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <View style={frameStyles.stage}>
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
    justifyContent: 'center',
    padding: 16,
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
  sub: { color: colors.textMuted, fontSize: 11, letterSpacing: 2, marginTop: 4, marginBottom: 14 },
  phone: {
    width: '100%',
    maxWidth: 402,
    flex: 1,
    maxHeight: 780,
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
  hint: { color: colors.textMuted, fontSize: 10, marginTop: 12, letterSpacing: 0.5 },
});
