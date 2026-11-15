import { useState, type ReactNode } from 'react';
import { Activity, ChevronDown, ChevronUp, Compass, Flame, Globe, HelpCircle, Layers, Map as MapIcon, Moon, Mountain, Sparkles, Sun } from 'lucide-react';
import { HIGH_INTENSITY_FRP_MW, MAP_FOCUS_PRESETS, MAP_STYLE_PRESETS, PROBABILITY_SCALE, type MapFocusPreset, type MapLayerState, type MapStylePreset } from './mapPresets';

interface MapOverlaysProps {
  focusId: string;
  styleId: MapStylePreset['id'];
  onStyleChange: (style: MapStylePreset) => void;
  onFocusChange: (preset: MapFocusPreset) => void;
  layers: MapLayerState;
  onToggleLayer: (key: keyof MapLayerState) => void;
  pointCount: number;
  frpCount: number;
  /** Abre la guía/glosario; si falta, no se muestra el botón “Guía”. */
  onOpenGuide?: () => void;
  sourceLabel?: string;
  /** Horizonte de la capa Markov: 0 = 24 h, 1 = 48 h, 2 = 72 h. */
  markovHorizon?: 0 | 1 | 2;
  onMarkovHorizonChange?: (horizon: 0 | 1 | 2) => void;
  /** Aviso cuando la estimación no se puede calcular (p. ej. pocos días). */
  markovNote?: string | null;
}

const PANEL = 'border border-border-strong bg-card shadow-2xl';
const STYLE_ICONS: Record<MapStylePreset['id'], typeof MapIcon> = { liberty: MapIcon, satellite: Globe, topographic: Mountain, dark: Moon, positron: Sun };

export default function MapOverlays({ focusId, styleId, onStyleChange, onFocusChange, layers, onToggleLayer, pointCount, frpCount, onOpenGuide, sourceLabel, markovHorizon = 0, onMarkovHorizonChange, markovNote }: MapOverlaysProps) {
  // En teléfonos los paneles empiezan plegados para dejar ver el mapa.
  const [layersOpen, setLayersOpen] = useState(() => typeof window === 'undefined' || typeof window.matchMedia !== 'function' || window.matchMedia('(min-width: 768px)').matches);
  const [baseOpen, setBaseOpen] = useState(false);
  const activeStyle = MAP_STYLE_PRESETS.find((style) => style.id === styleId) ?? MAP_STYLE_PRESETS[0];

  return <>
    <div className="pointer-events-none absolute left-2 right-12 top-2 z-20 flex flex-col gap-2 sm:left-3 sm:right-14 sm:top-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className={`pointer-events-auto flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-xl p-1.5 [scrollbar-width:none] sm:flex-wrap ${PANEL}`}>
          <span className="flex items-center gap-1 px-1.5 font-noto text-[11px] font-bold text-accent"><Compass className="h-3.5 w-3.5" aria-hidden /><span className="hidden sm:inline">Zona:</span></span>
          {MAP_FOCUS_PRESETS.map((preset) => <button key={preset.id} type="button" aria-pressed={focusId === preset.id} onClick={() => onFocusChange(preset)} className={`shrink-0 whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors sm:text-xs ${focusId === preset.id ? 'bg-accent-solid text-accent-fg' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}>{preset.label}</button>)}
        </div>
        <div className="pointer-events-auto flex flex-wrap items-center gap-2.5">
          {sourceLabel && <span className="hidden rounded-lg bg-card px-2 py-1 font-source text-[11px] font-bold text-success shadow-sm md:inline">● {sourceLabel} · {pointCount.toLocaleString()} pts</span>}
          {onOpenGuide && <button type="button" onClick={onOpenGuide} className="flex items-center gap-1 rounded-lg bg-card px-2 py-1.5 text-xs font-semibold text-info shadow-sm hover:underline" aria-label="Abrir guía y glosario"><HelpCircle className="h-3.5 w-3.5" aria-hidden /><span className="hidden sm:inline">Guía</span></button>}
        </div>
      </div>

      <div className={`pointer-events-auto max-w-[260px] self-start overflow-hidden rounded-2xl ${PANEL}`}>
        <button type="button" aria-expanded={baseOpen} onClick={() => setBaseOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-xs font-bold text-text-primary transition-colors hover:bg-surface-hover sm:py-2">
          <span className="flex items-center gap-2"><MapIcon className="h-4 w-4 text-accent" aria-hidden /><span>Base: <strong className="uppercase text-accent">{activeStyle.label}</strong></span></span>
          {baseOpen ? <ChevronUp className="h-3.5 w-3.5 text-text-secondary" /> : <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />}
        </button>
        {baseOpen && <div className="space-y-3 border-t border-border p-3 text-xs">
          <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Estilo del mapa base">
            {MAP_STYLE_PRESETS.map((style) => {
              const Icon = STYLE_ICONS[style.id];
              const active = style.id === styleId;
              return <button key={style.id} type="button" aria-pressed={active} onClick={() => onStyleChange(style)} className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${active ? 'border-accent bg-accent-soft text-accent' : 'border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}><Icon className="h-3.5 w-3.5" aria-hidden />{style.label}</button>;
            })}
          </div>
          <div className="space-y-1.5 border-t border-border pt-2">
            <Toggle label="Límite de Colombia" checked={layers.colombiaBoundary} onChange={() => onToggleLayer('colombiaBoundary')} />
            <Toggle label="Subregiones de Antioquia" checked={layers.antioquiaSubregions} onChange={() => onToggleLayer('antioquiaSubregions')} />
            <p className="text-[10px] leading-tight text-text-secondary">Contornos esquemáticos de referencia visual; no son límites oficiales.</p>
          </div>
        </div>}
      </div>
    </div>

    <section className={`absolute bottom-3 left-2 z-20 w-[min(15rem,calc(100%-1rem))] space-y-2 rounded-2xl p-2.5 text-xs sm:bottom-6 sm:left-3 ${PANEL}`}>
      <button type="button" aria-expanded={layersOpen} onClick={() => setLayersOpen((value) => !value)} className={`flex w-full items-center justify-between font-noto text-[11px] font-bold text-text-primary ${layersOpen ? 'border-b border-border pb-1' : ''}`}>
        <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-accent" aria-hidden />Capas Cartográficas</span>
        {layersOpen ? <ChevronUp className="h-3.5 w-3.5 text-text-secondary" /> : <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />}
      </button>
      {layersOpen && <div className="space-y-2 pt-0.5">
        <Toggle icon={<Flame className="h-3.5 w-3.5 text-accent" />} label="Marcadores Térmicos" count={pointCount} checked={layers.points} onChange={() => onToggleLayer('points')} />
        <Toggle icon={<Activity className="h-3.5 w-3.5 text-danger" />} label="Mapa Calor Observado" count={frpCount} checked={layers.heatmap} onChange={() => onToggleLayer('heatmap')} />
        {layers.heatmap && <p className="text-[10px] leading-tight text-text-secondary">Ponderado por FRP informada; las observaciones sin FRP no participan.</p>}
        <div className="space-y-1.5 border-t border-border pt-1.5">
          <label className="flex cursor-pointer items-center justify-between gap-2 font-semibold text-predictive">
            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" aria-hidden />Capa Predictiva Markov</span>
            <input type="checkbox" checked={layers.markov} onChange={() => onToggleLayer('markov')} aria-label="Capa Predictiva Markov" className="accent-accent" />
          </label>
          {layers.markov && <>
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-surface p-0.5" role="group" aria-label="Horizonte de la capa Markov">
              {(['24h', '48h', '72h'] as const).map((label, index) => <button key={label} type="button" aria-pressed={markovHorizon === index} onClick={() => onMarkovHorizonChange?.(index as 0 | 1 | 2)} className={`rounded-md py-1 font-source text-[11px] font-bold transition-colors ${markovHorizon === index ? 'bg-accent-solid text-accent-fg' : 'text-text-secondary hover:text-text-primary'}`}>{label}</button>)}
            </div>
            {markovNote
              ? <p className="rounded-md border border-warning/40 bg-warning-soft px-2 py-1 text-[10px] leading-tight text-warning">{markovNote}</p>
              : <p className="text-[10px] leading-tight text-text-secondary">Estimación exploratoria con los datos cargados (no es un modelo publicado). Toca una zona de color para ver la celda.</p>}
          </>}
        </div>
      </div>}
    </section>

    <div className={`absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 font-source text-[11px] lg:flex ${PANEL}`}>
      <div className="flex items-center gap-3">
      <LegendDot color="bg-[#ef4444]" label="VIIRS" />
      <span className="h-3 w-px bg-border-strong" />
      <LegendDot color="bg-[#facc15]" label="MODIS" />
      <span className="h-3 w-px bg-border-strong" />
      <LegendDot color="bg-[#f97316]" label={`Alta (≥${HIGH_INTENSITY_FRP_MW} MW)`} />
      {layers.citizen && <><span className="h-3 w-px bg-border-strong" /><LegendDot color="bg-[#3b82f6]" label="Ciudadanos" /></>}
      </div>
      {layers.markov && !markovNote && <div className="flex items-center gap-2 border-t border-border pt-1.5">
        <span className="font-bold text-predictive">P(S1 ∪ S2)</span>
        {PROBABILITY_SCALE.map((step) => <span key={step.label} className="flex items-center gap-1"><span className="inline-block h-2.5 w-4 rounded-xs" style={{ backgroundColor: step.color }} /><span className="text-text-secondary">{step.label}</span></span>)}
      </div>}
    </div>
  </>;
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className={`inline-block h-3 w-3 rounded-full ring-1 ring-border-strong ${color}`} /><span className="font-bold text-text-primary">{label}</span></span>;
}

function Toggle({ icon, label, count, checked, onChange }: { icon?: ReactNode; label: string; count?: number; checked: boolean; onChange: () => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-2 text-text-primary">
    <span className="flex items-center gap-1.5">{icon}{label}</span>
    <span className="flex items-center gap-2">
      {count !== undefined && <span className="min-w-5 rounded border border-border-strong bg-input-bg px-1 text-center font-source text-[10px] text-text-secondary">{count.toLocaleString()}</span>}
      <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} className="accent-accent" />
    </span>
  </label>;
}
