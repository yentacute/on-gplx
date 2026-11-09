# Ôn thi GPLX (Expo / React Native)

Ứng dụng ôn thi lý thuyết lái xe chạy trên **Android, iOS và Web** từ một codebase. Bản web đang chạy ở https://gplx-app.expo.app/.

- Expo SDK 58 + Expo Router (điều hướng theo file)
- TanStack Query (lấy / cache dữ liệu — `src/api`)
- NativeWind v4 (Tailwind cho RN — `global.css`, `tailwind.config.js`)
- `@ant-design/react-native` (List, Tag, Modal, Toast)
- Zustand + AsyncStorage (hạng bằng, câu đã sai, điểm và bài thi tạm lưu)
- Font Inter (`@expo-google-fonts/inter`)

## Chạy

```bash
npm install
npm run typecheck
npm run web              # hoặc: npm run android / npm run ios
```

## Build cho Google Play

```bash
npm i -g eas-cli && eas login
eas build -p android --profile preview      # APK để cài thử
eas build -p android --profile production   # AAB để tải lên Play Console
eas submit -p android --profile production  # đẩy lên kênh thử nghiệm nội bộ (bản nháp)
```

Số `versionCode` do EAS tự quản lý và tự tăng mỗi lần build production (`appVersionSource: remote`).
Mã gói Android là `com.sammy2309.gplx`; sau khi tải bản đầu tiên lên Play thì không đổi được nữa.

## Câu hỏi theo hạng bằng

Mỗi câu trong `src/data/questions.json` có `licenseTypes`. App chỉ hiện các câu của hạng đang chọn, và thi ngẫu nhiên
theo đúng số câu, thời gian, điểm đạt của hạng đó (`src/data/licenseClasses.json`). 20 đề cố định giữ cấu trúc hạng B
(30 câu, 20 phút, đạt 27). Dữ liệu hiện chưa có câu nào gắn cho hạng xe máy (A1, A, B1) nên các hạng này bị khóa
cho đến khi bổ sung `licenseTypes`.

## Cấu trúc

```
app/
  _layout.tsx         # font, splash, QueryClient, antd Provider, Stack
  (tabs)/             # Trang chủ · Ôn tập · Thi thử · Biển báo · Cá nhân
  quiz.tsx            # làm bài: ôn tập / điểm liệt / câu sai / danh mục / thi thử (có hẹn giờ, tạm lưu)
  topics.tsx          # ôn theo chương
  tips.tsx            # mẹo ghi nhớ
src/
  data/               # 600 câu hỏi, 245 biển báo, 20 đề thi, mẹo, hạng bằng (JSON) + map ảnh
  components/         # QuestionCard, HintBox, ResultSummary, ExitExamDialog, PassCelebration…
  lib/exam.ts         # luật thi: 30 câu, 20 phút, đạt 27/30, không sai câu điểm liệt
  store/settings.ts   # Zustand (lưu bằng AsyncStorage)
  theme/              # Inter + cỡ chữ cho web
assets/
  questions/          # ảnh câu hỏi (q<số>.jpg)
  traffic-signs/      # ảnh biển báo
```

## Ghi chú khôi phục (09/11/2026)

Mã nguồn này được dựng lại từ bản build đã deploy ở gplx-app.expo.app, vì code gốc không còn.
Dữ liệu, ảnh và logic giống bản build; tên biến, comment và cách chia file là viết lại.
Hai điểm còn khác so với bản gốc:

- Trên Android/iOS, chữ không đặt `fontFamily` đang dùng font hệ thống thay vì Inter (bản gốc có
  một lớp bọc Text riêng nhưng không khôi phục được cách gắn vào).
- `@ant-design/react-native` 5.x còn import `DrawerLayout`/`Swipeable` mà gesture-handler 3 đã bỏ.
  `metro.config.js` chuyển hai import này sang `src/shims/rngh-removed-component.js`, nên Drawer
  và SwipeAction của antd không dùng được.

Bản code cũ trước khi khôi phục nằm ở `../gplx-app-backup-20261109`.
