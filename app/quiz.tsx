import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, usePreventRemove, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useQuestions } from '@/api/queries';
import { AppButton } from '@/components/AppButton';
import { ExitExamDialog } from '@/components/ExitExamDialog';
import { FailEncouragement } from '@/components/FailEncouragement';
import { HintBox } from '@/components/HintBox';
import { LoadingView } from '@/components/LoadingView';
import { PassCelebration } from '@/components/PassCelebration';
import { QuestionCard } from '@/components/QuestionCard';
import { QuizProgress } from '@/components/QuizProgress';
import { ResultSummary } from '@/components/ResultSummary';
import { EXAMS } from '@/data';
import { FIXED_EXAM_RULES, examRulesFor, formatTime, gradeExam, makeRandomExam } from '@/lib/exam';
import { useSettings, useSettingsHydrated } from '@/store/settings';
import type { Question, QuizMode } from '@/types';

type Params = {
  mode?: QuizMode;
  /** Fixed exam id (exam mode). Without it, exam mode draws a random exam. */
  examId?: string;
  /** Comma-separated question ids to practice. */
  ids?: string;
  /** Category name to practice. */
  category?: string;
};

type Picked = Record<number, number>;

const SWIPE_DISTANCE = 60;

const WrongAnswers = ({ questions, picked }: { questions: Question[]; picked: Picked }) => {
  const wrong = questions.filter((q) => picked[q.id] !== q.answer);
  if (wrong.length === 0) return null;
  return (
    <View className="gap-3">
      <Text className="text-base font-semibold text-slate-900">Các câu sai ({wrong.length})</Text>
      {wrong.map((q) => {
        const choice = picked[q.id];
        return (
          <View key={q.id} className="gap-2 rounded-2xl border border-slate-200 bg-white p-3">
            <Text className="font-semibold text-slate-900">
              Câu {q.id}. {q.text}
            </Text>
            <Text className="text-sm font-medium text-red-600">
              Bạn chọn: {choice === undefined ? 'Chưa trả lời' : `${choice + 1}. ${q.options[choice]}`}
            </Text>
            <Text className="text-sm font-medium text-green-700">
              Đáp án đúng: {q.answer + 1}. {q.options[q.answer]}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const QuizScreen = () => {
  const router = useRouter();
  const { mode = 'practice', examId, ids, category } = useLocalSearchParams<Params>();
  const { data: allQuestions, isLoading } = useQuestions();
  const { licenseClass, wrongIds, addWrong, removeWrong, saveExamScore, saveExamDraft, clearExamDraft, examReveal } =
    useSettings();
  const hydrated = useSettingsHydrated();

  const isExam = mode === 'exam';
  const fixedExamId = isExam && examId ? Number(examId) : undefined;
  // Fixed exams keep their 30-question structure; random exams follow the chosen class.
  const rules = fixedExamId !== undefined ? FIXED_EXAM_RULES : examRulesFor(licenseClass);
  const passCount = isExam ? rules.passCount : undefined;

  const questions = useMemo(() => {
    if (!allQuestions || !hydrated) return [];
    if (ids) {
      const byId = new Map(allQuestions.map((q) => [q.id, q]));
      return ids.split(',').flatMap((id) => byId.get(Number(id)) ?? []);
    }
    if (mode === 'critical') return allQuestions.filter((q) => q.isCritical);
    if (mode === 'wrong') return allQuestions.filter((q) => wrongIds.includes(q.id));
    if (category) return allQuestions.filter((q) => q.category === category);
    if (isExam) {
      const exam = EXAMS.find((e) => e.id === fixedExamId);
      if (!exam) return makeRandomExam(allQuestions, rules.questionCount);
      const byId = new Map(allQuestions.map((q) => [q.id, q]));
      return exam.questionIds.flatMap((id) => byId.get(id) ?? []);
    }
    return allQuestions;
    // wrongIds is read once when the quiz starts, so answering doesn't reshuffle the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allQuestions, mode, fixedExamId, ids, category, hydrated, rules.questionCount]);

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Picked>({});
  const [hintOpen, setHintOpen] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showFail, setShowFail] = useState(false);
  const [timeLeft, setTimeLeft] = useState(rules.durationSec);
  const [timedOut, setTimedOut] = useState(false);
  const [dialog, setDialog] = useState<'finish' | 'exit' | null>(null);
  const draftRestored = useRef(false);
  const [allowLeave, setAllowLeave] = useState(false);
  const pendingLeave = useRef<(() => void) | null>(null);

  // Resume a saved draft of a fixed exam once settings are loaded.
  useEffect(() => {
    if (!hydrated || draftRestored.current || fixedExamId === undefined) return;
    draftRestored.current = true;
    const draft = useSettings.getState().examDrafts[fixedExamId];
    if (draft) {
      setPicked(draft.picked);
      setIndex(draft.index);
      setTimeLeft(draft.remainingSec);
    }
  }, [hydrated, fixedExamId]);

  const submit = (reason: 'submit' | 'timeout' = 'submit') => {
    addWrong(questions.filter((q) => picked[q.id] !== q.answer).map((q) => q.id));
    removeWrong(questions.filter((q) => picked[q.id] === q.answer).map((q) => q.id));
    const result = gradeExam(questions, picked, passCount);
    if (fixedExamId !== undefined) {
      saveExamScore(fixedExamId, { correct: result.correct, total: result.total, passed: result.passed });
      clearExamDraft(fixedExamId);
    }
    if (isExam && result.passed) setShowPass(true);
    if (isExam && !result.passed) setShowFail(true);
    setTimedOut(reason === 'timeout');
    setDialog(null);
    setFinished(true);
  };

  const examRunning = isExam && !finished && questions.length > 0;

  // Swipe left/right to move between questions.
  const swipeRef = useRef({ next: () => {}, prev: () => {} });
  swipeRef.current = {
    next: () => setIndex((i) => Math.min(i + 1, questions.length - 1)),
    prev: () => setIndex((i) => Math.max(i - 1, 0)),
  };
  // Ignore option taps that are really the end of a swipe.
  const swipingRef = useRef(false);
  const pan = usePanGesture({
    activeOffsetX: [-25, 25],
    failOffsetY: [-15, 15],
    cancelsJSResponder: true,
    runOnJS: true,
    onActivate: () => {
      swipingRef.current = true;
    },
    onFinalize: () => {
      setTimeout(() => {
        swipingRef.current = false;
      }, 50);
    },
    onDeactivate: (event) => {
      if (event.canceled) return;
      if (event.translationX <= -SWIPE_DISTANCE) swipeRef.current.next();
      else if (event.translationX >= SWIPE_DISTANCE) swipeRef.current.prev();
    },
  });

  useEffect(() => {
    if (!examRunning) return;
    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [examRunning]);

  useEffect(() => {
    if (examRunning && timeLeft === 0) submit('timeout');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examRunning, timeLeft]);

  // Ask before leaving an exam in progress.
  usePreventRemove(examRunning && !allowLeave, ({ repeat }) => {
    pendingLeave.current = repeat;
    setDialog('exit');
  });

  if (isLoading || !hydrated) return <LoadingView message="Đang tải câu hỏi…" />;
  if (questions.length === 0) {
    return <Text className="mt-10 text-center text-slate-600">Chưa có câu hỏi nào trong mục này.</Text>;
  }

  if (finished) {
    const result = gradeExam(questions, picked, passCount);
    const wrongQuestionIds = questions.filter((q) => picked[q.id] !== q.answer).map((q) => q.id);
    const reviewWrong = () => {
      setShowFail(false);
      router.replace({ pathname: '/quiz', params: { mode: 'practice', ids: wrongQuestionIds.join(',') } });
    };
    return (
      <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="gap-3 p-3">
        <Stack.Screen options={{ headerRight: () => null }} />
        <ResultSummary
          result={result}
          answered={Object.keys(picked).length}
          isExam={isExam}
          timeText={isExam ? (timedOut ? 'Hết giờ' : `Làm trong ${formatTime(rules.durationSec - timeLeft)}`) : undefined}
          timedOut={timedOut}
          onBack={() => router.back()}
          onReview={isExam && wrongQuestionIds.length > 0 ? reviewWrong : undefined}
        />
        {isExam ? <WrongAnswers questions={questions} picked={picked} /> : null}
        <PassCelebration
          visible={showPass}
          correct={result.correct}
          total={result.total}
          onClose={() => setShowPass(false)}
        />
        <FailEncouragement
          visible={showFail}
          correct={result.correct}
          total={result.total}
          passCount={result.passCount}
          criticalFailed={result.criticalFailed}
          onClose={() => setShowFail(false)}
          onReview={reviewWrong}
        />
      </ScrollView>
    );
  }

  const question = questions[index];
  if (!question) return null;
  const isLast = index === questions.length - 1;
  const answered = picked[question.id] !== undefined;
  const showAnswer = answered && (!isExam || examReveal === 'instant');
  const answeredCount = Object.keys(picked).length;

  return (
    <GestureDetector gesture={pan}>
      <View style={{ flex: 1 }}>
        <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="gap-3 p-3">
          {isExam ? (
            <Stack.Screen
              options={{
                headerRight: () => (
                  <Pressable
                    onPress={() => setDialog('finish')}
                    accessibilityLabel="Kết thúc thi"
                    hitSlop={6}
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, marginRight: 12 })}
                  >
                    <View className="h-9 flex-row items-center gap-1.5 rounded-full bg-red-50 px-3">
                      <Ionicons name="flag" size={16} color="#dc2626" />
                      <Text className="text-sm font-semibold text-red-600">Kết thúc thi</Text>
                    </View>
                  </Pressable>
                ),
              }}
            />
          ) : null}
          <QuizProgress
            current={index + 1}
            total={questions.length}
            answered={answeredCount}
            timeLeft={isExam ? timeLeft : undefined}
          />
          <QuestionCard
            question={question}
            selected={picked[question.id]}
            showAnswer={showAnswer}
            onSelect={(choice) => {
              if (swipingRef.current) return;
              setPicked((p) => ({ ...p, [question.id]: choice }));
            }}
          />
          <HintBox
            question={question}
            answered={answered}
            allowMemo={!isExam || examReveal === 'instant'}
            open={hintOpen[question.id] ?? false}
            onToggle={() => setHintOpen((h) => ({ ...h, [question.id]: !h[question.id] }))}
          />
          <View className="flex-row gap-3">
            <AppButton
              flex
              variant="secondary"
              label="Câu trước"
              icon="chevron-back"
              disabled={index === 0}
              onPress={() => setIndex((i) => i - 1)}
            />
            <AppButton
              flex
              label={isLast ? 'Nộp bài' : 'Câu sau'}
              icon={isLast ? 'checkmark-done' : 'chevron-forward'}
              onPress={() => (isLast ? submit() : setIndex((i) => i + 1))}
            />
          </View>
          <ExitExamDialog
            visible={dialog !== null}
            intent={dialog ?? 'exit'}
            answered={answeredCount}
            total={questions.length}
            timeLeft={timeLeft}
            canSave={fixedExamId !== undefined}
            onFinish={() => submit()}
            onSaveAndExit={() => {
              if (fixedExamId !== undefined) {
                saveExamDraft(fixedExamId, { picked, index, remainingSec: timeLeft });
              }
              setDialog(null);
              setAllowLeave(true);
              const leave = pendingLeave.current;
              if (leave) leave();
              else router.back();
            }}
            onContinue={() => setDialog(null)}
          />
          <Text className="text-center text-xs text-slate-400">Vuốt sang trái hoặc phải để chuyển câu</Text>
        </ScrollView>
      </View>
    </GestureDetector>
  );
};

export default QuizScreen;
