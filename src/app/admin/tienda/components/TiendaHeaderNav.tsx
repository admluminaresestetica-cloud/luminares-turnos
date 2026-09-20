"use client";

import Link from "next/link";

export type TabKey = "catalogo" | "pos" | "caja" | "pedidos" | "banners" | "tags";

interface TabOption {
  key: TabKey;
  label: string;
  icono: string;
  badge?: number;
}

interface TiendaHeaderNavProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  pedidosPendientes: number;
}

export default function TiendaHeaderNav({
  activeTab,
  setActiveTab,
  pedidosPendientes,
}: TiendaHeaderNavProps) {
  const TABS: TabOption[] = [
    { key: "catalogo", label: "Catálogo", icono: "📦" },
    { key: "pos", label: "Escáner / POS", icono: "📷" },
    { key: "caja", label: "Control de Caja", icono: "💵" },
    { key: "pedidos", label: "Pedidos", icono: "📋", badge: pedidosPendientes },
    { key: "banners", label: "Banners", icono: "🖼️" },
    { key: "tags", label: "Tags", icono: "🏷️" },
  ];

  return (
    <>
      {/* HEADER STICKY con blur tipo app nativa */}
      <header className="sticky top-0 z-30 border-b border-[#E7E5E0]/80 bg-white/80 backdrop-blur-md px-4 py-4 sm:px-10 sm:py-6">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#12151B] text-lg text-white shadow-sm">
              🛍️
            </span>
            <div>
              <p className="m-0 text-[10px] font-semibold uppercase tracking-wider text-[#0E6E55] sm:text-xs">
                Panel de administración
              </p>
              <h1 className="m-0 text-lg font-bold tracking-tight text-[#12151B] sm:text-2xl">
                Gestión de Tienda
              </h1>
            </div>
          </div>

          <Link
            href="/admin"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E7E5E0] bg-gray-50 px-3.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-100 active:scale-95 sm:px-4 sm:text-sm"
          >
            ← <span className="hidden sm:inline">Menú Admin</span>
          </Link>
        </div>
      </header>

      {/* Pestañas tipo "pill", deslizables horizontalmente */}
      <div className="no-scrollbar -mx-4 mb-6 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 mt-6">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-xs font-bold transition-all active:scale-95 sm:text-sm ${
                isActive
                  ? "bg-[#0E6E55] text-white shadow-md shadow-[#0E6E55]/20"
                  : "bg-white text-[#6B675F] border border-[#E7E5E0] hover:border-[#0E6E55]/40 hover:text-[#12151B]"
              }`}
            >
              <span>{tab.icono}</span>
              <span>{tab.label}</span>
              {!!tab.badge && tab.badge > 0 && (
                <span
                  className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold ${
                    isActive ? "bg-white/25 text-white" : "animate-pulse bg-[#C84343] text-white"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}