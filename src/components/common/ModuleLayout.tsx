import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/** Estructura común de los módulos, tomada de la carpeta Ejemplo. */
export function ModulePage({ children, width = 'max-w-7xl', as: Tag = 'section' }: { children: ReactNode; width?: string; as?: 'section' | 'main' }) {
  return <Tag className={`mx-auto w-full ${width} space-y-6 p-4 text-text-primary sm:p-6 lg:p-8`}>{children}</Tag>;
}

const BADGE_TONES = {
  success: 'border-success/40 bg-success-soft text-success',
  warning: 'border-warning/40 bg-warning-soft text-warning',
  info: 'border-info/40 bg-info-soft text-info',
  neutral: 'border-border-strong bg-surface text-text-secondary',
} as const;

interface ModuleHeaderProps {
  badge?: { label: string; tone: keyof typeof BADGE_TONES };
  meta?: ReactNode;
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
}

export function ModuleHeader({ badge, meta, icon: Icon, title, description, actions }: ModuleHeaderProps) {
  return <header className="flex flex-col justify-between gap-4 border-b border-border pb-4 lg:flex-row lg:items-center">
    <div>
      {(badge || meta) && <div className="flex flex-wrap items-center gap-2">
        {badge && <span className={`rounded border px-2.5 py-0.5 font-source text-[11px] font-bold uppercase ${BADGE_TONES[badge.tone]}`}>{badge.label}</span>}
        {meta && <span className="font-source text-[11px] font-semibold text-info">{meta}</span>}
      </div>}
      <h1 className="mt-1 flex items-center gap-2 font-noto text-xl font-bold tracking-tight text-text-primary sm:text-2xl"><Icon className="h-6 w-6 shrink-0 text-accent" aria-hidden />{title}</h1>
      <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">{description}</p>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>;
}

export function ProvenanceNote({ provenance, children }: { provenance: string; children?: ReactNode }) {
  return <p className="font-source text-[11px] leading-4 text-text-secondary">Procedencia: {provenance === 'synthetic_demo' ? 'Datos sintéticos de demostración; no son observaciones reales de NASA' : provenance}. {children}</p>;
}
