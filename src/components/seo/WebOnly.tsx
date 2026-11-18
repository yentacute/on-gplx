import type { ReactNode } from 'react';
import { Platform } from 'react-native';

/** Renders its children on web only: links that exist for search engines, kept out of the native app. */
export const WebOnly = ({ children }: { children: ReactNode }) => (Platform.OS === 'web' ? <>{children}</> : null);
