'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User, Phone, FileText, AlertCircle, CheckCircle2, History, Plus, Send, ClipboardCheck } from 'lucide-react';
import ModalAnamnesisRecepcion from './ModalAnamnesisRecepcion';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PanelFichaPacienteProps {
  turnoSeleccionado: any;
  onPacienteListo: (pacienteFicha: any) => void;
}

export default function PanelFichaPaciente({
  turnoSeleccionado,
  onPacienteListo,
}: PanelFichaPacienteProps) {
  const [loading, setLoading] = useState(false);
  const [pacienteFicha, setPacienteFicha] = useState<any>(null);
  const [creandoFicha, setCreandoFicha] = useState(false);
  const [sesionesPrevias, setSesionesPrevias] = useState<any[]>([]);
  const [isModalAnamnesisOpen, setIsModalAnamnesisOpen] = useState(false);

  // Buscar o verificar si el cliente ya tiene ficha en pacientes_ficha
  const buscarFichaPaciente = async () => {
    if (!turnoSeleccionado) return;
    setLoading(true);
    try {
      let query = supabase.from('pacientes_ficha').select('*');
      
      if (turnoSeleccionado.cliente_celular) {
        query = query.eq('celular', turnoSeleccionado.cliente_celular);
      } else {
        query = query.eq('nombre_completo', turnoSeleccionado.cliente_nombre);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error al buscar paciente_ficha:', error);
      }

      if (data) {
        setPacienteFicha(data);
        onPacienteListo(data);
        cargarSesionesPrevias(data.id);
      } else {
        setPacienteFicha(null);
      }
    } catch (err) {
      console.error('Excepción al buscar ficha:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!turnoSeleccionado) {
      setPacienteFicha(null);
      setSesionesPrevias([]);
      return;
    }
    buscarFichaPaciente();
  }, [turnoSeleccionado]);

  // Cargar historial rápido de sesiones anteriores
  const cargarSesionesPrevias = async (pacienteId: string) => {
    try {
      const { data } = await supabase
        .from('sesiones_laser')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (data) setSesionesPrevias(data);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  };

  // Crear ficha automáticamente si no existe
  const handleCrearFicha = async () => {
    if (!turnoSeleccionado) return;
    setCreandoFicha(true);
    try {
      const nuevaFicha = {
        nombre_completo: turnoSeleccionado.cliente_nombre,
        celular: turnoSeleccionado.cliente_celular || '',
        estado_atencion: 'pendiente',
      };

      const { data, error } = await supabase
        .from('pacientes_ficha')
        .insert([nuevaFicha])
        .select()
        .single();

      if (error) {
        console.error('Error al crear ficha:', error);
        alert('Hubo un error al crear la ficha del paciente.');
      } else if (data) {
        setPacienteFicha(data);
        onPacienteListo(data);
      }
    } catch (err) {
      console.error('Excepción al crear ficha:', err);
    } finally {
      setCreandoFicha(false);
    }
  };

  if (!turnoSeleccionado) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-zinc-800">
        <p className="text-xs text-slate-400 dark:text-zinc-500">
          Selecciona un turno de la agenda para ver o crear la ficha del paciente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-900">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            {turnoSeleccionado.cliente_nombre}
          </h2>
          <p className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
            <Phone className="h-3 w-3" /> {turnoSeleccionado.cliente_celular || 'Sin celular registrado'}
          </p>
        </div>
        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          {turnoSeleccionado.servicio_tipo || 'General'}
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Buscando ficha del cliente...</div>
      ) : pacienteFicha ? (
        /* SI YA TIENE FICHA CREADA */
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
              <CheckCircle2 className="h-4 w-4" /> Ficha vinculada
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
              pacienteFicha.estado_atencion === 'en_espera'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                : 'bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400'
            }`}>
              Estado: {pacienteFicha.estado_atencion || 'Pendiente'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-zinc-900">
            <div>
              <span className="text-[10px] text-slate-400">Fototipo:</span>
              <p className="font-semibold text-slate-700 dark:text-zinc-300">
                {pacienteFicha.fototipo || 'No especificado'}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400">Creado el:</span>
              <p className="font-semibold text-slate-700 dark:text-zinc-300">
                {new Date(pacienteFicha.created_at).toLocaleDateString('es-AR')}
              </p>
            </div>
          </div>

          {/* Observaciones fijas */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">Observaciones Fijas:</span>
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-2.5 text-[11px] text-slate-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
              {pacienteFicha.observaciones_fijas || 'Sin observaciones fijas cargadas.'}
            </div>
          </div>

          {/* Botón principal para abrir el Modal de Anamnesis y Enviar a Gabinete */}
          <button
            onClick={() => setIsModalAnamnesisOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all"
          >
            <ClipboardCheck className="h-4 w-4" />
            Completar Anamnesis y Enviar a Gabinete
          </button>

          {/* Historial de sesiones recientes */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-900">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
              <History className="h-3.5 w-3.5 text-slate-400" /> Últimas Sesiones
            </div>
            {sesionesPrevias.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">No registra sesiones anteriores.</p>
            ) : (
              <div className="space-y-1">
                {sesionesPrevias.map((s, idx) => (
                  <div key={s.id || idx} className="flex justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] text-slate-600 dark:bg-zinc-900 dark:text-zinc-400">
                    <span>{new Date(s.created_at).toLocaleDateString('es-AR')}</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400 capitalize">{s.estado_atencion || 'Atendido'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SI EL PACIENTE NO TIENE FICHA EN LA BASE */
        <div className="space-y-4 py-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/40">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-800 dark:text-zinc-200">
              Este cliente aún no tiene su ficha médica en el sistema.
            </p>
            <p className="text-[11px] text-slate-400">
              Haz clic abajo para crearlas automáticamente con los datos del turno.
            </p>
          </div>
          <button
            onClick={handleCrearFicha}
            disabled={creandoFicha}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {creandoFicha ? 'Creando ficha...' : 'Crear Ficha de Paciente'}
          </button>
        </div>
      )}

      {/* Modal de Anamnesis */}
      <ModalAnamnesisRecepcion
        isOpen={isModalAnamnesisOpen}
        onClose={() => setIsModalAnamnesisOpen(false)}
        pacienteFicha={pacienteFicha}
        turnoSeleccionado={turnoSeleccionado}
        onGuardadoExitoso={() => {
          buscarFichaPaciente();
          alert('¡Paciente enviado a gabinete con éxito!');
        }}
      />
    </div>
  );
}