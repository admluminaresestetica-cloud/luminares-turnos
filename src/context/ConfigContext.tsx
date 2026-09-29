'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  obtenerConfiguracion,
  ConfiguracionEmpresa,
  TemaColores,
  TEMA_COLORES_DEFAULT,
} from '@/lib/supabase/configuracion-empresa';
import { aplicarTemaEnDocumento } from '@/lib/utils/color';

interface ConfigContextType {
  config: ConfiguracionEmpresa | null;
  loading: boolean;
  refetchConfig: () => Promise<void>;
  actualizarTema: (nuevoTema: TemaColores) => void;
}

const ConfigContext = createContext<ConfigContextType>({
  config: null,
  loading: true,
  refetchConfig: async () => {},
  actualizarTema: () => {},
});

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<ConfiguracionEmpresa | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const data = await obtenerConfiguracion();
    if (data) {
      setConfig(data);
      // Aplicar tema cargado de Supabase o default al document
      aplicarTemaEnDocumento(data.tema_colores || TEMA_COLORES_DEFAULT);
    }
    setLoading(false);
  };

  // Permite actualizar visualmente el tema en tiempo real (por ejemplo desde el Admin Live Preview)
  const actualizarTema = (nuevoTema: TemaColores) => {
    aplicarTemaEnDocumento(nuevoTema);
    setConfig((prev) => (prev ? { ...prev, tema_colores: nuevoTema } : null));
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        config,
        loading,
        refetchConfig: cargar,
        actualizarTema,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);