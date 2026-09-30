import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ConfigProvider } from '@/context/ConfigContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Luminares - Gestión de Turnos',
  description: 'Sistema de gestión de turnos para centros de estética',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ConfigProvider>
        <div className={`${inter.className} bg-background text-foreground antialiased min-h-screen`}>
          {children}
        </div>
      </ConfigProvider>
    </ThemeProvider>
  );
}