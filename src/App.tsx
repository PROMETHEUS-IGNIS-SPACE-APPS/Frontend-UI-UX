import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Clock3, Flame, LoaderCircle, MapPin, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import GlossaryModal from '@/components/common/GlossaryModal';
import ModulePlaceholder from '@/components/common/ModulePlaceholder';
import Header from '@/components/layout/Header';
import ObservationMap from '@/features/explorer/ObservationMap';
import { fetchObservations } from '@/services/api/observationsService';
import { useUiStore } from '@/stores/uiStore';
import type { Observation, Sensor } from '@/types/api/observations';
import { APP_MODULES } from '@/types/domain/module';
import AnalyticsPanel from '@/features/analytics/AnalyticsPanel';
import LaboratoryPanel from '@/features/laboratory/LaboratoryPanel';
import PedagogicalPanel from '@/features/pedagogy/PedagogicalPanel';
import ExplorerSidebar from '@/features/explorer/ExplorerSidebar';
import MapOverlays from '@/features/explorer/MapOverlays';
import { MAP_FOCUS_PRESETS, type MapFocusPreset } from '@/features/explorer/mapPresets';

const EMPTY_OBSERVATIONS: Observation[] = [];

export default function App() {
  const activeModule = useUiStore((state) => state.activeModule);
  const setActiveModule = useUiStore((state) => state.setActiveModule);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [sensor, setSensor] = useState<Sensor | 'ALL'>('ALL');
  const [selected, setSelected] = useState<Observation | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [focusTarget, setFocusTarget] = useState<MapFocusPreset>(MAP_FOCUS_PRESETS[0]);
  const [showViirs, setShowViirs] = useState(true);
  const [showModis, setShowModis] = useState(true);
  const observationsQuery = useQuery({
    queryKey: ['observations', 'all', 1000],
    queryFn: ({ signal }) => fetchObservations({ limit: 1000, signal }),
    staleTime: 60_000,
  });
  const allObservations = observationsQuery.data?.data ?? EMPTY_OBSERVATIONS;
  const dates = useMemo(() => [...new Set(allObservations.map((item) => item.acquired_at.slice(0, 10)))].sort(), [allObservations]);
  const visible = useMemo(() => allObservations.filter((item) => (sensor === 'ALL' || item.sensor === sensor) && (!activeDate || item.acquired_at.startsWith(activeDate))), [allObservations, sensor, activeDate]);
  const active = APP_MODULES.find((module) => module.id === activeModule) ?? APP_MODULES[0];

  const activeDateIndex = activeDate ? dates.indexOf(activeDate) : -1;
  const stepDate = (direction: -1 | 1) => {
    if (!dates.length) return;
    const nextIndex = activeDateIndex < 0 ? (direction < 0 ? dates.length - 1 : 0) : Math.min(dates.length - 1, Math.max(0, activeDateIndex + direction));
    setActiveDate(dates[nextIndex]);
  };

  useEffect(() => {
    if (!isPlaying || dates.length < 2) return undefined;
    const interval = window.setInterval(() => {
      setActiveDate((current) => {
        const index = current ? dates.indexOf(current) : -1;
        return dates[(index + 1) % dates.length];
      });
    }, 900);
    return () => window.clearInterval(interval);
  }, [isPlaying, dates]);

  const handleExport = () => {
    if (!visible.length) return;
    const headers = ['observation_id', 'sensor', 'latitude', 'longitude', 'acquired_at', 'frp_mw', 'confidence_raw', 'source'];
    const csv = [headers.join(','), ...visible.map((item) => headers.map((key) => csvValue(item[key as keyof Observation])).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prometheus-ignis-observaciones.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060b13] text-slate-100 font-sans">
      <Header activeModule={activeModule} onModuleChange={setActiveModule} totalVisibleCount={activeModule === 'explorer' ? visible.length : 0} onExportCsv={handleExport} onOpenGlossary={() => setIsGlossaryOpen(true)} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div key={active.id} id={`panel-${active.id}`} role="tabpanel" aria-labelledby={`tab-${active.id}-desktop`} tabIndex={0} className="flex-1 flex flex-col overflow-y-auto">
          {activeModule === 'explorer' ? (
            <section className="flex min-h-[calc(100dvh-108px)] flex-1 flex-col overflow-hidden lg:h-[calc(100dvh-108px)] lg:flex-row">
              <ExplorerSidebar
                sensor={sensor}
                onSensorChange={setSensor}
                visibleCount={visible.length}
                recordCount={observationsQuery.data?.count ?? 0}
                totalMatching={observationsQuery.data?.total_matching ?? 0}
                provenance={observationsQuery.data?.data_provenance ?? ''}
                isTruncated={Boolean(observationsQuery.data && observationsQuery.data.count < observationsQuery.data.total_matching)}
                onReset={() => { setSensor('ALL'); setActiveDate(null); setSelected(null); setIsPlaying(false); }}
              />

              <div className="flex min-h-[580px] min-w-0 flex-1 flex-col overflow-hidden bg-[#080d16] lg:h-full lg:min-h-0">
                {observationsQuery.isPending && <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-800 bg-[#08111e] p-4 text-sm text-slate-300"><LoaderCircle className="h-4 w-4 animate-spin text-cyan-300" />Consultando observaciones…</div>}
                {observationsQuery.isError && <div role="alert" className="mb-3 flex items-start gap-3 rounded-xl border border-red-900/70 bg-red-950/30 p-4 text-sm text-red-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="font-semibold">No se pudieron cargar las observaciones</p><p className="mt-1 text-red-200/80">{observationsQuery.error.message}</p><button type="button" className="mt-3 rounded-lg border border-red-800 px-3 py-1.5 text-xs hover:bg-red-900/40" onClick={() => void observationsQuery.refetch()}>Reintentar</button></div></div>}
                <div className="relative min-h-[420px] flex-1 overflow-hidden bg-[#d9e4e8] lg:min-h-0">
                  {observationsQuery.isSuccess && <ObservationMap observations={visible} selected={selected} onSelect={setSelected} focusTarget={focusTarget} showViirs={showViirs} showModis={showModis} />}
                  {observationsQuery.isSuccess && visible.length === 0 && <div className="absolute inset-0 z-10 grid place-items-center bg-[#08111e]/65 text-center backdrop-blur-[1px]"><div className="rounded-xl border border-slate-700 bg-[#0b1422]/95 p-5"><Flame className="mx-auto h-7 w-7 text-slate-500" /><p className="mt-2 font-medium text-slate-200">No hay observaciones para este filtro</p><p className="mt-1 text-xs text-slate-400">La consulta respondió correctamente con una colección vacía.</p></div></div>}
                  {observationsQuery.isSuccess && <MapOverlays focusId={focusTarget.id} onFocusChange={setFocusTarget} observationCounts={{ VIIRS: visible.filter((item) => item.sensor === 'VIIRS').length, MODIS: visible.filter((item) => item.sensor === 'MODIS').length }} showViirs={showViirs} showModis={showModis} onToggleViirs={() => setShowViirs((value) => !value)} onToggleModis={() => setShowModis((value) => !value)} />}
                </div>
              <div className="border-t border-slate-800 bg-[#080d16] p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3"><div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1"><button type="button" onClick={() => stepDate(-1)} disabled={!dates.length || (activeDateIndex === 0)} aria-label="Paso anterior" className="rounded p-1.5 text-slate-300 hover:bg-slate-800 disabled:opacity-40"><SkipBack className="h-4 w-4" /></button><button type="button" onClick={() => { if (!isPlaying && activeDateIndex === dates.length - 1) setActiveDate(null); setIsPlaying((playing) => !playing); }} disabled={dates.length < 2} aria-label={isPlaying ? 'Pausar línea de tiempo' : 'Reproducir línea de tiempo'} className="rounded-lg bg-amber-500 p-2 text-slate-950 disabled:opacity-40">{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button><button type="button" onClick={() => stepDate(1)} disabled={!dates.length || activeDateIndex >= dates.length - 1} aria-label="Paso siguiente" className="rounded p-1.5 text-slate-300 hover:bg-slate-800 disabled:opacity-40"><SkipForward className="h-4 w-4" /></button></div><div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-cyan-300" /><div><p className="font-mono font-semibold text-slate-100">{activeDate ?? 'Todos los pasos'}</p><p className="text-[10px] text-slate-500">{activeDateIndex + 1 > 0 ? `Paso ${activeDateIndex + 1} de ${dates.length}` : `${dates.length} fechas disponibles`}</p></div></div></div>
                  <input type="range" aria-label="Fecha de la línea de tiempo" min={0} max={Math.max(0, dates.length - 1)} value={Math.max(0, activeDateIndex)} onChange={(event) => { setIsPlaying(false); setActiveDate(dates[Number(event.target.value)] ?? null); }} disabled={!dates.length} className="min-w-[180px] flex-1 accent-amber-500" />
                </div>
                <p className="mt-2 text-[10px] text-amber-200/80">La ausencia de datos en un paso orbital no equivale a ausencia de incendios.</p>
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-3 text-xs leading-5 text-amber-100/90"><strong className="text-amber-200">Lectura responsable</strong><p className="mt-1">Una observación satelital no equivale necesariamente a un incendio independiente. Los conteos MODIS y VIIRS se presentan por separado.</p></div>
                {selected && <aside className="rounded-xl border border-slate-800 bg-[#08111e] p-3"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xs font-semibold"><MapPin className="h-4 w-4 text-amber-400" />Observación seleccionada</h2><button type="button" onClick={() => setSelected(null)} aria-label="Limpiar selección" className="text-slate-500 hover:text-white"><X className="h-3.5 w-3.5" /></button></div><dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">{[['ID', selected.observation_id], ['Sensor', selected.sensor], ['Adquisición UTC', selected.acquired_at], ['FRP', selected.frp_mw === null ? 'No disponible' : `${selected.frp_mw} MW`], ['Confianza original', String(selected.confidence_raw)], ['Coordenadas', `${selected.latitude}, ${selected.longitude}`], ['Fuente', selected.source]].map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="mt-0.5 break-words text-slate-200">{value}</dd></div>)}</dl></aside>}
              </div>
              </div>
            </section>
          ) : activeModule === 'analytics' ? (
            observationsQuery.isSuccess
              ? <AnalyticsPanel observations={visible} totalMatching={observationsQuery.data.total_matching} provenance={observationsQuery.data.data_provenance} />
              : <div className="mx-auto w-full max-w-7xl p-6"><QueryState isLoading={observationsQuery.isPending} error={observationsQuery.error?.message} onRetry={() => void observationsQuery.refetch()} /></div>
          ) : activeModule === 'comparison' ? <PedagogicalPanel />
            : activeModule === 'laboratory' ? <LaboratoryPanel provenance={observationsQuery.data?.data_provenance ?? 'No disponible'} />
              : <div className="mx-auto w-full max-w-7xl p-6"><ModulePlaceholder title={active.label} description={active.description} /></div>}
        </div>
      </main>
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
    </div>
  );
}

function csvValue(value: string | number | null) {
  if (value === null) return '';
  return `"${String(value).replaceAll('"', '""')}"`;
}

function QueryState({ isLoading, error, onRetry }: { isLoading: boolean; error?: string; onRetry: () => void }) {
  if (isLoading) return <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0b1220] p-5 text-sm text-slate-300"><LoaderCircle className="h-4 w-4 animate-spin text-cyan-300" />Consultando observaciones para el análisis…</div>;
  return <div role="alert" className="rounded-xl border border-red-900/70 bg-red-950/30 p-5 text-sm text-red-200"><p className="font-semibold">No se pudo cargar el conjunto consultado</p><p className="mt-1">{error ?? 'Error desconocido'}</p><button type="button" onClick={onRetry} className="mt-3 rounded-lg border border-red-800 px-3 py-1.5 text-xs hover:bg-red-900/40">Reintentar</button></div>;
}
