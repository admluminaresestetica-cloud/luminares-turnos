'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';

export default function AjustesAdminPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ajustes del Negocio</h1>
        <p className="text-sm text-gray-500">
          Configurá la identidad visual, datos de contacto y pasarela de cobro.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <p className="text-gray-600">Módulo de configuración en construcción...</p>
      </div>
    </div>
  );
}