import { Activity, BookOpen, CalendarDays, Cpu, Download, HeartHandshake, Layers, TrendingUp } from 'lucide-react';
import type { AppModuleId } from '@/types/domain/module';
import { APP_MODULES } from '@/types/domain/module';
import ConnectionIndicator from './ConnectionIndicator';
import EmergencyAccess from './EmergencyAccess';
import logoPng from '@/assets/PROMETHEUS_IGNIS.png';

interface HeaderProps {
  activeModule: AppModuleId;
  onModuleChange: (moduleId: AppModuleId) => void;
  totalVisibleCount: number;
  onExportCsv: () => void;
  onOpenGlossary: () => void;
}

const MODULE_ICONS: Record<AppModuleId, typeof Layers> = {
  explorer: Layers,
  predictability: TrendingUp,
  calendar: CalendarDays,
  analytics: Activity,
  comparison: HeartHandshake,
  laboratory: Cpu,
};

const MOBILE_MODULE_LABELS: Record<AppModuleId, string> = {
  explorer: 'Mapa',
  predictability: 'Predicción',
  calendar: 'Calendario',
  analytics: 'Analítica',
  comparison: 'Aula',
  laboratory: 'Modelos IA',
};

export default function Header({ activeModule, onModuleChange, totalVisibleCount, onExportCsv, onOpenGlossary }: HeaderProps) {
  const canExport = totalVisibleCount > 0;
  const exportTitle = canExport
    ? `Exportar ${totalVisibleCount} registros filtrados a CSV`
    : 'Sin registros visibles para exportar (requiere conexión con el backend)';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-[#080d17]/[0.98] text-slate-100 shadow-lg shadow-black/20 backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] px-3 sm:px-5">
        <div className="flex min-h-[58px] items-center justify-between gap-3 py-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative h-9 w-9 shrink-0">
              <img src={logoPng} alt="" className="h-9 w-9 rounded-xl border border-amber-500/30 object-cover shadow-md shadow-orange-950/50" />
              <span aria-hidden className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#080d17] bg-cyan-400" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-mono text-xs font-extrabold tracking-wider text-orange-400 sm:text-sm">PROMETHEUS IGNIS</span>
                <span className="hidden whitespace-nowrap rounded border border-cyan-800/70 bg-cyan-950/50 px-1 py-0.5 font-mono text-[8px] text-cyan-300 sm:inline">MODIS · VIIRS</span>
              </div>
              <p className="hidden truncate text-[9px] text-slate-500 sm:block">Plataforma de Inteligencia Territorial · Semillero de Astronomía ITM</p>
            </div>
          </div>

          <nav aria-label="Módulos" role="tablist" className="hidden min-w-0 items-center gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-[#0d1422] p-1 lg:flex">
            {renderTabs('desktop')}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={onOpenGlossary} aria-label="Abrir glosario científico" title="Glosario científico" className="rounded-lg border border-slate-800 bg-[#0d1422] p-2 text-slate-300 transition hover:border-slate-600 hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><BookOpen className="h-4 w-4" aria-hidden /></button>
            <button type="button" onClick={onExportCsv} disabled={!canExport} title={exportTitle} aria-label={exportTitle} className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#111a29] px-2 py-2 font-mono text-[9px] font-semibold text-slate-200 transition hover:border-amber-600/60 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 sm:px-2.5 sm:text-[10px]"><Download className="h-3.5 w-3.5 text-amber-400" aria-hidden /><span className="hidden sm:inline">CSV ({totalVisibleCount})</span><span className="sm:hidden">CSV</span></button>
          </div>
        </div>

        <div className="flex min-h-10 items-center justify-between gap-2 border-t border-slate-800/70 py-1.5">
          <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
            <div className="lg:hidden flex items-center gap-1">{renderTabs('mobile')}</div>
            <div className="flex items-center gap-2"><ConnectionIndicator /><span className="hidden whitespace-nowrap font-mono text-[10px] text-slate-400 sm:inline">ESTADO DEL BACKEND</span></div>
            <span className="hidden h-4 w-px bg-slate-700 sm:block" />
            <span className="whitespace-nowrap rounded-md border border-slate-700 bg-[#101827] px-2 py-1 font-mono text-[10px] text-slate-300"><span className="text-cyan-300">▤</span> Observaciones satelitales <span className="text-slate-500">({totalVisibleCount})</span></span>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2"><EmergencyAccess /><span className="hidden font-mono text-[10px] text-slate-500 lg:inline">VISTA TERRITORIAL</span></div>
        </div>
      </div>
    </header>
  );

  function renderTabs(variant: 'desktop' | 'mobile') {
    return APP_MODULES.map((module) => {
      const Icon = MODULE_ICONS[module.id];
      const isActive = module.id === activeModule;
      return <button key={`${variant}-${module.id}`} type="button" role="tab" id={`tab-${module.id}-${variant}`} aria-selected={isActive} aria-controls={`panel-${module.id}`} onClick={() => onModuleChange(module.id)} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] font-semibold transition sm:text-[11px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${isActive ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}><Icon className="h-3.5 w-3.5" aria-hidden /><span>{variant === 'mobile' ? MOBILE_MODULE_LABELS[module.id] : module.label}</span></button>;
    });
  }
}
