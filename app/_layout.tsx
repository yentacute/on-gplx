import '@/theme/setup';
import '../global.css';
import { Provider as AntdProvider } from '@ant-design/react-native';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { StartupScreen } from '@/components/StartupScreen';
import { useTrackPageViews } from '@/hooks/useTrackPageViews';
import { INTER } from '@/theme/inter';

SplashScreen.preventAutoHideAsync();

const backButton = () => <HeaderBackButton />;

const RootLayout = () => {
  const [fontsLoaded, fontError] = useFonts({
    [INTER.regular]: Inter_400Regular,
    [INTER.medium]: Inter_500Medium,
    [INTER.semibold]: Inter_600SemiBold,
    [INTER.bold]: Inter_700Bold,
  });
  // Carry on with system fonts if Inter fails to load.
  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }),
  );

  useTrackPageViews();

  if (!ready) return <StartupScreen />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AntdProvider>
            <StatusBar style="dark" />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="quiz" options={{ title: 'Làm bài', headerLeft: backButton }} />
              <Stack.Screen name="tips" options={{ title: 'Mẹo ghi nhớ', headerLeft: backButton }} />
              <Stack.Screen name="topics" options={{ title: 'Ôn theo danh mục', headerLeft: backButton }} />
            </Stack>
          </AntdProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
