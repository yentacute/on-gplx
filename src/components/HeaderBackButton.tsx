import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

export const HeaderBackButton = () => {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/practice'))}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Quay lại"
      className="pr-3"
    >
      <Ionicons name="arrow-back" size={24} color="#0f172a" />
    </Pressable>
  );
};
