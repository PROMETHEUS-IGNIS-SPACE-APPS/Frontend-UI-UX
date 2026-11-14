import { useState } from 'react';
import { ChevronDown, ChevronUp, Layers, LocateFixed } from 'lucide-react';
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

export default function MapOverlays({ focusId, styleId, onStyleChange, onFocusChange, observationCounts, frpCount, showModis, showViirs, showHeatmap, onToggleModis, onToggleViirs, onToggleHeatmap }: MapOverlaysProps) {
  const [layersOpen, setLayersOpen] = useState(true);
  return <>
    <div className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-5rem)] items-center gap-1 overflow-x-auto rounded-xl border border-slate-700 bg-[#0b1422]/95 p-1.5 shadow-xl shadow-black/30 backdrop-blur sm:left-4 sm:top-4">
      <span className="flex shrink-0 items-center gap-1 px-2 font-mono text-[9px] text-amber-300"><LocateFixed className="h-3 w-3" />Zona:</span>
      {MAP_FOCUS_PRESETS.map((preset) => <button key={preset.id} type="button" aria-pressed={focusId === preset.id} onClick={() => onFocusChange(preset)} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[9px] font-semibold transition sm:text-[10px] ${focusId === preset.id ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>{preset.label}</button>)}
    </div>

    <label className="absolute right-3 top-[5rem] z-20 flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0b1422]/95 px-3 py-2 font-mono text-[9px] text-slate-300 shadow-xl backdrop-blur sm:right-4 sm:top-[5rem]">
      <span>Mapa base</span>
      <select aria-label="Estilo del mapa base" value={styleId} onChange={(event) => { const style = MAP_STYLE_PRESETS.find((item) => item.id === event.target.value); if (style) onStyleChange(style); }} className="max-w-24 bg-transparent font-semibold text-amber-200 outline-none focus-visible:ring-1 focus-visible:ring-cyan-400">
        {MAP_STYLE_PRESETS.map((style) => <option key={style.id} value={style.id} className="bg-slate-900 text-slate-100">{style.label}</option>)}
      </select>
    </label>

    <section className="absolute left-3 top-[3.65rem] z-20 w-[216px] overflow-hidden rounded-xl border border-slate-700 bg-[#0b1422]/95 shadow-xl shadow-black/30 backdrop-blur sm:left-4 sm:top-[4.25rem] sm:w-[230px]">
      <button type="button" aria-expanded={layersOpen} onClick={() => setLayersOpen((value) => !value)} className="flex w-full items-center justify-between px-3 py-2.5 text-left font-mono text-[9px] font-semibold text-slate-200"><span className="flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-amber-400" />Filtro por color / sensor</span>{layersOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}</button>
      {layersOpen && <div className="space-y-1 border-t border-slate-800 px-2 py-2">
        <LayerToggle label="Puntos rojos" detail="Focos VIIRS" color="bg-red-500" count={observationCounts.VIIRS} checked={showViirs} onChange={onToggleViirs} />
        <LayerToggle label="Puntos amarillos" detail="Focos MODIS" color="bg-yellow-400" count={observationCounts.MODIS} checked={showModis} onChange={onToggleModis} />
        <LayerToggle label="Densidad térmica" detail="Peso FRP disponible (MW)" color="bg-orange-400" count={frpCount} checked={showHeatmap} onChange={onToggleHeatmap} />
        {showHeatmap && <p className="px-2 pb-1 text-[8px] leading-4 text-slate-500">La intensidad visual usa FRP informada; FRP nula queda excluida y no se interpreta como cero.</p>}
      </div>}
    </section>
  </>;
}

function LayerToggle({ label, detail, color, count, checked, onChange }: { label: string; detail: string; color: string; count: number; checked: boolean; onChange: () => void }) {
  return <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-800/70">
    <span className={`h-3 w-3 shrink-0 rounded-full ring-1 ring-white/50 ${color}`} aria-hidden />
    <span className="min-w-0 flex-1"><span className="block text-[10px] font-semibold text-slate-200">{label}</span><span className="block text-[8px] text-slate-500">{detail}</span></span>
    <span className="min-w-5 rounded border border-slate-700 bg-slate-950 px-1 text-center font-mono text-[8px] text-slate-400">{count}</span>
    <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} className="accent-amber-500" />
  </label>;
}
