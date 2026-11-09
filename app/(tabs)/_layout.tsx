import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResetProgress } from '@/hooks/useResetProgress';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'index', title: 'Trang chủ', icon: 'home-outline', activeIcon: 'home' },
  { name: 'practice', title: 'Ôn tập', icon: 'book-outline', activeIcon: 'book' },
  { name: 'exam', title: 'Thi thử', icon: 'timer-outline', activeIcon: 'timer' },
  { name: 'signs', title: 'Biển báo', icon: 'warning-outline', activeIcon: 'warning' },
  { name: 'profile', title: 'Cá nhân', icon: 'person-outline', activeIcon: 'person' },
];

const TabIcon = ({ name, focused, color }: { name: IconName; focused: boolean; color: string }) => (
  <View
    style={{
      width: 56,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: focused ? '#dbeafe' : 'transparent',
    }}
  >
    <Ionicons name={name} size={22} color={color} />
  </View>
);

const ResetButton = () => {
  const resetProgress = useResetProgress();
  return (
    <Pressable
      onPress={resetProgress}
      accessibilityLabel="Xóa tiến trình học"
      hitSlop={8}
      style={{ marginRight: 12, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name="trash-outline" size={22} color="#dc2626" />
    </Pressable>
  );
};

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: 'center',
        headerRight: () => <ResetButton />,
        headerTitleStyle: { fontWeight: '600' },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 6,
          borderTopWidth: 0,
          backgroundColor: '#ffffff',
          shadowColor: '#0f172a',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -2 },
          elevation: 12,
        },
        tabBarLabelStyle: { fontSize: 12, lineHeight: 16, flexShrink: 0, fontWeight: '600', marginTop: 2 },
      }}
    >
      {TABS.map(({ name, title, icon, activeIcon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={focused ? activeIcon : icon}
                focused={focused}
                color={typeof color === 'string' ? color : '#64748b'}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabsLayout;
