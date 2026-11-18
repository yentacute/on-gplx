import { Ionicons } from '@expo/vector-icons';
import { type Href, Link, useRouter } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useQuestions } from '@/api/queries';
import { LinkChips } from '@/components/seo/ContentPage';
import { classHasQuestions } from '@/data';
import { LICENSE_CLASSES } from '@/data/licenseClasses';
import { LANDING_CLASSES } from '@/seo/catalog';
import { faqStructuredData, HOME_FAQ } from '@/seo/homeFaq';
import { JsonLd } from '@/seo/JsonLd';
import { routeMetadata } from '@/seo/pages';
import { paths } from '@/seo/slugs';
import { useSettings } from '@/store/settings';
import type { LicenseClass, LicenseClassId } from '@/types';

type IconName = ComponentProps<typeof Ionicons>['name'];

const SHORTCUTS: { href: Href; title: string; icon: IconName; color: string }[] = [
  { href: '/practice', title: 'Ôn tập', icon: 'book', color: '#2563eb' },
  { href: '/exam', title: 'Thi thử', icon: 'timer', color: '#7c3aed' },
  { href: '/signs', title: 'Biển báo', icon: 'warning', color: '#ea580c' },
];

const GUIDE_LINKS: { href: Href; label: string }[] = [
  { href: '/600-cau-hoi', label: '600 câu hỏi có đáp án' },
  { href: '/cau-diem-liet', label: '60 câu điểm liệt' },
  { href: '/practice', label: 'Ôn tập 600 câu' },
  { href: '/exam', label: 'Thi thử có chấm điểm' },
  { href: '/topics', label: 'Ôn theo chương' },
  { href: '/signs', label: 'Biển báo giao thông' },
  { href: '/tips', label: 'Mẹo thi lý thuyết' },
];

const FAQ_JSON_LD = JSON.stringify(faqStructuredData(HOME_FAQ));

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Text role="heading" aria-level={2} className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{children}</Text>
);

const HeroStat = ({
  value,
  label,
  icon,
  color,
}: {
  value: number | string;
  label: string;
  icon: IconName;
  color: string;
}) => (
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

type LicenseRowProps = { item: LicenseClass; active: boolean; onPress: () => void };

/** One license class: code, name, scope on one line, and its exam structure on the right. */
const LicenseRow = ({ item, active, onPress }: LicenseRowProps) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }}>
    <View
      className={
        'flex-row items-center gap-3 rounded-2xl border px-3 py-2.5 ' +
        (active ? 'border-primary bg-primary-light' : 'border-slate-200 bg-white')
      }
    >
      <View className={'h-10 w-11 items-center justify-center rounded-xl ' + (active ? 'bg-primary' : 'bg-slate-100')}>
        <Text className={'text-sm font-bold ' + (active ? 'text-white' : 'text-slate-700')}>{item.id}</Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-[15px] font-semibold text-slate-900" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-xs text-slate-500" numberOfLines={1}>
          Từ {item.minAge} tuổi · {item.description}
        </Text>
      </View>
      <View className="items-end">
        <Text className={'text-sm font-bold ' + (active ? 'text-primary' : 'text-slate-800')}>
          {item.exam.questionCount} câu
        </Text>
        <Text className="text-xs text-slate-500">
          {item.exam.timeMinutes} phút · đạt {item.exam.passingScore}
        </Text>
      </View>
    </View>
  </Pressable>
);

/** Placeholder for classes whose question set is not bundled yet. */
const LockedClasses = ({ classes }: { classes: LicenseClass[] }) => (
  <View className="flex-row items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-3">
    <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
    <View className="flex-1 gap-0.5">
      <Text className="text-sm font-semibold text-slate-700">{classes.map((c) => c.id).join(', ')} · sắp có</Text>
      <Text className="text-xs text-slate-500">Đang bổ sung bộ câu hỏi riêng cho xe mô tô</Text>
    </View>
  </View>
);

/** Intro and FAQ about the theory test: readable help for learners and indexable text for search. */
const HomeGuide = () => (
  <View className="gap-3">
    <JsonLd data={FAQ_JSON_LD} />
    <SectionTitle>Ôn thi lý thuyết lái xe miễn phí</SectionTitle>
    <View className="gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <Text className="text-sm leading-6 text-slate-700">
        Ôn tập đủ 600 câu hỏi lý thuyết lái xe ô tô hạng B, C1, C, D1, D2, D và các hạng kéo rơ-moóc. Mỗi câu có đáp
        án và giải thích, đánh dấu riêng 60 câu điểm liệt. Thi thử theo đúng số câu, thời gian và điểm đạt của từng
        hạng, xem lại câu sai và tra cứu biển báo giao thông. Miễn phí, không cần đăng ký.
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {GUIDE_LINKS.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="rounded-full bg-primary-light px-3 py-1.5 text-sm font-medium text-primary"
          >
            {l.label}
          </Link>
        ))}
      </View>
    </View>

    <SectionTitle>Thi thử theo hạng bằng</SectionTitle>
    <LinkChips links={LANDING_CLASSES.map((c) => ({ name: `Thi thử hạng ${c.id}`, path: paths.licenseClass(c.id) }))} />

    <SectionTitle>Câu hỏi thường gặp</SectionTitle>
    <View className="gap-2">
      {HOME_FAQ.map(({ question, answer }) => (
        <View key={question} className="gap-1 rounded-2xl border border-slate-200 bg-white p-4">
          <Text role="heading" aria-level={3} className="text-[15px] font-semibold text-slate-900">
            {question}
          </Text>
          <Text className="text-sm leading-6 text-slate-600">{answer}</Text>
        </View>
      ))}
    </View>
  </View>
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

  const renderClasses = (classes: LicenseClass[]) => {
    const open = classes.filter((c) => classHasQuestions(c.id));
    const locked = classes.filter((c) => !classHasQuestions(c.id));
    return (
      <View className="gap-2">
        {open.map((c) => (
          <LicenseRow key={c.id} item={c} active={c.id === licenseClass} onPress={() => chooseClass(c.id)} />
        ))}
        {locked.length > 0 ? <LockedClasses classes={locked} /> : null}
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="gap-3 p-3">
      <View className="gap-3 rounded-3xl bg-primary p-4">
        <View className="gap-1">
          <Text role="heading" aria-level={1} className="text-sm font-medium text-white/80">
            Ôn thi lý thuyết lái xe GPLX
          </Text>
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
            <Link href={s.href} asChild>
              <Pressable>
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
            </Link>
          </View>
        ))}
      </View>

      <SectionTitle>Hạng ô tô</SectionTitle>
      {renderClasses(carClasses)}
      <SectionTitle>Hạng mô tô</SectionTitle>
      {renderClasses(motoClasses)}

      <HomeGuide />
    </ScrollView>
  );
};

export const generateMetadata = routeMetadata('/');

export default HomeScreen;
