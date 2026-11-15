import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Flame, LoaderCircle, MapPin, X } from 'lucide-react';
import GlossaryModal from '@/components/common/GlossaryModal';
import ModulePlaceholder from '@/components/common/ModulePlaceholder';
import Header from '@/components/layout/Header';
import ObservationMap from '@/features/explorer/ObservationMap';
import { fetchIngestedObservations } from '@/services/api/ingestionService';
import { useUiStore } from '@/stores/uiStore';
import { selectLocalObservations, useLocalCsvStore } from '@/stores/localCsvStore';
import type { Observation, ObservationSourceMode, Sensor } from '@/types/api/observations';
import { APP_MODULES } from '@/types/domain/module';
import AnalyticsPanel from '@/features/analytics/AnalyticsPanel';
import ActivityCalendarPanel from '@/features/calendar/ActivityCalendarPanel';
import LaboratoryPanel from '@/features/laboratory/LaboratoryPanel';
import KairosClassroom from '@/features/pedagogy/KairosClassroom';
import PredictabilityPanel from '@/features/predictability/PredictabilityPanel';
import MarkovHeatmapPanel from '@/features/markov/MarkovHeatmapPanel';
import SourcesPanel from '@/features/sources/SourcesPanel';
import ExplorerSidebar from '@/features/explorer/ExplorerSidebar';
import MapOverlays from '@/features/explorer/MapOverlays';
import TimelineControls from '@/features/explorer/TimelineControls';
import { DEFAULT_MAP_LAYERS, MAP_FOCUS_PRESETS, MAP_STYLE_PRESETS, observationCategory, type MapFocusPreset, type MapLayerState, type MapStylePreset } from '@/features/explorer/mapPresets';
import type { SourcePreset } from '@/features/explorer/ExplorerSidebar';

const EMPTY_OBSERVATIONS: Observation[] = [];

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 6);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

function shiftDate(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export default function App() {
  const activeModule = useUiStore((state) => state.activeModule);
  const setActiveModule = useUiStore((state) => state.setActiveModule);
  const theme = useUiStore((state) => state.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [sensor, setSensor] = useState<Sensor | 'ALL'>('ALL');
  const [sourceMode, setSourceMode] = useState<ObservationSourceMode>('fusion');
  const [region, setRegion] = useState<'antioquia_ideam' | 'colombia'>('antioquia_ideam');
  const defaultRange = useMemo(getDefaultDateRange, []);
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);
  const [department, setDepartment] = useState('ALL');
  const [municipality, setMunicipality] = useState('ALL');
  const [municipalitySearch, setMunicipalitySearch] = useState('');
  const [daynight, setDaynight] = useState<'ALL' | 'D' | 'N'>('ALL');
  const [minimumFrp, setMinimumFrp] = useState('');
  const [confidenceRaw, setConfidenceRaw] = useState('ALL');
  const [selected, setSelected] = useState<Observation | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [focusTarget, setFocusTarget] = useState<MapFocusPreset>(MAP_FOCUS_PRESETS[0]);
  const [mapStyle, setMapStyle] = useState<MapStylePreset>(MAP_STYLE_PRESETS[0]);
  const [mapLayers, setMapLayers] = useState<MapLayerState>(DEFAULT_MAP_LAYERS);
  const toggleMapLayer = (key: keyof MapLayerState) => setMapLayers((current) => ({ ...current, [key]: !current[key] }));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const observationsQuery = useQuery({
    queryKey: ['observations', sourceMode, dateFrom, dateTo, region],
    queryFn: ({ signal }) => fetchIngestedObservations({
      sourceMode,
      from: dateFrom,
      to: dateTo,
      region: sourceMode === 'firms' && region === 'antioquia_ideam' ? 'antioquia' : region,
      signal,
    }),
    staleTime: 15 * 60_000,
  });
  const localDatasets = useLocalCsvStore((state) => state.datasets);
  const localObservations = useMemo(() => selectLocalObservations(localDatasets), [localDatasets]);
  const backendObservations = observationsQuery.data?.data ?? EMPTY_OBSERVATIONS;
  const allObservations = useMemo(() => localObservations.length ? [...backendObservations, ...localObservations] : backendObservations, [backendObservations, localObservations]);
  const hasData = observationsQuery.isSuccess || localObservations.length > 0;
  const totalMatching = (observationsQuery.data?.total_matching ?? 0) + localObservations.length;
  const provenance = [observationsQuery.data?.data_provenance, localObservations.length ? `CSV local (${localObservations.length.toLocaleString()} observaciones)` : null].filter(Boolean).join(' + ') || (observationsQuery.isPending ? 'Cargando fuente…' : 'No disponible');
  const matchingObservations = useMemo(() => {
    const minFrp = minimumFrp.trim() ? Number(minimumFrp) : null;
    const search = municipalitySearch.trim().toLocaleLowerCase('es');
    return allObservations.filter((item) => (sensor === 'ALL' || item.sensor === sensor)
      && (department === 'ALL' || item.department === department)
      && (municipality === 'ALL' || item.municipality === municipality)
      && (!search || item.municipality?.toLocaleLowerCase('es').includes(search))
      && (daynight === 'ALL' || item.daynight?.toUpperCase() === daynight)
      && (confidenceRaw === 'ALL' || String(item.confidence_raw) === confidenceRaw)
      && (minFrp === null || (item.frp_mw !== null && item.frp_mw >= minFrp)));
  }, [allObservations, sensor, department, municipality, municipalitySearch, daynight, confidenceRaw, minimumFrp]);
  const dates = useMemo(() => [...new Set(matchingObservations.map((item) => item.acquired_at.slice(0, 10)))].sort(), [matchingObservations]);
  const countsByDate = useMemo(() => matchingObservations.reduce<Record<string, number>>((counts, item) => { const date = item.acquired_at.slice(0, 10); counts[date] = (counts[date] ?? 0) + 1; return counts; }, {}), [matchingObservations]);
  const dateFiltered = useMemo(() => matchingObservations.filter((item) => !activeDate || item.acquired_at.startsWith(activeDate)), [matchingObservations, activeDate]);
  const categoryCounts = useMemo(() => {
    const counts = { viirs: 0, modis: 0, highIntensity: 0 };
    for (const item of dateFiltered) counts[observationCategory(item)] += 1;
    return counts;
  }, [dateFiltered]);
  const visible = useMemo(() => dateFiltered.filter((item) => mapLayers[observationCategory(item)]), [dateFiltered, mapLayers]);
  const applySourcePreset = (preset: SourcePreset) => {
    const today = new Date().toISOString().slice(0, 10);
    setSourceMode(preset.sourceMode);
    setRegion(preset.region);
    if (preset.days) { setDateTo(today); setDateFrom(shiftDate(today, -(preset.days - 1))); }
    setActiveDate(null); setSelected(null); setIsPlaying(false);
  };
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
    }, Math.max(200, Math.floor(900 / playbackSpeed)));
    return () => window.clearInterval(interval);
  }, [isPlaying, dates, playbackSpeed]);

  const handleExport = () => {
    if (!visible.length) return;
    const headers = ['observation_id', 'sensor', 'latitude', 'longitude', 'acquired_at', 'frp_mw', 'confidence_raw', 'daynight', 'department', 'municipality', 'satellite', 'source_origin', 'source', 'reference_url'];
    const csv = [headers.join(','), ...visible.map((item) => headers.map((key) => csvValue(item[key as keyof Observation])).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prometheus-ignis-observaciones.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-dvh w-full max-w-full flex-col overflow-x-hidden lg:h-dvh bg-background font-sans text-text-primary">
      <Header activeModule={activeModule} onModuleChange={setActiveModule} totalVisibleCount={visible.length} onExportCsv={handleExport} onOpenGlossary={() => setIsGlossaryOpen(true)} />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <div key={active.id} id={`panel-${active.id}`} role="tabpanel" aria-labelledby={`tab-${active.id}-desktop`} tabIndex={0} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {activeModule === 'explorer' ? (
            <section className="flex flex-1 flex-col lg:min-h-0 lg:flex-row lg:overflow-hidden">
              {isSidebarOpen && <ExplorerSidebar
                sensor={sensor}
                onSensorChange={setSensor}
                sourceMode={sourceMode}
                onSourceModeChange={(value) => { setSourceMode(value); setActiveDate(null); setSelected(null); setIsPlaying(false); }}
                region={region}
                onRegionChange={(value) => { setRegion(value); setActiveDate(null); setSelected(null); setIsPlaying(false); }}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateFromChange={(value) => { if (!value) return; setDateFrom(value); if (value > dateTo) setDateTo(value); else if (Date.parse(dateTo) - Date.parse(value) > 89 * 86_400_000) setDateTo(shiftDate(value, 89)); setActiveDate(null); setSelected(null); setIsPlaying(false); }}
                onDateToChange={(value) => { if (!value) return; setDateTo(value); if (value < dateFrom) setDateFrom(value); else if (Date.parse(value) - Date.parse(dateFrom) > 89 * 86_400_000) setDateFrom(shiftDate(value, -89)); setActiveDate(null); setSelected(null); setIsPlaying(false); }}
                department={department}
                onDepartmentChange={(value) => { setDepartment(value); setMunicipality('ALL'); }}
                municipality={municipality}
                onMunicipalityChange={setMunicipality}
                municipalitySearch={municipalitySearch}
                onMunicipalitySearchChange={setMunicipalitySearch}
                daynight={daynight}
                onDaynightChange={setDaynight}
                minimumFrp={minimumFrp}
                onMinimumFrpChange={setMinimumFrp}
                confidenceRaw={confidenceRaw}
                onConfidenceRawChange={setConfidenceRaw}
                observations={allObservations}
                visibleCount={visible.length}
                recordCount={(observationsQuery.data?.count ?? 0) + localObservations.length}
                totalMatching={totalMatching}
                provenance={provenance}
                warning={observationsQuery.data?.warning}
                degradedMode={observationsQuery.data?.degradedMode}
                sampling={observationsQuery.data?.sampling}
                isTruncated={sourceMode === 'historical' || Boolean(observationsQuery.data && observationsQuery.data.count < observationsQuery.data.total_matching)}
                categories={mapLayers}
                categoryCounts={categoryCounts}
                onToggleCategory={toggleMapLayer}
                onApplySourcePreset={applySourcePreset}
                onReset={() => { setSensor('ALL'); setActiveDate(null); setSelected(null); setIsPlaying(false); setDepartment('ALL'); setMunicipality('ALL'); setMunicipalitySearch(''); setDaynight('ALL'); setMinimumFrp(''); setConfidenceRaw('ALL'); }}
              />}

              <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background lg:min-h-0">
                <button type="button" onClick={() => setIsSidebarOpen((value) => !value)} aria-expanded={isSidebarOpen} aria-label={isSidebarOpen ? 'Cerrar panel lateral' : 'Abrir panel lateral'} title={isSidebarOpen ? 'Cerrar panel lateral' : 'Abrir panel lateral'} className="absolute left-0 top-1/2 z-30 hidden h-11 w-5 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-border bg-card text-[10px] text-text-secondary shadow-sm transition-colors hover:bg-card hover:text-text-primary lg:flex"><span aria-hidden>{isSidebarOpen ? '◀' : '▶'}</span></button>
                <div className="relative h-[max(440px,64dvh)] shrink-0 overflow-hidden bg-background lg:h-auto lg:min-h-0 lg:flex-1 lg:shrink">
                  <ObservationMap observations={visible} selected={selected} onSelect={setSelected} focusTarget={focusTarget} mapStyle={mapStyle} layers={mapLayers} />
                  {observationsQuery.isPending && <div className="absolute left-1/2 top-28 z-30 flex w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 items-center gap-2 rounded-xl shadow-2xl border border-border bg-card p-4 text-sm text-text-primary"><LoaderCircle className="h-4 w-4 animate-spin text-info" />Consultando observaciones…</div>}
                  {observationsQuery.isError && <div role="alert" className="absolute left-1/2 top-28 z-30 flex w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 items-start gap-3 rounded-xl border border-danger/40 bg-card shadow-2xl p-4 text-sm text-danger"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="font-semibold">No se pudieron cargar las observaciones</p><p className="mt-1 text-danger">{observationsQuery.error.message}</p><button type="button" className="mt-3 rounded-lg border border-danger/40 px-3 py-1.5 font-noto text-[11px] font-bold hover:bg-danger-soft" onClick={() => void observationsQuery.refetch()}>Reintentar</button></div></div>}
                  {hasData && visible.length === 0 && <div className="absolute inset-0 z-10 grid place-items-center bg-background/80 text-center backdrop-blur-[1px]"><div className="rounded-xl border border-border-strong bg-card p-5"><Flame className="mx-auto h-7 w-7 text-text-secondary" /><p className="mt-2 font-medium text-text-primary">No hay observaciones para este filtro</p><p className="mt-1 text-xs text-text-secondary">La consulta respondió correctamente con una colección vacía.</p></div></div>}
                  <MapOverlays focusId={focusTarget.id} styleId={mapStyle.id} onStyleChange={setMapStyle} onFocusChange={setFocusTarget} layers={mapLayers} onToggleLayer={toggleMapLayer} pointCount={visible.length} frpCount={visible.filter((item) => item.frp_mw !== null).length} onOpenGuide={() => setIsGlossaryOpen(true)} sourceLabel={`${observationsQuery.data?.data_provenance === 'synthetic_demo' ? 'Datos de demostración' : 'Datos reales'}${localObservations.length ? ' + CSV local' : ''}`} />
                  {selected && <aside aria-label="Observación seleccionada" className="absolute inset-x-2 bottom-2 z-30 max-h-[70%] space-y-3 overflow-y-auto rounded-2xl border border-accent/60 bg-card p-4 text-xs shadow-2xl sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-16 sm:max-h-[calc(100%-5rem)] sm:w-96">
                    <div className="flex items-center justify-between border-b border-border pb-2"><div className="flex items-center gap-2"><span className={`rounded-xl border p-2 ${selected.sensor === 'VIIRS' ? 'border-red-500/50 bg-red-500/10 text-sensor-viirs' : 'border-yellow-400/50 bg-yellow-400/10 text-sensor-modis'}`}><Flame className="h-4 w-4" /></span><div><h2 className="font-noto text-sm font-bold text-text-primary">{selected.municipality ?? 'Observación seleccionada'}</h2><span className="text-[10px] text-text-secondary">{selected.department ?? 'Sin departamento'} · {selected.sensor}</span></div></div><button type="button" onClick={() => setSelected(null)} aria-label="Limpiar selección" className="rounded-lg p-1 text-text-secondary transition-colors hover:bg-surface-hover/70 hover:text-text-primary"><X className="h-4 w-4" /></button></div>
                    <dl className="grid grid-cols-2 gap-2 font-source text-[11px]">{[['ID', selected.observation_id], ['Sensor', selected.sensor], ['Satélite', selected.satellite ?? 'No disponible'], ['Adquisición UTC', selected.acquired_at], ['FRP', selected.frp_mw === null ? 'No disponible' : `${selected.frp_mw} MW`], ['Confianza original', String(selected.confidence_raw)], ['Día/Noche', selected.daynight ?? 'No disponible'], ['Concordancia', selected.concordance ?? 'Sin clasificar'], ['Coordenadas', `${selected.latitude}, ${selected.longitude}`], ['Origen', selected.source_origin ?? selected.source]].map(([label, value]) => <div key={label} className="rounded-lg border border-border bg-surface p-2"><dt className="text-[10px] text-text-secondary">{label}</dt><dd className="mt-0.5 break-words font-semibold text-text-primary">{value}</dd></div>)}</dl>
                    <p className="flex items-start gap-1.5 text-[10px] leading-4 text-text-secondary"><MapPin className="mt-0.5 h-3 w-3 shrink-0 text-accent" />Una observación satelital no equivale necesariamente a un incendio independiente.</p>
                    {selected.reference_url && <a href={selected.reference_url} target="_blank" rel="noreferrer" className="inline-block text-[11px] font-semibold text-info underline underline-offset-2">Consultar fuente original</a>}
                  </aside>}
                </div>
                <TimelineControls dates={dates} countsByDate={countsByDate} activeDate={activeDate} isPlaying={isPlaying} speed={playbackSpeed} onSpeedChange={setPlaybackSpeed} onStep={stepDate} onTogglePlay={() => { if (!isPlaying && activeDateIndex === dates.length - 1) setActiveDate(null); setIsPlaying((playing) => !playing); }} onSelectIndex={(index) => { setIsPlaying(false); setActiveDate(dates[index] ?? null); }} />
              </div>
            </section>
          ) : activeModule === 'analytics' ? (
            hasData
              ? <AnalyticsPanel observations={visible} totalMatching={totalMatching} provenance={provenance} onExportCsv={handleExport} />
              : <div className="mx-auto w-full max-w-7xl p-6"><QueryState isLoading={observationsQuery.isPending} error={observationsQuery.error?.message} onRetry={() => void observationsQuery.refetch()} /></div>
          ) : activeModule === 'calendar' ? (
            hasData
              ? <ActivityCalendarPanel observations={allObservations} totalMatching={totalMatching} provenance={provenance} onSelectDate={(date) => { setActiveDate(date); setSensor('ALL'); setSelected(null); setIsPlaying(false); setActiveModule('explorer'); }} />
              : <div className="mx-auto w-full max-w-7xl p-6"><QueryState isLoading={observationsQuery.isPending} error={observationsQuery.error?.message} onRetry={() => void observationsQuery.refetch()} /></div>
          ) : activeModule === 'markov-heatmap' ? (
            hasData
              ? <MarkovHeatmapPanel observations={allObservations} provenance={provenance} />
              : <div className="mx-auto w-full max-w-7xl p-6"><QueryState isLoading={observationsQuery.isPending} error={observationsQuery.error?.message} onRetry={() => void observationsQuery.refetch()} /></div>
          ) : activeModule === 'predictability' ? <PredictabilityPanel />
            : activeModule === 'comparison' ? <KairosClassroom />
            : activeModule === 'project-info' ? <div className="flex flex-col"><LaboratoryPanel provenance={provenance} /><SourcesPanel sourceMode={sourceMode} provenance={provenance} loadedCount={allObservations.length} totalMatching={totalMatching} warning={observationsQuery.data?.warning} degradedMode={observationsQuery.data?.degradedMode} /></div>
              : <div className="mx-auto w-full max-w-7xl p-6"><ModulePlaceholder title={active.label} description={active.description} /></div>}
        </div>
      </main>
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
    </div>
  );
}

function csvValue(value: unknown) {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') return '';
  return `"${String(value).replaceAll('"', '""')}"`;
}

function QueryState({ isLoading, error, onRetry }: { isLoading: boolean; error?: string; onRetry: () => void }) {
  if (isLoading) return <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-5 text-sm text-text-primary"><LoaderCircle className="h-4 w-4 animate-spin text-info" />Consultando observaciones para el análisis…</div>;
  return <div role="alert" className="rounded-xl border border-danger/40 bg-danger-soft p-5 text-sm text-danger"><p className="font-semibold">No se pudo cargar el conjunto consultado</p><p className="mt-1">{error ?? 'Error desconocido'}</p><button type="button" onClick={onRetry} className="mt-3 rounded-lg border border-danger/40 px-3 py-1.5 text-xs hover:bg-danger-soft">Reintentar</button></div>;
}
