import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Clock3, Flame, LoaderCircle, MapPin, Pause, Play, RotateCcw, Satellite, SkipBack, SkipForward, X } from 'lucide-react';
import GlossaryModal from '@/components/common/GlossaryModal';
import ModulePlaceholder from '@/components/common/ModulePlaceholder';
import Header from '@/components/layout/Header';
import ObservationMap from '@/features/explorer/ObservationMap';
import { fetchObservations } from '@/services/api/observationsService';
import { useUiStore } from '@/stores/uiStore';
import type { Observation, Sensor } from '@/types/api/observations';
import { APP_MODULES } from '@/types/domain/module';

const EMPTY_OBSERVATIONS: Observation[] = [];

export default function App() {
  const activeModule = useUiStore((state) => state.activeModule);
  const setActiveModule = useUiStore((state) => state.setActiveModule);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [sensor, setSensor] = useState<Sensor | 'ALL'>('ALL');
  const [selected, setSelected] = useState<Observation | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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
            <section className="flex min-h-[calc(100vh-8rem)] flex-1 flex-col overflow-hidden lg:flex-row">
              <aside className="w-full shrink-0 space-y-4 border-b border-slate-800 bg-[#08111e] p-4 lg:max-h-[calc(100vh-8rem)] lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">Explorador geoespacial</p>
                  <h1 className="mt-1 text-xl font-semibold text-white">Mapa Territorial</h1>
                  <p className="mt-1 text-xs leading-5 text-slate-400">Explora observaciones MODIS y VIIRS entregadas por el Backend-API.</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  <h2 className="text-[11px] font-mono font-semibold uppercase tracking-wide text-slate-300">Sensor</h2>
                  <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-slate-900 p-1" aria-label="Filtrar por sensor">
                    {(['ALL', 'VIIRS', 'MODIS'] as const).map((item) => (
                      <button key={item} type="button" onClick={() => setSensor(item)} aria-pressed={sensor === item} className={`rounded-md px-2 py-2 text-[11px] font-semibold transition ${sensor === item ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>{item === 'ALL' ? 'Todos' : item}</button>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] leading-4 text-slate-500">El filtro se aplica al conjunto recibido; la consulta está limitada a 1.000 observaciones.</p>
                </div>
                {observationsQuery.isSuccess && <div className={`rounded-xl border p-3 ${observationsQuery.data.data_provenance === 'synthetic_demo' ? 'border-amber-800/60 bg-amber-950/20' : 'border-emerald-800/50 bg-emerald-950/20'}`}>
                  <div className={`flex items-center gap-2 text-[11px] font-semibold ${observationsQuery.data.data_provenance === 'synthetic_demo' ? 'text-amber-300' : 'text-emerald-300'}`}><Satellite className="h-3.5 w-3.5" />{observationsQuery.data.data_provenance === 'synthetic_demo' ? 'Demostración sintética' : 'Fuente conectada'}</div>
                  <p className="mt-2 break-words text-[10px] text-slate-300">{observationsQuery.data.data_provenance}</p>
                  {observationsQuery.data.data_provenance === 'synthetic_demo' && <p className="mt-2 text-[10px] leading-4 text-amber-200/80">Estos datos son demostrativos; no corresponden a observaciones reales de NASA.</p>}
                  <p className="mt-1 text-[10px] text-slate-500">{observationsQuery.data.count} recibidas · {observationsQuery.data.total_matching} coincidentes</p>
                  {observationsQuery.data.count < observationsQuery.data.total_matching && <p className="mt-2 text-[10px] text-amber-300">Conjunto truncado por el límite de 1.000</p>}
                </div>}
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  <h2 className="text-[11px] font-mono font-semibold uppercase tracking-wide text-slate-300">Leyenda</h2>
                  <div className="mt-3 space-y-2 text-xs text-slate-300"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-red-500" />VIIRS</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-yellow-400" />MODIS</span></div>
                </div>
                <button type="button" onClick={() => { setSensor('ALL'); setActiveDate(null); setSelected(null); }} className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white"><RotateCcw className="h-3.5 w-3.5" />Restablecer filtros</button>
              </aside>

              <div className="flex min-h-[calc(100vh-8rem)] min-w-0 flex-1 flex-col overflow-hidden p-3 sm:p-4">
                {observationsQuery.isPending && <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-800 bg-[#08111e] p-4 text-sm text-slate-300"><LoaderCircle className="h-4 w-4 animate-spin text-cyan-300" />Consultando observaciones…</div>}
                {observationsQuery.isError && <div role="alert" className="mb-3 flex items-start gap-3 rounded-xl border border-red-900/70 bg-red-950/30 p-4 text-sm text-red-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="font-semibold">No se pudieron cargar las observaciones</p><p className="mt-1 text-red-200/80">{observationsQuery.error.message}</p><button type="button" className="mt-3 rounded-lg border border-red-800 px-3 py-1.5 text-xs hover:bg-red-900/40" onClick={() => void observationsQuery.refetch()}>Reintentar</button></div></div>}
                <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-[#08111e]">
                  {observationsQuery.isSuccess && <ObservationMap observations={visible} selected={selected} onSelect={setSelected} />}
                  {observationsQuery.isSuccess && visible.length === 0 && <div className="absolute inset-0 z-10 grid place-items-center bg-[#08111e]/80 text-center"><div><Flame className="mx-auto h-8 w-8 text-slate-500" /><p className="mt-3 font-medium">No hay observaciones para este filtro</p><p className="mt-1 text-sm text-slate-400">La consulta respondió correctamente con una colección vacía.</p></div></div>}
                  {observationsQuery.isSuccess && <div className="absolute left-4 top-4 z-10 rounded-lg border border-slate-700/80 bg-[#060b13]/90 px-3 py-2 text-[11px] text-slate-200 shadow-lg backdrop-blur"><span className="font-mono text-amber-300">{visible.length.toLocaleString()}</span> observaciones visibles</div>}
                </div>
              <div className="mt-3 rounded-xl border border-slate-800 bg-[#070e1a]/95 p-3 text-xs">
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
          ) : <div className="mx-auto w-full max-w-7xl p-6"><ModulePlaceholder title={active.label} description={active.description} /></div>}
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
