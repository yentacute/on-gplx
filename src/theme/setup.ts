// Native: Inter is loaded with useFonts in app/_layout.tsx. Web-only CSS setup lives in setup.web.ts.
// Note: the production build also wrapped native Text so that all text used Inter by weight
// (helpers in ./inter.ts). How it was hooked into Text could not be recovered from the build,
// so on Android/iOS text without an explicit fontFamily currently uses the system font.
export {};
