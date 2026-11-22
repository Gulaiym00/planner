import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { AppShell } from "@/components/layout";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Планер Бипа",
  description: "Ежедневный планер: учёба, курсы, спорт, дом и встречи — вместе с 3D-роботом Бипом",
};

export const viewport: Viewport = {
  themeColor: "#050506",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={manrope.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
