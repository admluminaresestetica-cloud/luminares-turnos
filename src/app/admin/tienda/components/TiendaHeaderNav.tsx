"use client";

import Link from "next/link";
import { 
  Package, 
  QrCode, 
  Wallet, 
  ClipboardList, 
  Image as ImageIcon, 
  Tag, 
  ShoppingBag, 
  ArrowLeft,
  LucideIcon 
} from "lucide-react";

export type TabKey = "catalogo" | "pos" | "caja" | "pedidos" | "banners" | "tags";

interface TabOption {
  key: TabKey;
  label: string;
  badge?: number;
  icon: LucideIcon;
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
      icon: Package,
    },
    {
      key: "pos",
      label: "Escáner/POS",
      icon: QrCode,
    },
    {
      key: "caja",
      label: "Caja",
      icon: Wallet,
    },
    {
      key: "pedidos",
      label: "Pedidos",
      badge: pedidosPendientes,
      icon: ClipboardList,
    },
    
    {
      key: "tags",
      label: "Tags",
      icon: Tag,
    },
  ];

  return (
    <>
      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-4 py-3.5 sm:px-10 sm:py-4 transition-colors">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-xs sm:h-11 sm:w-11">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <div>
              <p className="m-0 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 sm:text-xs">
                Panel Admin
              </p>
              <h1 className="m-0 text-base font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-2xl">
                Gestión de Tienda
              </h1>
            </div>
          </div>

          <Link
            href="/admin"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 px-3 text-xs font-bold text-slate-700 dark:text-zinc-200 shadow-xs transition-all hover:bg-slate-100 dark:hover:bg-zinc-700 active:scale-95 sm:h-10 sm:px-4 sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* NAVEGACIÓN DESKTOP (Pills horizontales superiores) */}
      <div className="hidden sm:block mx-auto max-w-[1200px] px-10 mt-6 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex h-11 shrink-0 items-center gap-2.5 rounded-2xl px-4 text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 dark:shadow-emerald-500/20"
                    : "bg-white dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-zinc-800 hover:border-emerald-500/40 hover:text-slate-900 dark:hover:text-zinc-200"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                <span>{tab.label}</span>
                {!!tab.badge && tab.badge > 0 && (
                  <span
                    className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-black ${
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

      {/* BOTTOM NAVIGATION BAR NATIVA (Para Móviles) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-zinc-800 px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] shadow-2xl transition-colors">
        <div className="grid grid-cols-6 gap-1 items-center max-w-md mx-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-all active:scale-90 cursor-pointer ${
                  isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
                  {!!tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-zinc-900 animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? "font-extrabold text-emerald-600 dark:text-emerald-400" : ""}`}>
                  {tab.label.split("/")[0]}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 h-1 w-5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
