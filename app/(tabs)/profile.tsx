import type { ReactNode } from 'react';
import { ScrollView, Text } from 'react-native';
import { MenuCard } from '@/components/MenuCard';
import { LICENSE_CLASSES } from '@/data/licenseClasses';
import { useResetProgress } from '@/hooks/useResetProgress';
import { useSettings } from '@/store/settings';

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Text className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{children}</Text>
);

const ProfileScreen = () => {
  const { licenseClass, version, wrongIds } = useSettings();
  const current = LICENSE_CLASSES.find((c) => c.id === licenseClass);
  const resetProgress = useResetProgress();

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="gap-3 p-3">
      <SectionTitle>Thông tin</SectionTitle>
      <MenuCard
        title="Hạng bằng"
        description={
          current
            ? `${current.title} · đề ${current.exam.questionCount} câu, đạt ${current.exam.passingScore}/${current.exam.questionCount}`
            : undefined
        }
        icon="card"
        color="#2563eb"
        badge={licenseClass}
      />
      <MenuCard
        title="Loại đề"
        description={version === 'new' ? 'Từ 01/01/2025' : 'Trước 01/01/2025'}
        icon="document-text"
        color="#7c3aed"
        badge={version === 'new' ? 'Đề mới' : 'Đề cũ'}
      />
      <MenuCard
        title="Câu đã sai"
        description="Số câu cần ôn lại"
        icon="close-circle"
        color="#ea580c"
        badge={`${wrongIds.length} câu`}
      />
      <SectionTitle>Cài đặt</SectionTitle>
      <MenuCard
        title="Xóa tiến trình học"
        description="Xóa câu đã sai và lựa chọn đã lưu"
        icon="trash"
        color="#dc2626"
        onPress={resetProgress}
      />
    </ScrollView>
  );
};

export default ProfileScreen;
