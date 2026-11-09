import { Asset } from 'expo-asset';

// Web: load Inter through @font-face and apply it to all text, then pin the
// Tailwind text sizes so they match the native app.

const INTER_FILES = [
  { weight: 400, module: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf') },
  { weight: 500, module: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf') },
  { weight: 600, module: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf') },
  { weight: 700, module: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf') },
];

const TEXT_SIZES: Record<string, [fontSize: number, lineHeight: number]> = {
  'text-xs': [12, 16],
  'text-sm': [13, 18],
  'text-base': [15, 22],
  'text-lg': [17, 24],
  'text-xl': [19, 26],
  'text-2xl': [22, 28],
};

const addStyle = (css: string) => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

const fontFaces = INTER_FILES.map(
  ({ weight, module }) =>
    `@font-face{font-family:"Inter";font-weight:${weight};font-display:swap;src:url("${Asset.fromModule(module).uri}") format("truetype");}`,
).join('');

// Icon fonts must keep their own family.
addStyle(
  `${fontFaces}body,body *:not([style*="ionicons" i]):not([style*="anticon" i]):not([style*="antfont" i]){font-family:"Inter",system-ui,sans-serif !important;}`,
);

addStyle(
  Object.entries(TEXT_SIZES)
    .map(
      ([cls, [size, lineHeight]]) =>
        `.${cls}{font-size:${size}px !important;}.${cls}:not([class*="leading-"]){line-height:${lineHeight}px !important;}`,
    )
    .join(''),
);
