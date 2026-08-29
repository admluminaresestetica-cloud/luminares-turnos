'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import BuscadorCliente from '../componentes/BuscadorCliente';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RecepcionPage() {
  const [pacienteFicha, setPacienteFicha] = useState<any>(null);
  const [reservaHoy, setReservaHoy] = useState<any>(null);
  const [esNuevo, setEsNuevo] = useState(false);

  // Formulario para pacientes nuevos
  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [fototipo, setFototipo] = useState('Fototipo III');
  const [observacionesFijas, setObservacionesFijas] = useState('');

  // Observaciones puntuales para la sesión de hoy
  const [observacionesHoy, setObservacionesHoy] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleResultadoSeleccionado = (data: { pacienteFicha: any; reservaHoy: any }) => {
    setMensaje(null);
    setReservaHoy(data.reservaHoy);

    if (data.pacienteFicha) {
      // Paciente existente
      setPacienteFicha(data.pacienteFicha);
      setEsNuevo(false);
    } else {
      // Paciente nuevo que viene de una reserva web
      setPacienteFicha(null);
      setEsNuevo(true);
      setNombre(data.reservaHoy?.cliente_nombre || '');
      setCelular(data.reservaHoy?.cliente_celular || '');
    }
  };

  const handleEnviarAGabinete = async () => {
    setGuardando(true);
    setMensaje(null);

    try {
      let pacienteId = pacienteFicha?.id;

      // 1. Si es nuevo, primero creamos su registro en `pacientes_ficha`
      if (esNuevo || !pacienteId) {
        const { data: nuevoPaciente, error: errorFicha } = await supabase
          .from('pacientes_ficha')
          .insert({
            nombre_completo: nombre,
            celular: celular,
            fototipo: fototipo,
            observaciones_fijas: observacionesFijas
          })
          .select('id')
          .single();

        if (errorFicha) throw errorFicha;
        pacienteId = nuevoPaciente.id;
      }

      // 2. Crear la sesión en `sesiones_gabinete` (en espera)
      const { error: errorSesion } = await supabase.from('sesiones_gabinete').insert({
        paciente_id: pacienteId,
        reserva_id: reservaHoy?.id || null,
        estado: 'en_espera',
        observaciones_recepcion: observacionesHoy,
        zonas_preasignadas: reservaHoy?.detalle_reserva || [],
        parametros_tecnicos: {}
      });

      if (errorSesion) throw errorSesion;

      setMensaje('✅ ¡Paciente cargado y enviado a Gabinete con éxito!');
      limpiarFormulario();
    } catch (err: any) {
      console.error(err);
      setMensaje(`❌ Error: ${err.message || 'No se pudo completar la operación'}`);
    } finally {
      setGuardando(false);
    }
  };

  const limpiarFormulario = () => {
    setPacienteFicha(null);
    setReservaHoy(null);
    setEsNuevo(false);
    setNombre('');
    setCelular('');
    setFototipo('Fototipo III');
    setObservacionesFijas('');
    setObservacionesHoy('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recepción / Pre-asignación</h1>
        <p className="text-slate-500 text-sm">Gestiona el ingreso de pacientes y vincula sus fichas clínicas.</p>
      </div>

      <BuscadorCliente onResultadoSeleccionado={handleResultadoSeleccionado} />

      {/* TARJETA DE PACIENTE SELECCIONADO / FICHA */}
      {(pacienteFicha || esNuevo) && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-800">
              {esNuevo ? '🆕 Ficha Médica Inicial (Paciente Nuevo)' : '👤 Ficha de Paciente Registrado'}
            </h3>
            <button onClick={limpiarFormulario} className="text-xs text-rose-600 hover:underline">
              Cancelar / Cambiar
            </button>
          </div>

          {/* DATOS PERSONALES */}
          {esNuevo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Celular</label>
                <input
                  type="text"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fototipo de Piel (Fitzpatrick)</label>
                <select
                  value={fototipo}
                  onChange={(e) => setFototipo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Fototipo I">Fototipo I (Piel muy clara / Pelirroja)</option>
                  <option value="Fototipo II">Fototipo II (Piel clara / Sensible)</option>
                  <option value="Fototipo III">Fototipo III (Piel intermedia)</option>
                  <option value="Fototipo IV">Fototipo IV (Piel oscura / Se broncea fácil)</option>
                  <option value="Fototipo V">Fototipo V (Piel muy oscura)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notas Clínicas Permanentes</label>
                <input
                  type="text"
                  value={observacionesFijas}
                  onChange={(e) => setObservacionesFijas(e.target.value)}
                  placeholder="Ej: Lunar en muslo der, sensibilidad..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-slate-400 text-xs block font-medium">Paciente:</span>
                <span className="font-bold text-slate-900">{pacienteFicha.nombre_completo}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block font-medium">Celular:</span>
                <span className="font-medium text-slate-700">{pacienteFicha.celular}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block font-medium">Fototipo:</span>
                <span className="font-bold text-emerald-700">{pacienteFicha.fototipo || 'Sin especificar'}</span>
              </div>
            </div>
          )}

          {/* DATOS DE LA RESERVA DEL DÍA (SI TIENE) */}
          {reservaHoy && (
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-xs space-y-1">
              <span className="font-bold text-indigo-900">📅 Reserva de Hoy Asociada</span>
              <p className="text-indigo-700">
                Servicio: <b>{reservaHoy.servicio_tipo}</b> • Abonado: <b>${reservaHoy.monto_abonado || reservaHoy.precio_total || 0}</b>
              </p>
            </div>
          )}

          {/* OBSERVACIÓN PUNTUAL DE HOY */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Observaciones para la sesión de HOY (Gabinete):
            </label>
            <textarea
              rows={2}
              value={observacionesHoy}
              onChange={(e) => setObservacionesHoy(e.target.value)}
              placeholder="Ej: Viene por retoque en axilas, piel un poco bronceada..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm"
            />
          </div>

          <button
            onClick={handleEnviarAGabinete}
            disabled={guardando}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Paso a Gabinete (Enviar a Espera)'}
          </button>
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
