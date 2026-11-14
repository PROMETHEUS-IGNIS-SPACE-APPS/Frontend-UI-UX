import { useMemo, useState } from 'react';
import { AlertTriangle, Compass, MapPin, Radar, Thermometer, Wind, X } from 'lucide-react';
import ObservationMap from '@/features/explorer/ObservationMap';
import { MAP_STYLE_PRESETS, type MapFocusPreset } from '@/features/explorer/mapPresets';
import { ModuleHeader, ModulePage } from '@/components/common/ModuleLayout';
import type { Observation } from '@/types/api/observations';
import { ANTIOQUIA_VIEWPORT, SUBREGIONS, computeSubregionMatrix, resolveSubregion, type SubregionId } from '@/utils/subregions';

const DARK_STYLE = MAP_STYLE_PRESETS.find((style) => style.id === 'dark') ?? MAP_STYLE_PRESETS[0];

/** Escala del ejemplo; se usará cuando el AI-Pipeline publique probabilidades. */
const PROBABILITY_SCALE = [
  { color: 'bg-[#2563eb]', label: '<15%' },
  { color: 'bg-[#10b981]', label: '15–30%' },
  { color: 'bg-[#eab308]', label: '30–50%' },
  { color: 'bg-[#f97316]', label: '50–70%' },
  { color: 'bg-[#dc2626]', label: '>70%' },
];

interface MarkovHeatmapPanelProps {
  observations: Observation[];
  provenance: string;
}

export default function MarkovHeatmapPanel({ observations, provenance }: MarkovHeatmapPanelProps) {
  const [subregion, setSubregion] = useState<'all' | SubregionId>('all');
  const [selected, setSelected] = useState<Observation | null>(null);
  const matrix = useMemo(() => computeSubregionMatrix(observations), [observations]);

  const antioquiaObservations = useMemo(() => observations.filter((item) => {
    const id = resolveSubregion(item);
    return id !== null && (subregion === 'all' || id === subregion);
  }), [observations, subregion]);

  const focus: MapFocusPreset = useMemo(() => {
    const config = SUBREGIONS.find((item) => item.id === subregion);
    return config
      ? { id: config.id, label: config.label, center: config.center, zoom: config.zoom }
      : { id: 'antioquia-all', label: 'Antioquia (Todas)', center: ANTIOQUIA_VIEWPORT.center, zoom: ANTIOQUIA_VIEWPORT.zoom };
  }, [subregion]);

  const maxTotal = Math.max(1, ...SUBREGIONS.map((sub) => matrix.totals[sub.id]));
  const ranked = [...SUBREGIONS].sort((a, b) => matrix.totals[b.id] - matrix.totals[a.id]);
  const highFrpCount = antioquiaObservations.filter((item) => item.frp_mw !== null && item.frp_mw >= 30).length;

  return <ModulePage>
    <ModuleHeader
      badge={{ label: 'Sin modelo publicado', tone: 'warning' }}
      meta={`${matrix.classifiedCount.toLocaleString()} observaciones en subregiones · ${provenance}`}
      icon={Radar}
      title="Mapa de Calor Markov — Predictibilidad Espacial"
      description="Probabilidad de actividad térmica por celda y subregión de Antioquia cuando el AI-Pipeline publique un modelo evaluado. No equivale a predicción de ignición."
      actions={<>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1" role="group" aria-label="Horizonte de predicción">
          {['24h', '48h', '72h'].map((label) => <button key={label} type="button" disabled className="cursor-not-allowed whitespace-nowrap rounded-lg px-3 py-1 font-source text-xs font-bold text-text-secondary opacity-60">{label}</button>)}
        </div>
        <button type="button" disabled className="inline-flex cursor-not-allowed items-center gap-1.5 whitespace-nowrap rounded-xl border border-border px-3 py-1.5 font-noto text-xs font-bold text-text-secondary opacity-60"><Wind className="h-3.5 w-3.5 shrink-0" />Acoplamiento climático</button>
      </>}
    />

    <div className="space-y-1 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="space-y-1">
          <h2 className="font-noto text-sm font-bold text-warning">Capa predictiva pendiente</h2>
          <p className="text-xs leading-relaxed text-text-primary">Esta vista no calcula probabilidades en el navegador. Mientras no exista un modelo publicado, el mapa muestra solo las observaciones satelitales cargadas por subregión; los controles de horizonte y clima se habilitarán con el modelo.</p>
        </div>
      </div>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Enfocar subregión">
        <span className="flex items-center gap-1 px-1.5 font-noto text-[11px] font-semibold text-text-secondary"><Compass className="h-3.5 w-3.5 shrink-0 text-accent" />Subregión:</span>
        <button type="button" aria-pressed={subregion === 'all'} onClick={() => setSubregion('all')} className={`whitespace-nowrap rounded-lg px-3 py-1 font-noto text-xs font-semibold transition-colors ${subregion === 'all' ? 'bg-accent-solid text-accent-fg' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}>Antioquia (Todas)</button>
        {SUBREGIONS.map((sub) => <button key={sub.id} type="button" aria-pressed={subregion === sub.id} onClick={() => setSubregion(sub.id)} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 font-noto text-xs transition-colors ${subregion === sub.id ? 'bg-surface-hover font-bold text-text-primary' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}><span className={`h-2 w-2 shrink-0 rounded-full ${sub.dotClass}`} />{sub.label}</button>)}
      </div>
      <div className="flex items-center gap-3 px-1.5 font-source text-[11px] tabular-nums text-text-secondary">
        <span>Observaciones: <strong className="text-predictive">{antioquiaObservations.length.toLocaleString()}</strong></span>
        <span>FRP ≥ 30 MW: <strong className="text-info">{highFrpCount.toLocaleString()}</strong></span>
      </div>
    </div>

    <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
      <div className="relative flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:col-span-8 lg:min-h-[580px]">
        <div className="min-h-[460px] w-full flex-1 lg:min-h-[580px]">
          <ObservationMap observations={antioquiaObservations} selected={selected} onSelect={setSelected} focusTarget={focus} mapStyle={DARK_STYLE} showViirs showModis showHeatmap={false} />
        </div>

        <div className="pointer-events-none absolute left-3 top-3 z-10">
          <div className="pointer-events-auto max-w-[270px] space-y-0.5 rounded-xl border border-border-strong bg-card px-3 py-2 shadow-lg">
            <div className="flex items-center gap-1.5 font-noto text-xs font-bold text-predictive"><Thermometer className="h-3.5 w-3.5 shrink-0" />Capa: observaciones satelitales</div>
            <p className="font-source text-[10px] leading-tight text-text-secondary">{focus.label} · la capa de probabilidad Markov aún no está publicada.</p>
          </div>
        </div>

        <div className="absolute bottom-4 left-3 z-10 max-w-[280px] space-y-1.5 rounded-xl border border-border-strong bg-card px-3 py-2.5 font-source text-[10px] shadow-lg">
          <div className="flex items-center justify-between gap-3 font-noto font-bold text-text-primary"><span>Probabilidad predictiva P(S1 ∪ S2)</span><span className="font-normal text-text-secondary">Pendiente</span></div>
          <div className="grid grid-cols-5 gap-1 pt-0.5 opacity-50">{PROBABILITY_SCALE.map((step) => <div key={step.label} className="space-y-1 text-center"><div className={`h-2 rounded-xs ${step.color}`} /><span className="block text-[10px] text-text-secondary">{step.label}</span></div>)}</div>
        </div>

        {selected && <div className="absolute right-12 top-3 z-20 w-72 space-y-2.5 rounded-2xl border border-border-strong bg-card p-3.5 text-xs shadow-2xl sm:w-80">
          <div className="flex items-start justify-between gap-2 border-b border-border pb-2">
            <div className="min-w-0"><h3 className="truncate font-noto text-sm font-bold text-text-primary">{selected.municipality ?? 'Observación seleccionada'}</h3><p className="truncate font-source text-[10px] font-semibold text-predictive">{SUBREGIONS.find((sub) => sub.id === resolveSubregion(selected))?.label ?? 'Sin subregión'} · {selected.sensor}</p></div>
            <button type="button" onClick={() => setSelected(null)} aria-label="Cerrar inspector" className="rounded-lg p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary"><X className="h-3.5 w-3.5" /></button>
          </div>
          <dl className="grid grid-cols-2 gap-2 font-source text-[11px] tabular-nums">
            <div className="rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">Adquisición UTC</dt><dd className="font-bold text-text-primary">{selected.acquired_at.slice(0, 16).replace('T', ' ')}</dd></div>
            <div className="rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">FRP</dt><dd className="font-bold text-accent">{selected.frp_mw === null ? 'No disponible' : `${selected.frp_mw} MW`}</dd></div>
            <div className="rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">Confianza original</dt><dd className="font-bold text-text-primary">{String(selected.confidence_raw)}</dd></div>
            <div className="rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">Probabilidad 24h</dt><dd className="font-bold text-text-secondary">Pendiente</dd></div>
          </dl>
        </div>}
      </div>

      <div className="flex flex-col gap-4 lg:col-span-4">
        <div className="flex-1 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <h2 className="flex items-center gap-1.5 font-noto text-sm font-bold text-text-primary"><MapPin className="h-4 w-4 shrink-0 text-accent" />Subregiones de Antioquia</h2>
            <span className="font-source text-[10px] text-text-secondary">Observaciones cargadas</span>
          </div>
          <div className="space-y-2">
            {ranked.map((sub) => {
              const total = matrix.totals[sub.id];
              const avg = matrix.overallAvgFrp[sub.id];
              return <button key={sub.id} type="button" onClick={() => setSubregion(sub.id)} aria-pressed={subregion === sub.id} className={`w-full space-y-1.5 rounded-xl border p-2.5 text-left transition-colors ${subregion === sub.id ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:bg-surface-hover'}`}>
                <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 truncate font-noto text-xs font-bold text-text-primary"><span className={`h-2 w-2 shrink-0 rounded-full ${sub.dotClass}`} /><span className="truncate">{sub.label}</span></span><span className="shrink-0 font-source text-xs font-black tabular-nums text-predictive">{total.toLocaleString()}</span></div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border"><div className="h-full rounded-full" style={{ width: `${(total / maxTotal) * 100}%`, backgroundColor: sub.color }} /></div>
                <div className="flex items-center justify-between font-source text-[10px] tabular-nums text-text-secondary"><span>FRP promedio: {avg === null ? 'No disponible' : `${avg.toFixed(1)} MW`}</span><span>P(24h): pendiente</span></div>
              </button>;
            })}
          </div>
        </div>
        <p className="font-source text-[11px] leading-relaxed text-text-secondary">La subregión se deriva del municipio de referencia asignado por el Backend-API. Las celdas críticas y las probabilidades por horizonte aparecerán aquí cuando el modelo esté publicado.</p>
      </div>
    </div>
  </ModulePage>;
}
