import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';
import { formatTime } from '@/lib/exam';
import { AppButton } from './AppButton';

type Props = {
  visible: boolean;
  /** finish: the user tapped "Kết thúc thi" · exit: the user tried to leave the screen */
  intent: 'finish' | 'exit';
  answered: number;
  total: number;
  timeLeft: number;
  /** Only fixed exams can be saved and resumed. */
  canSave: boolean;
  onFinish: () => void;
  onSaveAndExit: () => void;
  onContinue: () => void;
};

export const ExitExamDialog = ({
  visible,
  intent,
  answered,
  total,
  timeLeft,
  canSave,
  onFinish,
  onSaveAndExit,
  onContinue,
}: Props) => {
  const isFinish = intent === 'finish';
  const showSave = canSave && !isFinish;
  const unanswered = total - answered;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(15,23,42,0.55)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View className="w-full max-w-[360px] gap-4 rounded-3xl bg-white p-5">
          <View className="items-center gap-2">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <Ionicons name={isFinish ? 'flag' : 'exit-outline'} size={28} color="#d97706" />
            </View>
            <Text className="text-lg font-semibold text-slate-900">
              {isFinish ? 'Kết thúc bài thi?' : 'Thoát bài thi?'}
            </Text>
            <Text className="text-center text-sm text-slate-500">
              Đã làm {answered}/{total} câu · còn {formatTime(timeLeft)}
            </Text>
            {isFinish && unanswered > 0 ? (
              <Text className="text-center text-sm font-medium text-red-600">
                Còn {unanswered} câu chưa trả lời, sẽ bị tính là sai.
              </Text>
            ) : null}
          </View>

          <View className="gap-2.5">
            <AppButton label="Kết thúc thi và chấm điểm" icon="checkmark-done" onPress={onFinish} />
            {showSave ? (
              <AppButton variant="secondary" label="Tạm lưu và thoát" icon="bookmark-outline" onPress={onSaveAndExit} />
            ) : null}
            <Pressable onPress={onContinue} className="h-10 items-center justify-center">
              <Text className="text-sm font-semibold text-slate-500">Tiếp tục làm bài</Text>
            </Pressable>
          </View>

          {showSave ? (
            <Text className="text-center text-xs text-slate-400">
              Tạm lưu giữ lại câu đã chọn và thời gian còn lại, mở lại đề để làm tiếp.
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};
