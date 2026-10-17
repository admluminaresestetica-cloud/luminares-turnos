'use client';

import { useEffect } from 'react';

export default function InstallPromptAdmin() {
  useEffect(() => {
    // Capturar el evento de instalación de forma silenciosa para que el botón manual lo dispare
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__deferredAdminInstallPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // No renderiza ningún banner flotante en pantalla
  return null;
}

// Helper global para ser llamado por el botón manual de instalación en el header
export const dispararInstalacionAdmin = async () => {
  const promptEvent = (window as any).__deferredAdminInstallPrompt;
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIosDevice = /iphone|ipad|ipod/.test(userAgent);

  if (promptEvent) {
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      console.log('App Admin instalada con éxito');
    }
    (window as any).__deferredAdminInstallPrompt = null;
  } else if (isIosDevice) {
    alert(
      'Para instalar en iPhone/iPad:\n1. Tocá el botón "Compartir" en la parte inferior de Safari.\n2. Elegí "Agregar a la pantalla de inicio".'
    );
  } else {
    alert(
      'Para instalar el panel de administración:\n\nTocá los 3 puntos del menú superior de tu navegador y seleccioná "Instalar aplicación" o "Agregar a la pantalla principal".'
    );
  }
};
