import { Platform, type ViewStyle } from 'react-native';

/** On a desktop browser keep screens in a readable column instead of stretching edge to edge. */
export const WEB_COLUMN: ViewStyle | undefined =
  Platform.OS === 'web' ? { width: '100%', maxWidth: 760, alignSelf: 'center' } : undefined;
