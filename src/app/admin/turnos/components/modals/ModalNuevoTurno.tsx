'use client'

import {
  Sparkles, Scissors, Tag, X, User, Phone, Calendar, FileText,
  DollarSign, CreditCard, CheckCircle2, Loader2
} from 'lucide-react'
import { PromoLaser, ServicioGeneral, ServicioLaser, TurnoForm } from '../types'

interface ModalNuevoTurnoProps {
  nuevoTurno: TurnoForm
  setNuevoTurno: (t: TurnoForm) => void

  tipoTurnoNuevo: 'laser' | 'promo' | 'general'
  setTipoTurnoNuevo: (v: 'laser' | 'promo' | 'general') => void

  filtroGeneroLaserNuevo: string
  setFiltroGeneroLaserNuevo: (v: string) => void

  zonasSeleccionadasNuevo: string[]
  toggleZonaSeleccionadaNuevo: (id: string) => void
  zonasLaserFiltradas: ServicioLaser[]

  promoSeleccionadaNuevo: string
  setPromoSeleccionadaNuevo: (id: string) => void
  promosLaserFiltradas: PromoLaser[]

  servicioGeneralSeleccionadoNuevo: string
  setServicioGeneralSeleccionadoNuevo: (id: string) => void
  serviciosGeneralesActivos: ServicioGeneral[]

  guardandoNuevoTurno: boolean
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function ModalNuevoTurno({
  nuevoTurno,
  setNuevoTurno,
  tipoTurnoNuevo,
  setTipoTurnoNuevo,
  filtroGeneroLaserNuevo,
  setFiltroGeneroLaserNuevo,
  zonasSeleccionadasNuevo,
  toggleZonaSeleccionadaNuevo,
  zonasLaserFiltradas,
  promoSeleccionadaNuevo,
  setPromoSeleccionadaNuevo,
  promosLaserFiltradas,
  servicioGeneralSeleccionadoNuevo,
  setServicioGeneralSeleccionadoNuevo,
  serviciosGeneralesActivos,
  guardandoNuevoTurno,
  onSubmit,
  onClose
}: ModalNuevoTurnoProps) {
return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all">
      {/* MOBILE: bottom sheet · DESKTOP (sm:): modal flotante centrado */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 w-full bg-white dark:bg-zinc-900 rounded-t-[32px] shadow-2xl border border-slate-200/80 dark:border-zinc-800 max-h-[92vh] overflow-y-auto transition-colors animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom)]
          sm:inset-x-0 sm:mx-auto sm:max-w-md sm:rounded-3xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:fade-in sm:zoom-in-95 sm:duration-200 sm:pb-0"
      >
        {/* Handle visual, solo mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto my-3 sm:hidden" />

        <div className="relative px-5 pb-6 pt-2 sm:p-6">
          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            disabled={guardandoNuevoTurno}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-600 w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center rounded-2xl hover:bg-slate-100 active:scale-90 select-none transition-all disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Cabecera del Modal */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="p-3.5 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 rounded-2xl border border-blue-200/60 dark:border-blue-800/40 shrink-0 shadow-2xs">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">Nuevo Turno Manual</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Cargá una reserva directamente desde el panel</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">

            {/* Nombre del Cliente */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <User className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                Nombre del Cliente
              </label>
              <input
                type="text"
                required
                value={nuevoTurno.cliente_nombre}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, cliente_nombre: e.target.value })}
                className="w-full px-4 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700 rounded-2xl bg-slate-50/50 dark:bg-zinc-800/80 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                placeholder="Ej: María González"
              />
            </div>

            {/* Celular */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                Celular
              </label>
              <input
                type="text"
                value={nuevoTurno.cliente_celular}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, cliente_celular: e.target.value })}
                className="w-full px-4 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700 rounded-2xl bg-slate-50/50 dark:bg-zinc-800/80 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs font-mono"
                placeholder="5493413954355"
              />
            </div>

            {/* Fecha y Hora */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                Fecha y Hora
              </label>
              <input
                type="datetime-local"
                required
                value={nuevoTurno.fecha_hora_local}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, fecha_hora_local: e.target.value })}
                className="w-full px-4 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700 rounded-2xl bg-slate-50/50 dark:bg-zinc-800/80 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            {/* Tipo de Turno */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 dark:text-zinc-400">
                Tipo de Turno
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoTurnoNuevo('laser')}
                  className={`min-h-[46px] py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all active:scale-95 select-none flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                    tipoTurnoNuevo === 'laser'
                      ? 'bg-rose-500 border-rose-600 text-white shadow-md ring-2 ring-rose-300 ring-offset-1 dark:ring-offset-zinc-900'
                      : 'bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-rose-50/50 hover:border-rose-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Zonas Láser
                </button>

                <button
                  type="button"
                  onClick={() => setTipoTurnoNuevo('promo')}
                  className={`min-h-[46px] py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all active:scale-95 select-none flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                    tipoTurnoNuevo === 'promo'
                      ? 'bg-amber-500 border-amber-600 text-white shadow-md ring-2 ring-amber-300 ring-offset-1 dark:ring-offset-zinc-900'
                      : 'bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-amber-50/50 hover:border-amber-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  Combos / Promo
                </button>

                <button
                  type="button"
                  onClick={() => setTipoTurnoNuevo('general')}
                  className={`min-h-[46px] py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all active:scale-95 select-none flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                    tipoTurnoNuevo === 'general'
                      ? 'bg-blue-600 border-blue-700 text-white shadow-md ring-2 ring-blue-300 ring-offset-1 dark:ring-offset-zinc-900'
                      : 'bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-blue-50/50 hover:border-blue-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Scissors className="w-4 h-4" />
                  General
                </button>
              </div>
            </div>

            {/* Opciones según tipo */}
            {tipoTurnoNuevo === 'laser' && (
              <div>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Zonas (Láser)
                  </label>
                  <select
                    value={filtroGeneroLaserNuevo}
                    onChange={(e) => setFiltroGeneroLaserNuevo(e.target.value)}
                    className="border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50/60 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value="todos">Todos los géneros</option>
                    <option value="femenino">Femenino</option>
                    <option value="masculino">Masculino</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-2.5 max-h-48 overflow-y-auto scroll-smooth space-y-1.5 bg-slate-50/40 dark:bg-zinc-800/40 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {zonasLaserFiltradas.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-4 dark:text-zinc-500">
                      No hay zonas activas para este filtro.
                    </div>
                  ) : (
                    zonasLaserFiltradas.map((s) => {
                      const seleccionada = zonasSeleccionadasNuevo.includes(s.id)
                      return (
                        <label
                          key={s.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer select-none transition-all min-h-[44px] ${
                            seleccionada
                              ? 'bg-white border border-slate-300 shadow-sm font-bold dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100'
                              : 'hover:bg-white/80 border border-transparent text-slate-600 dark:hover:bg-zinc-800/80 dark:text-zinc-400'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={seleccionada}
                              onChange={() => toggleZonaSeleccionadaNuevo(s.id)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:checked:bg-blue-600"
                            />
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{s.nombre_zona}</span>
                            <span className="text-slate-400 dark:text-zinc-500 font-medium">({s.genero})</span>
                          </span>
                          <span className="text-slate-700 dark:text-zinc-200 font-mono font-bold">
                            ${(s.precio_lista || 0).toLocaleString('es-AR')}
                          </span>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {tipoTurnoNuevo === 'promo' && (
              <div>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Combo / Promoción
                  </label>
                  <select
                    value={filtroGeneroLaserNuevo}
                    onChange={(e) => setFiltroGeneroLaserNuevo(e.target.value)}
                    className="border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50/60 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value="todos">Todos los géneros</option>
                    <option value="femenino">Femenino</option>
                    <option value="masculino">Masculino</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <select
                  value={promoSeleccionadaNuevo}
                  onChange={(e) => setPromoSeleccionadaNuevo(e.target.value)}
                  className="w-full px-4 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700 rounded-2xl bg-slate-50/50 dark:bg-zinc-800/80 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-2xs cursor-pointer"
                >
                  <option value="">Seleccioná un combo o promoción...</option>
                  {promosLaserFiltradas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre_promo} ({p.genero}) - ${(p.precio_promo || 0).toLocaleString('es-AR')} [{p.duracion_total_min || 30} min]
                    </option>
                  ))}
                </select>

                {promosLaserFiltradas.length === 0 && (
                  <p className="text-[11px] text-slate-400 mt-1.5 dark:text-zinc-500">No hay promociones activas para este filtro.</p>
                )}
              </div>
            )}

            {tipoTurnoNuevo === 'general' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 dark:text-zinc-400">
                  Servicio General
                </label>
                <select
                  value={servicioGeneralSeleccionadoNuevo}
                  onChange={(e) => setServicioGeneralSeleccionadoNuevo(e.target.value)}
                  className="w-full px-4 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700 rounded-2xl bg-slate-50/50 dark:bg-zinc-800/80 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs cursor-pointer"
                >
                  <option value="">Seleccioná un servicio...</option>
                  {serviciosGeneralesActivos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.categoria}
                      {s.subtipo ? ` - ${s.subtipo}` : ''} (${(s.precio || 0).toLocaleString('es-AR')})
                    </option>
                  ))}
                </select>
                {serviciosGeneralesActivos.length === 0 && (
                  <p className="text-[11px] text-slate-400 mt-1.5 dark:text-zinc-500">No hay servicios generales activos cargados.</p>
                )}
              </div>
            )}

            {/* Detalle / Zonas */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                Detalle / Zonas
              </label>
              <textarea
                value={nuevoTurno.detalle_texto}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, detalle_texto: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-2xl bg-slate-50/50 dark:bg-zinc-800/80 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs resize-none"
                rows={2}
              />
            </div>

            {/* Precio y Método de Pago */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Precio Total ($)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={nuevoTurno.precio_total}
                  onChange={(e) => setNuevoTurno({ ...nuevoTurno, precio_total: Number(e.target.value) })}
                  className="w-full px-4 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700 rounded-2xl bg-slate-50/50 dark:bg-zinc-800/80 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Método de Pago
                </label>
                <input
                  type="text"
                  value={nuevoTurno.metodo_pago}
                  onChange={(e) => setNuevoTurno({ ...nuevoTurno, metodo_pago: e.target.value })}
                  className="w-full px-4 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700 rounded-2xl bg-slate-50/50 dark:bg-zinc-800/80 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                  placeholder="Ej: Efectivo"
                />
              </div>
            </div>

            {/* Estado Inicial */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                Estado Inicial
              </label>
              <select
                value={nuevoTurno.estado}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, estado: e.target.value })}
                className="w-full px-4 py-3 sm:py-2.5 border border-slate-200 dark:border-zinc-700 rounded-2xl bg-slate-50/50 dark:bg-zinc-800/80 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs cursor-pointer"
              >
                <option value="pendiente_sena"> Pendiente Seña</option>
                <option value="confirmado"> Confirmado</option>
                <option value="bloqueado"> Bloqueado / Cliente VIP</option>
                <option value="completado"> Completado</option>
                <option value="cancelado"> Cancelado</option>
              </select>
            </div>

            {/* Acciones */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-900 sm:static sm:bg-transparent -mx-5 sm:mx-0 px-5 sm:px-0 pb-1 sm:pb-0">
              <button
                type="button"
                onClick={onClose}
                disabled={guardandoNuevoTurno}
                className="w-full sm:w-auto min-h-[44px] px-4 py-3 sm:py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 active:scale-95 select-none rounded-2xl transition-all disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardandoNuevoTurno}
                className="w-full sm:w-auto min-h-[44px] justify-center inline-flex items-center gap-2 px-6 py-3 sm:py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-md active:scale-95 select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {guardandoNuevoTurno ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Crear Turno</span>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}