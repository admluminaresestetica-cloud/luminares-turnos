'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BuscadorClienteProps {
  onClienteSeleccionado: (cliente: any, reserva?: any) => void;
}

export default function BuscadorCliente({ onClienteSeleccionado }: BuscadorClienteProps) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  const buscarClientes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busqueda.trim()) return;

    setCargando(true);
    
    // Buscar por nombre, teléfono o email en la tabla clientes
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .or(`nombre.ilike.%${busqueda}%,telefono.ilike.%${busqueda}%,email.ilike.%${busqueda}%`)
      .limit(10);

    if (error) {
      console.error('Error al buscar clientes:', error);
    } else {
      setResultados(data || []);
    }
    setCargando(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">1. Buscar Cliente o Reserva</h2>
      
      <form onSubmit={buscarClientes} className="flex gap-3 mb-4">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, teléfono o email..."
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
        />
        <button
          type="submit"
          disabled={cargando}
          className="px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50"
        >
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {resultados.length > 0 && (
        <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto border border-slate-100 rounded-lg">
          {resultados.map((cliente) => (
            <div
              key={cliente.id}
              onClick={() => onClienteSeleccionado(cliente)}
              className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors"
            >
              <div>
                <p className="font-medium text-slate-900">{cliente.nombre || cliente.nombre_completo}</p>
                <p className="text-xs text-slate-500">{cliente.telefono} {cliente.email ? `• ${cliente.email}` : ''}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded">
                Seleccionar
              </span>
            </div>
          ))}
        </div>
      )}

      {resultados.length === 0 && busqueda && !cargando && (
        <p className="text-sm text-slate-500 text-center py-2">No se encontraron clientes con esa búsqueda.</p>
      )}
    </div>
  );
}