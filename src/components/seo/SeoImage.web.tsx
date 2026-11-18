import type { ImageSourcePropType } from 'react-native';
import { assetUri } from '@/seo/catalog';

type Props = { source: ImageSourcePropType; alt: string; aspectRatio: number; maxHeight: number; lazy?: boolean };

/** Plain <img> so the picture is in the static HTML with its alt text, unlike react-native-web's Image. */
export const SeoImage = ({ source, alt, aspectRatio, maxHeight, lazy = false }: Props) => {
  const uri = assetUri(source);
  if (!uri) return null;
  return (
    <img
      src={uri}
      alt={alt}
      width={Math.round(maxHeight * aspectRatio)}
      height={maxHeight}
      decoding="async"
      loading={lazy ? 'lazy' : undefined}
      style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto', maxHeight, aspectRatio: String(aspectRatio), objectFit: 'contain' }}
    />
  );
};
