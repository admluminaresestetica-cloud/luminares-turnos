'use client';

import Link from 'next/link';
import { Calendar, ShoppingBag, Clock, ArrowRight } from 'lucide-react';

export default function AdminHubPage() {
  const modulos = [
    {
      titulo: 'Gestión de Turnos',
      descripcion: 'Agenda, horarios, servicios generales y depilación láser.',
      icono: Calendar,
      ruta: '/admin/turnos',
      color: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900',
    },
    {
      titulo: 'Tienda y Productos',
      descripcion: 'Control de stock, precios, categorías y pedidos de la tienda.',
      icono: ShoppingBag,
      ruta: '/admin/tienda',
      color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    },
    {
      titulo: 'Gestión y Atención',
      descripcion: 'Recepción, check-in, control de gabinete y sesiones en vivo.',
      icono: Clock,
      ruta: '/admin/gestion/recepcion',
      color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabecera del Hub */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Panel de Administración
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Selecciona el módulo al que deseas ingresar para administrar tu negocio.
          </p>
        </div>

        {/* Cuadrícula de Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modulos.map((modulo) => {
            const IconoComponente = modulo.icono;
            return (
              <Link
                key={modulo.ruta}
                href={modulo.ruta}
                className="group relative flex flex-col justify-between p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-700"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 ${modulo.color}`}>
                    <IconoComponente className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {modulo.titulo}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {modulo.descripcion}
                  </p>
                </div>

                <div className="mt-6 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Acceder al módulo</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}