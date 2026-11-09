import { Modal, Toast } from '@ant-design/react-native';
import { useSettings } from '@/store/settings';

/** Returns a handler that asks for confirmation, then wipes saved progress. */
export const useResetProgress = () => {
  const reset = useSettings((state) => state.reset);
  return () =>
    Modal.alert('Xóa tiến trình học', 'Bạn có chắc muốn xóa toàn bộ dữ liệu đã lưu?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        onPress: () => {
          reset();
          Toast.success('Đã xóa dữ liệu');
        },
      },
    ]);
};
