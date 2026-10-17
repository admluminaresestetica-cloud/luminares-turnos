export interface FondoFestivo {
  id: string;
  nombre: string;
  categoria: "navidad" | "fiestas" | "cyber" | "amor";
  value: string;
  tipo: "degradado" | "patron" | "imagen";
}

export const FONDOS_FESTIVOS: FondoFestivo[] = [
  {
    id: "navidad_rojo_dorado",
    nombre: "Rojo Navideño & Dorado",
    categoria: "navidad",
    value: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #d97706 100%)",
    tipo: "degradado",
  },
  {
    id: "navidad_verde_pino",
    nombre: "Verde Pino & Nieve",
    categoria: "navidad",
    value: "linear-gradient(135deg, #064e3b 0%, #047857 60%, #0f172a 100%)",
    tipo: "degradado",
  },
  {
    id: "ano_nuevo_elegante",
    nombre: "Noche de Gala & Oro",
    categoria: "fiestas",
    value: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #713f12 100%)",
    tipo: "degradado",
  },
  {
    id: "cyber_neon",
    nombre: "Cyber & Black Friday",
    categoria: "cyber",
    value: "linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #4c1d95 100%)",
    tipo: "degradado",
  },
  {
    id: "amor_rosa",
    nombre: "San Valentín / Pasión",
    categoria: "amor",
    value: "linear-gradient(135deg, #881337 0%, #e11d48 60%, #fda4af 100%)",
    tipo: "degradado",
  },
];