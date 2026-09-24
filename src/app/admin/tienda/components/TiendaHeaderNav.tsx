"use client";

import Link from "next/link";

export type TabKey = "catalogo" | "pos" | "caja" | "pedidos" | "banners" | "tags";

interface TabOption {
  key: TabKey;
  label: string;
  badge?: number;
  icon: (active: boolean) => JSX.Element;
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
    {
      key: "catalogo",
      label: "Catálogo",
      icon: (active) => (
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${active ? "scale-110" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.8"}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      key: "pos",
      label: "Escáner/POS",
      icon: (active) => (
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${active ? "scale-110" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.8"}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m8-8h-1M5 12H4m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ),
    },
    {
      key: "caja",
      label: "Caja",
      icon: (active) => (
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${active ? "scale-110" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.8"}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      key: "pedidos",
      label: "Pedidos",
      badge: pedidosPendientes,
      icon: (active) => (
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${active ? "scale-110" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.8"}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 022 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      key: "banners",
      label: "Banners",
      icon: (active) => (
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${active ? "scale-110" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.8"}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: "tags",
      label: "Tags",
      icon: (active) => (
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${active ? "scale-110" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.2" : "1.8"}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/80 backdrop-blur-md px-4 py-3.5 sm:px-10 sm:py-5">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#12151B] text-base text-white shadow-sm sm:h-11 sm:w-11 sm:text-lg">
              🛍️
            </span>
            <div>
              <p className="m-0 text-[10px] font-semibold uppercase tracking-wider text-[#0E6E55] sm:text-xs">
                Panel Admin
              </p>
              <h1 className="m-0 text-base font-bold tracking-tight text-[#12151B] sm:text-2xl">
                Gestión de Tienda
              </h1>
            </div>
          </div>

          <Link
            href="/admin"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50/80 px-3 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-100 active:scale-95 sm:h-10 sm:px-4 sm:text-sm"
          >
            ← <span className="hidden sm:inline">Menú Admin</span>
          </Link>
        </div>
      </header>

      {/* NAVEGACIÓN DESKTOP (Pills horizontales superiores) */}
      <div className="hidden sm:block mx-auto max-w-[1200px] px-10 mt-6 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex h-11 shrink-0 items-center gap-2.5 rounded-2xl px-4 text-sm font-semibold transition-all active:scale-95 ${
                  isActive
                    ? "bg-[#0E6E55] text-white shadow-lg shadow-[#0E6E55]/25"
                    : "bg-white text-gray-600 border border-gray-200/80 hover:border-[#0E6E55]/30 hover:text-gray-900"
                }`}
              >
                {tab.icon(isActive)}
                <span>{tab.label}</span>
                {!!tab.badge && tab.badge > 0 && (
                  <span
                    className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                      isActive ? "bg-white/25 text-white" : "bg-red-500 text-white animate-pulse"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM NAVIGATION BAR NATIVA (Para Móviles - z-[9999] garante que siempre flote por encima) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white/95 backdrop-blur-lg border-t border-gray-200/80 px-2 py-1.5 shadow-2xl">
        <div className="grid grid-cols-6 gap-1 items-center max-w-md mx-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-all active:scale-90 ${
                  isActive ? "text-[#0E6E55]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div className="relative">
                  {tab.icon(isActive)}
                  {!!tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? "font-bold text-[#0E6E55]" : ""}`}>
                  {tab.label.split("/")[0]}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 h-1 w-5 rounded-full bg-[#0E6E55]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}