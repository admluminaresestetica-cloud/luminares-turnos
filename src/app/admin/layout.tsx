'use client';

import { useState, useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdminDark, setIsAdminDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('admin-dark-mode');
    if (saved === 'true') {
      setIsAdminDark(true);
    }
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50 dark:bg-zinc-950" />;
  }

  return (
    <div className={isAdminDark ? 'dark' : ''}>
      <div className="relative min-h-screen bg-slate-50/80 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
        {children}
      </div>
    </div>
  );
}