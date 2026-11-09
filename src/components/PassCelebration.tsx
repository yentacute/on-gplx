import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Modal, Text, View, useWindowDimensions } from 'react-native';
import { AppButton } from './AppButton';

const CONFETTI_COLORS = ['#2563eb', '#f59e0b', '#16a34a', '#dc2626', '#7c3aed', '#ec4899', '#06b6d4'];
// Animated.View with percentage `left` and interpolated transforms is not supported by the native driver.
const USE_NATIVE_DRIVER = false;

type ConfettiPiece = {
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  spin: number;
  round: boolean;
};

const makeConfetti = (): ConfettiPiece[] =>
  Array.from({ length: 40 }, (_, i) => ({
    left: 100 * Math.random(),
    size: 8 + 8 * Math.random(),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] ?? '#2563eb',
    delay: 1800 * Math.random(),
    duration: 2600 + 1800 * Math.random(),
    spin: (Math.random() > 0.5 ? 1 : -1) * (360 + 540 * Math.random()),
    round: Math.random() > 0.6,
  }));

const Confetti = ({ piece, height }: { piece: ConfettiPiece; height: number }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: piece.duration,
        delay: piece.delay,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [piece, progress]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: `${piece.left}%`,
        width: piece.size,
        height: piece.size * (piece.round ? 1 : 0.5),
        borderRadius: piece.round ? piece.size : 2,
        backgroundColor: piece.color,
        transform: [
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-30, height + 30] }) },
          { translateX: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 14, -14] }) },
          { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${piece.spin}deg`] }) },
        ],
      }}
    />
  );
};

const Sparkle = ({ top, left, delay, size }: { top: number; left: number; delay: number; size: number }) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, delay, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: USE_NATIVE_DRIVER }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, pulse]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top,
        left,
        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
        transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.15] }) }],
      }}
    >
      <Ionicons name="sparkles" size={size} color="#f59e0b" />
    </Animated.View>
  );
};

type Props = { visible: boolean; correct: number; total: number; onClose: () => void };

export const PassCelebration = ({ visible, correct, total, onClose }: Props) => {
  const { height } = useWindowDimensions();
  const confetti = useMemo(makeConfetti, []);
  const pop = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 70, useNativeDriver: USE_NATIVE_DRIVER }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, pop, bounce]);

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
        {confetti.map((piece, i) => (
          <Confetti key={i} piece={piece} height={height} />
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
            paddingTop: 40,
            paddingBottom: 24,
            opacity: pop,
            transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          }}
        >
          <View style={{ width: 130, height: 110, alignItems: 'center', justifyContent: 'center' }}>
            <Sparkle top={0} left={4} delay={0} size={22} />
            <Sparkle top={14} left={96} delay={250} size={26} />
            <Sparkle top={72} left={0} delay={500} size={18} />
            <Animated.View
              style={{ transform: [{ translateY: bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }] }}
            >
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: '#fef3c7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="trophy" size={54} color="#f59e0b" />
              </View>
            </Animated.View>
            <Animated.View
              style={{
                position: 'absolute',
                right: 6,
                bottom: 0,
                transform: [
                  { rotate: bounce.interpolate({ inputRange: [0, 1], outputRange: ['-14deg', '14deg'] }) },
                  { scale: bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
                ],
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#dcfce7',
                  borderWidth: 3,
                  borderColor: '#ffffff',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="happy" size={26} color="#16a34a" />
              </View>
            </Animated.View>
          </View>
          <Text className="text-center text-2xl font-bold text-slate-900">Chúc mừng bạn!</Text>
          <Text className="text-center text-lg font-semibold text-green-600">Bạn đã thi đạt</Text>
          <View className="flex-row items-center gap-2 rounded-full bg-green-50 px-4 py-2">
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text className="text-base font-semibold text-green-700">
              Đúng {correct}/{total} câu
            </Text>
          </View>
          <Text className="text-center text-sm text-slate-500">
            Tuyệt vời! Hãy giữ vững phong độ và tiếp tục luyện các đề khác nhé.
          </Text>
          <View style={{ width: '100%', marginTop: 8 }}>
            <AppButton label="Xem kết quả" icon="eye" onPress={onClose} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
