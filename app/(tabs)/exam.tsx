import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type ComponentProps, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { MenuCard } from '@/components/MenuCard';
import { examRulesFor, fixedExamKey, fixedExamsFor, formatTime } from '@/lib/exam';
import { useSettings } from '@/store/settings';
import type { Exam, ExamDraft, ExamReveal, ExamRules, ExamScore } from '@/types';

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

type StartExamDialogProps = {
  /** Fixed exam number, or undefined for a random exam. */
  examId?: number;
  rules: ExamRules;
  reveal: ExamReveal;
  onRevealChange: (value: ExamReveal) => void;
  onStart: () => void;
  onCancel: () => void;
};

/** Asked before a new exam starts: how answers are shown. */
const StartExamDialog = ({ examId, rules, reveal, onRevealChange, onStart, onCancel }: StartExamDialogProps) => (
  <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
    <Pressable
      onPress={onCancel}
      style={{
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Swallow taps inside the card so only the backdrop closes the dialog. */}
      <Pressable onPress={() => {}} className="w-full max-w-[360px] gap-4 rounded-3xl bg-white p-5">
        <View className="items-center gap-1">
          <Text className="text-lg font-semibold text-slate-900">
            {examId === undefined ? 'Đề ngẫu nhiên' : `Đề số ${examId}`}
          </Text>
          <Text className="text-sm text-slate-500">
            {rules.questionCount} câu · {rules.durationSec / 60} phút · đạt {rules.passCount}/{rules.questionCount}
          </Text>
        </View>
        <View className="gap-2">
          <Text className="text-sm font-semibold text-slate-700">Xem đáp án</Text>
          <RevealSwitch value={reveal} onChange={onRevealChange} />
        </View>
        <View className="gap-1">
          <AppButton label="Bắt đầu thi" icon="play" onPress={onStart} />
          <Pressable onPress={onCancel} className="h-10 items-center justify-center">
            <Text className="text-sm font-semibold text-slate-500">Hủy</Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

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
  const exams = fixedExamsFor(licenseClass);
  const scoreOf = (exam: Exam) => examScores[fixedExamKey(licenseClass, exam.id)];
  const draftOf = (exam: Exam) => examDrafts[fixedExamKey(licenseClass, exam.id)];
  // `examId: undefined` means a random exam; null means the dialog is closed.
  const [pending, setPending] = useState<{ examId?: number } | null>(null);

  const startExam = (examId?: number) =>
    router.push({
      pathname: '/quiz',
      params: examId === undefined ? { mode: 'exam' } : { mode: 'exam', examId: String(examId) },
    });

  // A saved draft resumes straight away; a new exam first asks how to show answers.
  const openExam = (examId?: number) => {
    const exam = examId === undefined ? undefined : exams.find((e) => e.id === examId);
    if (exam && draftOf(exam)) startExam(examId);
    else setPending({ examId });
  };

  const passedCount = exams.filter((e) => scoreOf(e)?.passed).length;
  // Resume a saved exam first, otherwise suggest the first one not passed yet.
  const nextExam = exams.find((e) => draftOf(e)) ?? exams.find((e) => !scoreOf(e)?.passed) ?? exams[0];
  const hasDraft = nextExam ? Boolean(draftOf(nextExam)) : false;

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="gap-3 p-3">
      <View className="gap-3 rounded-2xl bg-primary p-4">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 gap-0.5">
            <Text className="text-xl font-semibold text-white">Thi thử lý thuyết</Text>
            <Text className="text-sm text-white/80">
              Hạng {licenseClass} · {exams.length} đề · sai câu điểm liệt là trượt
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xl font-bold text-white">
              {passedCount}/{exams.length}
            </Text>
            <Text className="text-xs text-white/80">đề đã đạt</Text>
          </View>
        </View>
        <View className="h-1.5 overflow-hidden rounded-full bg-white/20">
          <View className="h-full rounded-full bg-white" style={{ width: `${(passedCount / exams.length) * 100}%` }} />
        </View>
        <View className="flex-row flex-wrap gap-2">
          <HeroFact icon="document-text" text={`${classRules.questionCount} câu`} />
          <HeroFact icon="time" text={`${classRules.durationSec / 60} phút`} />
          <HeroFact icon="checkmark-circle" text={`Đạt ${classRules.passCount}/${classRules.questionCount}`} />
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
        description="Mỗi lần một đề mới"
        icon="shuffle"
        color="#7c3aed"
        badge={`${classRules.durationSec / 60} phút`}
        onPress={() => openExam()}
      />

      <SectionTitle>Danh sách đề thi</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, marginVertical: -5 }}>
        {exams.map((exam) => (
          <ExamTile
            key={exam.id}
            exam={exam}
            score={scoreOf(exam)}
            draft={draftOf(exam)}
            onPress={() => openExam(exam.id)}
          />
        ))}
      </View>

      {pending ? (
        <StartExamDialog
          examId={pending.examId}
          rules={classRules}
          reveal={examReveal}
          onRevealChange={setExamReveal}
          onCancel={() => setPending(null)}
          onStart={() => {
            setPending(null);
            startExam(pending.examId);
          }}
        />
      ) : null}
    </ScrollView>
  );
};

export default ExamScreen;
