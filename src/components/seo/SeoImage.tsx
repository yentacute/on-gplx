import { Image, type ImageSourcePropType } from 'react-native';

/** `lazy` defers loading on web; native lists already render lazily. */
type Props = { source: ImageSourcePropType; alt: string; aspectRatio: number; maxHeight: number; lazy?: boolean };

/** Content image. On web it is a real <img> with alt text so search engines index it. */
export const SeoImage = ({ source, alt, aspectRatio, maxHeight }: Props) => (
  <Image
    source={source}
    accessibilityLabel={alt}
    resizeMode="contain"
    style={{ width: '100%', maxHeight, aspectRatio }}
  />
);
