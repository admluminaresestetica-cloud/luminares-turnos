'use client';

import { useState, useEffect } from 'react';
import { Download, X, ShieldCheck, Smartphone } from 'lucide-react';

export default function InstallPromptAdmin() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada o abierta en modo standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Detectar iOS / Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Exponer el prompt de manera global para que un botón del menú pueda dispararlo
      (window as any).__deferredAdminInstallPrompt = e;
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || (window as any).__deferredAdminInstallPrompt;

    if (!promptEvent) {
      if (isIOS) {
        alert('Para instalar en iPhone/iPad:\n1. Tocá el botón "Compartir" de Safari.\n2. Seleccioná "Agregar a inicio".');
      } else {
        alert('El navegador no permite la instalación automática en este momento. Podés usar la opción "Añadir a la pantalla de inicio" desde el menú del navegador.');
      }
      return;
    }

    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;

    if (outcome === 'accepted') {
      console.log('App Admin Instalada');
    }

    setDeferredPrompt(null);
    (window as any).__deferredAdminInstallPrompt = null;
    setVisible(false);
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Banner flotante automático si el navegador emite el evento */}
      {visible && (
        <div className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-zinc-900/95 border border-zinc-700 text-zinc-100 p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md">
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
      )}
    </>
  );
}

// Función helper reutilizable para llamar desde cualquier botón de la UI
export const dispararInstalacionAdmin = async () => {
  const promptEvent = (window as any).__deferredAdminInstallPrompt;
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIosDevice = /iphone|ipad|ipod/.test(userAgent);

  if (promptEvent) {
    promptEvent.prompt();
    await promptEvent.userChoice;
    (window as any).__deferredAdminInstallPrompt = null;
  } else if (isIosDevice) {
    alert('Para instalar en iPhone/iPad:\n1. Tocá el botón "Compartir" en la parte inferior de Safari.\n2. Elegí "Agregar a la pantalla de inicio".');
  } else {
    alert('Para instalar el panel de administración:\n\nTocá los 3 puntos del menú superior de Chrome/Edge y seleccioná "Instalar aplicación" o "Agregar a la pantalla principal".');
  }
};