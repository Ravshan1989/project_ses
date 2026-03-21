import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { getToken } from './src/services/auth';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OfflineManager } from './src/services/OfflineManager';
import { api } from './src/services/api';

// Initialize offline manager
OfflineManager.init(api);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getToken();
      console.log('[DEBUG] App: checkAuthStatus, token exists:', !!token);
      setIsAuthenticated(!!token);
    } catch (e) {
      console.error('[DEBUG] App: checkAuthStatus error:', e);
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1677ff" />
        </View>
      </SafeAreaProvider>
    );
  }

  console.log('[DEBUG] App: rendering, isAuthenticated:', isAuthenticated);

  if (isAuthenticated) {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <TabNavigator onLogout={() => {
            console.log('[DEBUG] App: Logging out');
            setIsAuthenticated(false);
          }} />
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <LoginScreen onLoginSuccess={() => {
        console.log('[DEBUG] App: Login success triggered');
        setIsAuthenticated(true);
      }} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
