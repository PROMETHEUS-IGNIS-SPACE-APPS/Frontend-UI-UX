import { RotateCcw, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { Observation, ObservationSourceMode, Sensor } from '@/types/api/observations';

interface ExplorerSidebarProps {
  sensor: Sensor | 'ALL';
  onSensorChange: (sensor: Sensor | 'ALL') => void;
  sourceMode: ObservationSourceMode;
  onSourceModeChange: (source: ObservationSourceMode) => void;
  region: 'antioquia_ideam' | 'colombia';
  onRegionChange: (region: 'antioquia_ideam' | 'colombia') => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  department: string;
  onDepartmentChange: (department: string) => void;
  municipality: string;
  onMunicipalityChange: (municipality: string) => void;
  municipalitySearch: string;
  onMunicipalitySearchChange: (value: string) => void;
  daynight: 'ALL' | 'D' | 'N';
  onDaynightChange: (value: 'ALL' | 'D' | 'N') => void;
  minimumFrp: string;
  onMinimumFrpChange: (value: string) => void;
  confidenceRaw: string;
  onConfidenceRawChange: (value: string) => void;
  observations: Observation[];
  visibleCount: number;
  recordCount: number;
  totalMatching: number;
  provenance: string;
  warning?: string | null;
  degradedMode?: boolean;
  isTruncated: boolean;
  onReset: () => void;
}

export default function ExplorerSidebar(props: ExplorerSidebarProps) {
  const [advanced, setAdvanced] = useState(false);
  const departments = [...new Set(props.observations.map((item) => item.department).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'es'));
  const municipalities = [...new Set(props.observations.filter((item) => props.department === 'ALL' || item.department === props.department).map((item) => item.municipality).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'es'));
  const confidenceValues = [...new Set(props.observations.map((item) => String(item.confidence_raw)))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
  const firmsMode = props.sourceMode === 'firms';

  return <aside className="flex w-full shrink-0 flex-col gap-3 border-b border-slate-800 bg-[#080e19] p-3 text-xs lg:h-full lg:w-[310px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-800 bg-[#0e1726] p-1">
      <button type="button" aria-pressed={!advanced} onClick={() => setAdvanced(false)} className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-semibold transition ${!advanced ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}><Sparkles className="h-3.5 w-3.5" />Modo FÃ¡cil</button>
      <button type="button" aria-pressed={advanced} onClick={() => setAdvanced(true)} className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-semibold transition ${advanced ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}><SlidersHorizontal className="h-3.5 w-3.5" />Filtros Pro</button>
    </div>

    <section className="space-y-2 rounded-xl border border-slate-800 bg-[#0d1625] p-3">
      <div className="flex items-center justify-between text-[10px] text-slate-400"><span>Fuente de observaciones</span>{props.degradedMode && <span className="rounded border border-amber-800 px-1.5 py-0.5 text-[8px] uppercase text-amber-300">CachÃ©</span>}</div>
      <select aria-label="Fuente de datos" value={props.sourceMode} onChange={(event) => props.onSourceModeChange(event.target.value as ObservationSourceMode)} className="w-full rounded-lg border border-slate-700 bg-[#050a12] px-2.5 py-2 text-[10px] text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><option value="fusion">Combinado Â· IDEAM + NASA FIRMS</option><option value="ideam">IDEAM Â· SMByC</option><option value="firms">NASA FIRMS Â· NRT 7 dÃ­as</option></select>
      <label className="block space-y-1 text-[10px] text-slate-400">Cobertura<select aria-label="Cobertura territorial" value={props.region} onChange={(event) => props.onRegionChange(event.target.value as 'antioquia_ideam' | 'colombia')} className="w-full rounded-lg border border-slate-800 bg-[#050a12] px-2.5 py-2 text-slate-100"><option value="antioquia_ideam">Antioquia</option><option value="colombia">Colombia</option></select></label>
      <div className="grid grid-cols-2 gap-2"><label className="space-y-1 text-[9px] text-slate-400">Desde (UTC)<input aria-label="Fecha inicial" type="date" value={props.dateFrom} max={props.dateTo} disabled={firmsMode} onChange={(event) => props.onDateFromChange(event.target.value)} className="w-full rounded-lg border border-slate-800 bg-[#050a12] px-2 py-2 text-[9px] text-slate-200 disabled:opacity-50" /></label><label className="space-y-1 text-[9px] text-slate-400">Hasta (UTC)<input aria-label="Fecha final" type="date" value={props.dateTo} min={props.dateFrom} disabled={firmsMode} onChange={(event) => props.onDateToChange(event.target.value)} className="w-full rounded-lg border border-slate-800 bg-[#050a12] px-2 py-2 text-[9px] text-slate-200 disabled:opacity-50" /></label></div>
      <p className="text-[9px] leading-4 text-slate-500">{firmsMode ? 'NASA FIRMS entrega su feed NRT pÃºblico de los Ãºltimos 7 dÃ­as.' : 'Rango inclusivo, mÃ¡ximo 90 dÃ­as. Fechas interpretadas en UTC.'}</p>
      {props.warning && <p role="status" className="rounded-md border border-amber-900/50 bg-amber-950/30 px-2 py-1.5 text-[9px] leading-4 text-amber-200">{props.warning}</p>}
      <p className="text-[9px] leading-4 text-slate-500">Procedencia: <span className="text-slate-300">{props.provenance}</span></p>
    </section>

    <section className="rounded-xl border border-slate-800 bg-[#0d1625] p-3">
      <div className="flex items-center justify-between text-[10px] text-slate-400"><span>Observaciones encontradas:</span><button type="button" onClick={props.onReset} aria-label="Restablecer filtros" title="Restablecer filtros" className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white"><RotateCcw className="h-3 w-3" /></button></div>
      <p className="mt-1 font-mono text-sm"><span className="font-bold text-amber-400">{props.visibleCount.toLocaleString()}</span><span className="text-slate-500"> / {props.recordCount.toLocaleString()}</span></p>
      <p className="mt-1 text-[9px] text-slate-500">{props.recordCount.toLocaleString()} cargadas Â· {props.totalMatching.toLocaleString()} recibidas</p>
      {props.isTruncated && <p className="mt-2 rounded-md border border-amber-900/50 bg-amber-950/30 px-2 py-1 text-[9px] text-amber-200">El resultado recibido estÃ¡ limitado por la fuente.</p>}
      {props.degradedMode && <p className="mt-2 text-[9px] leading-4 text-amber-200">La fuente remota no respondiÃ³; se muestran datos de cachÃ© autÃ©nticos.</p>}
    </section>

    <section className="space-y-2 border-t border-slate-800 pt-3">
      <h2 className="font-semibold text-slate-200">Sensor</h2>
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#050a12] p-1" aria-label="Filtrar por sensor">
        {(['ALL', 'VIIRS', 'MODIS'] as const).map((item) => <button key={item} type="button" onClick={() => props.onSensorChange(item)} aria-pressed={props.sensor === item} className={`rounded-md px-2 py-2 text-[10px] font-semibold transition ${props.sensor === item ? 'bg-slate-700 text-white ring-1 ring-slate-500' : 'text-slate-500 hover:text-slate-200'}`}>{item === 'ALL' ? 'Todos' : item}</button>)}
      </div>
    </section>

    <section className="space-y-2 border-t border-slate-800 pt-3">
      <h2 className="font-semibold text-slate-200">UbicaciÃ³n</h2>
      <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#050a12] px-2.5 py-2 text-slate-400"><Search className="h-3.5 w-3.5" /><input value={props.municipalitySearch} onChange={(event) => props.onMunicipalitySearchChange(event.target.value)} aria-label="Buscar por municipio" placeholder="Buscar municipio..." className="min-w-0 flex-1 bg-transparent text-[10px] text-slate-100 outline-none placeholder:text-slate-600" /></label>
      <label className="block space-y-1 text-[10px] text-slate-400">Departamento<select aria-label="Departamento" value={props.department} onChange={(event) => props.onDepartmentChange(event.target.value)} className="w-full rounded-lg border border-slate-800 bg-[#050a12] px-2.5 py-2 text-slate-100"><option value="ALL">Todos los departamentos</option>{departments.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label className="block space-y-1 text-[10px] text-slate-400">Municipio<select aria-label="Municipio" value={props.municipality} onChange={(event) => props.onMunicipalityChange(event.target.value)} className="w-full rounded-lg border border-slate-800 bg-[#050a12] px-2.5 py-2 text-slate-100"><option value="ALL">Todos los municipios</option>{municipalities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
    </section>

    {advanced && <section className="space-y-3 border-t border-slate-800 pt-3">
      <h2 className="font-semibold text-slate-200">Filtros adicionales</h2>
      <label className="block space-y-1 text-[10px] text-slate-400">FRP mÃ­nima (MW)<input type="number" min="0" step="0.1" value={props.minimumFrp} onChange={(event) => props.onMinimumFrpChange(event.target.value)} placeholder="Sin mÃ­nimo" className="w-full rounded-lg border border-slate-800 bg-[#050a12] px-2.5 py-2 text-slate-100 placeholder:text-slate-600" /><span className="block text-[9px] text-slate-500">Las observaciones sin FRP no coinciden con un mÃ­nimo.</span></label>
      <label className="block space-y-1 text-[10px] text-slate-400">Confianza original<select aria-label="Confianza original" value={props.confidenceRaw} onChange={(event) => props.onConfidenceRawChange(event.target.value)} className="w-full rounded-lg border border-slate-800 bg-[#050a12] px-2.5 py-2 text-slate-100"><option value="ALL">Todas las categorÃ­as</option>{confidenceValues.map((value) => <option key={value} value={value}>{value}</option>)}</select><span className="block text-[9px] text-slate-500">Filtro exacto del valor de origen; no armoniza escalas.</span></label>
      <fieldset><legend className="mb-1 text-[10px] text-slate-400">Paso orbital</legend><div className="grid grid-cols-3 gap-1">{([{ key: 'ALL', label: 'Todos' }, { key: 'D', label: 'DÃ­a' }, { key: 'N', label: 'Noche' }] as const).map(({ key, label }) => <button key={key} type="button" aria-pressed={props.daynight === key} onClick={() => props.onDaynightChange(key)} className={`rounded-md px-2 py-1.5 text-[9px] font-semibold ${props.daynight === key ? 'bg-cyan-800/70 text-cyan-100' : 'bg-[#050a12] text-slate-500 hover:text-slate-200'}`}>{label}</button>)}</div></fieldset>
    </section>}

    <div className="mt-auto border-t border-slate-800 pt-3 text-[9px] leading-4 text-slate-500"><p className="font-semibold text-slate-400">Lectura de los datos</p><p className="mt-1">Una observaciÃ³n no equivale necesariamente a un incendio independiente. Los conteos se mantienen separados por sensor.</p></div>
  </aside>;
}
