'use client';

import type { Viewport } from "next";
import localFont from "next/font/local";
import { usePathname } from "next/navigation";
import "./globals.css";
import Footer from "@/components/footer";
import { CarritoProvider } from "@/context/CarritoContext";
import { ConfigProvider } from "@/context/ConfigContext";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    <html lang="es" className="bg-white" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-white text-slate-900 min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
        >
          <ConfigProvider>
            <CarritoProvider>
              {children}
              {/* El footer se muestra en la web pública, pero se oculta en todo el panel /admin */}
              {!isAdmin && <Footer />}
            </CarritoProvider>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
