"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Producto {
  id: number | string;
  nombre: string;
  precio: number;
  precio_original?: number;
  imagen_url?: string;
  categoria?: string;
  stock?: number;
  activo?: boolean;
}

export interface CarritoItem extends Producto {
  cantidad: number;
}

export interface DatosEnvio {
  nombreCliente: string;
  telefonoCliente: string;
  direccion: string;
  metodoEnvio: "retiro" | "envio";
  notaAdicional: string;
}

interface CarritoContextType {
  carrito: CarritoItem[];
  items: CarritoItem[];
  datosEnvio: DatosEnvio;
  setDatosEnvio: React.Dispatch<React.SetStateAction<DatosEnvio>>;
  agregarAlCarrito: (producto: Producto) => void;
  restarDelCarrito: (id: number | string) => void;
  restarUnidad: (id: number | string) => void;
  eliminarDelCarrito: (id: number | string) => void;
  vaciarCarrito: () => void;
  total: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [cargado, setCargado] = useState(false); // Bandera para evitar sobrescribir al iniciar
  const [datosEnvio, setDatosEnvio] = useState<DatosEnvio>({
    nombreCliente: "",
    telefonoCliente: "",
    direccion: "",
    metodoEnvio: "retiro",
    notaAdicional: "",
  });

  // 1. Cargar carrito desde localStorage en la primera carga
  useEffect(() => {
    const guardado = localStorage.getItem("luminares_carrito");
    if (guardado) {
      try {
        setCarrito(JSON.parse(guardado));
      } catch (e) {
        console.error("Error al cargar el carrito:", e);
      }
    }
    setCargado(true); // Marcamos que la lectura inicial ya se realizó
  }, []);

  // 2. Guardar en localStorage solo DESPUÉS de haber cargado el estado inicial
  useEffect(() => {
    if (cargado) {
      localStorage.setItem("luminares_carrito", JSON.stringify(carrito));
    }
  }, [carrito, cargado]);

  const agregarAlCarrito = (producto: Producto) => {
    if (producto.activo === false) {
      alert("Este producto no está disponible en este momento.");
      return;
    }

    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      const stockDisponible = producto.stock ?? 0;
      const cantidadActual = existe ? existe.cantidad : 0;

      if (cantidadActual + 1 > stockDisponible) {
        alert(`Solo hay ${stockDisponible} unidad(es) disponible(s) de este producto.`);
        return prev;
      }

      if (existe) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const restarDelCarrito = (id: number | string) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            return { ...item, cantidad: item.cantidad - 1 };
          }
          return item;
        })
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarDelCarrito = (id: number | string) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const total = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        items: carrito,
        datosEnvio,
        setDatosEnvio,
        agregarAlCarrito,
        restarDelCarrito,
        restarUnidad: restarDelCarrito,
        eliminarDelCarrito,
        vaciarCarrito,
        total,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error("useCarrito debe usarse dentro de un CarritoProvider");
  }
  return context;
}