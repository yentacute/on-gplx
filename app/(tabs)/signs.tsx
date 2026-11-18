import { List } from '@ant-design/react-native';
import { useMemo, useState } from 'react';
import { type Href, Link } from 'expo-router';
import { Platform, ScrollView, Text, View } from 'react-native';
import { useSigns } from '@/api/queries';
import { LoadingView } from '@/components/LoadingView';
import { SignDetailModal } from '@/components/SignDetailModal';
import { SeoImage } from '@/components/seo/SeoImage';
import { SIGN_GROUP_LABEL, SIGN_GROUP_ORDER } from '@/data/signGroups';
import { SIGN_IMAGES } from '@/data/signImages';
import { signLabel } from '@/seo/catalog';
import { routeMetadata } from '@/seo/pages';
import { paths } from '@/seo/slugs';

const GROUP_LABEL = SIGN_GROUP_LABEL;
const GROUP_ORDER = SIGN_GROUP_ORDER;

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
                        <View style={{ width: 80, height: 64, justifyContent: 'center' }} className="mr-3">
                          <SeoImage source={image} alt={signLabel(sign)} aspectRatio={1.25} maxHeight={64} lazy />
                        </View>
                      ) : null
                    }
                  >
                    {Platform.OS === 'web' ? (
                      // A real link so search engines reach each sign's own page; the row still opens the dialog.
                      <Link href={paths.sign(sign) as Href} onPress={(e) => e.stopPropagation()}>
                        {sign.name}
                      </Link>
                    ) : (
                      sign.name
                    )}
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

export const generateMetadata = routeMetadata('/signs');

export default SignsScreen;
