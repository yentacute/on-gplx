import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { PASS_COUNT } from '@/lib/exam';
import { AppButton } from './AppButton';

const USE_NATIVE_DRIVER = false;

type RainDrop = { left: number; length: number; delay: number; duration: number };

const makeRain = (): RainDrop[] =>
  Array.from({ length: 28 }, () => ({
    left: 100 * Math.random(),
    length: 10 + 14 * Math.random(),
    delay: 1500 * Math.random(),
    duration: 1100 + 700 * Math.random(),
  }));

const Drop = ({ drop, height }: { drop: RainDrop; height: number }) => {
  const fall = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(fall, {
        toValue: 1,
        duration: drop.duration,
        delay: drop.delay,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [drop, fall]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: `${drop.left}%`,
        width: 2,
        height: drop.length,
        borderRadius: 1,
        backgroundColor: 'rgba(147,197,253,0.7)',
        transform: [{ translateY: fall.interpolate({ inputRange: [0, 1], outputRange: [-30, height + 30] }) }],
      }}
    />
  );
};

/** A rocking sad face with a falling tear. */
const SadFace = () => {
  const rock = useRef(new Animated.Value(0)).current;
  const tear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rockLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(rock, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(rock, {
          toValue: -1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    const tearLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tear, {
          toValue: 1,
          duration: 1300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.delay(400),
        Animated.timing(tear, { toValue: 0, duration: 0, useNativeDriver: USE_NATIVE_DRIVER }),
      ]),
    );
    rockLoop.start();
    tearLoop.start();
    return () => {
      rockLoop.stop();
      tearLoop.stop();
    };
  }, [rock, tear]);

  return (
    <View style={{ width: 120, height: 116, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{ transform: [{ rotate: rock.interpolate({ inputRange: [-1, 1], outputRange: ['-8deg', '8deg'] }) }] }}
      >
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: '#e0f2fe',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="sad-outline" size={62} color="#0284c7" />
        </View>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 52,
          left: 40,
          opacity: tear.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
          transform: [{ translateY: tear.interpolate({ inputRange: [0, 1], outputRange: [0, 46] }) }],
        }}
      >
        <Ionicons name="water" size={16} color="#38bdf8" />
      </Animated.View>
    </View>
  );
};

type Props = {
  visible: boolean;
  correct: number;
  total: number;
  criticalFailed: boolean;
  onReview: () => void;
  onClose: () => void;
};

export const FailEncouragement = ({ visible, correct, total, criticalFailed, onReview, onClose }: Props) => {
  const { height } = useWindowDimensions();
  const rain = useMemo(makeRain, []);
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, friction: 6, tension: 60, useNativeDriver: USE_NATIVE_DRIVER }).start();
  }, [visible, pop]);

  const reason = criticalFailed ? 'Bạn đã sai câu điểm liệt' : `Cần đúng ít nhất ${PASS_COUNT}/${total} câu`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(15,23,42,0.65)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        {rain.map((drop, i) => (
          <Drop key={i} drop={drop} height={height} />
        ))}
        <Animated.View
          style={{
            width: '100%',
            maxWidth: 360,
            alignItems: 'center',
            gap: 12,
            borderRadius: 28,
            backgroundColor: '#ffffff',
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: 20,
            opacity: pop,
            transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          }}
        >
          <SadFace />
          <Text className="text-center text-2xl font-bold text-slate-900">Bạn đã thi trượt</Text>
          <Text className="text-center text-lg font-semibold text-sky-700">Ôn tập thêm nhé!</Text>
          <View className="items-center gap-1 rounded-2xl bg-red-50 px-4 py-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="close-circle" size={20} color="#dc2626" />
              <Text className="text-base font-semibold text-red-700">
                Đúng {correct}/{total} câu
              </Text>
            </View>
            <Text className="text-xs text-red-600">{reason}</Text>
          </View>
          <Text className="text-center text-sm text-slate-500">
            Đừng nản, xem lại các câu sai rồi thử lại. Lần sau chắc chắn sẽ tốt hơn!
          </Text>
          <View style={{ width: '100%', gap: 8, marginTop: 8 }}>
            <AppButton label="Ôn lại các câu sai" icon="refresh" onPress={onReview} />
            <Pressable onPress={onClose} className="h-10 items-center justify-center">
              <Text className="text-sm font-semibold text-slate-500">Xem kết quả</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
