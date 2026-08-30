'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import BuscadorCliente from '../componentes/BuscadorCliente';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RecepcionPage() {
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Estado para el formulario de Nuevo Cliente
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [celularNuevo, setCelularNuevo] = useState('');
  const [creandoCliente, setCreandoCliente] = useState(false);

  // Enviar paciente a la sala de espera
  const handleEnviarAGabinete = async () => {
    if (!clienteSeleccionado) return;

    setGuardando(true);
    setMensaje(null);

    const { error } = await supabase.from('sesiones_gabinete').insert({
      cliente_id: clienteSeleccionado.id,
      estado: 'en_espera',
      observaciones_recepcion: observaciones,
      zonas_preasignadas: [],
      parametros_tecnicos: {}
    });

    if (error) {
      console.error('Error al enviar a gabinete:', error);
      setMensaje('❌ Error al enviar el paciente a gabinete.');
    } else {
      setMensaje('✅ ¡Paciente enviado a Gabinete correctamente!');
      setClienteSeleccionado(null);
      setObservaciones('');
    }

    setGuardando(false);
  };

  // Crear cliente usando 'nombre' y 'celular'
  const handleCrearCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevo.trim() || !celularNuevo.trim()) return;

    setCreandoCliente(true);

    const { data, error } = await supabase
      .from('clientes')
      .insert({
        nombre: nombreNuevo,
        celular: celularNuevo
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear cliente:', error);
      alert(`❌ Error al guardar el cliente: ${error.message}`);
    } else {
      alert('✅ ¡Cliente creado con éxito en Supabase!');
      setClienteSeleccionado(data);
      setMostrarModalNuevo(false);
      setNombreNuevo('');
      setCelularNuevo('');
    }

    setCreandoCliente(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recepción / Pre-asignación</h1>
          <p className="text-slate-500 text-sm">Gestiona el ingreso de clientes y envíalos a la sala de espera.</p>
        </div>
        <button
          onClick={() => setMostrarModalNuevo(true)}
          className="px-4 py-2 bg-emerald-600 text-white font-medium text-sm rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Nuevo Cliente
        </button>
      </div>

      <BuscadorCliente onClienteSeleccionado={(cliente) => setClienteSeleccionado(cliente)} />

      {clienteSeleccionado && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Cliente Seleccionado
              </span>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{clienteSeleccionado.nombre}</h3>
              <p className="text-sm text-slate-500">{clienteSeleccionado.celular}</p>
            </div>
            <button
              onClick={() => setClienteSeleccionado(null)}
              className="text-xs text-rose-600 hover:underline"
            >
              Cambiar
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Observaciones de Recepción / Alertas preliminares:
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Cliente refiere piel sensible hoy, consulta por zona axilas..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleEnviarAGabinete}
              disabled={guardando}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {guardando ? 'Enviando...' : 'Paso a Gabinete (Enviar a Espera)'}
            </button>
          </div>
        </div>
      )}

      {mostrarModalNuevo && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Alta Rápida de Cliente</h3>
            <form onSubmit={handleCrearCliente} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={nombreNuevo}
                  onChange={(e) => setNombreNuevo(e.target.value)}
                  placeholder="Ej: Laura Pérez (Prueba)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono / Celular *</label>
                <input
                  type="text"
                  required
                  value={celularNuevo}
                  onChange={(e) => setCelularNuevo(e.target.value)}
                  placeholder="Ej: 3412983734"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creandoCliente}
                  className="px-4 py-2 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {creandoCliente ? 'Guardando...' : 'Crear y Seleccionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mensaje && (
        <div className={`p-4 rounded-lg text-sm font-medium ${mensaje.includes('❌') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {mensaje}
        </div>
      )}
    </div>
  );
}