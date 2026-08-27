// src/components/admin/SegmentedTabs.tsx
'use client'

type Accent = 'teal' | 'rose'

type Tab<T extends string> = {
  key: T
  label: string
  count?: number
}

type SegmentedTabsProps<T extends string> = {
  tabs: Tab<T>[]
  active: T
  onChange: (key: T) => void
  accent?: Accent
}

// Tailwind necesita clases completas y estáticas (no template strings) para
// no purgarlas en build, por eso el mapeo explícito por acento.
const ACCENT_STYLES: Record<Accent, { activeText: string; activeRing: string; countBg: string }> = {
  teal: {
    activeText: 'text-teal-700',
    activeRing: 'ring-1 ring-teal-100',
    countBg: 'bg-teal-50 text-teal-700'
  },
  rose: {
    activeText: 'text-rose-700',
    activeRing: 'ring-1 ring-rose-100',
    countBg: 'bg-rose-50 text-rose-700'
  }
}

export default function SegmentedTabs<T extends string>({
  tabs,
  active,
  onChange,
  accent = 'teal'
}: SegmentedTabsProps<T>) {
  const styles = ACCENT_STYLES[accent]

  return (
    <div
      role="tablist"
      className="flex flex-wrap gap-1 rounded-full bg-slate-100 p-1 w-full sm:w-fit"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`
              relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2
              text-sm font-medium transition-all duration-200 ease-out
              ${isActive ? `bg-white shadow-sm ${styles.activeText} ${styles.activeRing}` : 'text-slate-500 hover:text-slate-800'}
            `}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className={`
                  rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums
                  ${isActive ? styles.countBg : 'bg-slate-200 text-slate-600'}
                `}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
