import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import {
  ActionLink,
  Card,
  ContentPage,
  LinkChips,
  PageHeading,
  Paragraph,
  SectionHeading,
} from '@/components/seo/ContentPage';
import { SeoImage } from '@/components/seo/SeoImage';
import { SIGNS } from '@/data';
import { SIGN_GROUP_LABEL } from '@/data/signGroups';
import { SIGN_IMAGES } from '@/data/signImages';
import { signBySlug, signImageUri, signLabel, signsInGroup } from '@/seo/catalog';
import { dynamicRouteMetadata } from '@/seo/pages';
import { paths, slugify } from '@/seo/slugs';
import { signJsonLd } from '@/seo/structuredData';

const SignPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sign = signBySlug(id);
  if (!sign) return <Text className="p-4 text-center text-slate-600">Không tìm thấy biển báo.</Text>;

  const label = signLabel(sign);
  const group = SIGN_GROUP_LABEL[sign.group];
  const path = paths.sign(sign);
  const image = sign.image ? SIGN_IMAGES[sign.image] : undefined;
  const siblings = signsInGroup(sign);
  const index = siblings.indexOf(sign);
  const prev = siblings[index - 1];
  const next = siblings[index + 1];
  const related = siblings.filter((s) => s !== sign).slice(Math.max(0, index - 4), Math.max(0, index - 4) + 8);

  return (
    <>
      <ContentPage
        trail={[
          { name: 'Biển báo giao thông', path: '/signs' },
          { name: sign.group === 'vachke' ? sign.name : `Biển ${sign.id}`, path },
        ]}
        jsonLd={[signJsonLd(sign, label, path, signImageUri(sign))]}
      >
        <Card>
          <Text className="text-xs font-medium uppercase text-slate-500">
            {group} · {index + 1}/{siblings.length}
          </Text>
          <PageHeading>{label}</PageHeading>
          {image ? (
            <View className="items-center rounded-2xl bg-slate-50 p-4">
              <SeoImage source={image} alt={label} aspectRatio={1} maxHeight={180} />
            </View>
          ) : null}
          <SectionHeading>Ý nghĩa</SectionHeading>
          <Paragraph>{sign.meaning || sign.name}</Paragraph>
          <Paragraph>
            {sign.group === 'vachke'
              ? 'Vạch kẻ đường là một loại báo hiệu đường bộ theo QCVN 41, dùng để phân chia làn, hướng đi và vị trí dừng xe.'
              : `${label} thuộc nhóm ${group.toLowerCase()} trong Quy chuẩn kỹ thuật quốc gia về báo hiệu đường bộ QCVN 41.`}{' '}
            Các câu hỏi về biển báo nằm ở chương V của bộ 600 câu lý thuyết lái xe.
          </Paragraph>
        </Card>

        <View className="flex-row gap-3">
          {prev ? <ActionLink href={paths.sign(prev)} label={`← ${prev.group === 'vachke' ? 'Trước' : prev.id}`} /> : null}
          {next ? <ActionLink href={paths.sign(next)} label={`${next.group === 'vachke' ? 'Tiếp' : next.id} →`} primary /> : null}
        </View>

        {related.length > 0 ? (
          <Card>
            <SectionHeading>Cùng nhóm {group.toLowerCase()}</SectionHeading>
            <LinkChips links={related.map((s) => ({ name: signLabel(s), path: paths.sign(s) }))} />
          </Card>
        ) : null}

        <Card>
          <SectionHeading>Ôn câu hỏi biển báo</SectionHeading>
          <View className="flex-row gap-3">
            <ActionLink href={paths.chapter('Chương V. Báo hiệu đường bộ')} label="Câu hỏi biển báo" primary />
            <ActionLink href="/signs" label="Tất cả biển báo" />
          </View>
        </Card>
      </ContentPage>
    </>
  );
};

export const generateStaticParams = () => SIGNS.map((s) => ({ id: slugify(s.id) }));

export const generateMetadata = dynamicRouteMetadata((id) => `/bien-bao/${id}`, 'id');

export default SignPage;
