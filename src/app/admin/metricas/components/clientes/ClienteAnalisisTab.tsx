'use client';

import { useState, useEffect } from 'react';
import { obtenerListaClientes, obtenerAnalisisCliente } from './clienteAnalisisApi';
import { ClienteResumen, DetalleHistorialCliente } from './types';
import FichaClienteCard from './FichaClienteCard';
import { Search, Loader2, UserCheck } from 'lucide-react';

export default function ClienteAnalisisTab() {
  const [clientes, setClientes] = useState<{ user_id: string; nombre: string; celular?: string }[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  
  const [cargandoLista, setCargandoLista] = useState(true);
  const [cargandoFicha, setCargandoFicha] = useState(false);

  const [resumen, setResumen] = useState<ClienteResumen | null>(null);
  const [detalle, setDetalle] = useState<DetalleHistorialCliente | null>(null);

  useEffect(() => {
    async function CargarClientes() {
      setCargandoLista(true);
      const res = await obtenerListaClientes();
      setClientes(res);
      setCargandoLista(false);
    }
    CargarClientes();
  }, []);

  const handleSeleccionarCliente = async (userId: string) => {
    setClienteSeleccionado(userId);
    setCargandoFicha(true);
    const res = await obtenerAnalisisCliente(userId);
    if (res) {
      setResumen(res.resumen);
      setDetalle(res.detalle);
    }
    setCargandoFicha(false);
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.celular?.includes(busqueda)
  );

  return (
    <div className="space-y-6">
      {/* Buscador de Cliente */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Analizar Comportamiento de Cliente
        </h3>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          />
        </div>

        {/* Lista desplegable de coincidencias */}
        {busqueda.length > 0 && (
          <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-zinc-800 rounded-xl divide-y divide-slate-100 dark:divide-zinc-800">
            {clientesFiltrados.length === 0 ? (
              <p className="p-3 text-xs text-slate-400 italic">No se encontraron clientes.</p>
            ) : (
              clientesFiltrados.map((c) => (
                <button
                  key={c.user_id}
                  onClick={() => {
                    handleSeleccionarCliente(c.user_id);
                    setBusqueda('');
                  }}
                  className="w-full text-left p-2.5 text-xs hover:bg-rose-50 dark:hover:bg-zinc-800 flex justify-between items-center transition-colors"
                >
                  <span className="font-medium text-slate-700 dark:text-zinc-200">{c.nombre}</span>
                  <span className="text-[10px] text-slate-400">{c.celular}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Contenido del análisis */}
      {cargandoFicha ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <span className="text-xs font-medium">Analizando historial del cliente...</span>
        </div>
      ) : resumen && detalle ? (
        <FichaClienteCard resumen={resumen} detalle={detalle} />
      ) : (
        <div className="p-8 text-center bg-slate-50/50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-slate-400 text-xs flex flex-col items-center gap-2">
          <UserCheck className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
          <span>Buscá un cliente arriba para desplegar su ficha de comportamiento y preferencias.</span>
        </div>
      )}
    </div>
  );
}