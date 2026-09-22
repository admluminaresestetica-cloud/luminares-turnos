import type { Viewport } from "next";
import localFont from "next/font/local";
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

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata = {
  title: "Luminares - Estética",
  description: "Servicios de estética y tienda online",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              <Footer />
            </CarritoProvider>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}