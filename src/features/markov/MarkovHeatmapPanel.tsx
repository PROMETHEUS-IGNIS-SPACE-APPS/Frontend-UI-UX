import { useMemo, useState } from 'react';
import { AlertTriangle, Compass, Info, MapPin, Thermometer, Wind, X } from 'lucide-react';
import ObservationMap from '@/features/explorer/ObservationMap';
import { MAP_STYLE_PRESETS, type MapFocusPreset } from '@/features/explorer/mapPresets';
import { useUiStore } from '@/stores/uiStore';
import type { Observation } from '@/types/api/observations';
import { ANTIOQUIA_VIEWPORT, SUBREGIONS, computeSubregionMatrix, resolveSubregion, type SubregionId } from '@/utils/subregions';

const DARK_STYLE = MAP_STYLE_PRESETS.find((style) => style.id === 'dark') ?? MAP_STYLE_PRESETS[0];
const LIGHT_STYLE = MAP_STYLE_PRESETS.find((style) => style.id === 'positron') ?? MAP_STYLE_PRESETS[0];

/** Escala del ejemplo; se usará cuando el AI-Pipeline publique probabilidades. */
const PROBABILITY_SCALE = [
  { color: 'bg-[#fde047]', label: '<15%' },
  { color: 'bg-[#facc15]', label: '15–30%' },
  { color: 'bg-[#f97316]', label: '30–50%' },
  { color: 'bg-[#ef4444]', label: '50–70%' },
  { color: 'bg-[#b91c1c]', label: '>70%' },
];

const CARD = 'rounded-2xl border border-border bg-card shadow-sm';

interface MarkovHeatmapPanelProps {
  observations: Observation[];
  provenance: string;
}

interface MunicipalityRank { name: string; subregion: string; count: number; center: [number, number] }

/**
 * Mapa de Calor Markov con la distribución de la carpeta `ejemplo`. No calcula
 * probabilidades en el navegador: mientras el AI-Pipeline no publique un modelo
 * evaluado, muestra observaciones reales por subregión y deja la escala P(S1 ∪ S2)
 * como “Pendiente”.
 */
export default function MarkovHeatmapPanel({ observations, provenance }: MarkovHeatmapPanelProps) {
  const [subregion, setSubregion] = useState<'all' | SubregionId>('all');
  const [selected, setSelected] = useState<Observation | null>(null);
  const [municipalityFocus, setMunicipalityFocus] = useState<MapFocusPreset | null>(null);
  const theme = useUiStore((state) => state.theme);
  const matrix = useMemo(() => computeSubregionMatrix(observations), [observations]);

  const antioquiaObservations = useMemo(() => observations.filter((item) => {
    const id = resolveSubregion(item);
    return id !== null && (subregion === 'all' || id === subregion);
  }), [observations, subregion]);

  const subregionFocus: MapFocusPreset = useMemo(() => {
    const config = SUBREGIONS.find((item) => item.id === subregion);
    return config
      ? { id: config.id, label: config.label, center: config.center, zoom: config.zoom }
      : { id: 'antioquia-all', label: 'Antioquia (Todas)', center: ANTIOQUIA_VIEWPORT.center, zoom: ANTIOQUIA_VIEWPORT.zoom };
  }, [subregion]);
  const focus = municipalityFocus ?? subregionFocus;

  const topMunicipalities: MunicipalityRank[] = useMemo(() => {
    const groups = new Map<string, { count: number; lat: number; lon: number; subregion: string }>();
    for (const item of antioquiaObservations) {
      if (!item.municipality) continue;
      const group = groups.get(item.municipality) ?? { count: 0, lat: 0, lon: 0, subregion: SUBREGIONS.find((sub) => sub.id === resolveSubregion(item))?.label ?? '' };
      group.count += 1; group.lat += item.latitude; group.lon += item.longitude;
      groups.set(item.municipality, group);
    }
    return [...groups.entries()]
      .map(([name, group]) => ({ name, subregion: group.subregion, count: group.count, center: [group.lon / group.count, group.lat / group.count] as [number, number] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [antioquiaObservations]);

  const chooseSubregion = (id: 'all' | SubregionId) => { setSubregion(id); setMunicipalityFocus(null); setSelected(null); };
  const maxTotal = Math.max(1, ...SUBREGIONS.map((sub) => matrix.totals[sub.id]));
  const ranked = [...SUBREGIONS].sort((a, b) => matrix.totals[b.id] - matrix.totals[a.id]);
  const highFrpCount = antioquiaObservations.filter((item) => item.frp_mw !== null && item.frp_mw >= 30).length;

  return <div className="mx-auto w-full max-w-7xl space-y-5 overflow-x-hidden p-4 text-text-primary sm:p-6 lg:p-8">
    <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 lg:flex-row lg:items-center">
      <div className="min-w-0">
        <span className="mb-1.5 inline-block rounded border border-warning/40 bg-warning-soft px-2 py-0.5 font-source text-[11px] font-bold uppercase text-warning">Sin modelo publicado</span>
        <h1 className="font-noto text-xl font-bold tracking-tight sm:text-2xl">Mapa de Calor Markov — Predictibilidad Espacial</h1>
        <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">Visualización cartográfica de probabilidades P(S1 ∪ S2) por subregiones de Antioquia cuando el AI-Pipeline publique un modelo evaluado. No modifica las capas del Mapa principal.</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1" role="group" aria-label="Horizonte de predicción">
          {['24h', '48h', '72h'].map((label) => <button key={label} type="button" disabled title="Pendiente de modelo publicado" className="cursor-not-allowed whitespace-nowrap rounded-lg px-3 py-1 font-source text-xs font-bold text-text-secondary opacity-60">{label}</button>)}
        </div>
        <button type="button" disabled title="Pendiente de modelo publicado" className="inline-flex cursor-not-allowed items-center gap-1.5 whitespace-nowrap rounded-xl border border-border bg-card px-3 py-1.5 font-noto text-xs font-bold text-text-secondary opacity-60"><Wind className="h-3.5 w-3.5 shrink-0" aria-hidden />+ Clima</button>
      </div>
    </div>

    <div className={`flex flex-wrap items-center justify-between gap-2 p-3 ${CARD}`}>
      <div className="-mx-1 flex max-w-full items-center gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] sm:flex-wrap" role="group" aria-label="Enfocar subregión">
        <span className="flex shrink-0 items-center gap-1 px-1.5 font-noto text-[11px] font-semibold text-text-secondary"><Compass className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />Subregión:</span>
        <button type="button" aria-pressed={subregion === 'all'} onClick={() => chooseSubregion('all')} className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1 font-noto text-xs font-semibold transition-colors ${subregion === 'all' ? 'bg-accent-solid font-bold text-accent-fg' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}>Todas (Antioquia)</button>
        {SUBREGIONS.map((sub) => <button key={sub.id} type="button" aria-pressed={subregion === sub.id} onClick={() => chooseSubregion(sub.id)} className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 font-noto text-xs transition-colors ${subregion === sub.id ? 'bg-surface-hover font-bold text-text-primary' : 'font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}><span className={`h-2 w-2 shrink-0 rounded-full ${sub.dotClass}`} />{sub.label}</button>)}
      </div>
      <div className="flex items-center gap-3 px-1.5 font-source text-[11px] tabular-nums text-text-secondary">
        <span>Observaciones: <strong className="text-predictive">{antioquiaObservations.length.toLocaleString()}</strong></span>
        <span>FRP ≥ 30 MW: <strong className="text-info">{highFrpCount.toLocaleString()}</strong></span>
      </div>
    </div>

    <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
      <div className={`relative flex min-h-[420px] flex-col overflow-hidden lg:col-span-8 lg:min-h-[580px] ${CARD}`}>
        <div className="relative h-[max(420px,60dvh)] w-full flex-1 lg:h-auto lg:min-h-[580px]">
          <div className="absolute inset-0"><ObservationMap observations={antioquiaObservations} selected={selected} onSelect={setSelected} focusTarget={focus} mapStyle={theme === 'light' ? LIGHT_STYLE : DARK_STYLE} layers={{ heatmap: false, colombiaBoundary: false, antioquiaSubregions: true }} /></div>
        </div>

        <div className="pointer-events-none absolute left-3 top-3 z-10">
          <div className="pointer-events-auto max-w-[270px] space-y-0.5 rounded-xl border border-border-strong bg-card px-3 py-2 shadow-lg">
            <div className="flex items-center gap-1.5 font-noto text-xs font-bold text-predictive"><Thermometer className="h-3.5 w-3.5 shrink-0" aria-hidden />Capa: observaciones satelitales</div>
            <p className="font-source text-[10px] leading-tight text-text-secondary">{focus.label} · toca un punto para ver su ficha. La capa Markov aún no está publicada.</p>
          </div>
        </div>

        <div className="absolute bottom-4 left-3 z-10 max-w-[calc(100%-1.5rem)] space-y-1.5 rounded-xl border border-border-strong bg-card px-3 py-2.5 font-source text-[10px] shadow-lg sm:max-w-[280px]">
          <div className="flex items-center justify-between gap-3 font-noto font-bold text-text-primary"><span>Probabilidad predictiva P(S1 ∪ S2)</span><span className="font-normal text-text-secondary">Pendiente</span></div>
          <div className="grid grid-cols-5 gap-1 pt-0.5 opacity-50">{PROBABILITY_SCALE.map((step) => <div key={step.label} className="space-y-1 text-center"><div className={`h-2 rounded-xs ${step.color}`} /><span className="block text-[9px] text-text-secondary">{step.label}</span></div>)}</div>
        </div>

        {selected && <div className="absolute inset-x-3 top-3 z-20 space-y-2.5 rounded-2xl border border-border-strong bg-card p-3.5 text-xs shadow-2xl sm:inset-x-auto sm:right-12 sm:w-80">
          <div className="flex items-start justify-between gap-2 border-b border-border pb-2">
            <div className="min-w-0"><h3 className="truncate font-noto text-sm font-bold text-text-primary">{selected.municipality ?? 'Observación seleccionada'}</h3><p className="truncate font-source text-[10px] font-semibold text-predictive">{SUBREGIONS.find((sub) => sub.id === resolveSubregion(selected))?.label ?? 'Sin subregión'} · {selected.sensor}</p></div>
            <button type="button" onClick={() => setSelected(null)} aria-label="Cerrar inspector" className="rounded-lg p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary"><X className="h-3.5 w-3.5" /></button>
          </div>
          <dl className="grid grid-cols-2 gap-2 font-source text-[11px] tabular-nums">
            <div className="rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">Adquisición UTC</dt><dd className="font-bold text-text-primary">{selected.acquired_at.slice(0, 16).replace('T', ' ')}</dd></div>
            <div className="rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">FRP</dt><dd className="font-bold text-accent">{selected.frp_mw === null ? 'No disponible' : `${selected.frp_mw} MW`}</dd></div>
            <div className="rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">Confianza original</dt><dd className="font-bold text-text-primary">{String(selected.confidence_raw)}</dd></div>
            <div className="rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">P(24h / 48h / 72h)</dt><dd className="font-bold text-text-secondary">Pendiente</dd></div>
          </dl>
        </div>}
      </div>

      <div className="flex flex-col gap-4 lg:col-span-4">
        <div className={`flex-1 space-y-3 p-4 ${CARD}`}>
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <h2 className="flex items-center gap-1.5 font-noto text-sm font-bold text-text-primary"><MapPin className="h-4 w-4 shrink-0 text-accent" aria-hidden />Subregiones de Antioquia</h2>
            <span className="font-source text-[10px] text-text-secondary">Observaciones</span>
          </div>
          <div className="space-y-1">
            {ranked.map((sub) => {
              const total = matrix.totals[sub.id];
              const avg = matrix.overallAvgFrp[sub.id];
              const active = subregion === sub.id;
              return <button key={sub.id} type="button" onClick={() => chooseSubregion(active ? 'all' : sub.id)} aria-pressed={active} className={`w-full space-y-1.5 rounded-xl px-1.5 py-2 text-left transition-opacity ${active ? 'opacity-100' : subregion !== 'all' ? 'opacity-60 hover:opacity-100' : 'hover:opacity-85'}`}>
                <div className="flex items-center justify-between gap-2"><span className={`flex items-center gap-1.5 truncate font-noto text-xs font-bold ${active ? 'text-accent' : 'text-text-primary'}`}><span className={`h-2 w-2 shrink-0 rounded-full ${sub.dotClass}`} /><span className="truncate">{sub.label}</span></span><span className="shrink-0 font-source text-xs font-black tabular-nums text-predictive">{total.toLocaleString()}</span></div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border"><div className="h-full rounded-full transition-all duration-300" style={{ width: `${total ? Math.max(4, (total / maxTotal) * 100) : 0}%`, backgroundColor: sub.color }} /></div>
                <div className="flex items-center justify-between font-source text-[10px] tabular-nums text-text-secondary"><span>FRP prom.: {avg === null ? 'No disponible' : `${avg.toFixed(1)} MW`}</span><span>P(24h): pendiente</span></div>
              </button>;
            })}
          </div>
        </div>

        <div className={`space-y-2.5 p-4 ${CARD}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-noto text-xs font-bold text-text-primary">Municipios con más observaciones</h3>
            <span className="font-source text-[10px] text-text-secondary">Top {topMunicipalities.length}</span>
          </div>
          {topMunicipalities.length === 0
            ? <p className="py-2 text-[11px] text-text-secondary">Sin observaciones con municipio en esta subregión.</p>
            : <div className="space-y-1.5">{topMunicipalities.map((item) => <button key={item.name} type="button" onClick={() => setMunicipalityFocus({ id: `mun-${item.name}`, label: item.name, center: item.center, zoom: 10.5 })} className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 font-source text-[11px] transition-colors ${municipalityFocus?.label === item.name ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:bg-surface-hover'}`}>
                <span className="truncate text-left"><strong className="text-text-primary">{item.name}</strong><span className="ml-1.5 text-[10px] text-text-secondary">({item.subregion})</span></span>
                <span className="shrink-0 font-bold tabular-nums text-predictive">{item.count.toLocaleString()} obs.</span>
              </button>)}</div>}
          <p className="text-[10px] leading-tight text-text-secondary">Las “celdas prioritarias” por probabilidad aparecerán cuando el modelo esté publicado.</p>
        </div>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded border border-success/40 bg-success-soft px-2.5 py-0.5 font-source text-[11px] font-bold uppercase text-success">Datos reales</span>
      <span className="font-source text-xs tabular-nums text-text-secondary">{matrix.classifiedCount.toLocaleString()} observaciones en subregiones · {provenance}</span>
    </div>

    <div className="flex items-start gap-2.5 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3 text-xs">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
      <div><p className="font-noto font-bold text-warning">Capa predictiva pendiente</p><p className="mt-0.5 leading-relaxed text-text-primary">Esta vista no calcula probabilidades en el navegador. El horizonte (24/48/72 h) y el acoplamiento climático se habilitarán cuando el AI-Pipeline publique un modelo con método, horizonte y validación.</p></div>
    </div>

    <div className="flex items-start gap-2 pt-1 text-[11px] text-text-secondary">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden />
      <p className="leading-relaxed">La subregión se deriva del municipio de referencia asignado por el Backend-API (aproximado); Oriente y otras zonas sin municipio de referencia quedan fuera de estas seis agrupaciones. Una observación satelital no representa ignición confirmada ni superficie quemada.</p>
    </div>
  </div>;
}
