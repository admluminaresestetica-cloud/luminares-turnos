'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BloqueHorario,
  DisponibilidadMensualGeneral,
  FiltroDisponibilidadGeneral,
} from '@/lib/types';
import {
  EmpleadoDisponible,
  eliminarDisponibilidadDiaGeneral,
  guardarDisponibilidadDiasGeneral,
  obtenerDisponibilidadMesGeneral,
  obtenerEmpleadosActivos,
} from '@/lib/supabase/disponibilidad-mensual';

function getMesActualYYYYMM(): string {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function getHoyYYYYMMDD(): string {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  const d = String(hoy.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useDisponibilidadMensualGeneral() {
  const [mesSeleccionado, setMesSeleccionado] = useState<string>(getMesActualYYYYMM);
  const [filtroEmpleado, setFiltroEmpleado] = useState<FiltroDisponibilidadGeneral>('general');
  const [empleados, setEmpleados] = useState<EmpleadoDisponible[]>([]);

  const [registrosMes, setRegistrosMes] = useState<DisponibilidadMensualGeneral[]>([]);
  const [loadingMes, setLoadingMes] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(getHoyYYYYMMDD);
  const [activoDia, setActivoDia] = useState<boolean>(true);
  const [bloquesDia, setBloquesDia] = useState<BloqueHorario[]>([{ inicio: '09:00', fin: '13:00' }]);

  const empleadoIdActual = filtroEmpleado === 'general' ? null : filtroEmpleado;

  const cargarEmpleados = useCallback(async () => {
    const lista = await obtenerEmpleadosActivos();
    setEmpleados(lista);
  }, []);

  const cargarMes = useCallback(async () => {
    setLoadingMes(true);
    setMensaje(null);
    const data = await obtenerDisponibilidadMesGeneral(mesSeleccionado, filtroEmpleado);
    setRegistrosMes(data);
    setLoadingMes(false);
  }, [mesSeleccionado, filtroEmpleado]);

  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  useEffect(() => {
    cargarMes();
  }, [cargarMes]);

  // Al cambiar de mes, si el día seleccionado no pertenece a ese mes, ajustamos al día 1 del mes
  useEffect(() => {
    if (!mesSeleccionado) return;
    if (!diaSeleccionado.startsWith(mesSeleccionado)) {
      setDiaSeleccionado(`${mesSeleccionado}-01`);
    }
  }, [mesSeleccionado, diaSeleccionado]);

  const registroDiaActual = useMemo(
    () => registrosMes.find((r) => r.fecha === diaSeleccionado) || null,
    [registrosMes, diaSeleccionado]
  );

  // Sincroniza el editor del día cuando cambia el día seleccionado o los registros cargados
  useEffect(() => {
    if (registroDiaActual) {
      setActivoDia(registroDiaActual.activo);
      setBloquesDia(
        registroDiaActual.bloques.length > 0
          ? registroDiaActual.bloques
          : [{ inicio: '09:00', fin: '13:00' }]
      );
    } else {
      setActivoDia(true);
      setBloquesDia([{ inicio: '09:00', fin: '13:00' }]);
    }
  }, [registroDiaActual, diaSeleccionado]);

  const agregarBloque = () => {
    setBloquesDia((prev) => [...prev, { inicio: '14:00', fin: '18:00' }]);
  };

  const quitarBloque = (index: number) => {
    setBloquesDia((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const actualizarBloque = (index: number, campo: 'inicio' | 'fin', valor: string) => {
    setBloquesDia((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [campo]: valor } : b))
    );
  };

  const validarBloques = (bloques: BloqueHorario[]): string | null => {
    for (const b of bloques) {
      if (!b.inicio || !b.fin) {
        return 'Completá la hora de inicio y fin en todas las franjas.';
      }
      if (b.inicio >= b.fin) {
        return `La hora de inicio (${b.inicio}) debe ser menor que la de fin (${b.fin}).`;
      }
    }
    return null;
  };

  const guardarDiaActual = async () => {
    if (!diaSeleccionado) return;
    setMensaje(null);

    const bloquesAEnviar = activoDia ? bloquesDia : [];
    if (activoDia) {
      const errValidacion = validarBloques(bloquesAEnviar);
      if (errValidacion) {
        setMensaje({ tipo: 'error', texto: errValidacion });
        return;
      }
    }

    setGuardando(true);
    const res = await guardarDisponibilidadDiasGeneral([
      {
        fecha: diaSeleccionado,
        empleado_id: empleadoIdActual,
        activo: activoDia,
        bloques: bloquesAEnviar,
      },
    ]);
    setGuardando(false);

    if (!res.ok) {
      setMensaje({ tipo: 'error', texto: res.error || 'No se pudo guardar el día.' });
      return;
    }

    setMensaje({ tipo: 'ok', texto: 'Disponibilidad del día guardada.' });
    await cargarMes();
  };

  /**
   * Copia el horario actual (o estado cerrado) a todos los mismos días de la semana dentro del mes elegido.
   */
  const copiarAMismosDiasDelMes = async () => {
    if (!diaSeleccionado || !mesSeleccionado) return;
    setMensaje(null);

    const bloquesAEnviar = activoDia ? bloquesDia : [];
    if (activoDia) {
      const errValidacion = validarBloques(bloquesAEnviar);
      if (errValidacion) {
        setMensaje({ tipo: 'error', texto: errValidacion });
        return;
      }
    }

    const [yStr, mStr] = mesSeleccionado.split('-');
    const year = Number(yStr);
    const month = Number(mStr);
    const ultimoDia = new Date(year, month, 0).getDate();

    const [dy, dm, dd] = diaSeleccionado.split('-').map(Number);
    const diaSemanaObjetivo = new Date(dy, dm - 1, dd).getDay();

    const fechasCoincidentes: string[] = [];
    for (let d = 1; d <= ultimoDia; d++) {
      const fechaObj = new Date(year, month - 1, d);
      if (fechaObj.getDay() === diaSemanaObjetivo) {
        const iso = `${yStr}-${mStr}-${String(d).padStart(2, '0')}`;
        fechasCoincidentes.push(iso);
      }
    }

    if (fechasCoincidentes.length === 0) return;

    setGuardando(true);
    const res = await guardarDisponibilidadDiasGeneral(
      fechasCoincidentes.map((fecha) => ({
        fecha,
        empleado_id: empleadoIdActual,
        activo: activoDia,
        bloques: bloquesAEnviar,
      }))
    );
    setGuardando(false);

    if (!res.ok) {
      setMensaje({ tipo: 'error', texto: res.error || 'No se pudo copiar a los demás días.' });
      return;
    }

    setMensaje({
      tipo: 'ok',
      texto: `Horario aplicado a ${fechasCoincidentes.length} día(s) del mes.`,
    });
    await cargarMes();
  };

  const limpiarOverrideDia = async () => {
    if (!diaSeleccionado) return;
    setMensaje(null);
    setGuardando(true);
    const res = await eliminarDisponibilidadDiaGeneral(diaSeleccionado, empleadoIdActual);
    setGuardando(false);

    if (!res.ok) {
      setMensaje({ tipo: 'error', texto: res.error || 'No se pudo quitar la carga del día.' });
      return;
    }

    setMensaje({ tipo: 'ok', texto: 'Se quitó la carga mensual de este día.' });
    await cargarMes();
  };

  return {
    mesSeleccionado,
    setMesSeleccionado,
    filtroEmpleado,
    setFiltroEmpleado,
    empleados,
    registrosMes,
    loadingMes,
    guardando,
    mensaje,
    diaSeleccionado,
    setDiaSeleccionado,
    registroDiaActual,
    activoDia,
    setActivoDia,
    bloquesDia,
    agregarBloque,
    quitarBloque,
    actualizarBloque,
    guardarDiaActual,
    copiarAMismosDiasDelMes,
    limpiarOverrideDia,
    recargarMes: cargarMes,
  };
}