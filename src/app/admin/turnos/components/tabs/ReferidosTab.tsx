'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getConfiguracionSistema, updateConfiguracionSistema } from '@/lib/supabase/configuracion';
import type { ConfiguracionSistema } from '@/lib/types';
import { 
  Gift, 
  Search, 
  Save, 
  Loader2, 
  CheckCircle2, 
  UserCheck, 
  Plus, 
  Minus,
  Sparkles
} from 'lucide-react';

interface Cliente {
  id: string;
  nombre: string;
  celular: string;
  codigo_referido: string;
  descuentos_disponibles: number;
}

export default function ReferidosTab() {
  const [config, setConfig] = useState<ConfiguracionSistema | null>(null);
  const [cargandoConfig, setCargandoConfig] = useState(true);
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargandoClientes, setCargandoClientes] = useState(true);

  // Formulario local de config
  const [activo, setActivo] = useState(false);
  const [tipoDescuento, setTipoDescuento] = useState<'monto_fijo' | 'porcentaje'>('monto_fijo');
  const [valorDescuento, setValorDescuento] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargandoConfig(true);
    setCargandoClientes(true);

    const conf = await getConfiguracionSistema();
    if (conf) {
      setConfig(conf);
      setActivo(conf.referidos_activo ?? false);
      setTipoDescuento(conf.referidos_tipo_descuento ?? 'monto_fijo');
      setValorDescuento(conf.referidos_valor_descuento ?? 0);
    }
    setCargandoConfig(false);

    const { data } = await supabase
      .from('clientes')
      .select('id, nombre, celular, codigo_referido, descuentos_disponibles')
      .order('nombre', { ascending: true });

    if (data) {
      setClientes(data);
    }
    setCargandoClientes(false);
  }

  const handleGuardarConfig = async () => {
    setGuardandoConfig(true);
    const exito = await updateConfiguracionSistema({
      referidos_activo: activo,
      referidos_tipo_descuento: tipoDescuento,
      referidos_valor_descuento: Number(valorDescuento),
    });

    setGuardandoConfig(false);
    if (exito) {
      setMensajeExito(true);
      setTimeout(() => setMensajeExito(false), 3000);
    }
  };

  const modificarDescuentosCliente = async (clienteId: string, delta: number) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) return;

    const nuevoValor = Math.max(0, (cliente.descuentos_disponibles || 0) + delta);

    const { error } = await supabase
      .from('clientes')
      .update({ descuentos_disponibles: nuevoValor })
      .eq('id', clienteId);

    if (!error) {
      setClientes((prev) =>
        prev.map((c) => (c.id === clienteId ? { ...c, descuentos_disponibles: nuevoValor } : c))
      );
    }
  };

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.celular.includes(busqueda) ||
      (c.codigo_referido && c.codigo_referido.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* TARJETA 1: CONFIGURACIÓN GLOBAL DEL PROGRAMA */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-rose-500" />
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Ajustes del Programa de Referidos</h2>
        </div>

        {cargandoConfig ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando parámetros...
          </div>
        ) : (
          <div className="space-y-5">
            {/* SWITCH ACTIVAR/DESACTIVAR */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200/60">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 block">
                  Estado del Programa
                </span>
                <span className="text-[11px] text-gray-500">
                  Activa o pausa la aplicación automática de descuentos al reservar.
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            {/* SELECCIÓN TIPO Y VALOR DESCUENTO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Tipo de Descuento
                </label>
                <select
                  value={tipoDescuento}
                  onChange={(e) => setTipoDescuento(e.target.value as 'monto_fijo' | 'porcentaje')}
                  className="w-full text-xs font-medium border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  <option value="monto_fijo">Monto Fijo ($)</option>
                  <option value="porcentaje">Porcentaje (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Valor del Descuento {tipoDescuento === 'monto_fijo' ? '($)' : '(%)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={valorDescuento}
                  onChange={(e) => setValorDescuento(Number(e.target.value))}
                  className="w-full text-xs font-medium border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  placeholder="Ej: 2000"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {mensajeExito ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Configuración guardada con éxito
                </span>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={handleGuardarConfig}
                disabled={guardandoConfig}
                className="bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {guardandoConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TARJETA 2: GESTIÓN DE CLIENTES Y CRÉDITOS */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-rose-500" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Saldos de Descuentos por Cliente
            </h2>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, tel o código..."
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
        </div>

        {cargandoClientes ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 py-6 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando listado de clientes...
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <p className="text-center py-6 text-xs text-gray-400">
            No se encontraron clientes que coincidan con la búsqueda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Celular</th>
                  <th className="py-2.5 px-3">Código Único</th>
                  <th className="py-2.5 px-3 text-center">Descuentos Acumulados</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-gray-900">{cliente.nombre}</td>
                    <td className="py-3 px-3 text-gray-500 font-mono">{cliente.celular}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-bold text-[11px]">
                        {cliente.codigo_referido || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-xs ${
                          (cliente.descuentos_disponibles || 0) > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {cliente.descuentos_disponibles || 0} dispon.
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          title="Descontar 1 beneficio"
                          onClick={() => modificarDescuentosCliente(cliente.id, -1)}
                          disabled={(cliente.descuentos_disponibles || 0) <= 0}
                          className="p-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Acreditar 1 beneficio"
                          onClick={() => modificarDescuentosCliente(cliente.id, 1)}
                          className="p-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}