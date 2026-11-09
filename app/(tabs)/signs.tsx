import { List } from '@ant-design/react-native';
import { useMemo, useState } from 'react';
import { Image, ScrollView, Text } from 'react-native';
import { useSigns } from '@/api/queries';
import { LoadingView } from '@/components/LoadingView';
import { SignDetailModal } from '@/components/SignDetailModal';
import { SIGN_IMAGES } from '@/data/signImages';
import type { SignGroup } from '@/types';

const GROUP_LABEL: Record<SignGroup, string> = {
  nguyhiem: 'Biển báo nguy hiểm',
  cam: 'Biển báo cấm',
  hieulenh: 'Biển hiệu lệnh',
  chidan: 'Biển chỉ dẫn',
  phu: 'Biển phụ',
  vachke: 'Vạch kẻ đường',
};

const GROUP_ORDER = Object.keys(GROUP_LABEL) as SignGroup[];

const SignsScreen = () => {
  const { data, isLoading, isError, refetch } = useSigns();
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  return (
    <>
      <ScrollView className="flex-1 bg-slate-50">
        {signsByGroup.map(({ group, signs }) => {
          if (signs.length === 0) return null;
          return (
            <List key={group} renderHeader={`${GROUP_LABEL[group]} (${signs.length})`}>
              {signs.map((sign) => {
                const image = sign.image ? SIGN_IMAGES[sign.image] : undefined;
                return (
                  <List.Item
                    key={sign.id}
                    multipleLine
                    wrap
                    arrow="horizontal"
                    onPress={() => setSelectedId(sign.id)}
                    thumb={
                      image ? (
                        <Image source={image} resizeMode="contain" style={{ width: 80, height: 64 }} className="mr-3" />
                      ) : null
                    }
                  >
                    {sign.name}
                    {sign.meaning ? <List.Item.Brief wrap>{sign.meaning}</List.Item.Brief> : null}
                  </List.Item>
                );
              })}
            </List>
          );
        })}
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

export default SignsScreen;
