// Web: load Inter through @font-face and apply it to all text, then pin the
// Tailwind text sizes so they match the native app.

// Latin + Vietnamese subsets of Inter as woff2 (about 42 KB each, against 340 KB for the full TTF).
// Made with: pyftsubset Inter_<weight>.ttf --flavor=woff2 --unicodes=U+0000-024F,U+0300-036F,U+1E00-1EFF,U+2000-22FF,U+25A0-25FF
const INTER_WEIGHTS = [400, 500, 600, 700];

const TEXT_SIZES: Record<string, [fontSize: number, lineHeight: number]> = {
  'text-xs': [12, 16],
  'text-sm': [13, 18],
  'text-base': [15, 22],
  'text-lg': [17, 24],
  'text-xl': [19, 26],
  'text-2xl': [22, 28],
};

const addStyle = (css: string) => {
  // Static rendering runs this module in Node, where there is no document.
  if (typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

const fontFaces = INTER_WEIGHTS.map(
  (weight) =>
    `@font-face{font-family:"Inter";font-weight:${weight};font-display:swap;src:url("/fonts/inter-${weight}.woff2") format("woff2");}`,
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
