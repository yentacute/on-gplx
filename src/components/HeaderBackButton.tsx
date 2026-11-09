import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, Pressable } from 'react-native';

export const HeaderBackButton = () => {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/practice'))}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Quay lại"
      className="pr-3"
      // The web header puts headerLeft flush to the edge; native headers already inset it.
      style={{ marginLeft: Platform.OS === 'web' ? 12 : 0 }}
    >
      <Ionicons name="arrow-back" size={24} color="#0f172a" />
    </Pressable>
  );
};
