import '@/theme/setup';
import '../global.css';
import { Provider as AntdProvider } from '@ant-design/react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { type ReactNode, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { PlainHeaderTitle } from '@/components/seo/ContentPage';
import { StartupScreen } from '@/components/StartupScreen';
import { useTrackPageViews } from '@/hooks/useTrackPageViews';
import { RouteSeo } from '@/seo/RouteSeo';
import { contentHeaderTitle } from '@/seo/slugs';
import { INTER } from '@/theme/inter';

SplashScreen.preventAutoHideAsync();

// Web gets Inter as small woff2 files from @font-face (theme/setup.web.ts), so only the icon font is
// registered there; that keeps the 340 KB TTFs out of every page's preload list.
const FONTS = {
  ...(Platform.OS === 'web'
    ? {}
    : {
        [INTER.regular]: Inter_400Regular,
        [INTER.medium]: Inter_500Medium,
        [INTER.semibold]: Inter_600SemiBold,
        [INTER.bold]: Inter_700Bold,
      }),
  // Registered here so static web pages render icon glyphs, matching the client.
  ...Ionicons.font,
};

const backButton = () => <HeaderBackButton />;

/** Indexable content pages. Each sets its own header title. */
const CONTENT_SCREENS = ['cau-hoi/[id]', 'bien-bao/[id]', 'chuong/[slug]', 'thi-thu/[slug]', 'cau-diem-liet', '600-cau-hoi'];

// Head tags only render inside a focused screen, so each screen gets them here.
const withRouteSeo = ({ children }: { children: ReactNode }) => (
  <>
    <RouteSeo />
    {children}
  </>
);

const RootLayout = () => {
  const [fontsLoaded, fontError] = useFonts(FONTS);
  // Carry on with system fonts if Inter fails to load. On web, Inter comes from @font-face
  // (theme/setup.web.ts), so render straight away: the static HTML is the full page and the
  // first client render must match it for hydration.
  const ready = Platform.OS === 'web' || fontsLoaded || fontError !== null;

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
            <Stack screenLayout={withRouteSeo}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="quiz" options={{ title: 'Làm bài', headerLeft: backButton }} />
              <Stack.Screen name="tips" options={{ title: 'Mẹo ghi nhớ', headerLeft: backButton }} />
              <Stack.Screen name="topics" options={{ title: 'Ôn theo danh mục', headerLeft: backButton }} />
              {CONTENT_SCREENS.map((name) => (
                <Stack.Screen
                  key={name}
                  name={name}
                  options={({ route }) => ({
                    headerLeft: backButton,
                    headerTitleAlign: 'center',
                    headerTitle: () => (
                      <PlainHeaderTitle text={contentHeaderTitle(name, route.params as Record<string, unknown>)} />
                    ),
                  })}
                />
              ))}
            </Stack>
          </AntdProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
