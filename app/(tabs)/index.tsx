import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useQuestions } from '@/api/queries';
import { LICENSE_CLASSES } from '@/data/licenseClasses';
import { useSettings } from '@/store/settings';
import type { LicenseClass, LicenseClassId } from '@/types';

type IconName = ComponentProps<typeof Ionicons>['name'];

const SHORTCUTS: { href: Href; title: string; icon: IconName; color: string }[] = [
  { href: '/practice', title: 'Ôn tập', icon: 'book', color: '#2563eb' },
  { href: '/exam', title: 'Thi thử', icon: 'timer', color: '#7c3aed' },
  { href: '/signs', title: 'Biển báo', icon: 'warning', color: '#ea580c' },
];

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Text className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{children}</Text>
);

const HeroStat = ({ value, label, icon, color }: { value: number | string; label: string; icon: IconName; color: string }) => (
  <View
    className="flex-1 items-center gap-0.5 rounded-xl border py-2"
    style={{ backgroundColor: `${color}26`, borderColor: `${color}4d` }}
  >
    <View className="flex-row items-center gap-1">
      <Ionicons name={icon} size={14} color={color} />
      <Text className="text-xl font-bold text-white">{value}</Text>
    </View>
    <Text className="text-xs font-medium text-white/80">{label}</Text>
  </View>
);

const LicenseRow = ({ item, active, onPress }: { item: LicenseClass; active: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress}>
    <View
      className={
        'flex-row items-center gap-3 rounded-2xl border-2 px-3 py-2.5 ' +
        (active ? 'border-primary bg-primary-light' : 'border-slate-200 bg-white')
      }
    >
      <View className={'h-11 w-11 items-center justify-center rounded-xl ' + (active ? 'bg-primary' : 'bg-slate-100')}>
        <Text className={'text-base font-bold ' + (active ? 'text-white' : 'text-slate-700')}>{item.id}</Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold text-slate-900">{item.title}</Text>
        <Text className="text-xs text-slate-500">{item.description}</Text>
        <View className="mt-0.5 flex-row flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <Text className="text-xs text-slate-400">Từ {item.minAge} tuổi</Text>
          <Text className="text-xs text-slate-300">·</Text>
          <Text className="text-xs text-slate-400">
            {item.exam.questionCount} câu · {item.exam.timeMinutes} phút · đạt {item.exam.passingScore}/
            {item.exam.questionCount}
          </Text>
        </View>
      </View>
      <Ionicons
        name={active ? 'checkmark-circle' : 'ellipse-outline'}
        size={24}
        color={active ? '#2563eb' : '#cbd5e1'}
      />
    </View>
  </Pressable>
);

const HomeScreen = () => {
  const router = useRouter();
  const { data: questions } = useQuestions();
  const { licenseClass, wrongIds, setLicenseClass } = useSettings();
  const motoClasses = LICENSE_CLASSES.filter((c) => c.group === 'moto');
  const carClasses = LICENSE_CLASSES.filter((c) => c.group === 'car');

  const chooseClass = (id: LicenseClassId) => {
    setLicenseClass(id);
    router.navigate('/practice');
  };

  const renderClasses = (classes: LicenseClass[]) =>
    classes.map((c) => (
      <LicenseRow key={c.id} item={c} active={c.id === licenseClass} onPress={() => chooseClass(c.id)} />
    ));

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="gap-3 p-3">
      <View className="gap-3 rounded-3xl bg-primary p-4">
        <View className="gap-1">
          <Text className="text-sm font-medium text-white/80">Ôn thi lý thuyết GPLX</Text>
          <Text className="text-2xl font-semibold text-white">Hạng {licenseClass}</Text>
        </View>
        <View className="flex-row gap-3">
          <HeroStat value={questions?.length ?? '—'} label="Câu hỏi" icon="document-text" color="#6ee7b7" />
          <HeroStat
            value={questions?.filter((q) => q.isCritical).length ?? '—'}
            label="Điểm liệt"
            icon="alert-circle"
            color="#fca5a5"
          />
          <HeroStat value={wrongIds.length} label="Câu đã sai" icon="close-circle" color="#fcd34d" />
        </View>
      </View>

      <View className="flex-row gap-3">
        {SHORTCUTS.map((s) => (
          <View key={s.title} style={{ flex: 1 }}>
            <Pressable onPress={() => router.navigate(s.href)}>
              <View className="items-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${s.color}1a` }}
                >
                  <Ionicons name={s.icon} size={22} color={s.color} />
                </View>
                <Text className="text-center text-sm font-semibold text-slate-800">{s.title}</Text>
              </View>
            </Pressable>
          </View>
        ))}
      </View>

      <SectionTitle>Hạng bằng lái · Mô tô</SectionTitle>
      <View className="gap-2">{renderClasses(motoClasses)}</View>
      <SectionTitle>Hạng bằng lái · Ô tô</SectionTitle>
      <View className="gap-2">{renderClasses(carClasses)}</View>
    </ScrollView>
  );
};

export default HomeScreen;
