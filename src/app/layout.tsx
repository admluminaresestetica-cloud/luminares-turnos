'use client';

import localFont from "next/font/local";
import { usePathname } from "next/navigation";
import './globals.css';
import Footer from "@/components/footer";
import BottomNav from '@/components/Home/BottomNav';
import { CarritoProvider } from "@/context/CarritoContext";
import { ConfigProvider } from "@/context/ConfigContext";
import { FavoritosProvider } from "@/context/FavoritosContext";
import { ThemeProvider } from '@/components/theme-provider';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <html lang="es" suppressHydrationWarning className="dark:color-scheme-dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 min-h-screen flex flex-col pb-16 md:pb-0 transition-colors duration-200`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConfigProvider>
            <FavoritosProvider>
              <CarritoProvider>
                <div className="flex-1 w-full">
                  {children}
                </div>

                {/* Elementos públicos que se ocultan en el panel /admin */}
                {!isAdmin && (
                  <>
                    <Footer />
                    <div className="md:hidden">
                      <BottomNav />
                    </div>
                  </>
                )}
              </CarritoProvider>
            </FavoritosProvider>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
