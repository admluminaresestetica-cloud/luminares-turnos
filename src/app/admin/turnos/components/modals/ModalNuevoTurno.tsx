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
        className="fixed inset-x-0 bottom-0 z-50 w-full bg-white dark:bg-zinc-900 rounded-t-[28px] shadow-2xl border border-gray-100 dark:border-zinc-800 max-h-[92vh] overflow-y-auto transition-colors animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom)]
          sm:inset-x-0 sm:mx-auto sm:max-w-md sm:rounded-3xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:fade-in sm:zoom-in-95 sm:duration-200 sm:pb-0"
      >
        {/* Handle visual, solo mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto my-2 sm:hidden" />

        <div className="relative px-5 pb-5 pt-1 sm:p-6">
          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            disabled={guardandoNuevoTurno}
            className="absolute top-2 right-2 sm:top-5 sm:right-5 text-gray-400 hover:text-gray-600 w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 select-none transition-all disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Cabecera del Modal */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gray-100 rounded-2xl text-gray-800 shrink-0 dark:bg-zinc-800 dark:text-zinc-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight dark:text-zinc-100">Nuevo Turno Manual</h2>
              <p className="text-xs text-gray-500 mt-0.5 dark:text-zinc-400">Cargá una reserva directamente desde el panel</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">

            {/* Nombre del Cliente */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <User className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Nombre del Cliente
              </label>
              <input
                type="text"
                required
                value={nuevoTurno.cliente_nombre}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, cliente_nombre: e.target.value })}
                className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
                placeholder="Ej: María González"
              />
            </div>

            {/* Celular */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Celular
              </label>
              <input
                type="text"
                value={nuevoTurno.cliente_celular}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, cliente_celular: e.target.value })}
                className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
                placeholder="5493413954355"
              />
            </div>

            {/* Fecha y Hora */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Fecha y Hora
              </label>
              <input
                type="datetime-local"
                required
                value={nuevoTurno.fecha_hora_local}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, fecha_hora_local: e.target.value })}
                className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark] dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
              />
            </div>

            {/* Tipo de Turno */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 dark:text-zinc-400">
                Tipo de Turno
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoTurnoNuevo('laser')}
                  className={`min-h-[44px] py-2.5 px-2 rounded-xl border text-[11px] font-bold transition-all active:scale-95 select-none flex items-center justify-center gap-1.5 ${
                    tipoTurnoNuevo === 'laser'
                      ? 'bg-rose-500 border-rose-600 text-white shadow-sm ring-2 ring-rose-300 ring-offset-1 dark:ring-offset-zinc-900'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-rose-50/50 hover:border-rose-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Zonas Laser
                </button>

                <button
                  type="button"
                  onClick={() => setTipoTurnoNuevo('promo')}
                  className={`min-h-[44px] py-2.5 px-2 rounded-xl border text-[11px] font-bold transition-all active:scale-95 select-none flex items-center justify-center gap-1.5 ${
                    tipoTurnoNuevo === 'promo'
                      ? 'bg-amber-500 border-amber-600 text-white shadow-sm ring-2 ring-amber-300 ring-offset-1 dark:ring-offset-zinc-900'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-amber-50/50 hover:border-amber-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  Combos / Promo
                </button>

                <button
                  type="button"
                  onClick={() => setTipoTurnoNuevo('general')}
                  className={`min-h-[44px] py-2.5 px-2 rounded-xl border text-[11px] font-bold transition-all active:scale-95 select-none flex items-center justify-center gap-1.5 ${
                    tipoTurnoNuevo === 'general'
                      ? 'bg-gray-900 border-gray-900 text-white shadow-sm ring-2 ring-gray-300 ring-offset-1 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 dark:ring-zinc-700 dark:ring-offset-zinc-900'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  General
                </button>
              </div>
            </div>

            {/* Opciones según tipo */}
            {tipoTurnoNuevo === 'laser' && (
              <div>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    Zonas (Láser)
                  </label>
                  <select
                    value={filtroGeneroLaserNuevo}
                    onChange={(e) => setFiltroGeneroLaserNuevo(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] font-medium outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
                  >
                    <option value="todos">Todos los géneros</option>
                    <option value="femenino">Femenino</option>
                    <option value="masculino">Masculino</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div className="border border-gray-200 rounded-2xl p-2.5 max-h-48 overflow-y-auto scroll-smooth space-y-1.5 bg-gray-50/50 dark:bg-zinc-800/50 dark:border-zinc-800 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {zonasLaserFiltradas.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-4 dark:text-zinc-500">
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
                              ? 'bg-white border border-gray-300 shadow-sm font-semibold dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100'
                              : 'hover:bg-white/80 border border-transparent text-gray-600 dark:hover:bg-zinc-800/80 dark:text-zinc-400'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={seleccionada}
                              onChange={() => toggleZonaSeleccionadaNuevo(s.id)}
                              className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 dark:border-zinc-600 dark:bg-zinc-700 dark:checked:bg-zinc-100"
                            />
                            <span className="font-medium text-gray-800 dark:text-zinc-200">{s.nombre_zona}</span>
                            <span className="text-gray-400 dark:text-zinc-500">({s.genero})</span>
                          </span>
                          <span className="text-gray-600 font-semibold dark:text-zinc-300">
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    Combo / Promoción
                  </label>
                  <select
                    value={filtroGeneroLaserNuevo}
                    onChange={(e) => setFiltroGeneroLaserNuevo(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-[11px] font-medium outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
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
                  className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                >
                  <option value="">Seleccioná un combo o promoción...</option>
                  {promosLaserFiltradas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre_promo} ({p.genero}) - ${(p.precio_promo || 0).toLocaleString('es-AR')} [{p.duracion_total_min || 30} min]
                    </option>
                  ))}
                </select>

                {promosLaserFiltradas.length === 0 && (
                  <p className="text-[11px] text-gray-400 mt-1.5 dark:text-zinc-500">No hay promociones activas para este filtro.</p>
                )}
              </div>
            )}

            {tipoTurnoNuevo === 'general' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 dark:text-zinc-400">
                  Servicio General
                </label>
                <select
                  value={servicioGeneralSeleccionadoNuevo}
                  onChange={(e) => setServicioGeneralSeleccionadoNuevo(e.target.value)}
                  className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
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
                  <p className="text-[11px] text-gray-400 mt-1.5 dark:text-zinc-500">No hay servicios generales activos cargados.</p>
                )}
              </div>
            )}

            {/* Detalle / Zonas */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Detalle / Zonas
              </label>
              <textarea
                value={nuevoTurno.detalle_texto}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, detalle_texto: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm resize-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
                rows={2}
              />
            </div>

            {/* Precio y Método de Pago */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                  Precio Total ($)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={nuevoTurno.precio_total}
                  onChange={(e) => setNuevoTurno({ ...nuevoTurno, precio_total: Number(e.target.value) })}
                  className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                  <CreditCard className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                  Método de Pago
                </label>
                <input
                  type="text"
                  value={nuevoTurno.metodo_pago}
                  onChange={(e) => setNuevoTurno({ ...nuevoTurno, metodo_pago: e.target.value })}
                  className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
                  placeholder="Ej: Efectivo, Transferencia"
                />
              </div>
            </div>

            {/* Estado Inicial */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1.5 dark:text-zinc-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                Estado Inicial
              </label>
              <select
                value={nuevoTurno.estado}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, estado: e.target.value })}
                className="w-full px-3.5 py-3 sm:py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
              >
                <option value="pendiente_sena">⏳ Pendiente Seña</option>
                <option value="confirmado">✅ Confirmado</option>
                <option value="completado">🎉 Completado</option>
                <option value="cancelado">❌ Cancelado</option>
              </select>
            </div>

            {/* Acciones */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-2.5 pt-4 border-t border-gray-100 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-900 sm:static sm:bg-transparent -mx-5 sm:mx-0 px-5 sm:px-0 pb-1 sm:pb-0">
              <button
                type="button"
                onClick={onClose}
                disabled={guardandoNuevoTurno}
                className="w-full sm:w-auto min-h-[44px] px-4 py-3 sm:py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 active:scale-95 select-none rounded-xl transition-all disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardandoNuevoTurno}
                className="w-full sm:w-auto min-h-[44px] justify-center inline-flex items-center gap-2 px-5 py-3 sm:py-2.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all shadow-sm active:scale-95 select-none disabled:opacity-50 disabled:pointer-events-none dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
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