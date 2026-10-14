'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Storage key según la sección
  const storageKey = isAdmin ? 'admin-dark-mode' : 'public-dark-mode';

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(storageKey);
    if (saved === 'true') {
      setIsDark(true);
    }
  }, [storageKey]);

  const toggleTheme = () => {
    const nuevoEstado = !isDark;
    setIsDark(nuevoEstado);
    localStorage.setItem(storageKey, String(nuevoEstado));

    // Si estamos en admin, forzamos un pequeño evento o recarga de clase local si es necesario,
    // o recargamos la página sutilmente para aplicar el cambio de contenedor al instante.
    window.location.reload();
  };

  if (!mounted) {
    return <div className="w-9 h-9" />; // Espaciador mientras monta
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      className="flex items-center justify-center w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 backdrop-blur-md border border-slate-200/80 dark:border-zinc-700/80 shadow-xs transition-all active:scale-95 cursor-pointer"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600 dark:text-zinc-300 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}