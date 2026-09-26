'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previene que el navegador muestre su banner predeterminado por defecto
      e.preventDefault();
      // Guarda el evento para dispararlo cuando el usuario presione el botón
      setDeferredPrompt(e);
      // Muestra nuestro banner personalizado
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Muestra el aviso nativo de instalación del sistema
    deferredPrompt.prompt();

    // Espera a la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('El usuario aceptó instalar la PWA');
    }

    // Limpia el prompt porque ya no se puede reutilizar
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#1b2e25] dark:bg-zinc-900 border border-[#2d4d3d] dark:border-zinc-800 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md">
        
        {/* Icono e Información */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-400 text-[#1b2e25] shrink-0 shadow-sm">
            <Download className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Instalar Aplicación</h4>
            <p className="text-[11px] text-stone-300">
              Instalá Luminares para un acceso más rápido.
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="bg-emerald-400 hover:bg-emerald-300 text-[#1b2e25] font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Instalar
          </button>
          
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="text-stone-400 hover:text-white p-1 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
