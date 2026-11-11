'use client';

import { ClienteResumen, DetalleHistorialCliente } from './types';
import { User, Mail, Phone, MapPin, Tag, Clock, Heart, ShoppingBag } from 'lucide-react';

interface Props {
  resumen: ClienteResumen;
  detalle: DetalleHistorialCliente;
}

/* ───────── Helpers puramente visuales ───────── */

const moneda = (n: number) => `$${n.toLocaleString('es-AR')}`;
const porcentaje = (parte: number, total: number) =>
  total > 0 ? Math.round((parte / total) * 100) : 0;

const FRANJAS = [
  { key: 'Mañana', rango: '08–13' },
  { key: 'Tarde', rango: '13–19' },
  { key: 'Noche', rango: '19–22' },
];

function colorEstado(estado: string) {
  const e = (estado || '').toLowerCase();
  if (e.includes('cancel') || e.includes('rechaz')) 
    return { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' };
  if (e.includes('pend') || e.includes('esper')) 
    return { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' };
  return { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' };
}

function Etiqueta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 ${className}`}>
      {children}
    </span>
  );
}

function MiniBarra({
  label,
  valor,
  display,
  color,
}: {
  label: string;
  valor: number;
  display: string;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <Etiqueta>{label}</Etiqueta>
        <span className="font-mono text-[11px] font-medium tabular-nums text-slate-600 dark:text-zinc-300">{display}</span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, valor))}%` }} />
      </div>
    </div>
  );
}

const PANEL =
  'rounded-lg border border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm';

/* ───────── Componente ───────── */

export default function FichaClienteCard({ resumen, detalle }: Props) {
  const montoReservas = detalle.reservas.reduce((acc, r) => acc + r.precio_total, 0);
  const montoPedidos = detalle.pedidos.reduce((acc, p) => acc + p.total, 0);
  const baseMonto = montoReservas + montoPedidos;

  const totalOperaciones = resumen.totalReservas + resumen.totalPedidos;
  const ticketPromedio = totalOperaciones > 0 ? Math.round(resumen.totalGastado / totalOperaciones) : 0;

  const puntosCanjeados = Math.max(resumen.puntosTotales - resumen.puntosActuales, 0);

  const reservasVisibles = detalle.reservas.slice(0, 5);
  const maxPrecio = Math.max(...reservasVisibles.map((r) => r.precio_total), 1);

  const fechaCorta = (f: string) =>
    new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

  const contactos = [
    { icono: Mail, valor: resumen.email, color: 'text-sky-500 dark:text-sky-400' },
    { icono: Phone, valor: resumen.celular, color: 'text-emerald-500 dark:text-emerald-400' },
    { icono: MapPin, valor: resumen.direccion, color: 'text-rose-500 dark:text-rose-400' },
  ].filter((c) => c.valor);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* ═════════ HERO · PERFIL (Suavizado y armónico) ═════════ */}
      <aside className="relative flex flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-slate-900 text-slate-100 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
        <div className="flex flex-1 flex-col p-5">
          <Etiqueta className="text-zinc-400">Ficha de cliente</Etiqueta>

          {/* Identidad */}
          <div className="mt-4 flex items-center gap-3.5 lg:flex-col lg:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
              {resumen.avatar_url ? (
                <img src={resumen.avatar_url} alt={resumen.nombre} className="h-full w-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-rose-400" />
              )}
            </div>
            <div className="min-w-0 space-y-1.5">
              <h2 className="break-words text-lg font-bold leading-snug tracking-tight text-white">
                {resumen.nombre}
              </h2>
              {resumen.codigo_referido && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-400">
                  <Tag className="h-3 w-3" />
                  {resumen.codigo_referido}
                </span>
              )}
            </div>
          </div>

          {/* Contacto */}
          {contactos.length > 0 && (
            <ul className="mt-5 divide-y divide-zinc-800/80 border-y border-zinc-800/80 py-1">
              {contactos.map(({ icono: Icono, valor, color }) => (
                <li key={valor} className="flex items-start gap-2.5 py-2 text-xs text-zinc-300">
                  <Icono className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${color}`} />
                  <span className="min-w-0 break-all">{valor}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Métricas ancla laterales */}
          <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
            <div className="space-y-1 rounded-md border border-zinc-800 bg-zinc-900/60 p-2.5">
              <Etiqueta className="text-zinc-500">Ticket prom.</Etiqueta>
              <p className="text-sm font-semibold tabular-nums text-white">{moneda(ticketPromedio)}</p>
            </div>
            <div className="space-y-1 rounded-md border border-zinc-800 bg-zinc-900/60 p-2.5">
              <Etiqueta className="text-zinc-500">Últ. actividad</Etiqueta>
              <p className="text-xs font-semibold tabular-nums text-zinc-200">
                {resumen.ultimaVisita ? fechaCorta(resumen.ultimaVisita) : '—'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ═════════ PANEL ANALÍTICO ═════════ */}
      <div className="grid min-w-0 content-start gap-4">
        {/* KPIs split-card */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Total aportado (ancho completo) */}
          <section className={`${PANEL} md:col-span-2 grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] divide-y sm:divide-x sm:divide-y-0 divide-slate-200/80 dark:divide-zinc-800`}>
            <div className="flex flex-col justify-between gap-3 p-5">
              <Etiqueta>Total aportado</Etiqueta>
              <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
                {moneda(resumen.totalGastado)}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-4 p-5">
              <MiniBarra
                label="Turnos"
                valor={porcentaje(montoReservas, baseMonto)}
                display={`${porcentaje(montoReservas, baseMonto)}% · ${moneda(montoReservas)}`}
                color="bg-blue-500"
              />
              <MiniBarra
                label="Tienda"
                valor={porcentaje(montoPedidos, baseMonto)}
                display={`${porcentaje(montoPedidos, baseMonto)}% · ${moneda(montoPedidos)}`}
                color="bg-violet-500"
              />
            </div>
          </section>

          {/* Actividad */}
          <section className={`${PANEL} grid grid-cols-[auto_minmax(0,1fr)] divide-x divide-slate-200/80 dark:divide-zinc-800`}>
            <div className="flex min-w-[90px] flex-col justify-between gap-3 p-4">
              <Etiqueta>Operaciones</Etiqueta>
              <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
                {totalOperaciones}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3.5 p-4">
              <MiniBarra
                label="Turnos"
                valor={porcentaje(resumen.totalReservas, totalOperaciones)}
                display={String(resumen.totalReservas)}
                color="bg-blue-500"
              />
              <MiniBarra
                label="Compras"
                valor={porcentaje(resumen.totalPedidos, totalOperaciones)}
                display={String(resumen.totalPedidos)}
                color="bg-violet-500"
              />
            </div>
          </section>

          {/* Puntos */}
          <section className={`${PANEL} grid grid-cols-[auto_minmax(0,1fr)] divide-x divide-slate-200/80 dark:divide-zinc-800`}>
            <div className="flex min-w-[90px] flex-col justify-between gap-3 p-4">
              <Etiqueta>Puntos</Etiqueta>
              <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
                {resumen.puntosActuales}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3.5 p-4">
              <MiniBarra
                label="Disponibles"
                valor={porcentaje(resumen.puntosActuales, resumen.puntosTotales)}
                display={`${porcentaje(resumen.puntosActuales, resumen.puntosTotales)}%`}
                color="bg-amber-500"
              />
              <MiniBarra
                label="Canjeados"
                valor={porcentaje(puntosCanjeados, resumen.puntosTotales)}
                display={`${puntosCanjeados} / ${resumen.puntosTotales}`}
                color="bg-slate-400 dark:bg-zinc-600"
              />
            </div>
          </section>
        </div>

        {/* Preferencias y hábitos */}
        <section className={`${PANEL} grid divide-y divide-slate-200/80 dark:divide-zinc-800 md:grid-cols-[1fr_1fr_1.3fr] md:divide-x md:divide-y-0`}>
          <div className="space-y-1.5 p-4">
            <Etiqueta className="flex items-center gap-1.5">
              <Heart className="h-3 w-3 text-rose-500" /> Servicio frecuente
            </Etiqueta>
            <p className="text-sm font-semibold capitalize text-slate-900 dark:text-zinc-100">
              {resumen.servicioFavorito}
            </p>
          </div>

          <div className="space-y-1.5 p-4">
            <Etiqueta className="flex items-center gap-1.5">
              <ShoppingBag className="h-3 w-3 text-violet-500" /> Producto principal
            </Etiqueta>
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {resumen.productoFavorito}
            </p>
          </div>

          <div className="space-y-2 p-4">
            <Etiqueta className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-sky-500" /> Horario habitual
            </Etiqueta>
            <div className="grid grid-cols-3 gap-1.5">
              {FRANJAS.map((f) => {
                const activa = resumen.horarioHabitual?.startsWith(f.key);
                return (
                  <div key={f.key} className="space-y-1">
                    <div className={`h-[2px] rounded-full ${activa ? 'bg-sky-500' : 'bg-slate-100 dark:bg-zinc-800'}`} />
                    <p className={`font-mono text-[10px] ${activa ? 'font-semibold text-slate-900 dark:text-zinc-100' : 'text-slate-400 dark:text-zinc-600'}`}>
                      {f.rango}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-zinc-300">
              {resumen.horarioHabitual}
            </p>
          </div>
        </section>

        {/* Historial de reservas */}
        <section className={`${PANEL} overflow-hidden`}>
          <header className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3 dark:border-zinc-800">
            <Etiqueta>Últimas reservas</Etiqueta>
            <span className="font-mono text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              {reservasVisibles.length} de {detalle.reservas.length}
            </span>
          </header>

          {detalle.reservas.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-slate-400 dark:text-zinc-500">
              Este cliente no registra turnos agendados en el sistema.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {/* Cabecera de columnas */}
              <div className="grid grid-cols-[minmax(0,1fr)_auto_110px] items-center gap-4 bg-slate-50/70 px-4 py-2 dark:bg-zinc-950/40">
                <Etiqueta>Servicio</Etiqueta>
                <Etiqueta className="text-right">Monto</Etiqueta>
                <Etiqueta>Estado</Etiqueta>
              </div>

              {reservasVisibles.map((r) => {
                const est = colorEstado(r.estado);
                return (
                  <div key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto_110px] items-center gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium capitalize text-slate-900 dark:text-zinc-100">
                        {r.servicio_tipo}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                        {fechaCorta(r.fecha_hora_inicio)}
                      </p>
                    </div>

                    <div className="w-24 space-y-1.5 text-right">
                      <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                        {moneda(r.precio_total)}
                      </p>
                    </div>

                    <div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${est.bg}`}>
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${est.dot}`} />
                        <span className="truncate">{r.estado}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}