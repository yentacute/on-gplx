import type { SignGroup } from '@/types';

export const SIGN_GROUP_LABEL: Record<SignGroup, string> = {
  nguyhiem: 'Biển báo nguy hiểm',
  cam: 'Biển báo cấm',
  hieulenh: 'Biển hiệu lệnh',
  chidan: 'Biển chỉ dẫn',
  phu: 'Biển phụ',
  vachke: 'Vạch kẻ đường',
};

export const SIGN_GROUP_ORDER = Object.keys(SIGN_GROUP_LABEL) as SignGroup[];
