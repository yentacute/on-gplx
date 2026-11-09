/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  // app.json pins userInterfaceStyle to "light", so NativeWind sets the color
  // scheme manually; on web that requires class-based dark mode.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Màu chủ đạo tham khảo onthigplx.edu.vn (#2563eb)
        primary: { DEFAULT: '#2563eb', dark: '#1d4ed8', light: '#dbeafe' },
        danger: '#dc2626',
        success: '#16a34a',
      },
    },
  },
  plugins: [],
};
