'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Producto, CarritoItem, DatosEnvio } from '@/types/tienda';

interface CarritoContextType {
  carrito: CarritoItem[];
  agregarAlCarrito: (producto: Producto) => void;
  restarUnidad: (id: string) => void;
  eliminarDelCarrito: (id: string) => void;
  vaciarCarrito: () => void;
  totalPrecio: number;
  totalItems: number;
  datosEnvio: DatosEnvio;
  setDatosEnvio: React.Dispatch<React.SetStateAction<DatosEnvio>>;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const CarritoProvider = ({ children }: { children: React.ReactNode }) => {
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [datosEnvio, setDatosEnvio] = useState<DatosEnvio>({
    nombreCliente: '',
    telefonoCliente: '', // <-- Agregado para el teléfono/WhatsApp
    direccion: '',
    metodoEnvio: 'retiro',
    notaAdicional: '',
  });

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('tienda_carrito');
    if (carritoGuardado) {
      try {
        setCarrito(JSON.parse(carritoGuardado));
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
      }
    }
  }, []);

  // Guardar en localStorage cada vez que cambia el carrito
  useEffect(() => {
    localStorage.setItem('tienda_carrito', JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      const cantidadActual = existe ? existe.cantidad : 0;

      // Validar si el producto está pausado o inactivo
      if (producto.activo === false) {
        alert('Este producto no está disponible temporalmente.');
        return prev;
      }

      // Validar límite de stock disponible en Supabase
      if (cantidadActual + 1 > producto.stock) {
        alert(`Solo hay ${producto.stock} unidad(es) disponible(s) de este producto.`);
        return prev;
      }

      if (existe) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }

      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const restarUnidad = (id: string) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === id);
      if (existe && existe.cantidad > 1) {
        return prev.map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
        );
      }
      // Si la cantidad es 1 y resta, lo elimina del carrito
      return prev.filter((item) => item.id !== id);
    });
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const totalPrecio = carrito.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );

  const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        restarUnidad,
        eliminarDelCarrito,
        vaciarCarrito,
        totalPrecio,
        totalItems,
        datosEnvio,
        setDatosEnvio,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  }
  return context;
};
