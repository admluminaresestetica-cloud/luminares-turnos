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
  permite_cuotas?: boolean;
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
  const [cargado, setCargado] = useState(false);
  const [datosEnvio, setDatosEnvio] = useState<DatosEnvio>({
    nombreCliente: "",
    telefonoCliente: "",
    direccion: "",
    metodoEnvio: "retiro",
    notaAdicional: "",
  });

  // Cargar carrito desde localStorage sólo en el cliente
  useEffect(() => {
    try {
      const guardado = localStorage.getItem("luminares_carrito");
      if (guardado) {
        const parseado = JSON.parse(guardado);
        if (Array.isArray(parseado)) {
          setCarrito(parseado);
        }
      }
    } catch (e) {
      console.error("Error al cargar el carrito:", e);
    } finally {
      setCargado(true);
    }
  }, []);

  // Guardar en localStorage de forma segura
  useEffect(() => {
    if (cargado) {
      try {
        localStorage.setItem("luminares_carrito", JSON.stringify(carrito));
      } catch (e) {
        console.error("Error al guardar en localStorage:", e);
      }
    }
  }, [carrito, cargado]);

  const agregarAlCarrito = (producto: Producto) => {
    if (!producto) return;

    if (producto.activo === false) {
      alert("Este producto no está disponible en este momento.");
      return;
    }

    setCarrito((prev) => {
      const listaSegura = Array.isArray(prev) ? prev : [];
      const existe = listaSegura.find((item) => item.id === producto.id);
      const stockDisponible = Number(producto.stock) || 0;
      const cantidadActual = existe ? existe.cantidad : 0;

      if (stockDisponible > 0 && cantidadActual + 1 > stockDisponible) {
        alert(`Solo hay ${stockDisponible} unidad(es) disponible(s) de este producto.`);
        return listaSegura;
      }

      if (existe) {
        return listaSegura.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                precio: Number(producto.precio) || Number(item.precio) || 0,
                permite_cuotas: producto.permite_cuotas ?? item.permite_cuotas ?? true,
              }
            : item
        );
      }

      return [
        ...listaSegura,
        {
          ...producto,
          precio: Number(producto.precio) || 0,
          cantidad: 1,
          permite_cuotas: producto.permite_cuotas ?? true,
        },
      ];
    });
  };

  const restarDelCarrito = (id: number | string) => {
    setCarrito((prev) => {
      const listaSegura = Array.isArray(prev) ? prev : [];
      return listaSegura
        .map((item) => {
          if (item.id === id) {
            return { ...item, cantidad: item.cantidad - 1 };
          }
          return item;
        })
        .filter((item) => item.cantidad > 0);
    });
  };

  const eliminarDelCarrito = (id: number | string) => {
    setCarrito((prev) => {
      const listaSegura = Array.isArray(prev) ? prev : [];
      return listaSegura.filter((item) => item.id !== id);
    });
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const listaSegura = Array.isArray(carrito) ? carrito : [];
  const total = listaSegura.reduce(
    (acc, item) => acc + (Number(item?.precio) || 0) * (Number(item?.cantidad) || 1),
    0
  );

  return (
    <CarritoContext.Provider
      value={{
        carrito: listaSegura,
        items: listaSegura,
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
