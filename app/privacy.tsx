import { ScrollView, Text, View } from 'react-native';

const UPDATED_AT = '10/11/2026';

type Section = { heading: string; body: string[] };

const SECTIONS: Section[] = [
  {
    heading: 'Dữ liệu chúng tôi thu thập',
    body: [
      'Ứng dụng Ôn thi GPLX trên Android và iOS không yêu cầu đăng nhập, không thu thập và không gửi bất kỳ dữ liệu cá nhân nào ra khỏi thiết bị của bạn.',
      'Các thông tin bạn tạo ra khi học (hạng bằng đã chọn, câu đã làm sai, bài thi đang làm dở) chỉ được lưu trong bộ nhớ của chính thiết bị. Bạn có thể xóa chúng bất cứ lúc nào ở mục Cá nhân > Xóa tiến trình học, hoặc bằng cách gỡ ứng dụng.',
    ],
  },
  {
    heading: 'Quyền truy cập',
    body: [
      'Ứng dụng không xin quyền truy cập vị trí, danh bạ, máy ảnh, micro hay tệp tin. Toàn bộ câu hỏi và hình ảnh được đóng gói sẵn nên ứng dụng dùng được cả khi không có mạng.',
    ],
  },
  {
    heading: 'Bản web',
    body: [
      'Riêng bản chạy trên trình duyệt dùng Google Analytics để đếm số lượt xem trang một cách ẩn danh (đường dẫn trang, loại trình duyệt, quốc gia gần đúng). Dữ liệu này do Google xử lý theo chính sách của Google và không dùng để nhận diện bạn. Ứng dụng trên điện thoại không dùng Google Analytics.',
    ],
  },
  {
    heading: 'Quảng cáo và chia sẻ dữ liệu',
    body: ['Ứng dụng không hiển thị quảng cáo và không bán hay chia sẻ dữ liệu của bạn cho bên thứ ba.'],
  },
  {
    heading: 'Trẻ em',
    body: [
      'Ứng dụng dành cho người chuẩn bị thi giấy phép lái xe và không cố ý thu thập thông tin của trẻ em.',
    ],
  },
  {
    heading: 'Thông tin về nội dung',
    body: [
      'Ôn thi GPLX là ứng dụng cá nhân, không thuộc và không đại diện cho bất kỳ cơ quan nhà nước nào. Câu hỏi được lấy từ bộ câu hỏi sát hạch lý thuyết lái xe do cơ quan nhà nước có thẩm quyền công bố công khai; phần giải thích là do chúng tôi tự biên soạn để tham khảo. Khi có khác biệt, văn bản chính thức của nhà nước là căn cứ cuối cùng.',
    ],
  },
  {
    heading: 'Liên hệ',
    body: [
      'Nếu có câu hỏi về chính sách này, hãy liên hệ qua email nhà phát triển ghi trên trang ứng dụng ở Google Play. Khi chính sách thay đổi, chúng tôi sẽ cập nhật ngày ở đầu trang.',
    ],
  },
];

const PrivacyScreen = () => (
  <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="gap-4 p-4">
    <View className="gap-1">
      <Text className="text-xl font-bold text-slate-900">Chính sách quyền riêng tư</Text>
      <Text className="text-sm text-slate-500">Cập nhật ngày {UPDATED_AT}</Text>
    </View>
    {SECTIONS.map((section) => (
      <View key={section.heading} className="gap-2 rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="text-base font-semibold text-slate-900">{section.heading}</Text>
        {section.body.map((paragraph) => (
          <Text key={paragraph} className="text-sm leading-6 text-slate-700">
            {paragraph}
          </Text>
        ))}
      </View>
    ))}
  </ScrollView>
);

export default PrivacyScreen;
