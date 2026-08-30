'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BuscadorProps {
  onClienteSeleccionado: (data: { pacienteFicha: any; reservaHoy: any }) => void;
  onVerHistorialDirecto: (pacienteId: string) => void;
}

export default function BuscadorMulticoincidencia({
  onClienteSeleccionado,
  onVerHistorialDirecto,
}: BuscadorProps) {
  const [query, setQuery] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [resultadosPacientes, setResultadosPacientes] = useState<any[]>([]);
  const [resultadosReservas, setResultadosReservas] = useState<any[]>([]);
  const [buscado, setBuscado] = useState(false);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setBuscando(true);
    setBuscado(true);

    try {
      const termino = `%${query.trim()}%`;

      // 1. Buscar en Fichas de Pacientes Existentes
      const { data: pacientes } = await supabase
        .from('pacientes_ficha')
        .select('*')
        .or(`nombre_completo.ilike.${termino},celular.ilike.${termino}`);

      // 2. Buscar en Agenda/Reservas de Hoy
      const hoyInicio = new Date();
      hoyInicio.setHours(0, 0, 0, 0);

      const { data: reservas } = await supabase
        .from('reservas')
        .select('*')
        .gte('fecha', hoyInicio.toISOString())
        .or(`cliente_nombre.ilike.${termino},cliente_celular.ilike.${termino}`);

      setResultadosPacientes(pacientes || []);
      setResultadosReservas(reservas || []);
    } catch (err) {
      console.error('Error al buscar:', err);
    } finally {
      setBuscando(false);
    }
  };

  const seleccionar = (paciente: any, reserva: any) => {
    onClienteSeleccionado({ pacienteFicha: paciente, reservaHoy: reserva });
    setResultadosPacientes([]);
    setResultadosReservas([]);
    setBuscado(false);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleBuscar} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por Nombre o Celular..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
        <button
          type="submit"
          disabled={buscando}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {/* RESULTADOS DE MULTI-COINCIDENCIA */}
      {buscado && (
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
          <p className="text-xs font-bold text-slate-700 uppercase">
            Resultados Coincidentes:
          </p>

          {resultadosPacientes.length === 0 && resultadosReservas.length === 0 && (
            <div className="flex justify-between items-center py-2 text-xs text-slate-600">
              <span>No se encontraron coincidencias exactas.</span>
              <button
                onClick={() => seleccionar(null, { cliente_nombre: query })}
                className="bg-emerald-600 text-white px-2.5 py-1 rounded font-medium hover:bg-emerald-700"
              >
                + Cargar como Paciente Nuevo
              </button>
            </div>
          )}

          {/* LISTA DE PACIENTES REGISTRADOS */}
          {resultadosPacientes.map((p) => {
            const reservaAsociada = resultadosReservas.find(
              (r) => r.cliente_celular === p.celular || r.cliente_nombre === p.nombre_completo
            );

            return (
              <div
                key={p.id}
                className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">{p.nombre_completo}</p>
                  <p className="text-xs text-slate-500">📱 Cel: {p.celular} | Fototipo: {p.fototipo || 'N/I'}</p>
                  {reservaAsociada && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded mt-1 inline-block">
                      📅 Tiene Reserva Hoy
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onVerHistorialDirecto(p.id)}
                    className="px-2.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded hover:bg-slate-200"
                  >
                    🔍 Ver Historial
                  </button>
                  <button
                    onClick={() => seleccionar(p, reservaAsociada || null)}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700"
                  >
                    Seleccionar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}