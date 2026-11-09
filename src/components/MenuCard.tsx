import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  title: string;
  description?: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  color: string;
  badge?: string;
  onPress?: () => void;
};

export const MenuCard = ({ title, description, icon, color, badge, onPress }: Props) => {
  const card = (
    <View className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
      <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${color}1a` }}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold text-slate-900">{title}</Text>
        {description ? <Text className="text-sm text-slate-500">{description}</Text> : null}
      </View>
      {badge ? (
        <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${color}1a` }}>
          <Text className="text-xs font-bold" style={{ color }}>
            {badge}
          </Text>
        </View>
      ) : null}
      {onPress ? <Ionicons name="chevron-forward" size={20} color="#94a3b8" /> : null}
    </View>
  );

  if (!onPress) return card;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
    >
      {card}
    </Pressable>
  );
};
