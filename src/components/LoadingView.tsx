import { ActivityIndicator, Text, View } from 'react-native';

export const LoadingView = ({ message = 'Đang tải…' }: { message?: string }) => (
  <View className="flex-1 items-center justify-center gap-4 bg-slate-50 p-6">
    <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-light">
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
    <Text className="text-base font-medium text-slate-500">{message}</Text>
  </View>
);
