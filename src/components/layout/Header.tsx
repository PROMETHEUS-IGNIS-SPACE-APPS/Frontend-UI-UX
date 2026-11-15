import { Activity, BookOpen, CalendarDays, Download, HeartHandshake, Info, Layers, Moon, Radar, Sun, TrendingUp } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { downloadCitizenReportsCsv, useCitizenReportsStore } from '@/stores/citizenReportsStore';
import type { AppModuleId } from '@/types/domain/module';
import { APP_MODULES } from '@/types/domain/module';
import ConnectionIndicator from './ConnectionIndicator';
import EmergencyAccess from './EmergencyAccess';
import LocalCsvAccess from './LocalCsvAccess';
import ManualAccess from './ManualAccess';
import MobileBottomNav from './MobileBottomNav';
import NoveltyReportAccess from './NoveltyReportAccess';
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
  'markov-heatmap': Radar,
  calendar: CalendarDays,
  analytics: Activity,
  comparison: HeartHandshake,
  'project-info': Info,
};

/** Etiquetas visibles cortas, como en la barra del ejemplo. */
const DESKTOP_MODULE_LABELS: Record<AppModuleId, string> = {
  explorer: 'Mapa',
  predictability: 'Predictibilidad',
  'markov-heatmap': 'Mapa de Calor',
  calendar: 'Calendario',
  analytics: 'Analítica',
  comparison: 'Aula Pedagógica',
  'project-info': 'Información del Proyecto',
};

const MOBILE_MODULE_LABELS: Record<AppModuleId, string> = {
  explorer: 'Mapa',
  predictability: 'Predicción',
  'markov-heatmap': 'Calor Markov',
  calendar: 'Calendario',
  analytics: 'Analítica',
  comparison: 'Aula',
  'project-info': 'Proyecto',
};

const SMALL_BUTTON = 'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 font-noto text-[11px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400';

export default function Header({ activeModule, onModuleChange, totalVisibleCount, onExportCsv, onOpenGlossary }: HeaderProps) {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const canExport = totalVisibleCount > 0;
  const citizenReports = useCitizenReportsStore((state) => state.reports);
  const exportTitle = canExport
    ? `Descargar las ${totalVisibleCount} observaciones satelitales visibles en un archivo .CSV`
    : 'Sin registros visibles para exportar (requiere conexión con el backend)';

  return (
    <header className="relative z-40 md:sticky md:top-0 w-full max-w-full shrink-0 select-none overflow-x-hidden border-b border-border bg-card text-text-primary shadow-xs">
      <div className="mx-auto w-full max-w-[1440px] px-2.5 sm:px-4">
        {/* Fila superior: marca, navegación y herramientas */}
        <div className="flex flex-nowrap items-center justify-between gap-2 py-2 lg:flex-wrap 2xl:flex-nowrap">
          <div className="flex min-w-0 items-center gap-2.5 lg:shrink-0">
            <img src={logoPng} alt="" className="h-8 w-8 shrink-0 sm:h-9 sm:w-9 rounded-xl object-cover shadow-md" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="whitespace-nowrap font-noto text-sm font-extrabold tracking-wide text-text-primary sm:text-[15px]">PROMETHEUS IGNIS</span>
                <span className="hidden whitespace-nowrap rounded border border-border bg-card px-1.5 py-0.5 font-source text-[10px] font-bold tracking-wide text-accent sm:inline">MODIS · VIIRS</span>
              </div>
              <p className="hidden truncate text-[11px] leading-tight text-text-secondary sm:block">Plataforma de Inteligencia Territorial · Semillero ITM</p>
            </div>
          </div>

          <nav aria-label="Módulos" role="tablist" className="order-3 hidden w-full max-w-full flex-wrap items-center justify-center gap-0.5 rounded-xl border border-border bg-card p-1 lg:flex 2xl:order-2 2xl:w-auto 2xl:flex-nowrap">
            {renderTabs('desktop')}
          </nav>

          <div className="order-2 flex shrink-0 items-center gap-1 sm:gap-1.5 2xl:order-3">
            <button type="button" onClick={toggleTheme} aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'} title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-accent transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">
              {theme === 'light' ? <Moon className="h-4 w-4" aria-hidden /> : <Sun className="h-4 w-4" aria-hidden />}
            </button>
            <button type="button" onClick={onOpenGlossary} aria-label="Abrir glosario científico" title="Guía y Glosario Científico" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">
              <BookOpen className="h-4 w-4" aria-hidden />
            </button>
            <ManualAccess />
          </div>
        </div>

        {/* Fila inferior: estado de datos y acciones rápidas */}
        <div className="-mx-2.5 flex flex-nowrap items-center justify-between gap-2 overflow-x-auto border-t border-border px-2.5 py-1.5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <div className="flex shrink-0 items-center gap-1.5 sm:min-w-0 sm:shrink sm:flex-wrap">
            <div className="hidden items-center gap-1 overflow-x-auto md:flex lg:hidden">{renderTabs('mobile')}</div>
            <ConnectionIndicator />
            <LocalCsvAccess />
            <button type="button" onClick={onExportCsv} disabled={!canExport} title={exportTitle} aria-label={exportTitle} className={`${SMALL_BUTTON} gap-2 border border-border bg-card text-text-primary hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50`}>
              <Download className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
              <span className="hidden sm:inline">Descargar observaciones (.CSV)</span>
              <span className="sm:hidden">Descargar</span>
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-solid px-1.5 font-source text-[10px] font-extrabold tabular-nums text-accent-fg">{totalVisibleCount.toLocaleString()}</span>
            </button>
          </div>
          <div role="group" aria-label="Emergencias y reportes ciudadanos" className="order-first flex shrink-0 items-center gap-1.5 sm:order-none sm:flex-wrap">
            <EmergencyAccess />
            <NoveltyReportAccess />
            <button type="button" onClick={() => downloadCitizenReportsCsv(citizenReports)} disabled={!citizenReports.length} title={citizenReports.length ? `Descargar los ${citizenReports.length} reportes ciudadanos guardados en este dispositivo` : 'Aún no hay reportes ciudadanos guardados en este dispositivo'} aria-label="Descargar Reportes (.CSV)" className={`${SMALL_BUTTON} gap-2 border border-border bg-card text-text-primary hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50`}>
              <Download className="h-3.5 w-3.5 shrink-0 text-info" aria-hidden />
              <span className="hidden sm:inline">Descargar Reportes (.CSV)</span>
              <span className="sm:hidden">Reportes</span>
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-info px-1.5 font-source text-[10px] font-extrabold tabular-nums text-white">{citizenReports.length}</span>
            </button>
          </div>
        </div>
      </div>
      <MobileBottomNav activeModule={activeModule} onModuleChange={onModuleChange} />
    </header>
  );

  function renderTabs(variant: 'desktop' | 'mobile') {
    return APP_MODULES.map((module) => {
      const Icon = MODULE_ICONS[module.id];
      const isActive = module.id === activeModule;
      const visibleLabel = variant === 'mobile' ? MOBILE_MODULE_LABELS[module.id] : DESKTOP_MODULE_LABELS[module.id];
      return <button
        key={`${variant}-${module.id}`}
        type="button"
        role="tab"
        id={`tab-${module.id}-${variant}`}
        aria-selected={isActive}
        aria-controls={`panel-${module.id}`}
        aria-label={variant === 'desktop' ? module.label : undefined}
        title={module.label}
        onClick={() => onModuleChange(module.id)}
        className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-1.5 font-noto text-[11px] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${isActive ? 'bg-accent-solid font-bold text-accent-fg shadow-sm' : 'font-medium text-text-primary/80 hover:bg-surface-hover hover:text-text-primary'}`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{visibleLabel}</span>
      </button>;
    });
  }
}
