import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BUTTON_HEIGHT } from './constants';

const PRIMARY = '#2563eb';

type Props = {
  label: string;
  onPress?: () => void;
  /** primary: filled blue · secondary: outlined · light: white on a colored background */
  variant?: 'primary' | 'secondary' | 'light';
  icon?: ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  /** Stretch to fill a row. */
  flex?: boolean;
};

export const AppButton = ({ label, onPress, variant = 'primary', icon, disabled = false, flex = false }: Props) => {
  const isPrimary = variant === 'primary';
  const isLight = variant === 'light';
  const contentColor = disabled ? '#94a3b8' : isPrimary ? '#ffffff' : PRIMARY;
  const hasShadow = (isPrimary || isLight) && !disabled;

  return (
    <View style={{ flex: flex ? 1 : undefined }}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
      >
        <View
          style={{
            height: BUTTON_HEIGHT,
            borderRadius: 12,
            borderWidth: isPrimary || isLight ? 0 : 1.5,
            borderColor: disabled ? '#e2e8f0' : PRIMARY,
            backgroundColor: disabled ? '#f1f5f9' : isPrimary ? PRIMARY : '#ffffff',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            ...(hasShadow
              ? {
                  shadowColor: isLight ? '#0f172a' : PRIMARY,
                  shadowOpacity: isLight ? 0.25 : 0.3,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 4,
                }
              : null),
          }}
        >
          {icon ? <Ionicons name={icon} size={18} color={contentColor} /> : null}
          <Text style={{ fontSize: 14, fontWeight: '600', color: contentColor }}>{label}</Text>
        </View>
      </Pressable>
    </View>
  );
};
