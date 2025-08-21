/* eslint-disable react-refresh/only-export-components */
import "./globals.css";
import type { Metadata } from "next";
import BodyClassController from "@/components/BodyClassController";

export const metadata: Metadata = {
  title: "Пикник",
  description: "Организация пикника: участники, карта, снаряжение, меню и покупки",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {/* Класс фона вешается только на клиенте */}
        <BodyClassController />
        <main className="max-w-6xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
