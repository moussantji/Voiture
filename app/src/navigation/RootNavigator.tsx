// 🧭 Navigation par pile — V1 Niger Royal
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import ClientMapScreen from '../screens/client/ClientMapScreen';
import HistoryScreen from '../screens/client/HistoryScreen';
import DriverMapScreen from '../screens/driver/DriverMapScreen';
import EarningsScreen from '../screens/driver/EarningsScreen';

export type RootStackParamList = {
  RoleSelect: undefined;
  ClientMap: undefined;
  ClientHistory: undefined;
  DriverMap: undefined;
  DriverEarnings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="ClientMap" component={ClientMapScreen} />
      <Stack.Screen name="ClientHistory" component={HistoryScreen} />
      <Stack.Screen name="DriverMap" component={DriverMapScreen} />
      <Stack.Screen name="DriverEarnings" component={EarningsScreen} />
    </Stack.Navigator>
  );
}
