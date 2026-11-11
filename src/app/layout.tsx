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
  const [cargandoApp, setCargandoApp] = useState(true); // <-- Estado para el splash screen animado

  useEffect(() => {
    setMounted(true);
    const checkTheme = () => {
      const saved = localStorage.getItem('public-dark-mode');
      setIsPublicDark(saved === 'true');
    };

    checkTheme();
    window.addEventListener('storage', checkTheme);

    // Oculta la pantalla de carga animada después de 1.5 segundos al abrir la app
    const timer = setTimeout(() => {
      setCargandoApp(false);
    }, 1500);

    return () => {
      window.removeEventListener('storage', checkTheme);
      clearTimeout(timer);
    };
  }, []);

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col pb-16 md:pb-0 ${mounted && isPublicDark ? 'dark' : ''}`}>
        
{/* PANTALLA DE CARGA INICIAL CON TU VIDEO ANIMADO */}
        {cargandoApp && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white dark:bg-zinc-950 transition-opacity duration-500">
            <video 
              src="/logo-inicial3.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-[75%] max-w-[320px] md:max-w-[450px] h-auto object-contain pointer-events-none"
            />
          </div>
        )}

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