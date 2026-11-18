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
| `/` | Trang chủ: chọn hạng, lộ trình, thi thử, chương, hỏi đáp | ✓ |
| `/on-tap` | Chọn chương, câu điểm liệt, câu hay sai | ✓ |
| `/on-tap/<chương>`, `/on-tap/cau-diem-liet`, `/on-tap/cau-sai`, `/on-tap/tat-ca` | Màn luyện câu (bấm là biết đúng sai) | noindex |
| `/thi-thu`, `/thi-thu/hang-b` … | Chọn hạng, 20 đề cố định của hạng | ✓ (6 hạng chính) |
| `/thi-thu/hang-b/de-1` … `/ngau-nhien` | Màn thi có đồng hồ, chấm điểm | noindex |
| `/cau-hoi/1` … `/600` | Từng câu, có đáp án và QAPage JSON-LD | ✓ |
| `/chuong/<slug>`, `/cau-diem-liet`, `/600-cau-hoi` | Danh sách câu có đáp án | ✓ |
| `/bien-bao`, `/bien-bao/<id>` | Tra cứu biển báo | ✓ |
| `/meo-ghi-nho` | Mẹo | ✓ |

Các URL SEO giữ nguyên như bản Expo web. Đường dẫn cũ của app web (`/exam`, `/practice`, `/signs`, `/topics`,
`/tips`, `/quiz`, `/profile`) chuyển hướng 301 qua `public/_redirects`. `sitemap.xml` sinh lúc build, chỉ gồm trang được index.

Tiến độ học (câu đã làm, điểm thi) lưu trong `localStorage` của trình duyệt (`src/lib/progress.ts`).
