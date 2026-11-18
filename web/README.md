# Web ôn thi GPLX (ontaplaixe.com)

Bản web riêng của app, dựng bằng **Astro** (HTML tĩnh cho từng trang) + **React** cho phần tương tác + **Tailwind CSS v4**.
Dữ liệu dùng chung với app mobile: `../src/data/*.json` và ảnh trong `../assets/` được `scripts/sync-assets.mjs`
chép vào đây trước mỗi lần chạy `dev` hoặc `build`, nên chỉ cần sửa dữ liệu ở một chỗ.

```bash
cd web
npm install
npm run dev       # http://localhost:4321
npm run build     # xuất ra web/dist
npm run preview   # build rồi chạy thử bằng wrangler dev
npm run deploy    # build rồi deploy lên Cloudflare (thay bản Expo web ở ontaplaixe.com)
```

## Trang

| URL | Nội dung | Index |
| --- | --- | --- |
| `/` | Trang chủ: lộ trình, thi thử, chương, hỏi đáp | ✓ |
| `/on-tap` | Chọn chương, câu điểm liệt, câu hay sai | ✓ |
| `/on-tap/<chương>`, `/on-tap/cau-diem-liet`, `/on-tap/cau-sai`, `/on-tap/tat-ca` | Màn luyện câu (bấm là biết đúng sai) | noindex |
| `/thi-thu`, `/thi-thu/hang-b` … | Chọn hạng, 20 đề cố định của hạng | ✓ (6 hạng chính) |
| `/thi-thu/hang-b/de-1` … `/ngau-nhien` | Màn thi có đồng hồ, chấm điểm | noindex |
| `/cau-hoi/1` … `/600` | Từng câu, có đáp án và QAPage JSON-LD | ✓ |
| `/chuong/<slug>`, `/cau-diem-liet`, `/600-cau-hoi` | Danh sách câu có đáp án | ✓ |
| `/bien-bao`, `/bien-bao/<id>` | Tra cứu biển báo | ✓ |
| `/meo-ghi-nho` | Mẹo | ✓ |
| `/tro-chuyen` | Phòng chat cộng đồng theo thời gian thực | noindex |

Các URL SEO giữ nguyên như bản Expo web. Đường dẫn cũ của app web (`/exam`, `/practice`, `/signs`, `/topics`,
`/tips`, `/quiz`, `/profile`) chuyển hướng 301 qua `public/_redirects`. `sitemap.xml` sinh lúc build, chỉ gồm trang được index.

Tiến độ học (câu đã làm, điểm thi) lưu trong `localStorage` của trình duyệt (`src/lib/progress.ts`).

## Phòng chat cộng đồng

1. Trong Supabase Dashboard, vào **Authentication → Sign In / Providers → Anonymous Sign-Ins** và bật đăng nhập ẩn danh.
2. Vào **SQL Editor**, dán và chạy toàn bộ [supabase/chat.sql](supabase/chat.sql). File tạo bảng tin nhắn, bảng báo cáo, quyền đọc, hàm gửi/báo cáo có giới hạn tần suất, và bật Realtime cho bảng tin nhắn.
3. Sao chép `.env.example` thành `.env.local`, điền Project URL và **publishable key**. Không dùng `service_role` hoặc secret key trong web. Đổi `PUBLIC_CHAT_ENABLED=true` sau khi SQL và đăng nhập ẩn danh đã hoạt động.
4. Chạy `npm run dev`, mở `/tro-chuyen` trong hai tab, gửi một tin nhắn và xác nhận tab còn lại nhận được ngay. Với bản production, đặt cùng các biến `PUBLIC_*` trong môi trường **build** rồi build/deploy lại; đây là site tĩnh nên biến chỉ được nhúng lúc build.

Khi chưa bật `PUBLIC_CHAT_ENABLED`, liên kết chat sẽ không xuất hiện trong điều hướng. Mọi người có thể đọc tin nhắn không cần đăng nhập; khi gửi hoặc báo cáo, trình duyệt tạo phiên ẩn danh. Tên hiển thị lưu trên thiết bị. Hàm SQL giới hạn 1 tin/8 giây và 40 tin/giờ cho mỗi phiên; nên bật CAPTCHA/Turnstile của Supabase Auth trước khi mở rộng quảng bá phòng chat.

Khi chat được bật, sidebar bên phải mở sẵn trên màn hình rộng. Ở màn hình nhỏ hơn, nút **Trò chuyện** mở sidebar; trang `/tro-chuyen` vẫn là chế độ xem riêng.

Quản trị viên xem báo cáo trong bảng `chat_reports` trên Supabase Dashboard. Để ẩn một tin, đặt `is_hidden=true` cho dòng tương ứng trong `chat_messages`. Không cấp quyền sửa hoặc xoá bảng này cho trình duyệt.

## Nút Zalo hỗ trợ

Đặt `PUBLIC_ZALO_URL` (ví dụ `https://zalo.me/0912345678`) trong `.env.local` hoặc môi trường build để hiện nút Zalo nổi ở góc phải màn hình. Để trống thì nút bị ẩn. Nút hiện trên mọi trang; ở màn làm bài nút thu nhỏ và nằm trên thanh câu hỏi.
