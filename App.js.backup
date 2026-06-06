import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { checkDueNotifications } from './src/lib/expiryNotifications';
import HomeScreen from './src/screens/HomeScreen';
import ScanRateConScreen from './src/screens/ScanRateConScreen';
import ScanReceiptScreen from './src/screens/ScanReceiptScreen';
import SmartScanScreen from './src/screens/SmartScanScreen';
import DocumentVaultScreen from './src/screens/DocumentVaultScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MyLoadsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="MyLoadsHome"
        component={HomeScreen}
        options={{ title: 'My Loads' }}
      />
      <Stack.Screen
        name="ScanRateCon"
        component={ScanRateConScreen}
        options={{ title: 'Scan Rate Confirmation' }}
      />
    </Stack.Navigator>
  );
}

function ExpensesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="ExpensesHome"
        component={HomeScreen}
        options={{ title: 'Expenses' }}
      />
      <Stack.Screen
        name="ScanReceipt"
        component={ScanReceiptScreen}
        options={{ title: 'Scan Receipt' }}
      />
    </Stack.Navigator>
  );
}

function SmartScanStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="SmartScanHome"
        component={SmartScanScreen}
        options={{ title: 'Smart Scan' }}
      />
    </Stack.Navigator>
  );
}

function VaultStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="VaultHome"
        component={DocumentVaultScreen}
        options={{ title: 'Document Vault' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    checkDueNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#007AFF',
          }}
        >
          <Tab.Screen
            name="Home"
            component={MyLoadsStack}
            options={{
              title: 'My Loads',
            }}
          />
          <Tab.Screen
            name="Expenses"
            component={ExpensesStack}
            options={{
              title: 'Expenses',
            }}
          />
          <Tab.Screen
            name="SmartScan"
            component={SmartScanStack}
            options={{
              title: 'Smart Scan',
            }}
          />
          <Tab.Screen
            name="Vault"
            component={VaultStack}
            options={{
              title: 'Vault',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}