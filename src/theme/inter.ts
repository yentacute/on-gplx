/** Font family names registered by useFonts in app/_layout.tsx. */
export const INTER = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

const FAMILY_BY_WEIGHT: Record<string, string> = {
  normal: INTER.regular,
  100: INTER.regular,
  200: INTER.regular,
  300: INTER.regular,
  400: INTER.regular,
  500: INTER.medium,
  600: INTER.semibold,
  700: INTER.bold,
  bold: INTER.bold,
  800: INTER.bold,
  900: INTER.bold,
};

const SYSTEM_FAMILY = /^(system|system-ui|sans-serif|-apple-system|roboto|segoe ui|helvetica)/i;

/** True when the font family is unset or a system font, i.e. safe to swap for Inter. */
export const isReplaceableFamily = (family: unknown) =>
  family === undefined || (typeof family === 'string' && SYSTEM_FAMILY.test(family));

/** Inter ships one file per weight, so pick the family that matches `fontWeight`. */
export const interFamilyFor = (weight: unknown) => FAMILY_BY_WEIGHT[String(weight ?? 'normal')] ?? INTER.regular;
