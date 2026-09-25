'use client';

import React, { createContext, useContext, useState, useEffect } from "react";

export interface ProductoFavorito {
  id: string | number;
  nombre: string;
  precio: number;
  imagen_url?: string;
  descripcion?: string;
  permite_cuotas?: boolean;
}

// 1. Agregar quitarFavorito a la interfaz
interface FavoritosContextType {
  favoritos: ProductoFavorito[];
  toggleFavorito: (producto: ProductoFavorito) => void;
  quitarFavorito: (id: string | number) => void; // <-- AÑADIR ESTA LÍNEA
  esFavorito: (id: string | number) => boolean;
  limpiarFavoritos: () => void;
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export function FavoritosProvider({ children }: { children: React.ReactNode }) {
  const [favoritos, setFavoritos] = useState<ProductoFavorito[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try {
      const guardados = localStorage.getItem("tienda_favoritos");
      if (guardados) {
        setFavoritos(JSON.parse(guardados));
      }
    } catch (e) {
      console.error("Error al cargar favoritos de localStorage:", e);
    } finally {
      setCargado(true);
    }
  }, []);

  useEffect(() => {
    if (cargado) {
      try {
        localStorage.setItem("tienda_favoritos", JSON.stringify(favoritos));
      } catch (e) {
        console.error("Error al guardar favoritos en localStorage:", e);
      }
    }
  }, [favoritos, cargado]);

  const toggleFavorito = (producto: ProductoFavorito) => {
    setFavoritos((prev) => {
      const existe = prev.some((item) => item.id === producto.id);
      if (existe) {
        return prev.filter((item) => item.id !== producto.id);
      } else {
        return [...prev, producto];
      }
    });
  };

  // 2. Definir la función de eliminación por ID
  const quitarFavorito = (id: string | number) => {
    setFavoritos((prev) => prev.filter((item) => item.id !== id));
  };

  const esFavorito = (id: string | number) => {
    return favoritos.some((item) => item.id === id);
  };

  const limpiarFavoritos = () => {
    setFavoritos([]);
  };

  return (
    // 3. Exportar quitarFavorito en el value
    <FavoritosContext.Provider
      value={{ favoritos, toggleFavorito, quitarFavorito, esFavorito, limpiarFavoritos }}
    >
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  const context = useContext(FavoritosContext);
  if (!context) {
    throw new Error("useFavoritos debe usarse dentro de FavoritosProvider");
  }
  return context;
}