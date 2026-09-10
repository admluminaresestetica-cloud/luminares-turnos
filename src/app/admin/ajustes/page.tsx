'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import {
  obtenerConfiguracion,
  guardarConfiguracion,
  ConfiguracionEmpresa,
} from '@/lib/supabase/configuracion-empresa';
import { supabase } from '@/lib/supabase'; // Asegurate de importar tu cliente supabase

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
  });

  useEffect(() => {
    async function cargarData() {
      setLoading(true);
      const data = await obtenerConfiguracion();
      if (data) {
        setForm(data);
      }
      setLoading(false);
    }
    cargarData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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
        .from('imagenes')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('imagenes')
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
      <div className="p-8 text-center text-gray-500">
        Cargando ajustes del negocio...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ajustes del Negocio</h1>
        <p className="text-sm text-gray-500">
          Administrá la información dinámica de tu marca, datos de contacto y cobros.
        </p>
      </div>

      {mensaje && (
        <div
          className={`p-4 rounded-lg text-sm font-medium ${
            mensaje.tipo === 'exito'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identidad de Marca */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Identidad de Marca
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nombre del Negocio
              </label>
              <input
                type="text"
                name="nombre_empresa"
                value={form.nombre_empresa}
                onChange={handleChange}
                placeholder="Ej. Luminares Estética"
                className="w-full border rounded-lg p-2.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Subtítulo / Bajada Tienda
              </label>
              <input
                type="text"
                name="subtitulo_tienda"
                value={form.subtitulo_tienda}
                onChange={handleChange}
                placeholder="Ej. Productos & Cuidado Personal"
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Logo del Negocio
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  name="logo_url"
                  value={form.logo_url}
                  onChange={handleChange}
                  placeholder="https://... o subí un archivo"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-lg border whitespace-nowrap transition-colors">
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
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Contacto y Redes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Número de WhatsApp (con código de país)
              </label>
              <input
                type="text"
                name="whatsapp_numero"
                value={form.whatsapp_numero}
                onChange={handleChange}
                placeholder="Ej. 5493411234567"
                className="w-full border rounded-lg p-2.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Link de Google Maps
              </label>
              <input
                type="text"
                name="google_maps_url"
                value={form.google_maps_url}
                onChange={handleChange}
                placeholder="https://maps.google.com/..."
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Pagos / Mercado Pago */}
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Configuración de Pagos (Mercado Pago)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alias / CBU para Transferencias
              </label>
              <input
                type="text"
                name="mp_alias"
                value={form.mp_alias}
                onChange={handleChange}
                placeholder="Ej. luminares.mp"
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mercado Pago Access Token (API)
              </label>
              <input
                type="password"
                name="mp_access_token"
                value={form.mp_access_token}
                onChange={handleChange}
                placeholder="APP_USR-..."
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || subiendoLogo}
            className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}