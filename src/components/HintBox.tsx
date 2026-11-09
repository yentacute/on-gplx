import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { getHint } from '@/lib/hint';
import type { Question } from '@/types';
import { BUTTON_HEIGHT } from './constants';

const AMBER = '#d97706';

type Props = {
  question: Question;
  answered: boolean;
  /** False during an exam that only reveals answers at the end. */
  allowMemo?: boolean;
  open: boolean;
  onToggle: () => void;
};

export const HintBox = ({ question, answered, allowMemo = true, open, onToggle }: Props) => {
  const { memo } = getHint(question);
  if (!allowMemo || !memo) return null;

  if (answered) {
    return (
      <View className="flex-row gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3">
        <Ionicons name="bulb" size={22} color={AMBER} />
        <View className="flex-1 gap-1">
          <Text className="text-sm font-semibold text-amber-800">Mẹo ghi nhớ</Text>
          <Text className="text-sm text-amber-900">{memo}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <Pressable
        onPress={onToggle}
        style={{ height: BUTTON_HEIGHT }}
        className="flex-row items-center justify-center gap-2 self-start rounded-full border border-amber-300 bg-amber-50 px-4"
      >
        <Ionicons name={open ? 'bulb' : 'bulb-outline'} size={18} color={AMBER} />
        <Text className="text-sm font-semibold text-amber-800">{open ? 'Ẩn gợi ý' : 'Gợi ý'}</Text>
      </Pressable>
      {open ? (
        <View className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <Text className="text-sm text-amber-900">{memo}</Text>
        </View>
      ) : null}
    </View>
  );
};
