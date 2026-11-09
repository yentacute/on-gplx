import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type ComponentProps, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { TIP_SECTIONS } from '@/data/tips';
import type { Tip, TipPoint, TipSection, TipStat } from '@/types';

type IconName = ComponentProps<typeof Ionicons>['name'];

const POINT_ICONS: Partial<Record<NonNullable<TipPoint['kind']>, { name: IconName; color: string }>> = {
  do: { name: 'checkmark-circle', color: '#16a34a' },
  dont: { name: 'close-circle', color: '#dc2626' },
};

const SectionChip = ({ section, active, onPress }: { section: TipSection; active: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress}>
    <View
      className="h-10 flex-row items-center gap-1.5 rounded-full border px-3.5"
      style={{ backgroundColor: active ? section.color : '#ffffff', borderColor: active ? section.color : '#e2e8f0' }}
    >
      <Ionicons name={section.icon as IconName} size={16} color={active ? '#ffffff' : section.color} />
      <Text className="text-sm font-semibold" style={{ color: active ? '#ffffff' : '#334155' }}>
        {section.short}
      </Text>
    </View>
  </Pressable>
);

const StatBar = ({ stat, color }: { stat: TipStat; color: string }) => (
  <View className="gap-1">
    <View className="flex-row items-baseline justify-between gap-2">
      <Text className="flex-1 text-xs text-slate-600">{stat.label}</Text>
      <Text className="text-sm font-bold" style={{ color }}>
        {stat.value}%
      </Text>
    </View>
    <View className="h-2 overflow-hidden rounded-full bg-white/70">
      <View className="h-2 rounded-full" style={{ width: `${Math.max(stat.value, 2)}%`, backgroundColor: color }} />
      {stat.chance !== undefined ? (
        <View
          style={{ position: 'absolute', left: `${stat.chance}%`, top: 0, bottom: 0, width: 2, backgroundColor: '#475569' }}
        />
      ) : null}
    </View>
    <Text className="text-[11px] text-slate-500">
      {stat.detail}
      {stat.chance !== undefined ? ` · ngẫu nhiên ≈ ${stat.chance}%` : ''}
    </Text>
  </View>
);

const PointRow = ({ point, color }: { point: TipPoint; color: string }) => {
  const icon = point.kind ? POINT_ICONS[point.kind] : undefined;
  // Bold a short "Label:" prefix when the text has one.
  const colon = point.text.indexOf(':');
  const label = colon > 0 && colon < 40 ? point.text.slice(0, colon + 1) : null;
  const body = label ? point.text.slice(colon + 1) : point.text;

  return (
    <View className="flex-row items-start gap-2.5">
      {icon ? (
        <Ionicons name={icon.name} size={18} color={icon.color} style={{ marginTop: 2 }} />
      ) : (
        <View className="mt-[9px] h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color, marginHorizontal: 6 }} />
      )}
      <Text className="flex-1 text-sm leading-6 text-slate-700">
        {label ? (
          <Text className="font-bold" style={{ color }}>
            {label}
          </Text>
        ) : null}
        {body}
      </Text>
    </View>
  );
};

type TipCardProps = {
  tip: Tip;
  index: number;
  color: string;
  open: boolean;
  onToggle: () => void;
  onPractice: (questionIds: number[]) => void;
};

const TipCard = ({ tip, index, color, open, onToggle, onPractice }: TipCardProps) => (
  <View
    className="overflow-hidden rounded-2xl border bg-white"
    style={{ borderColor: open ? color : '#e2e8f0', borderLeftWidth: open ? 4 : 1 }}
  >
    <Pressable onPress={onToggle}>
      <View className="flex-row items-center gap-3 p-3" style={open ? { backgroundColor: `${color}14` } : undefined}>
        <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${color}1a` }}>
          <Text className="text-sm font-bold" style={{ color }}>
            {index + 1}
          </Text>
        </View>
        <Text className="flex-1 text-base font-semibold text-slate-900">{tip.title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={open ? color : '#94a3b8'} />
      </View>
    </Pressable>
    {open ? (
      <View className="gap-3 p-3 pt-3">
        <View className="flex-row gap-2 rounded-xl p-3" style={{ backgroundColor: `${color}12` }}>
          <Ionicons name="bulb" size={18} color={color} />
          <Text className="flex-1 text-sm font-semibold leading-5" style={{ color: '#0f172a' }}>
            {tip.takeaway}
          </Text>
        </View>
        {tip.stats ? (
          <View className="gap-3 rounded-xl p-3" style={{ backgroundColor: `${color}0d` }}>
            {tip.stats.map((stat) => (
              <StatBar key={stat.label} stat={stat} color={color} />
            ))}
          </View>
        ) : null}
        {tip.points ? (
          <View className="gap-3.5 rounded-xl p-3" style={{ backgroundColor: `${color}0d` }}>
            {tip.points.map((point) => (
              <PointRow key={point.text} point={point} color={color} />
            ))}
          </View>
        ) : null}
        {tip.questions ? (
          <Pressable onPress={() => onPractice(tip.questions ?? [])}>
            <View className="flex-row items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5">
              <Text className="flex-1 text-xs text-slate-500" numberOfLines={1}>
                Câu {tip.questions.join(', ')}
              </Text>
              <View className="flex-row items-center gap-1">
                <Text className="text-sm font-semibold" style={{ color }}>
                  Luyện {tip.questions.length} câu
                </Text>
                <Ionicons name="chevron-forward" size={16} color={color} />
              </View>
            </View>
          </Pressable>
        ) : null}
      </View>
    ) : null}
  </View>
);

const firstTipTitle = (sectionId: string) =>
  TIP_SECTIONS.find((s) => s.id === sectionId)?.tips[0]?.title ?? null;

const TipsScreen = () => {
  const router = useRouter();
  const [sectionId, setSectionId] = useState(TIP_SECTIONS[0]?.id ?? '');
  const [openTitle, setOpenTitle] = useState<string | null>(firstTipTitle(sectionId));
  const section = TIP_SECTIONS.find((s) => s.id === sectionId) ?? TIP_SECTIONS[0];

  const selectSection = (id: string) => {
    setSectionId(id);
    setOpenTitle(firstTipTitle(id));
  };

  const practice = (questionIds: number[]) =>
    router.push({ pathname: '/quiz', params: { mode: 'practice', ids: questionIds.join(',') } });

  if (!section) return null;

  return (
    <View className="flex-1 bg-slate-50">
      <View className="border-b border-slate-200 bg-white">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-3 py-2.5">
          {TIP_SECTIONS.map((s) => (
            <SectionChip key={s.id} section={s} active={s.id === sectionId} onPress={() => selectSection(s.id)} />
          ))}
        </ScrollView>
      </View>
      <ScrollView key={section.id} contentContainerClassName="gap-3 p-3 pb-8">
        <View className="flex-row items-center gap-3 rounded-2xl p-3" style={{ backgroundColor: section.color }}>
          <View className="h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <Ionicons name={section.icon as IconName} size={22} color="#ffffff" />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-lg font-semibold text-white">{section.title}</Text>
            <Text className="text-sm text-white/85">
              {section.summary} · {section.tips.length} mẹo
            </Text>
          </View>
        </View>
        {section.tips.map((tip, index) => (
          <TipCard
            key={tip.title}
            tip={tip}
            index={index}
            color={section.color}
            open={openTitle === tip.title}
            onToggle={() => setOpenTitle((current) => (current === tip.title ? null : tip.title))}
            onPractice={practice}
          />
        ))}
        <Text className="px-2 text-center text-xs leading-5 text-slate-400">
          Tỉ lệ đếm trên 600 câu trong app, chỉ là xu hướng. Vạch xám trên thanh là mức đúng nếu chọn ngẫu nhiên.
        </Text>
      </ScrollView>
    </View>
  );
};

export default TipsScreen;
