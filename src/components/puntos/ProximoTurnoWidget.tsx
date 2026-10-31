'use client';

import { Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

interface ProximoTurnoWidgetProps {
  proximoTurno: any;
  cargandoTurno: boolean;
  onCloseModal: () => void;
}

export default function ProximoTurnoWidget({
  proximoTurno,
  cargandoTurno,
  onCloseModal,
}: ProximoTurnoWidgetProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-3 space-y-1.5 shadow-xs">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3 text-primary" /> Próximo Turno Agendado
        </span>
      </div>
      {cargandoTurno ? (
        <p className="text-[11px] text-muted-foreground py-1 animate-pulse">Buscando citas...</p>
      ) : proximoTurno ? (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/15 p-3 rounded-2xl">
          <div className="flex items-start gap-3">
            {/* Contenedor elegante para el icono de Lucide */}
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            
            <div className="space-y-0.5 pr-2">
              <p className="text-xs font-bold text-foreground line-clamp-1">
                {proximoTurno.detalle_reserva?.detalle_texto || 'Servicio Estético'}
              </p>
              <p className="text-[11px] font-medium text-primary">
                {new Date(proximoTurno.fecha_hora_inicio).toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })} a las {new Date(proximoTurno.fecha_hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
              </p>
            </div>
          </div>
          <Link 
            href="/mis-turnos" 
            onClick={onCloseModal}
            className="text-[10px] font-bold px-2.5 py-1.5 bg-primary text-primary-foreground rounded-lg shrink-0 shadow-2xs"
          >
            Ver
          </Link>
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground py-1">
          No tenés turnos próximos agendados.
        </p>
      )}
    </div>
  );
}
