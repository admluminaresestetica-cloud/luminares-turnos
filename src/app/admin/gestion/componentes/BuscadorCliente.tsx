'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BuscadorClienteProps {
  onResultadoSeleccionado: (data: {
    pacienteFicha: any | null;
    reservaHoy: any | null;
  }) => void;
}

export default function BuscadorCliente({ onResultadoSeleccionado }: BuscadorClienteProps) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busqueda.trim()) return;

    setCargando(true);
    setResultados([]);

    try {
      // 1. Buscar en pacientes_ficha (clientes ya existentes en gestión)
      const { data: pacientes } = await supabase
        .from('pacientes_ficha')
        .select('*')
        .or(`nombre_completo.ilike.%${busqueda}%,celular.ilike.%${busqueda}%`)
        .limit(5);

      // 2. Buscar en reservas de la web (turnos agendados)
      const { data: reservas } = await supabase
        .from('reservas')
        .select('*')
        .or(`cliente_nombre.ilike.%${busqueda}%,cliente_celular.ilike.%${busqueda}%`)
        .order('fecha_hora_inicio', { ascending: false })
        .limit(5);

      // Combinar los resultados evitando duplicados por celular
      const combinados: any[] = [];
      const celularesProcesados = new Set();

      // Prioridad a fichas de pacientes ya registradas
      (pacientes || []).forEach((p) => {
        celularesProcesados.add(p.celular);
        const reservaAsociada = (reservas || []).find((r) => r.cliente_celular === p.celular);
        combinados.push({
          tipo: 'PACIENTE_REGISTRADO',
          pacienteFicha: p,
          reservaHoy: reservaAsociada || null
        });
      });

      // Agregar reservas que aún no tienen ficha de paciente creada
      (reservas || []).forEach((r) => {
        if (!celularesProcesados.has(r.cliente_celular)) {
          celularesProcesados.add(r.cliente_celular);
          combinados.push({
            tipo: 'SOLO_RESERVA_NUEVO',
            pacienteFicha: null,
            reservaHoy: r
          });
        }
      });

      setResultados(combinados);
    } catch (err) {
      console.error('Error durante la búsqueda:', err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">1. Buscar Paciente o Reserva</h2>

      <form onSubmit={buscar} className="flex gap-3 mb-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por Nombre o Celular..."
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm"
        />
        <button
          type="submit"
          disabled={cargando}
          className="px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm disabled:opacity-50"
        >
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {resultados.length > 0 && (
        <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto border border-slate-100 rounded-lg">
          {resultados.map((item, idx) => {
            const nombre = item.pacienteFicha?.nombre_completo || item.reservaHoy?.cliente_nombre;
            const celular = item.pacienteFicha?.celular || item.reservaHoy?.cliente_celular;
            const esNuevo = item.tipo === 'SOLO_RESERVA_NUEVO';

            return (
              <div
                key={idx}
                onClick={() => onResultadoSeleccionado(item)}
                className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">{nombre}</p>
                    {esNuevo ? (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                        NUEVO (Requiere Ficha)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                        {item.pacienteFicha.fototipo || 'Ficha Registrada'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Cel: {celular}</p>
                  {item.reservaHoy && (
                    <p className="text-xs text-indigo-600 font-medium mt-0.5">
                      Turno Reserva: {item.reservaHoy.servicio_tipo} (${item.reservaHoy.monto_abonado || item.reservaHoy.precio_total || 0})
                    </p>
                  )}
                </div>

                <button className="text-xs font-semibold px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
                  {esNuevo ? 'Crear Ficha y Atender' : 'Seleccionar'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {resultados.length === 0 && busqueda && !cargando && (
        <p className="text-sm text-slate-500 text-center py-3">No se encontraron pacientes ni reservas con ese dato.</p>
      )}
    </div>
  );
}
