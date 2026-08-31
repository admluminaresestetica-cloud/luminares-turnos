'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Settings,
  UserRound,
  UserPlus,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

import BuscadorMulticoincidencia from './components/BuscadorMulticoincidencia';
import ResumenReservaCobro from './components/ResumenReservaCobro';
import ChecklistAnamnesis from './components/ChecklistAnamnesis';
import SelectorZonasBotones from './components/SelectorZonasBotones';
import ConfiguracionAnamnesis from './components/ConfiguracionAnamnesis';

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

  const [mostrarConfigAnamnesis, setMostrarConfigAnamnesis] = useState(false);

  // Campos del Paciente
  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [fototipo, setFototipo] = useState('Fototipo III');
  const [observacionesFijas, setObservacionesFijas] = useState('');
  const [antecedentes, setAntecedentes] = useState<Record<string, boolean>>({});

  // Operación del Día
  const [cobradoEnPuerta, setCobradoEnPuerta] = useState(false);
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([]);
  const [observacionesHoy, setObservacionesHoy] = useState('');

  // Modales y Estados de UI
  const [pacienteIdModal, setPacienteIdModal] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const extraerZonasDeReserva = (reserva: any): string[] => {
    if (!reserva) return [];

    let detalle = reserva.detalle_reserva;

    if (!detalle) {
      if (reserva.servicio_tipo) return [reserva.servicio_tipo];
      return [];
    }

    if (typeof detalle === 'string') {
      try {
        detalle = JSON.parse(detalle);
      } catch (e) {
        return detalle.split(/[,+\-/]/).map((z: string) => z.trim()).filter(Boolean);
      }
    }

    if (Array.isArray(detalle)) {
      return detalle
        .map((item: any) => {
          if (typeof item === 'string') return item;
          return item.nombre_zona || item.nombre || item.zona || item.titulo || '';
        })
        .filter(Boolean);
    }

    if (typeof detalle === 'object') {
      if (Array.isArray(detalle.zonas)) {
        return detalle.zonas.map((z: any) => (typeof z === 'string' ? z : z.nombre_zona || z.nombre));
      }
      if (Array.isArray(detalle.zonas_seleccionadas)) {
        return detalle.zonas_seleccionadas;
      }
      if (detalle.nombre_zona) return [detalle.nombre_zona];
      if (detalle.nombre) return [detalle.nombre];
      if (detalle.servicio) return [detalle.servicio];
    }

    return [];
  };

  const handleClienteSeleccionado = (data: { pacienteFicha: any; reservaHoy: any }) => {
    setMensaje(null);
    setReservaHoy(data.reservaHoy);

    const zonasPrecalculadas = extraerZonasDeReserva(data.reservaHoy);
    setZonasSeleccionadas(zonasPrecalculadas);

    if (data.pacienteFicha) {
      setPacienteFicha(data.pacienteFicha);
      setEsNuevo(false);
      setNombre(data.pacienteFicha.nombre_completo || '');
      setCelular(data.pacienteFicha.celular || '');
      setFototipo(data.pacienteFicha.fototipo || 'Fototipo III');
      setObservacionesFijas(data.pacienteFicha.observaciones_fijas || '');

      // ✅ Si ya tiene antecedentes guardados los usa; si no, objeto vacío
      setAntecedentes(data.pacienteFicha.antecedentes_medicos || {});
    } else {
      setPacienteFicha(null);
      setEsNuevo(true);
      setNombre(data.reservaHoy?.cliente_nombre || '');
      setCelular(data.reservaHoy?.cliente_celular || '');
      setFototipo('Fototipo III');
      setObservacionesFijas('');

      // ✅ Para nuevo cliente arranca completamente limpio
      setAntecedentes({});
    }
  };

const handleEnviarAGabinete = async () => {
    if (zonasSeleccionadas.length === 0) {
      setMensaje('⚠️ Seleccioná al menos una zona para realizar hoy.');
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      let pacienteId = pacienteFicha?.id;

      // 🛑 VALIDACIÓN: Verificar si el cliente ya fue derivado hoy
      const inicioHoy = new Date();
      inicioHoy.setHours(0, 0, 0, 0);

      // Si tenemos celular o ID, buscamos si ya fue derivado en la fecha actual
      let query = supabase
        .from('pacientes_ficha')
        .select('id, estado_atencion, updated_at')
        .gte('updated_at', inicioHoy.toISOString());

      if (pacienteId) {
        query = query.eq('id', pacienteId);
      } else if (celular) {
        query = query.eq('celular', celular);
      }

      const { data: existente } = await query;

      if (existente && existente.length > 0) {
        const estadoActual = existente[0].estado_atencion;
        if (['en_espera', 'en_atencion', 'atendido'].includes(estadoActual)) {
          setMensaje(`⚠️ El paciente ya fue derivado a Gabinete el día de hoy (Estado: ${estadoActual}).`);
          setGuardando(false);
          return;
        }
      }

      // Payload normal para Supabase
      const payload = {
        nombre_completo: nombre,
        celular: celular,
        fototipo: fototipo,
        antecedentes_medicos: antecedentes,
        observaciones_fijas: observacionesFijas,
        estado_atencion: 'en_espera',
        zonas_realizadas: zonasSeleccionadas,
        observaciones_recepcion: observacionesHoy,
        anamnesis_sesion: antecedentes,
        updated_at: new Date().toISOString(),
      };

      if (esNuevo || !pacienteId) {
        const { data: nuevo, error: errFicha } = await supabase
          .from('pacientes_ficha')
          .insert(payload)
          .select('id')
          .single();

        if (errFicha) throw errFicha;
        pacienteId = nuevo.id;
      } else {
        const { error: errUpdate } = await supabase
          .from('pacientes_ficha')
          .update(payload)
          .eq('id', pacienteId);

        if (errUpdate) throw errUpdate;
      }

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
    setAntecedentes({});
  };

  const hayPacienteActivo = pacienteFicha || esNuevo;

  const configMensaje = mensaje?.startsWith('✅')
    ? {
        wrap: 'border-emerald-200/80 bg-emerald-50 text-emerald-800',
        icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />,
      }
    : mensaje?.startsWith('❌')
    ? {
        wrap: 'border-rose-200/80 bg-rose-50 text-rose-800 ring-1 ring-rose-200',
        icon: <XCircle className="h-4 w-4 shrink-0 text-rose-600" />,
      }
    : mensaje?.startsWith('⚠️')
    ? {
        wrap: 'border-amber-200/80 bg-amber-50 text-amber-800',
        icon: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />,
      }
    : {
        wrap: 'border-slate-200/80 bg-slate-50 text-slate-800',
        icon: null,
      };

  const textoBoton = guardando
    ? 'Enviando...'
    : `Enviar a Gabinete${zonasSeleccionadas.length ? ` (${zonasSeleccionadas.length})` : ''}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div
        className={`mx-auto max-w-6xl space-y-5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 ${
          hayPacienteActivo && !mostrarConfigAnamnesis ? 'pb-28 lg:pb-8' : 'pb-8'
        }`}
      >
        {/* Encabezado */}
        <header className="flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Recepción
            </h1>
            <p className="text-sm text-slate-500">
              Búsqueda, evaluación clínica y derivación a gabinete
            </p>
          </div>

          <button
            onClick={() => setMostrarConfigAnamnesis(!mostrarConfigAnamnesis)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]"
          >
            <Settings className="h-4 w-4 text-teal-600" />
            <span>{mostrarConfigAnamnesis ? 'Volver a Recepción' : 'Configurar Anamnesis'}</span>
          </button>
        </header>

        {mostrarConfigAnamnesis ? (
          <ConfiguracionAnamnesis onClose={() => setMostrarConfigAnamnesis(false)} />
        ) : (
          <>
            <BuscadorMulticoincidencia
              onClienteSeleccionado={handleClienteSeleccionado}
              onVerHistorialDirecto={(id) => setPacienteIdModal(id)}
            />

            {hayPacienteActivo && (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
                {/* Columna clínica */}
                <div className="space-y-5 lg:col-span-7 xl:col-span-8">
                  <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                          {esNuevo ? <UserPlus className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-slate-900">
                            {esNuevo ? 'Nuevo paciente' : nombre || 'Paciente'}
                          </p>
                          {esNuevo ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                              Se creará una ficha nueva
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Ficha clínica registrada
                            </span>
                          )}
                        </div>
                      </div>

                      {pacienteFicha && (
                        <button
                          onClick={() => setPacienteIdModal(pacienteFicha.id)}
                          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                          <ClipboardList className="h-3.5 w-3.5 text-teal-600" />
                          <span className="hidden sm:inline">Ver historial</span>
                        </button>
                      )}
                    </div>

                    <BannerAlertasClinicas
                      antecedentes={antecedentes}
                      observacionesFijas={observacionesFijas}
                    />
                  </div>

                  <ChecklistAnamnesis
                    fototipo={fototipo}
                    setFototipo={setFototipo}
                    antecedentes={antecedentes}
                    setAntecedentes={setAntecedentes}
                    observacionesFijas={observacionesFijas}
                    setObservacionesFijas={setObservacionesFijas}
                  />
                </div>

                {/* Columna operativa (sticky en desktop) */}
                <div className="space-y-5 lg:sticky lg:top-6 lg:col-span-5 xl:col-span-4">
                  <ResumenReservaCobro
                    reserva={reservaHoy}
                    cobradoEnPuerta={cobradoEnPuerta}
                    onToggleCobrado={setCobradoEnPuerta}
                  />

                  <div className="space-y-5 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:p-5">
                    <SelectorZonasBotones
                      zonasSeleccionadas={zonasSeleccionadas}
                      setZonasSeleccionadas={setZonasSeleccionadas}
                    />

                    <div className="border-t border-slate-100 pt-4">
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Notas para gabinete
                      </label>
                      <input
                        type="text"
                        value={observacionesHoy}
                        onChange={(e) => setObservacionesHoy(e.target.value)}
                        placeholder="Ej: Sensibilidad leve en axilas..."
                        className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    {mensaje && (
                      <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs font-semibold ${configMensaje.wrap}`}>
                        {configMensaje.icon}
                        <span>{mensaje}</span>
                      </div>
                    )}

                    {/* Botón de envío — versión desktop/tablet, integrada en el panel */}
                    <button
                      onClick={handleEnviarAGabinete}
                      disabled={guardando}
                      className="hidden h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none lg:flex"
                    >
                      {textoBoton}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Mensaje flotante para cuando no hay panel operativo visible (p.ej. sin zonas aún) */}
        {mensaje && !hayPacienteActivo && (
          <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs font-semibold ${configMensaje.wrap}`}>
            {configMensaje.icon}
            <span>{mensaje}</span>
          </div>
        )}
      </div>

      {/* Barra de acción fija — mobile / tablet vertical */}
      {hayPacienteActivo && !mostrarConfigAnamnesis && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/80 bg-white/95 p-3 backdrop-blur-md lg:hidden">
          <button
            onClick={handleEnviarAGabinete}
            disabled={guardando}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
          >
            {textoBoton}
          </button>
        </div>
      )}

      <ModalHistorialSesiones
        pacienteId={pacienteIdModal || ''}
        celularPaciente={pacienteFicha?.celular || celular}
        isOpen={!!pacienteIdModal}
        onClose={() => setPacienteIdModal(null)}
      />
    </div>
  );
}