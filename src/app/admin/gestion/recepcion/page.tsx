'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

import BuscadorMulticoincidencia from './components/BuscadorMulticoincidencia';
import ResumenReservaCobro from './components/ResumenReservaCobro';
import ChecklistAnamnesis from './components/ChecklistAnamnesis';
import SelectorZonasBotones from './components/SelectorZonasBotones';

import BannerAlertasClinicas from '../components/BannerAlertasClinicas';
import ModalHistorialSesiones from '../components/ModalHistorialSesiones';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RecepcionPage() {
  const [pacienteFicha, setPacienteFicha] = useState<any>(null);
  const [reservaHoy, setReservaHoy] = useState<any>(null);
  const [esNuevo, setEsNuevo] = useState(false);

  // Campos del Paciente
  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [fototipo, setFototipo] = useState('Fototipo III');
  const [observacionesFijas, setObservacionesFijas] = useState('');
  const [antecedentes, setAntecedentes] = useState({
    embarazo: false,
    solReciente: false,
    medicacion: false,
    pielSensible: false,
  });

  // Operación del Día
  const [cobradoEnPuerta, setCobradoEnPuerta] = useState(false);
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([]);
  const [observacionesHoy, setObservacionesHoy] = useState('');

  // Modales y Estados de UI
  const [pacienteIdModal, setPacienteIdModal] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleClienteSeleccionado = (data: { pacienteFicha: any; reservaHoy: any }) => {
    setMensaje(null);
    setReservaHoy(data.reservaHoy);

    if (data.pacienteFicha) {
      setPacienteFicha(data.pacienteFicha);
      setEsNuevo(false);
      setNombre(data.pacienteFicha.nombre_completo);
      setCelular(data.pacienteFicha.celular);
      setFototipo(data.pacienteFicha.fototipo || 'Fototipo III');
      setObservacionesFijas(data.pacienteFicha.observaciones_fijas || '');
      setAntecedentes(
        data.pacienteFicha.antecedentes_medicos || {
          embarazo: false,
          solReciente: false,
          medicacion: false,
          pielSensible: false,
        }
      );
    } else {
      setPacienteFicha(null);
      setEsNuevo(true);
      setNombre(data.reservaHoy?.cliente_nombre || '');
      setCelular(data.reservaHoy?.cliente_celular || '');
      setFototipo('Fototipo III');
      setObservacionesFijas('');
      setAntecedentes({ embarazo: false, solReciente: false, medicacion: false, pielSensible: false });
    }
  };

  const handleEnviarAGabinete = async () => {
    if (zonasSeleccionadas.length === 0) {
      setMensaje('⚠️ Selecciona al menos una zona para realizar hoy.');
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      let pacienteId = pacienteFicha?.id;

      // 1. Guardar o Actualizar Ficha de Paciente
      if (esNuevo || !pacienteId) {
        const { data: nuevo, error: errFicha } = await supabase
          .from('pacientes_ficha')
          .insert({
            nombre_completo: nombre,
            celular: celular,
            fototipo: fototipo,
            antecedentes_medicos: antecedentes,
            observaciones_fijas: observacionesFijas,
          })
          .select('id')
          .single();

        if (errFicha) throw errFicha;
        pacienteId = nuevo.id;
      } else {
        await supabase
          .from('pacientes_ficha')
          .update({
            fototipo: fototipo,
            antecedentes_medicos: antecedentes,
            observaciones_fijas: observacionesFijas,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pacienteId);
      }

      // 2. Crear Registro en Sesiones Gabinete (estado: en_espera)
      const precioTotal = Number(reservaHoy?.precio_total || reservaHoy?.monto_total || 0);
      const montoAbonado = Number(reservaHoy?.monto_abonado || reservaHoy?.sena || 0);
      const saldoRestante = Math.max(0, precioTotal - montoAbonado);

      const { error: errSesion } = await supabase.from('sesiones_gabinete').insert({
        paciente_id: pacienteId,
        reserva_id: reservaHoy?.id || null,
        estado: 'en_espera',
        observaciones_recepcion: observacionesHoy,
        zonas_preasignadas: zonasSeleccionadas,
        saldo_pendiente: cobradoEnPuerta ? 0 : saldoRestante,
        estado_pago_recepcion: cobradoEnPuerta ? 'cobrado' : 'pendiente',
        parametros_tecnicos: {},
      });

      if (errSesion) throw errSesion;

      setMensaje('✅ ¡Paciente derivado a Gabinete (En Espera)!');
      limpiar();
    } catch (err: any) {
      console.error(err);
      setMensaje(`❌ Error: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const limpiar = () => {
    setPacienteFicha(null);
    setReservaHoy(null);
    setEsNuevo(false);
    setNombre('');
    setCelular('');
    setZonasSeleccionadas([]);
    setObservacionesHoy('');
    setCobradoEnPuerta(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Módulo Recepción (PRO-EVAL)</h1>
        <p className="text-xs text-slate-500">Búsqueda, evaluación clínica y derivación a gabinete.</p>
      </div>

      <BuscadorMulticoincidencia
        onClienteSeleccionado={handleClienteSeleccionado}
        onVerHistorialDirecto={(id) => setPacienteIdModal(id)}
      />

      {(pacienteFicha || esNuevo) && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-base font-bold text-slate-800">
              {esNuevo ? '🆕 Nuevo Paciente' : `👤 ${nombre}`}
            </h3>
            {pacienteFicha && (
              <button
                onClick={() => setPacienteIdModal(pacienteFicha.id)}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                📋 Ver Historial Completo
              </button>
            )}
          </div>

          <BannerAlertasClinicas
            antecedentes={antecedentes}
            observacionesFijas={observacionesFijas}
          />

          <ResumenReservaCobro
            reserva={reservaHoy}
            cobradoEnPuerta={cobradoEnPuerta}
            onToggleCobrado={setCobradoEnPuerta}
          />

          <ChecklistAnamnesis
            fototipo={fototipo}
            setFototipo={setFototipo}
            antecedentes={antecedentes}
            setAntecedentes={setAntecedentes}
            observacionesFijas={observacionesFijas}
            setObservacionesFijas={setObservacionesFijas}
          />

          <SelectorZonasBotones
            zonasSeleccionadas={zonasSeleccionadas}
            setZonasSeleccionadas={setZonasSeleccionadas}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas para Gabinete:
            </label>
            <input
              type="text"
              value={observacionesHoy}
              onChange={(e) => setObservacionesHoy(e.target.value)}
              placeholder="Ej: Sensibilidad leve en axilas..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <button
            onClick={handleEnviarAGabinete}
            disabled={guardando}
            className="w-full py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 disabled:opacity-50"
          >
            {guardando ? 'Enviando...' : '🚀 Enviar a Gabinete (En Espera)'}
          </button>
        </div>
      )}

      {mensaje && (
        <div className="p-3 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800">
          {mensaje}
        </div>
      )}

      <ModalHistorialSesiones
        pacienteId={pacienteIdModal || ''}
        isOpen={!!pacienteIdModal}
        onClose={() => setPacienteIdModal(null)}
      />
    </div>
  );
}