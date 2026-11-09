import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { MenuCard } from '@/components/MenuCard';
import { EXAMS } from '@/data';
import { FIXED_EXAM_RULES, examRulesFor, formatTime } from '@/lib/exam';
import { useSettings } from '@/store/settings';
import type { Exam, ExamDraft, ExamReveal, ExamScore } from '@/types';

type IconName = ComponentProps<typeof Ionicons>['name'];

type RevealOption = { id: ExamReveal; title: string; hint: string; icon: IconName };

const REVEAL_OPTIONS: RevealOption[] = [
  { id: 'instant', title: 'Sau mỗi câu', hint: 'Biết đúng sai ngay, hợp khi mới luyện.', icon: 'flash' },
  { id: 'end', title: 'Khi nộp bài', hint: 'Chỉ xem kết quả ở cuối, giống thi thật.', icon: 'flag' },
];

const SectionTitle = ({ children }: { children: string }) => (
  <Text className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{children}</Text>
);

/** Small icon + value pill in the hero, e.g. "30 câu". */
const HeroFact = ({ icon, text }: { icon: IconName; text: string }) => (
  <View className="flex-row items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
    <Ionicons name={icon} size={13} color="#ffffff" />
    <Text className="text-xs font-semibold text-white">{text}</Text>
  </View>
);

/** Two-option segmented control with a one-line hint for the selected option. */
const RevealSwitch = ({ value, onChange }: { value: ExamReveal; onChange: (value: ExamReveal) => void }) => {
  const selected = REVEAL_OPTIONS.find((o) => o.id === value) ?? REVEAL_OPTIONS[0]!;
  return (
    <View className="gap-2">
      <View className="flex-row rounded-xl bg-slate-200/70 p-1">
        {REVEAL_OPTIONS.map((option) => {
          const active = option.id === value;
          return (
            <Pressable
              key={option.id}
              onPress={() => onChange(option.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={
                'flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2 ' + (active ? 'bg-white' : '')
              }
              style={
                active
                  ? {
                      shadowColor: '#0f172a',
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      shadowOffset: { width: 0, height: 1 },
                      elevation: 1,
                    }
                  : undefined
              }
            >
              <Ionicons name={option.icon} size={15} color={active ? '#2563eb' : '#64748b'} />
              <Text className={'text-sm font-semibold ' + (active ? 'text-primary' : 'text-slate-500')}>
                {option.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text className="px-1 text-xs text-slate-500">{selected.hint}</Text>
    </View>
  );
};

const examStatus = (score?: ExamScore, draft?: ExamDraft) => {
  if (draft) return { text: `⏱ ${formatTime(draft.remainingSec)}`, color: '#2563eb', tint: '#eff6ff' };
  if (!score) return { text: 'Chưa làm', color: '#64748b', tint: '#ffffff' };
  if (score.passed) return { text: `${score.correct}/${score.total} Đạt`, color: '#16a34a', tint: '#f0fdf4' };
  return { text: `${score.correct}/${score.total} Trượt`, color: '#dc2626', tint: '#fef2f2' };
};

const ExamTile = ({
  exam,
  score,
  draft,
  onPress,
}: {
  exam: Exam;
  score?: ExamScore;
  draft?: ExamDraft;
  onPress: () => void;
}) => {
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
  const { licenseClass, examReveal, setExamReveal, examScores, examDrafts } = useSettings();
  const classRules = examRulesFor(licenseClass);
  const fixed = FIXED_EXAM_RULES;
  const openExam = (examId: number) =>
    router.push({ pathname: '/quiz', params: { mode: 'exam', examId: String(examId) } });

  const passedCount = EXAMS.filter((e) => examScores[e.id]?.passed).length;
  // Resume a saved exam first, otherwise suggest the first one not passed yet.
  const nextExam = EXAMS.find((e) => examDrafts[e.id]) ?? EXAMS.find((e) => !examScores[e.id]?.passed) ?? EXAMS[0];
  const hasDraft = nextExam ? Boolean(examDrafts[nextExam.id]) : false;

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="gap-3 p-3">
      <View className="gap-3 rounded-2xl bg-primary p-4">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 gap-0.5">
            <Text className="text-xl font-semibold text-white">Thi thử lý thuyết</Text>
            <Text className="text-sm text-white/80">
              {EXAMS.length} đề mẫu{licenseClass === 'B' ? '' : ' hạng B'} · sai câu điểm liệt là trượt
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xl font-bold text-white">
              {passedCount}/{EXAMS.length}
            </Text>
            <Text className="text-xs text-white/80">đề đã đạt</Text>
          </View>
        </View>
        <View className="h-1.5 overflow-hidden rounded-full bg-white/20">
          <View className="h-full rounded-full bg-white" style={{ width: `${(passedCount / EXAMS.length) * 100}%` }} />
        </View>
        <View className="flex-row flex-wrap gap-2">
          <HeroFact icon="document-text" text={`${fixed.questionCount} câu`} />
          <HeroFact icon="time" text={`${fixed.durationSec / 60} phút`} />
          <HeroFact icon="checkmark-circle" text={`Đạt ${fixed.passCount}/${fixed.questionCount}`} />
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
        title="Đề ngẫu nhiên"
        description={`Hạng ${licenseClass} · ${classRules.questionCount} câu · đạt ${classRules.passCount}/${classRules.questionCount}`}
        icon="shuffle"
        color="#7c3aed"
        badge={`${classRules.durationSec / 60} phút`}
        onPress={() => router.push({ pathname: '/quiz', params: { mode: 'exam' } })}
      />

      <SectionTitle>Xem đáp án</SectionTitle>
      <RevealSwitch value={examReveal} onChange={setExamReveal} />

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
