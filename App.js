import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useState, useEffect } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './navigation/TabNavigator';
import LoadingScreen from './screens/LoadingScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <SafeAreaProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
    </SafeAreaProvider>
  );
}