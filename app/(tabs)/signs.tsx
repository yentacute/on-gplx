import { List } from '@ant-design/react-native';
import { Image, ScrollView, Text } from 'react-native';
import { useSigns } from '@/api/queries';
import { LoadingView } from '@/components/LoadingView';
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

  if (isLoading) return <LoadingView message="Đang tải biển báo…" />;
  if (isError || !data) {
    return (
      <Text className="mt-10 text-center text-danger" onPress={() => refetch()}>
        Không tải được dữ liệu. Chạm để thử lại.
      </Text>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {GROUP_ORDER.map((group) => {
        const signs = data.filter((s) => s.group === group);
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
  );
};

export default SignsScreen;
