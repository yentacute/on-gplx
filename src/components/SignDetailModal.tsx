import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SIGN_IMAGES } from '@/data/signImages';
import type { TrafficSign } from '@/types';
import { AppButton } from './AppButton';

type Props = {
  sign: TrafficSign | null;
  groupLabel: string;
  /** Position of the sign inside its group, 1-based. */
  position: number;
  groupSize: number;
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
};

export const SignDetailModal = ({ sign, groupLabel, position, groupSize, onPrev, onNext, onClose }: Props) => {
  const { height } = useWindowDimensions();
  const image = sign?.image ? SIGN_IMAGES[sign.image] : undefined;

  return (
    <Modal visible={sign !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(15,23,42,0.55)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        {/* Inner Pressable swallows taps so only the backdrop closes the dialog. */}
        <Pressable
          onPress={() => {}}
          className="w-full max-w-[420px] rounded-3xl bg-white"
          style={{ maxHeight: height * 0.85 }}
        >
          {sign ? (
            <>
              <View className="flex-row items-center justify-between px-5 pb-2 pt-4">
                <Text className="text-xs font-medium uppercase text-slate-400">
                  {groupLabel} · {position}/{groupSize}
                </Text>
                <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Đóng">
                  <Ionicons name="close" size={22} color="#64748b" />
                </Pressable>
              </View>

              <ScrollView contentContainerClassName="gap-4 px-5 pb-5">
                <View className="items-center justify-center rounded-2xl bg-slate-50 p-4">
                  {image ? (
                    <Image source={image} resizeMode="contain" style={{ width: '100%', height: 200 }} />
                  ) : (
                    <Ionicons name="image-outline" size={64} color="#cbd5e1" />
                  )}
                </View>

                <View className="gap-2">
                  <View className="self-start rounded-full bg-primary-light px-3 py-1">
                    <Text className="text-sm font-semibold text-primary">{sign.id}</Text>
                  </View>
                  <Text className="text-xl font-bold text-slate-900">{sign.name}</Text>
                  {sign.meaning ? <Text className="text-base leading-6 text-slate-600">{sign.meaning}</Text> : null}
                </View>

                <View className="flex-row gap-3">
                  <AppButton
                    flex
                    variant="secondary"
                    icon="chevron-back"
                    label="Trước"
                    disabled={!onPrev}
                    onPress={onPrev}
                  />
                  <AppButton
                    flex
                    variant="secondary"
                    icon="chevron-forward"
                    label="Sau"
                    disabled={!onNext}
                    onPress={onNext}
                  />
                </View>
              </ScrollView>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
};
