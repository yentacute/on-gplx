import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { type Href, Link } from 'expo-router';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSigns } from '@/api/queries';
import { LoadingView } from '@/components/LoadingView';
import { SignDetailModal } from '@/components/SignDetailModal';
import { SeoImage } from '@/components/seo/SeoImage';
import { SIGN_GROUP_LABEL, SIGN_GROUP_ORDER } from '@/data/signGroups';
import { SIGN_IMAGES } from '@/data/signImages';
import { signLabel } from '@/seo/catalog';
import { routeMetadata } from '@/seo/pages';
import { paths } from '@/seo/slugs';
import type { SignGroup, TrafficSign } from '@/types';

const GROUP_LABEL = SIGN_GROUP_LABEL;
const GROUP_ORDER = SIGN_GROUP_ORDER;

/** Short group names for the filter chips. */
const GROUP_SHORT: Record<SignGroup, string> = {
  nguyhiem: 'Nguy hiểm',
  cam: 'Cấm',
  hieulenh: 'Hiệu lệnh',
  chidan: 'Chỉ dẫn',
  phu: 'Biển phụ',
  vachke: 'Vạch kẻ',
};

const FilterChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }}>
    <View
      className={
        'h-9 items-center justify-center rounded-full border px-3.5 ' +
        (active ? 'border-primary bg-primary' : 'border-slate-200 bg-white')
      }
    >
      <Text className={'text-sm font-semibold ' + (active ? 'text-white' : 'text-slate-700')}>{label}</Text>
    </View>
  </Pressable>
);

type SignRowProps = { sign: TrafficSign; first: boolean; onPress: () => void };

/** One sign: picture, code, name and meaning. Opens the detail dialog; on web the name also links to its page. */
const SignRow = ({ sign, first, onPress }: SignRowProps) => {
  const image = sign.image ? SIGN_IMAGES[sign.image] : undefined;
  const name =
    Platform.OS === 'web' ? (
      // A real link so search engines reach each sign's own page; the row still opens the dialog.
      <Link href={paths.sign(sign) as Href} onPress={(e) => e.stopPropagation()}>
        {sign.name}
      </Link>
    ) : (
      sign.name
    );
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ backgroundColor: pressed ? '#f8fafc' : '#ffffff' })}
      className={'flex-row items-center gap-3 px-3 py-3 ' + (first ? '' : 'border-t border-slate-100')}
    >
      <View className="h-16 w-16 items-center justify-center rounded-xl bg-slate-50 p-1.5">
        {image ? <SeoImage source={image} alt={signLabel(sign)} aspectRatio={1} maxHeight={52} lazy /> : null}
      </View>
      <View className="flex-1 gap-0.5">
        {sign.group === 'vachke' ? null : (
          <Text className="text-xs font-semibold text-primary">{sign.id}</Text>
        )}
        <Text className="text-[15px] font-semibold leading-5 text-slate-900">{name}</Text>
        {sign.meaning ? (
          <Text className="text-[13px] leading-[18px] text-slate-500" numberOfLines={2}>
            {sign.meaning}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </Pressable>
  );
};

const SignsScreen = () => {
  const { data, isLoading, isError, refetch } = useSigns();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SignGroup | 'all'>('all');

  const signsByGroup = useMemo(
    () => GROUP_ORDER.map((group) => ({ group, signs: (data ?? []).filter((s) => s.group === group) })),
    [data],
  );

  const selection = useMemo(() => {
    if (!selectedId) return null;
    for (const { group, signs } of signsByGroup) {
      const index = signs.findIndex((s) => s.id === selectedId);
      if (index >= 0) return { group, signs, index };
    }
    return null;
  }, [selectedId, signsByGroup]);

  if (isLoading) return <LoadingView message="Đang tải biển báo…" />;
  if (isError || !data) {
    return (
      <Text className="mt-10 text-center text-danger" onPress={() => refetch()}>
        Không tải được dữ liệu. Chạm để thử lại.
      </Text>
    );
  }

  const visibleGroups = signsByGroup.filter(({ group, signs }) => signs.length > 0 && (filter === 'all' || filter === group));

  return (
    <>
      <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="gap-3 pb-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-3 pt-3"
        >
          <FilterChip label={`Tất cả · ${data.length}`} active={filter === 'all'} onPress={() => setFilter('all')} />
          {signsByGroup.map(({ group, signs }) =>
            signs.length > 0 ? (
              <FilterChip
                key={group}
                label={`${GROUP_SHORT[group]} · ${signs.length}`}
                active={filter === group}
                onPress={() => setFilter(group)}
              />
            ) : null,
          )}
        </ScrollView>

        {visibleGroups.map(({ group, signs }) => (
          <View key={group} className="gap-2 px-3">
            <Text role="heading" aria-level={2} className="mt-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {GROUP_LABEL[group]} ({signs.length})
            </Text>
            <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {signs.map((sign, i) => (
                <SignRow key={sign.id} sign={sign} first={i === 0} onPress={() => setSelectedId(sign.id)} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <SignDetailModal
        sign={selection ? selection.signs[selection.index] : null}
        groupLabel={selection ? GROUP_LABEL[selection.group] : ''}
        position={selection ? selection.index + 1 : 0}
        groupSize={selection?.signs.length ?? 0}
        onPrev={
          selection && selection.index > 0 ? () => setSelectedId(selection.signs[selection.index - 1].id) : undefined
        }
        onNext={
          selection && selection.index < selection.signs.length - 1
            ? () => setSelectedId(selection.signs[selection.index + 1].id)
            : undefined
        }
        onClose={() => setSelectedId(null)}
      />
    </>
  );
};

export const generateMetadata = routeMetadata('/signs');

export default SignsScreen;
