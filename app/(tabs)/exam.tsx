import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { MenuCard } from '@/components/MenuCard';
import { EXAMS } from '@/data';
import { EXAM_DURATION_SEC, EXAM_SIZE, PASS_COUNT, formatTime } from '@/lib/exam';
import { useSettings } from '@/store/settings';
import type { Exam, ExamDraft, ExamReveal, ExamScore } from '@/types';

type RevealOption = { id: ExamReveal; title: string; description: string; icon: ComponentProps<typeof Ionicons>['name'] };

const REVEAL_OPTIONS: RevealOption[] = [
  {
    id: 'instant',
    title: 'Hiện đáp án ngay',
    description: 'Biết đúng/sai sau mỗi câu, phù hợp khi mới luyện',
    icon: 'flash',
  },
  {
    id: 'end',
    title: 'Hiện khi nộp bài',
    description: 'Giống thi thật: chỉ xem kết quả và câu sai ở cuối',
    icon: 'flag',
  },
];

const SectionTitle = ({ children }: { children: string }) => (
  <Text className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{children}</Text>
);

const RevealRow = ({ option, selected, onPress }: { option: RevealOption; selected: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress}>
    <View
      className={
        'flex-row items-center gap-3 rounded-2xl border-2 p-3 ' +
        (selected ? 'border-primary bg-primary-light' : 'border-slate-200 bg-white')
      }
    >
      <View className={'h-10 w-10 items-center justify-center rounded-full ' + (selected ? 'bg-primary' : 'bg-slate-100')}>
        <Ionicons name={option.icon} size={20} color={selected ? '#ffffff' : '#64748b'} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold text-slate-900">{option.title}</Text>
        <Text className="text-sm text-slate-500">{option.description}</Text>
      </View>
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={22}
        color={selected ? '#2563eb' : '#94a3b8'}
      />
    </View>
  </Pressable>
);

const examStatus = (score?: ExamScore, draft?: ExamDraft) => {
  if (draft) return { text: `⏱ ${formatTime(draft.remainingSec)}`, color: '#2563eb', tint: '#eff6ff' };
  if (!score) return { text: 'Chưa làm', color: '#64748b', tint: '#ffffff' };
  if (score.passed) return { text: `${score.correct}/${score.total} Đạt`, color: '#16a34a', tint: '#f0fdf4' };
  return { text: `${score.correct}/${score.total} Trượt`, color: '#dc2626', tint: '#fef2f2' };
};

const ExamTile = ({ exam, score, draft, onPress }: { exam: Exam; score?: ExamScore; draft?: ExamDraft; onPress: () => void }) => {
  const status = examStatus(score, draft);
  return (
    <View style={{ width: '25%', paddingHorizontal: 5, paddingVertical: 5 }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}
      >
        <View
          className="items-center gap-0.5 rounded-2xl border px-0.5 py-2.5"
          style={{
            borderColor: status.color === '#64748b' ? '#e2e8f0' : `${status.color}55`,
            backgroundColor: status.tint,
          }}
        >
          <Text className="text-base font-semibold text-slate-900">Đề {exam.id}</Text>
          <Text
            className="text-[12px] font-semibold"
            style={{ color: status.color }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {status.text}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const ExamScreen = () => {
  const router = useRouter();
  const { examReveal, setExamReveal, examScores, examDrafts } = useSettings();
  const openExam = (examId: number) =>
    router.push({ pathname: '/quiz', params: { mode: 'exam', examId: String(examId) } });

  const passedCount = EXAMS.filter((e) => examScores[e.id]?.passed).length;
  // Resume a saved exam first, otherwise suggest the first one not passed yet.
  const nextExam =
    EXAMS.find((e) => examDrafts[e.id]) ?? EXAMS.find((e) => !examScores[e.id]?.passed) ?? EXAMS[0];
  const hasDraft = nextExam ? Boolean(examDrafts[nextExam.id]) : false;

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="gap-3 p-3">
      <View className="gap-3 rounded-2xl bg-primary p-4">
        <View className="gap-1">
          <Text className="text-xl font-semibold text-white">Thi thử lý thuyết</Text>
          <Text className="text-white/85">
            {EXAMS.length} đề · mỗi đề {EXAM_SIZE} câu trong {EXAM_DURATION_SEC / 60} phút, không trùng nhau. Đạt khi
            đúng ≥ {PASS_COUNT}/{EXAM_SIZE} câu và không sai câu điểm liệt.
          </Text>
        </View>
        <View className="self-start rounded-full bg-white/20 px-3 py-1">
          <Text className="text-sm font-semibold text-white">
            Đã đạt {passedCount}/{EXAMS.length} đề
          </Text>
        </View>
        {nextExam ? (
          <AppButton
            variant="light"
            icon="play"
            label={hasDraft ? `Tiếp tục làm · Đề số ${nextExam.id}` : `Bắt đầu thi thử · Đề số ${nextExam.id}`}
            onPress={() => openExam(nextExam.id)}
          />
        ) : null}
      </View>

      <MenuCard
        title="Thi đề ngẫu nhiên"
        description={`${EXAM_SIZE} câu rút ngẫu nhiên từ 600 câu, có câu điểm liệt, mỗi lần một đề khác`}
        icon="shuffle"
        color="#7c3aed"
        badge={`${EXAM_DURATION_SEC / 60} phút`}
        onPress={() => router.push({ pathname: '/quiz', params: { mode: 'exam' } })}
      />

      <SectionTitle>Cách hiện kết quả</SectionTitle>
      {REVEAL_OPTIONS.map((option) => (
        <RevealRow
          key={option.id}
          option={option}
          selected={examReveal === option.id}
          onPress={() => setExamReveal(option.id)}
        />
      ))}

      <SectionTitle>Danh sách đề thi</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, marginVertical: -5 }}>
        {EXAMS.map((exam) => (
          <ExamTile
            key={exam.id}
            exam={exam}
            score={examScores[exam.id]}
            draft={examDrafts[exam.id]}
            onPress={() => openExam(exam.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default ExamScreen;
