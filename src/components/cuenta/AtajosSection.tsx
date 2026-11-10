import Link from 'next/link';
import { Calendar, PackageSearch, Heart, MessageCircle, ChevronRight, type LucideIcon } from 'lucide-react';

interface Atajo {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  tone: 'primary' | 'emerald';
  external?: boolean;
}

const ATAJOS: Atajo[] = [
  { href: '/mis-turnos', label: 'Mis Reservas', hint: 'Próximos y anteriores', icon: Calendar, tone: 'primary' },
  { href: '/seguimiento', label: 'Mis compras y pedidos', hint: 'Seguí el estado de tus pedidos', icon: PackageSearch, tone: 'primary' },
  { href: '/favoritos', label: 'Mis productos favoritos', hint: 'Lo que guardaste', icon: Heart, tone: 'primary' },
  { href: 'https://wa.me/', label: 'Soporte por WhatsApp', hint: 'Escribinos, te respondemos', icon: MessageCircle, tone: 'emerald', external: true },
];

const TONOS = {
  primary:
    'bg-primary/10 text-primary ring-primary/15 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary',
  emerald:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/15 group-hover:bg-emerald-500 group-hover:text-white group-hover:ring-emerald-500',
} as const;

interface AtajosSectionProps {
  onClose: () => void;
}

export default function AtajosSection({ onClose }: AtajosSectionProps) {
  const claseAtajo =
    'group flex items-center gap-3 p-3 rounded-2xl border border-stone-200/60 dark:border-zinc-800 ' +
    'bg-white/70 dark:bg-zinc-900/60 shadow-sm shadow-stone-900/[0.03] ' +
    'transition-all duration-200 ease-out ' +
    'hover:bg-white dark:hover:bg-zinc-900 hover:border-stone-300/70 dark:hover:border-zinc-700 ' +
    'hover:shadow-lg hover:shadow-stone-900/5 hover:-translate-y-px ' +
    'active:scale-[0.98] active:translate-y-0 cursor-pointer ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

  return (
    <section className="space-y-2.5">
      <h4 className="px-1 text-xs font-bold text-stone-500 dark:text-zinc-400">
        Gestión y actividad
      </h4>

      <div className="space-y-2">
        {ATAJOS.map(({ href, label, hint, icon: Icon, tone, external }) => {
          const contenido = (
            <>
              <span className={`shrink-0 w-10 h-10 rounded-xl ring-1 flex items-center justify-center transition-all duration-200 ${TONOS[tone]}`}>
                <Icon className="w-[18px] h-[18px]" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-bold text-stone-900 dark:text-zinc-100 leading-tight truncate">
                  {label}
                </span>
                <span className="block text-[11px] font-medium text-stone-500 dark:text-zinc-500 mt-0.5 truncate">
                  {hint}
                </span>
              </span>
              <ChevronRight className="shrink-0 w-4 h-4 text-stone-400 dark:text-zinc-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-stone-600 dark:group-hover:text-zinc-300" />
            </>
          );

          return external ? (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer" onClick={onClose} className={claseAtajo}>
              {contenido}
            </a>
          ) : (
            <Link key={href} href={href} onClick={onClose} className={claseAtajo}>
              {contenido}
            </Link>
          );
        })}
      </div>
    </section>
  );
}