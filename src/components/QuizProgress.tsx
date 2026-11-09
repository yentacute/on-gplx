import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { formatTime } from '@/lib/exam';

type Props = {
  current: number;
  total: number;
  answered: number;
  /** Seconds left; only set during an exam. */
  timeLeft?: number;
};

const LOW_TIME_SEC = 120;

export const QuizProgress = ({ current, total, answered, timeLeft }: Props) => {
  const percent = Math.round((current / total) * 100);
  const barColor = current === total ? '#16a34a' : '#2563eb';
  const timeColor = timeLeft !== undefined && timeLeft <= LOW_TIME_SEC ? '#dc2626' : '#334155';

  return (
    <View className="gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-baseline gap-1">
          <Text className="text-base font-bold" style={{ color: barColor }}>
            {current}
          </Text>
          <Text className="text-xs text-slate-400">/ {total} câu</Text>
          <Text className="ml-1 text-xs text-slate-500">· đã làm {answered}</Text>
        </View>
        {timeLeft !== undefined ? (
          <View
            className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
            style={{ backgroundColor: `${timeColor}14` }}
          >
            <Ionicons name="time-outline" size={14} color={timeColor} />
            <Text className="text-xs font-bold" style={{ color: timeColor, fontVariant: ['tabular-nums'] }}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        ) : (
          <Text className="text-xs font-bold" style={{ color: barColor }}>
            {percent}%
          </Text>
        )}
      </View>
      <View className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <View className="h-1.5 rounded-full" style={{ width: `${percent}%`, backgroundColor: barColor }} />
      </View>
    </View>
  );
};
