import { Tag } from '@ant-design/react-native';
import { useState } from 'react';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { QUESTION_IMAGES } from '@/data/questionImages';
import { tagColor } from '@/lib/tagColor';
import { INTER } from '@/theme/inter';
import type { Question } from '@/types';

type Props = {
  question: Question;
  selected?: number;
  showAnswer: boolean;
  onSelect: (index: number) => void;
};

const IMAGE_GAP = 8;

const optionClass = (index: number, { selected, showAnswer, question }: Props) => {
  if (showAnswer && index === question.answer) return 'border-success bg-green-50';
  if (showAnswer && index === selected) return 'border-danger bg-red-50';
  if (index === selected) return 'border-primary bg-primary-light';
  return 'border-slate-200 bg-white';
};

export const QuestionCard = (props: Props) => {
  const { question, showAnswer, onSelect } = props;
  const { height: screenHeight } = useWindowDimensions();
  const [rowWidth, setRowWidth] = useState(0);
  const images = question.images ?? [];
  // Keep images to about a third of the screen so the options stay visible.
  const maxImageHeight = Math.min(300, Math.round(0.33 * screenHeight));

  return (
    <View className="gap-2.5 rounded-2xl bg-white p-3">
      {question.isCritical ? (
        <View className="self-start">
          <Tag styles={tagColor('#dc2626')}>Câu điểm liệt</Tag>
        </View>
      ) : null}
      <Text className="text-base font-semibold text-slate-900">{question.text}</Text>
      {images.length > 0 ? (
        <View
          className="flex-row items-center justify-center"
          style={{ gap: IMAGE_GAP }}
          onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
        >
          {rowWidth > 0
            ? images.map((key) => {
                const image = QUESTION_IMAGES[key];
                if (!image) return null;
                const slotWidth = (rowWidth - IMAGE_GAP * (images.length - 1)) / images.length;
                const height = Math.min(slotWidth / image.aspectRatio, maxImageHeight);
                return (
                  <Image
                    key={key}
                    source={image.source}
                    resizeMode="contain"
                    style={{ width: Math.floor(height * image.aspectRatio), height: Math.floor(height) }}
                    className="rounded-xl"
                  />
                );
              })
            : null}
        </View>
      ) : null}
      {question.options.map((option, i) => (
        <Pressable
          key={i}
          disabled={showAnswer}
          onPress={() => onSelect(i)}
          className={`rounded-xl border px-3 py-2.5 ${optionClass(i, props)}`}
        >
          <Text style={{ fontFamily: INTER.regular }} className="text-sm font-normal text-slate-800">
            {i + 1}. {option}
          </Text>
        </Pressable>
      ))}
      {showAnswer && question.explanation ? (
        <Text className="text-sm text-slate-600">Giải thích: {question.explanation}</Text>
      ) : null}
    </View>
  );
};
