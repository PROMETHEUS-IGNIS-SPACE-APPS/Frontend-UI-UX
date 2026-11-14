import { useState } from 'react';
import { ChevronDown, ChevronUp, Compass, Layers, Map as MapIcon } from 'lucide-react';
import { MAP_FOCUS_PRESETS, MAP_STYLE_PRESETS, type MapFocusPreset, type MapStylePreset } from './mapPresets';

interface MapOverlaysProps {
  focusId: string;
  styleId: MapStylePreset['id'];
  onStyleChange: (style: MapStylePreset) => void;
  onFocusChange: (preset: MapFocusPreset) => void;
  observationCounts: { MODIS: number; VIIRS: number };
  frpCount: number;
  showModis: boolean;
  showViirs: boolean;
  showHeatmap: boolean;
  onToggleModis: () => void;
  onToggleViirs: () => void;
  onToggleHeatmap: () => void;
}

const GLASS = 'border border-border-strong bg-card/25 shadow-2xl backdrop-blur-md';

export default function MapOverlays({ focusId, styleId, onStyleChange, onFocusChange, observationCounts, frpCount, showModis, showViirs, showHeatmap, onToggleModis, onToggleViirs, onToggleHeatmap }: MapOverlaysProps) {
  const [layersOpen, setLayersOpen] = useState(true);
  const [baseOpen, setBaseOpen] = useState(false);
  const activeStyle = MAP_STYLE_PRESETS.find((style) => style.id === styleId) ?? MAP_STYLE_PRESETS[0];

  return <>
    <div className="pointer-events-none absolute left-3 right-14 top-3 z-20 flex flex-col gap-2">
      <div className={`pointer-events-auto flex flex-wrap items-center gap-1 self-start rounded-xl p-1.5 ${GLASS}`}>
        <span className="flex items-center gap-1 px-1.5 font-noto text-[11px] font-bold text-accent"><Compass className="h-3.5 w-3.5" aria-hidden /><span className="hidden sm:inline">Zona:</span></span>
        {MAP_FOCUS_PRESETS.map((preset) => <button key={preset.id} type="button" aria-pressed={focusId === preset.id} onClick={() => onFocusChange(preset)} className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors sm:text-xs ${focusId === preset.id ? 'bg-accent-solid text-accent-fg' : 'text-text-secondary hover:bg-surface-hover/60 hover:text-text-primary'}`}>{preset.label}</button>)}
      </div>

      <div className={`pointer-events-auto max-w-[260px] self-start overflow-hidden rounded-2xl ${GLASS}`}>
        <button type="button" aria-expanded={baseOpen} onClick={() => setBaseOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-xs font-bold text-text-primary transition-colors hover:bg-surface-hover/50 sm:py-2">
          <span className="flex items-center gap-2"><MapIcon className="h-4 w-4 text-accent" aria-hidden /><span>Base: <strong className="uppercase text-accent">{activeStyle.label}</strong></span></span>
          {baseOpen ? <ChevronUp className="h-3.5 w-3.5 text-text-secondary" /> : <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />}
        </button>
        <div className={`${baseOpen ? 'block' : 'hidden'} border-t border-border p-3 text-xs`}>
          <label className="flex items-center justify-between gap-2 text-text-secondary">
            <span>Mapa base</span>
            <select aria-label="Estilo del mapa base" value={styleId} onChange={(event) => { const style = MAP_STYLE_PRESETS.find((item) => item.id === event.target.value); if (style) onStyleChange(style); }} className="rounded-lg border border-border-strong bg-input-bg px-2 py-1 font-semibold text-text-primary outline-none focus-visible:ring-1 focus-visible:ring-cyan-400">
              {MAP_STYLE_PRESETS.map((style) => <option key={style.id} value={style.id}>{style.label}</option>)}
            </select>
          </label>
        </div>
      </div>
    </div>

    <section className={`absolute bottom-6 left-3 z-20 w-60 space-y-2 rounded-2xl p-2.5 text-xs ${GLASS}`}>
      <button type="button" aria-expanded={layersOpen} onClick={() => setLayersOpen((value) => !value)} className="flex w-full items-center justify-between border-b border-border pb-1 font-noto text-[11px] font-bold text-text-primary">
        <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-accent" aria-hidden />Capas Cartográficas</span>
        {layersOpen ? <ChevronUp className="h-3.5 w-3.5 text-text-secondary" /> : <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />}
      </button>
      {layersOpen && <div className="space-y-2 pt-0.5">
        <LayerToggle label="Puntos rojos" detail="Focos VIIRS" color="bg-[#ef4444]" count={observationCounts.VIIRS} checked={showViirs} onChange={onToggleViirs} />
        <LayerToggle label="Puntos amarillos" detail="Focos MODIS" color="bg-[#facc15]" count={observationCounts.MODIS} checked={showModis} onChange={onToggleModis} />
        <div className="border-t border-border pt-1.5">
          <LayerToggle label="Densidad térmica" detail="Peso FRP disponible (MW)" color="bg-orange-400" count={frpCount} checked={showHeatmap} onChange={onToggleHeatmap} />
          {showHeatmap && <p className="pt-1 text-[10px] leading-tight text-text-secondary">La intensidad visual usa FRP informada; FRP nula queda excluida y no se interpreta como cero.</p>}
        </div>
      </div>}
    </section>

    <div className={`absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-3 rounded-xl px-3.5 py-2 font-source text-[11px] lg:flex ${GLASS}`}>
      <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-[#ef4444] ring-1 ring-border-strong" /><span className="font-bold text-text-primary">VIIRS</span></span>
      <span className="h-3 w-px bg-border-strong" />
      <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-[#facc15] ring-1 ring-border-strong" /><span className="font-bold text-text-primary">MODIS</span></span>
    </div>
  </>;
}

function LayerToggle({ label, detail, color, count, checked, onChange }: { label: string; detail: string; color: string; count: number; checked: boolean; onChange: () => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-2 text-text-primary">
    <span className="flex min-w-0 items-center gap-1.5">
      <span className={`h-3 w-3 shrink-0 rounded-full ring-1 ring-border-strong ${color}`} aria-hidden />
      <span className="min-w-0"><span className="block text-xs">{label}</span><span className="block text-[10px] text-text-secondary">{detail}</span></span>
    </span>
    <span className="flex items-center gap-2">
      <span className="min-w-5 rounded border border-border-strong bg-input-bg px-1 text-center font-source text-[10px] text-text-secondary">{count}</span>
      <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} className="accent-[#D9692B]" />
    </span>
  </label>;
}
