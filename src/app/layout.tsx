import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Hub Sellers — Мультимодальный ИИ-хаб для маркетплейсов",
  description:
    "AI-оптимизация карточек товаров, умный авто-ответчик на отзывы и интеграционный терминал для Ozon и Wildberries.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#17212B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-tma-bg">
        {children}
        <footer className="text-center py-3 px-4">
          <p className="text-[10px] text-tma-muted/50">
            {process.env.GEMINI_API_KEY ? '🔒' : '🔄'} Данные обрабатываются безопасно.
            {process.env.GEMINI_API_KEY ? '' : ' Демо-режим — данные не отправляются во внешние AI-сервисы.'}
          </p>
        </footer>
      </body>
    </html>
  );
}
