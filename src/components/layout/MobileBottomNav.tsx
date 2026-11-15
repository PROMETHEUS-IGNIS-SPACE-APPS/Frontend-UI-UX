import { useEffect, useState } from 'react';
import { Activity, CalendarDays, Cpu, HeartHandshake, Layers, MoreHorizontal, Radar, Server, TrendingUp, X } from 'lucide-react';
import type { AppModuleId } from '@/types/domain/module';

interface MobileBottomNavProps {
  activeModule: AppModuleId;
  onModuleChange: (moduleId: AppModuleId) => void;
}

interface NavItem { id: AppModuleId; label: string; icon: typeof Layers }

const PRIMARY: NavItem[] = [
  { id: 'explorer', label: 'Mapa', icon: Layers },
  { id: 'calendar', label: 'Calendario', icon: CalendarDays },
  { id: 'analytics', label: 'Analítica', icon: Activity },
  { id: 'comparison', label: 'Aula', icon: HeartHandshake },
];

const SECONDARY: NavItem[] = [
  { id: 'predictability', label: 'Predictibilidad', icon: TrendingUp },
  { id: 'markov-heatmap', label: 'Mapa de Calor Markov', icon: Radar },
  { id: 'laboratory', label: 'Modelos IA', icon: Cpu },
  { id: 'sources', label: 'Fuentes/API', icon: Server },
];

/**
 * Barra de navegación inferior para teléfonos (< md). Muestra los cuatro
 * módulos más usados y agrupa el resto en “Más”, al alcance del pulgar.
 */
export default function MobileBottomNav({ activeModule, onModuleChange }: MobileBottomNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = SECONDARY.some((item) => item.id === activeModule);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMoreOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moreOpen]);

  const go = (id: AppModuleId) => { onModuleChange(id); setMoreOpen(false); window.scrollTo({ top: 0 }); };

  return <>
    {moreOpen && <div className="fixed inset-0 z-[45] bg-black/60 md:hidden" onClick={() => setMoreOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Más módulos" className="absolute inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] mx-2 rounded-2xl border border-border-strong bg-card p-2 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
          <span className="font-noto text-xs font-bold text-text-primary">Más módulos</span>
          <button type="button" onClick={() => setMoreOpen(false)} aria-label="Cerrar menú de módulos" className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover"><X className="h-4 w-4" aria-hidden /></button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {SECONDARY.map(({ id, label, icon: Icon }) => {
            const active = id === activeModule;
            return <button key={id} type="button" onClick={() => go(id)} aria-current={active ? 'page' : undefined} className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2.5 text-left font-noto text-xs font-semibold transition-colors ${active ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-surface text-text-primary hover:bg-surface-hover'}`}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden />{label}
            </button>;
          })}
        </div>
      </div>
    </div>}

    <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-[46] border-t border-border-strong bg-card pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_16px_rgba(0,0,0,0.25)] md:hidden">
      <div className="grid h-15 grid-cols-5">
        {PRIMARY.map(({ id, label, icon: Icon }) => {
          const active = id === activeModule;
          return <button key={id} type="button" onClick={() => go(id)} aria-current={active ? 'page' : undefined} className={`flex flex-col items-center justify-center gap-0.5 font-noto text-[10px] font-semibold transition-colors ${active ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}>
            <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${active ? 'bg-accent-soft' : ''}`}><Icon className="h-[18px] w-[18px]" aria-hidden /></span>
            {label}
          </button>;
        })}
        <button type="button" onClick={() => setMoreOpen((value) => !value)} aria-expanded={moreOpen} aria-haspopup="dialog" className={`flex flex-col items-center justify-center gap-0.5 font-noto text-[10px] font-semibold transition-colors ${moreActive || moreOpen ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}>
          <span className={`flex h-7 w-12 items-center justify-center rounded-full ${moreActive || moreOpen ? 'bg-accent-soft' : ''}`}><MoreHorizontal className="h-[18px] w-[18px]" aria-hidden /></span>
          Más
        </button>
      </div>
    </nav>
  </>;
}
