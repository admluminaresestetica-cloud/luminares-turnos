'use client';

import { useState, useEffect } from "react";
import localFont from "next/font/local";
import { usePathname } from "next/navigation";
import "./globals.css";
import Footer from "@/components/footer";
import BottomNav from '@/components/Home/BottomNav';
import { CarritoProvider } from "@/context/CarritoContext";
import { ConfigProvider } from "@/context/ConfigContext";
import { FavoritosProvider } from "@/context/FavoritosContext";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", weight: "100 900" });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono", weight: "100 900" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  const [isPublicDark, setIsPublicDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkTheme = () => {
      const saved = localStorage.getItem('public-dark-mode');
      setIsPublicDark(saved === 'true');
    };

    checkTheme();
    window.addEventListener('storage', checkTheme);
    return () => window.removeEventListener('storage', checkTheme);
  }, []);

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col pb-16 md:pb-0 ${mounted && isPublicDark ? 'dark' : ''}`}>
        <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors flex-1 w-full">
          <ConfigProvider>
            <AuthProvider>
              <FavoritosProvider>
                <CarritoProvider>
                  <div className="flex-1 w-full">{children}</div>
                  {!isAdmin && (
                    <>
                      <Footer />
                      <div className="md:hidden"><BottomNav /></div>
                    </>
                  )}
                </CarritoProvider>
              </FavoritosProvider>
            </AuthProvider>
          </ConfigProvider>
        </div>
      </body>
    </html>
  );
}