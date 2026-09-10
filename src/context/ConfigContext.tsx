'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  obtenerConfiguracion,
  ConfiguracionEmpresa,
} from '@/lib/supabase/configuracion-empresa';

interface ConfigContextType {
  config: ConfiguracionEmpresa | null;
  loading: boolean;
  refetchConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType>({
  config: null,
  loading: true,
  refetchConfig: async () => {},
});

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<ConfiguracionEmpresa | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    const data = await obtenerConfiguracion();
    if (data) {
      setConfig(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading, refetchConfig: cargar }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);