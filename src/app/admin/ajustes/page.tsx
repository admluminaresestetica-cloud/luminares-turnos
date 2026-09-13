'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import {
  obtenerConfiguracion,
  guardarConfiguracion,
  ConfiguracionEmpresa,
} from '@/lib/supabase/configuracion-empresa';
import { supabase } from '@/lib/supabase';
import FaqTab from './components/FaqTab';

export default function AjustesAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const [form, setForm] = useState<ConfiguracionEmpresa>({
    nombre_empresa: '',
    subtitulo_tienda: '',
    logo_url: '',
    whatsapp_numero: '',
    google_maps_url: '',
    mp_access_token: '',
    mp_alias: '',
    envio_domicilio_activo: false,
    costo_envio_base: 0,
    envio_gratis_activo: false,
    monto_envio_gratis: 0,
  });

  useEffect(() => {
    async function cargarData() {
      setLoading(true);
      const data = await obtenerConfiguracion();
      if (data) {
        setForm({
          ...data,
          envio_domicilio_activo: data.envio_domicilio_activo ?? false,
          costo_envio_base: data.costo_envio_base ?? 0,
          envio_gratis_activo: data.envio_gratis_activo ?? false,
          monto_envio_gratis: data.monto_envio_gratis ?? 0,
        });
      }
      setLoading(false);
    }
    cargarData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
  };

  const handleSubirLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoLogo(true);
    setMensaje(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ajustes')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('ajustes')
        .getPublicUrl(filePath);

      setForm((prev) => ({
        ...prev,
        logo_url: publicUrlData.publicUrl,
      }));

      setMensaje({ tipo: 'exito', texto: 'Logo cargado. Presioná "Guardar Cambios" para aplicar.' });
    } catch (err: any) {
      console.error(err);
      setMensaje({ tipo: 'error', texto: 'Error al subir la imagen a Supabase Storage.' });
    } finally {
      setSubiendoLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMensaje(null);

    const ok = await guardarConfiguracion(form);

    if (ok) {
      setMensaje({ tipo: 'exito', texto: 'Configuración guardada correctamente.' });
    } else {
      setMensaje({ tipo: 'error', texto: 'Ocurrió un error al guardar los datos.' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 font-medium">
        Cargando ajustes del negocio...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 text-slate-800 dark:text-zinc-100">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Ajustes del Negocio</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Administrá la información dinámica de tu marca, datos de contacto, cobros y envíos.
        </p>
      </div>

      {mensaje && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border ${
            mensaje.tipo === 'exito'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Formulario de Ajustes Generales */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identidad de Marca */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 transition-colors">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-3">
            Identidad de Marca
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                Nombre del Negocio
              </label>
              <input
                type="text"
                name="nombre_empresa"
                value={form.nombre_empresa}
                onChange={handleChange}
                placeholder="Ej. Luminares Estética"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                Subtítulo / Bajada Tienda
              </label>
              <input
                type="text"
                name="subtitulo_tienda"
                value={form.subtitulo_tienda}
                onChange={handleChange}
                placeholder="Ej. Productos & Cuidado Personal"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                Logo del Negocio
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  name="logo_url"
                  value={form.logo_url}
                  onChange={handleChange}
                  placeholder="https://... o subí un archivo"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
                />
                <label className="cursor-pointer bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 whitespace-nowrap transition-colors">
                  {subiendoLogo ? 'Subiendo...' : 'Subir imagen'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSubirLogo}
                    className="hidden"
                    disabled={subiendoLogo}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Contacto & Ubicación */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 transition-colors">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-3">
            Contacto y Redes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                Número de WhatsApp (con código de país)
              </label>
              <input
                type="text"
                name="whatsapp_numero"
                value={form.whatsapp_numero}
                onChange={handleChange}
                placeholder="Ej. 5493411234567"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                Link de Google Maps
              </label>
              <input
                type="text"
                name="google_maps_url"
                value={form.google_maps_url}
                onChange={handleChange}
                placeholder="https://maps.google.com/..."
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
              />
            </div>
          </div>
        </div>

        {/* Envíos y Entregas */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 transition-colors">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-3">
            Configuración de Envíos
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">Ofrecer Envío a Domicilio</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Permite a los clientes seleccionar entrega a domicilio en el carrito.</p>
              </div>
              <input
                type="checkbox"
                name="envio_domicilio_activo"
                checked={form.envio_domicilio_activo}
                onChange={handleChange}
                className="w-5 h-5 accent-indigo-600 dark:accent-indigo-500 cursor-pointer rounded"
              />
            </div>

            {form.envio_domicilio_activo && (
              <div className="pl-4 border-l-2 border-slate-200 dark:border-zinc-800 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                    Costo Base de Cadetería / Envío ($)
                  </label>
                  <input
                    type="number"
                    name="costo_envio_base"
                    value={form.costo_envio_base}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="w-full md:w-1/2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">Ofrecer Envío Gratis por Monto Mínimo</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Bonifica el costo de envío cuando el pedido alcanza cierto monto.</p>
                  </div>
                  <input
                    type="checkbox"
                    name="envio_gratis_activo"
                    checked={form.envio_gratis_activo}
                    onChange={handleChange}
                    className="w-5 h-5 accent-indigo-600 dark:accent-indigo-500 cursor-pointer rounded"
                  />
                </div>

                {form.envio_gratis_activo && (
                  <div className="pl-4 border-l-2 border-slate-200 dark:border-zinc-800">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                      Monto Mínimo de Compra para Envío Gratis ($)
                    </label>
                    <input
                      type="number"
                      name="monto_envio_gratis"
                      value={form.monto_envio_gratis}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="w-full md:w-1/2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pagos / Mercado Pago */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 transition-colors">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-3">
            Configuración de Pagos (Mercado Pago)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                Alias / CBU para Transferencias
              </label>
              <input
                type="text"
                name="mp_alias"
                value={form.mp_alias}
                onChange={handleChange}
                placeholder="Ej. luminares.mp"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">
                Mercado Pago Access Token (API)
              </label>
              <input
                type="password"
                name="mp_access_token"
                value={form.mp_access_token}
                onChange={handleChange}
                placeholder="APP_USR-..."
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || subiendoLogo}
            className="bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>

      {/* Sección Independiente de Preguntas Frecuentes */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 transition-colors">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-3">
          Preguntas Frecuentes (FAQ)
        </h2>
        <FaqTab />
      </div>
    </div>
  );
}