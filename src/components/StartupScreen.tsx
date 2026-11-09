import { ActivityIndicator, Image, View } from 'react-native';

/** Shown while fonts load; matches the native splash screen. */
export const StartupScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28, backgroundColor: '#2563eb' }}>
    <Image
      source={require('../../assets/splash-icon.png')}
      style={{ width: 200, height: 200 }}
      resizeMode="contain"
    />
    <ActivityIndicator color="#ffffff" />
  </View>
);
