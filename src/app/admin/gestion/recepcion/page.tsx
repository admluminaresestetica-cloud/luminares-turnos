'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import AgendaRecepcion from '../components/AgendaRecepcion';
import DetalleReservaCard from '../components/DetalleReservaCard';
import ModalEditarServiciosTurno from '../components/ModalEditarServiciosTurno';
import { Sparkles } from 'lucide-react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RecepcionPage() {
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<any | null>(null);
  
  // Estados para catálogos, promos y el modal de edición
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [serviciosLaser, setServiciosLaser] = useState<any[]>([]);
  const [serviciosGenerales, setServiciosGenerales] = useState<any[]>([]);
  const [promosLaser, setPromosLaser] = useState<any[]>([]);

  // Cargar catálogos de servicios, zonas láser y promos al montar la página
  useEffect(() => {
    const cargarCatalogos = async () => {
      const [resLaser, resGen, resPromos] = await Promise.all([
        supabase.from('servicios_laser').select('*').eq('activo', true),
        supabase.from('servicios_generales').select('*').eq('activo', true),
        supabase.from('promos_laser').select('*').eq('activo', true)
      ]);

      if (resLaser.data) setServiciosLaser(resLaser.data);
      if (resGen.data) setServiciosGenerales(resGen.data);
      if (resPromos.data) setPromosLaser(resPromos.data);
    };

    cargarCatalogos();
  }, []);

  // Detección robusta del género del paciente
  const obtenerGeneroPaciente = () => {
    if (!turnoSeleccionado) return 'femenino';
    if (turnoSeleccionado.genero_paciente) return turnoSeleccionado.genero_paciente;
    
    const detalle = turnoSeleccionado.detalle_reserva;
    if (detalle && typeof detalle === 'object' && detalle.genero) {
      return detalle.genero;
    }
    
    return 'femenino';
  };

  // Función para guardar los cambios del carrito/servicios estructurados en JSONB
  const handleGuardarServiciosTurno = async (datosNuevos: {
    idsLaser: string[];
    idsGenerales: string[];
    idsPromos: string[];
    nuevoPrecio: number;
    nuevaDuracion: number;
    detalleTexto: string;
    genero: string;
  }) => {
    if (!turnoSeleccionado) return;

    try {
      const detalleReservaActualizado = {
        ...(typeof turnoSeleccionado.detalle_reserva === 'object' ? turnoSeleccionado.detalle_reserva : {}),
        detalle_texto: datosNuevos.detalleTexto,
        ids_laser: datosNuevos.idsLaser,
        ids_generales: datosNuevos.idsGenerales,
        ids_promos: datosNuevos.idsPromos,
        genero: datosNuevos.genero,
      };

      const { error } = await supabase
        .from('reservas')
        .update({
          precio_total: datosNuevos.nuevoPrecio,
          duracion_total: datosNuevos.nuevaDuracion,
          detalle_reserva: detalleReservaActualizado,
          estado: 'confirmado',
        })
        .eq('id', turnoSeleccionado.id);

      if (error) {
        console.error('Error al actualizar la reserva:', error);
        alert('Hubo un error al actualizar el turno.');
      } else {
        const turnoActualizadoLocal = {
          ...turnoSeleccionado,
          precio_total: datosNuevos.nuevoPrecio,
          duracion_total: datosNuevos.nuevaDuracion,
          detalle_reserva: detalleReservaActualizado,
          estado: 'confirmado',
        };
        
        setTurnoSeleccionado(turnoActualizadoLocal);
        setModalEdicionAbierto(false);
        alert('¡Servicios y zonas del turno actualizados con éxito!');
      }
    } catch (err) {
      console.error('Excepción al actualizar turno:', err);
    }
  };

  // Función para cambiar de estado rápidamente (ej. Pasar a gabinete, finalizado, etc.)
  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!turnoSeleccionado) return;

    try {
      const { error } = await supabase
        .from('reservas')
        .update({ estado: nuevoEstado })
        .eq('id', turnoSeleccionado.id);

      if (error) {
        console.error('Error al cambiar estado:', error);
        alert('No se pudo actualizar el estado del turno.');
      } else {
        setTurnoSeleccionado({
          ...turnoSeleccionado,
          estado: nuevoEstado,
        });
      }
    } catch (err) {
      console.error('Excepción al cambiar estado:', err);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 max-w-7xl mx-auto pb-24 sm:pb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 dark:text-zinc-100">
          Recepción y Gestión Diaria
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Visualiza la agenda del día, gestiona ingresos y revisa los detalles completos de cada turno.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        {/* Columna Izquierda: Agenda del Día */}
        <div className="lg:col-span-7 order-2 lg:order-1">
          <AgendaRecepcion 
            onSeleccionarTurno={(turno: any) => {
              setTurnoSeleccionado(turno);
            }}
            turnoSeleccionadoId={turnoSeleccionado?.id}
          />
        </div>

        {/* Columna Derecha: Tarjeta de Detalles del Turno Seleccionado */}
        <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
          <div className="sticky top-4 space-y-4">
            <DetalleReservaCard 
              turno={turnoSeleccionado}
              onCambiarEstado={handleCambiarEstado}
              onAbrirEdicion={() => setModalEdicionAbierto(true)}
            />
          </div>
        </div>
      </div>

      {/* Modal del Carrito / Selector Dinámico con soporte para Promos y Género real */}
      {modalEdicionAbierto && turnoSeleccionado && (
        <ModalEditarServiciosTurno
          turnoActual={turnoSeleccionado}
          generoPaciente={obtenerGeneroPaciente()}
          serviciosLaserDisponibles={serviciosLaser}
          serviciosGeneralesDisponibles={serviciosGenerales}
          promosLaserDisponibles={promosLaser}
          onSave={handleGuardarServiciosTurno}
          onClose={() => setModalEdicionAbierto(false)}
        />
      )}
    </div>
  );
}