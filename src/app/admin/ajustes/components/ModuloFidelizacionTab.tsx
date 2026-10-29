'use client';

import React, { useState } from 'react';
import { Share2, Gift, QrCode } from 'lucide-react';
import ReferidosTab from './ReferidosTab';
import PremiosAdminTab from './PremiosAdminTab';
import ValidarCanjesTab from './ValidarCanjesTab';

type SubTabFidelizacion = 'referidos' | 'premios' | 'validar';

export default function ModuloFidelizacionTab() {
  const [activeTab, setActiveTab] = useState<SubTabFidelizacion>('referidos');

  return (
    <div className="space-y-6">
      {/* Selector de Pestañas Superior */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700/60 max-w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('referidos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'referidos'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-fuchsia-500" />
          <span>Programa de Referidos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('premios')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'premios'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Gift className="w-3.5 h-3.5 text-rose-500" />
          <span>Catálogo de Premios</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('validar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'validar'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-violet-500" />
          <span>Validar Canjes</span>
        </button>
      </div>

      {/* Renderizado del Módulo Seleccionado */}
      <div className="animate-in fade-in duration-200">
        {activeTab === 'referidos' && <ReferidosTab />}
        {activeTab === 'premios' && <PremiosAdminTab />}
        {activeTab === 'validar' && <ValidarCanjesTab />}
      </div>
    </div>
  );
}