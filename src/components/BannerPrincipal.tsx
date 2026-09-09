'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Banner {
  id: string
  imagen_url: string
  titulo?: string
  activo: boolean
  orden: number
}

export default function BannerPrincipal() {
  const [banner, setBanner] = useState<Banner | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarBanner() {
      try {
        // Lee directamente la tabla 'banners' que maneja el panel Admin
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('activo', true)
          .order('orden', { ascending: true })
          .limit(1)

        if (error) {
          console.error('Error al obtener el banner activo:', error)
        } else if (data && data.length > 0) {
          setBanner(data[0])
          setIsVisible(true)
        }
      } catch (error) {
        console.error('Error al cargar el banner público de turnos:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarBanner()
  }, [])

  const cerrarBanner = () => {
    setIsVisible(false)
  }

  // Detectar si la URL es un video (.mp4 o .webm)
  const esVideo = (url: string) => {
    return url?.toLowerCase().endsWith('.mp4') || url?.toLowerCase().endsWith('.webm')
  }

  if (loading || !isVisible || !banner) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        {/* Botón de cierre */}
        <button
          onClick={cerrarBanner}
          aria-label="Cerrar banner"
          className="absolute top-4 right-4 z-30 p-2.5 bg-black/70 hover:bg-black text-white rounded-full transition-all backdrop-blur-sm shadow-lg hover:scale-105"
        >
          <X size={20} />
        </button>

        {/* Contenido multimedia de Turnos */}
        <div className="w-full relative h-[60vh] sm:h-[70vh] flex items-center justify-center bg-black">
          {esVideo(banner.imagen_url) ? (
            <video
              src={banner.imagen_url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={banner.imagen_url}
              alt={banner.titulo || 'Aviso de Turnos'}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Mensaje o título promocional del turno */}
        {banner.titulo && (
          <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 text-center">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              {banner.titulo}
            </h2>
          </div>
        )}
      </div>
    </div>
  )
}