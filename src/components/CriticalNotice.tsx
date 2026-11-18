import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { INTER } from '@/theme/inter';

const RED = '#dc2626';

/** Warns that a question is "điểm liệt": answering it wrong fails the exam regardless of score. */
export const CriticalNotice = () => (
  <View
    accessibilityRole="alert"
    className="flex-row items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-2.5 py-2"
  >
    <Ionicons name="warning" size={18} color={RED} />
    <Text style={{ fontFamily: INTER.regular }} className="flex-1 text-[13px] font-normal leading-5 text-red-800">
      <Text style={{ fontFamily: INTER.semibold }} className="font-semibold text-red-700">
        Câu điểm liệt
      </Text>
      {' · Trả lời sai là trượt, dù đủ điểm.'}
    </Text>
  </View>
);
