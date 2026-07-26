/**
 * @file src/app/layout.js
 * @description Root layout aplikasi SIMPASAR dengan konfigurasi Font & Provider.
 * @author Aditya Syahestiano
 */

import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "SIMPASAR - Sistem Informasi Manajemen Pasar",
  description: "Portal Sistem Informasi Manajemen Pasar (SIMPASAR)",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${jakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
