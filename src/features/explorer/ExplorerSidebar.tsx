import { useState } from 'react';
import { RotateCcw, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { Sensor } from '@/types/api/observations';

interface ExplorerSidebarProps {
  sensor: Sensor | 'ALL';
  onSensorChange: (sensor: Sensor | 'ALL') => void;
  visibleCount: number;
  recordCount: number;
  totalMatching: number;
  provenance: string;
  isTruncated: boolean;
  onReset: () => void;
}

export default function ExplorerSidebar({ sensor, onSensorChange, visibleCount, recordCount, totalMatching, provenance, isTruncated, onReset }: ExplorerSidebarProps) {
  const [advanced, setAdvanced] = useState(false);

  return <aside className="flex w-full shrink-0 flex-col gap-3 border-b border-slate-800 bg-[#080e19] p-3 text-xs lg:h-full lg:w-[300px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-800 bg-[#0e1726] p-1">
      <button type="button" aria-pressed={!advanced} onClick={() => setAdvanced(false)} className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-semibold transition ${!advanced ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}><Sparkles className="h-3.5 w-3.5" />Modo Fácil</button>
      <button type="button" aria-pressed={advanced} onClick={() => setAdvanced(true)} className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-semibold transition ${advanced ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}><SlidersHorizontal className="h-3.5 w-3.5" />Filtros Pro</button>
    </div>

    <section className="rounded-xl border border-slate-800 bg-[#0d1625] p-3">
      <div className="flex items-center justify-between text-[10px] text-slate-400"><span>Observaciones encontradas:</span><button type="button" onClick={onReset} aria-label="Restablecer filtros" title="Restablecer filtros" className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white"><RotateCcw className="h-3 w-3" /></button></div>
      <p className="mt-1 font-mono text-sm"><span className="font-bold text-amber-400">{visibleCount.toLocaleString()}</span><span className="text-slate-500"> / {recordCount.toLocaleString()}</span></p>
      <p className="mt-1 text-[9px] text-slate-500">{recordCount.toLocaleString()} cargadas · {totalMatching.toLocaleString()} coincidentes en la API</p>
      {isTruncated && <p className="mt-2 rounded-md border border-amber-900/50 bg-amber-950/30 px-2 py-1 text-[9px] text-amber-200">Consulta truncada al límite de 1.000.</p>}
      {provenance === 'synthetic_demo' && <p className="mt-2 text-[9px] leading-4 text-amber-200">Modo de demostración: estos registros no son observaciones reales de NASA.</p>}
    </section>

    <section className="space-y-2 border-t border-slate-800 pt-3">
      <div className="flex items-center justify-between"><h2 className="font-semibold text-slate-200">Buscar por municipio</h2><span className="rounded border border-slate-700 px-1.5 py-0.5 text-[8px] uppercase tracking-wide text-slate-500">No disponible</span></div>
      <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#050a12] px-2.5 py-2 text-slate-500"><Search className="h-3.5 w-3.5" /><input disabled aria-label="Buscar por municipio" placeholder="El conjunto no incluye municipio" className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-slate-600 disabled:cursor-not-allowed" /></label>
    </section>

    <section className="space-y-2 border-t border-slate-800 pt-3">
      <h2 className="font-semibold text-slate-200">Sensor</h2>
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#050a12] p-1" aria-label="Filtrar por sensor">
        {(['ALL', 'VIIRS', 'MODIS'] as const).map((item) => <button key={item} type="button" onClick={() => onSensorChange(item)} aria-pressed={sensor === item} className={`rounded-md px-2 py-2 text-[10px] font-semibold transition ${sensor === item ? 'bg-slate-700 text-white ring-1 ring-slate-500' : 'text-slate-500 hover:text-slate-200'}`}>{item === 'ALL' ? 'Todos' : item}</button>)}
      </div>
    </section>

    <section className="space-y-2 border-t border-slate-800 pt-3">
      <div className="flex items-center justify-between"><h2 className="font-semibold text-slate-200">Filtros territoriales</h2><span className="rounded border border-slate-700 px-1.5 py-0.5 text-[8px] uppercase tracking-wide text-slate-500">No disponible</span></div>
      <label className="block space-y-1 text-[10px] text-slate-400">Departamento<select disabled aria-label="Departamento" className="w-full rounded-lg border border-slate-800 bg-[#050a12] px-2.5 py-2 text-slate-500 disabled:cursor-not-allowed"><option>No disponible en este conjunto</option></select></label>
      <label className="block space-y-1 text-[10px] text-slate-400">Municipio<select disabled aria-label="Municipio" className="w-full rounded-lg border border-slate-800 bg-[#050a12] px-2.5 py-2 text-slate-500 disabled:cursor-not-allowed"><option>Requiere campo municipio</option></select></label>
      <p className="text-[9px] leading-4 text-slate-500">La API actual no entrega departamento ni municipio. Las vistas rápidas del mapa solo cambian la cámara.</p>
    </section>

    {advanced && <section className="space-y-2 border-t border-slate-800 pt-3"><h2 className="font-semibold text-slate-200">Filtros adicionales</h2><p className="text-[9px] leading-4 text-slate-500">El periodo se controla en la línea de tiempo. Los filtros por FRP, confianza y día/noche requieren campos que este contrato no entrega.</p></section>}

    <div className="mt-auto border-t border-slate-800 pt-3 text-[9px] leading-4 text-slate-500">
      <p className="font-semibold text-slate-400">Fuentes MODIS y VIIRS</p>
      <p className="mt-1">Una observación no equivale necesariamente a un incendio independiente. Los conteos se mantienen separados por sensor.</p>
    </div>
  </aside>;
}
