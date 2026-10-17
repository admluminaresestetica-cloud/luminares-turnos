'use client';

import { useState, useEffect } from 'react';
import { Download, X, ShieldCheck } from 'lucide-react';

export default function InstallPromptAdmin() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('El usuario aceptó instalar Admin PWA');
    }

    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-zinc-900/95 border border-zinc-700 text-zinc-100 p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md">
        
        {/* Icono e Información */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-600 text-white shrink-0 shadow-md">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-100">Instalar Panel Admin</h4>
            <p className="text-[11px] text-zinc-400">
              Instalá la app de gestión para acceso rápido.
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Instalar
          </button>
          
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="text-zinc-400 hover:text-zinc-100 p-1 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}