import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PZT Fruit POS - ระบบจัดการร้านผลไม้และทุเรียน',
    short_name: 'PZT POS',
    description: 'ระบบขายหน้าร้าน POS สไตล์ Minimal ตัวหนังสือใหญ่ ใช้ง่าย สบายตา',
    start_url: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#f8fafc',
    theme_color: '#059669',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
