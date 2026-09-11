import type { Metadata, Viewport } from "next";
import { Prompt } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const promptFont = Prompt({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["thai", "latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "PZT Fruit POS - ระบบจัดการร้านผลไม้และทุเรียนตามฤดูกาล (ใช้ง่าย สบายตา)",
  description: "ระบบขายหน้าร้าน POS สไตล์ Minimal ตัวหนังสือใหญ่ ใช้งานง่าย เหมาะสำหรับทุกคน",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PZT POS",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={promptFont.className}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
