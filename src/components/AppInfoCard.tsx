import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Linking, Pressable, Text, View } from 'react-native';

type ReferenceSource = {
  label: string;
  url: string;
};

const OFFICIAL_SOURCES: ReferenceSource[] = [
  { label: 'Bộ Công an', url: 'https://bocongan.gov.vn' },
  { label: 'Cục Cảnh sát giao thông', url: 'https://csgt.bocongan.gov.vn' },
  { label: 'Văn bản pháp luật', url: 'https://vbpl.vn' },
];

const DISCLAIMER =
  'Ứng dụng ôn tập độc lập, không liên kết hoặc đại diện cho bất kỳ cơ quan chính phủ nào. ' +
  'Nội dung chỉ mang tính tham khảo, vui lòng đối chiếu với nguồn chính thức ở trên.';

const openUrl = (url: string) => {
  Linking.openURL(url).catch(() => undefined);
};

const SourceRow = ({ label, url }: ReferenceSource) => (
  <Pressable
    accessibilityRole="link"
    accessibilityLabel={`Mở trang ${label}`}
    onPress={() => openUrl(url)}
    className="flex-row items-center justify-between py-2.5"
    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
  >
    <Text className="text-base text-slate-800">{label}</Text>
    <Ionicons name="open-outline" size={18} color="#64748b" />
  </Pressable>
);

export const AppInfoCard = () => {
  const appVersion = Constants.expoConfig?.version;

  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4">
      <View className="flex-row items-center gap-2 border-b border-slate-100 pb-3">
        <Ionicons name="information-circle-outline" size={20} color="#0f172a" />
        <Text className="text-base font-semibold text-slate-900">Thông tin ứng dụng</Text>
        {appVersion ? <Text className="ml-auto text-xs text-slate-400">Phiên bản {appVersion}</Text> : null}
      </View>

      <Text className="mt-3 text-sm font-semibold text-slate-700">Nguồn tham khảo chính thức</Text>
      <View className="mt-1">
        {OFFICIAL_SOURCES.map((source) => (
          <SourceRow key={source.url} {...source} />
        ))}
      </View>

      <View className="mt-2 border-t border-slate-100 pt-3">
        <Text className="text-xs leading-5 text-slate-500">{DISCLAIMER}</Text>
      </View>
    </View>
  );
};
