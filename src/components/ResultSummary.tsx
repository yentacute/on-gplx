import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';
import type { ExamResult } from '@/types';
import { AppButton } from './AppButton';

type IconName = ComponentProps<typeof Ionicons>['name'];

const Stat = ({ value, label, color }: { value: number; label: string; color: string }) => (
  <View className="flex-1 items-center gap-0.5 rounded-xl py-2.5" style={{ backgroundColor: `${color}12` }}>
    <Text className="text-xl font-bold" style={{ color }}>
      {value}
    </Text>
    <Text className="text-xs font-medium text-slate-500">{label}</Text>
  </View>
);

const Chip = ({ icon, text, color }: { icon: IconName; text: string; color: string }) => (
  <View className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: `${color}14` }}>
    <Ionicons name={icon} size={14} color={color} />
    <Text className="text-xs font-semibold" style={{ color }}>
      {text}
    </Text>
  </View>
);

type Props = {
  result: ExamResult;
  answered: number;
  isExam: boolean;
  timeText?: string;
  timedOut?: boolean;
  onBack: () => void;
  onReview?: () => void;
};

const headerFor = (isExam: boolean, passed: boolean): { title: string; subtitle: string; icon: IconName; color: string } => {
  if (!isExam) return { title: 'Hoàn thành', subtitle: 'Bạn đã làm hết các câu', icon: 'ribbon', color: '#2563eb' };
  if (passed) {
    return { title: 'ĐẠT', subtitle: 'Chúc mừng, bạn đã vượt qua đề thi', icon: 'checkmark-circle', color: '#16a34a' };
  }
  return { title: 'TRƯỢT', subtitle: 'Ôn thêm rồi thử lại nhé', icon: 'close-circle', color: '#dc2626' };
};

export const ResultSummary = ({ result, answered, isExam, timeText, timedOut, onBack, onReview }: Props) => {
  const header = headerFor(isExam, result.passed);
  const wrong = answered - result.correct;
  const skipped = result.total - answered;
  const percent = Math.round((result.correct / result.total) * 100);
  const passMarkPercent = (result.passCount / result.total) * 100;

  return (
    <View className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <View className="items-center gap-1 px-4 pb-4 pt-5" style={{ backgroundColor: `${header.color}10` }}>
        <View
          className="h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: `${header.color}22` }}
        >
          <Ionicons name={header.icon} size={40} color={header.color} />
        </View>
        <Text className="mt-1 text-2xl font-bold" style={{ color: header.color }}>
          {header.title}
        </Text>
        <Text className="text-sm text-slate-500">{header.subtitle}</Text>
      </View>

      <View className="gap-3 p-4">
        <View className="gap-2">
          <View className="flex-row items-baseline justify-between">
            <Text className="text-sm font-medium text-slate-500">Số câu đúng</Text>
            <Text className="text-lg font-bold text-slate-900">
              {result.correct}/{result.total}
              <Text className="text-sm font-medium text-slate-400"> · {percent}%</Text>
            </Text>
          </View>
          <View className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <View
              className="h-2.5 rounded-full"
              style={{ width: `${Math.max(percent, 1)}%`, backgroundColor: header.color }}
            />
            {isExam ? (
              <View
                style={{
                  position: 'absolute',
                  left: `${passMarkPercent}%`,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  backgroundColor: '#334155',
                }}
              />
            ) : null}
          </View>
          {isExam ? (
            <Text className="text-xs text-slate-400">
              Vạch đậm: mức đạt {result.passCount}/{result.total} câu
            </Text>
          ) : null}
        </View>

        <View className="flex-row gap-2">
          <Stat value={result.correct} label="Đúng" color="#16a34a" />
          <Stat value={wrong} label="Sai" color="#dc2626" />
          <Stat value={skipped} label="Bỏ trống" color="#64748b" />
        </View>

        {isExam ? (
          <View className="flex-row flex-wrap justify-center gap-2">
            {result.criticalFailed ? <Chip icon="alert-circle" text="Sai câu điểm liệt" color="#dc2626" /> : null}
            {result.passed || result.criticalFailed ? null : (
              <Chip icon="trending-down" text={`Thiếu ${result.passCount - result.correct} câu để đạt`} color="#ea580c" />
            )}
            {timeText ? (
              <Chip
                icon={timedOut ? 'alarm' : 'time-outline'}
                text={timeText}
                color={timedOut ? '#dc2626' : '#2563eb'}
              />
            ) : null}
          </View>
        ) : null}

        <View className="gap-2">
          {onReview ? (
            <AppButton label={`Ôn lại ${result.total - result.correct} câu sai`} icon="refresh" onPress={onReview} />
          ) : null}
          <AppButton variant="secondary" label="Quay lại" icon="arrow-back" onPress={onBack} />
        </View>
      </View>
    </View>
  );
};
