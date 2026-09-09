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

  const esVideo = (url: string) => {
    return url?.toLowerCase().endsWith('.mp4') || url?.toLowerCase().endsWith('.webm')
  }

  if (loading || !isVisible || !banner) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Botón de cierre */}
        <button
          onClick={cerrarBanner}
          aria-label="Cerrar banner"
          className="absolute top-4 right-4 z-30 p-2.5 bg-black/70 hover:bg-black text-white rounded-full transition-all backdrop-blur-sm shadow-lg hover:scale-105"
        >
          <X size={20} />
        </button>

        {/* Solo la imagen o el video sin franjas extras */}
        <div className="w-full relative h-[60vh] sm:h-[70vh] flex items-center justify-center bg-black rounded-3xl overflow-hidden">
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
              alt="Banner"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
    </div>
  )
}