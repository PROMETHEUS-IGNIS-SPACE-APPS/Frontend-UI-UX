import { RotateCcw, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { Observation, ObservationSamplingInfo, ObservationSourceMode, Sensor } from '@/types/api/observations';

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
  sampling?: ObservationSamplingInfo;
  isTruncated: boolean;
  onReset: () => void;
}

export default function ExplorerSidebar(props: ExplorerSidebarProps) {
  const [advanced, setAdvanced] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const departments = [...new Set(props.observations.map((item) => item.department).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'es'));
  const municipalities = [...new Set(props.observations.filter((item) => props.department === 'ALL' || item.department === props.department).map((item) => item.municipality).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'es'));
  const confidenceValues = [...new Set(props.observations.map((item) => String(item.confidence_raw)))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
  const firmsMode = props.sourceMode === 'firms';
  const historicalMode = props.sourceMode === 'historical';

  return <aside className="flex w-full shrink-0 select-none flex-col gap-3 border-b border-border bg-card p-3 text-xs lg:h-full lg:w-80 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-4">
    <button type="button" aria-expanded={mobileExpanded} onClick={() => setMobileExpanded((value) => !value)} className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5 text-left font-semibold text-text-primary lg:hidden">
      <span className="flex items-center gap-2"><SlidersHorizontal className="h-3.5 w-3.5 text-accent" />Filtros ({props.visibleCount.toLocaleString()} observaciones)</span>
      <span className="text-[11px] text-warning">{mobileExpanded ? 'Ocultar ▲' : 'Mostrar ▼'}</span>
    </button>
    <div className={`${mobileExpanded ? 'flex' : 'hidden'} flex-col gap-3 lg:flex`}>
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface p-1">
      <button type="button" aria-pressed={!advanced} onClick={() => setAdvanced(false)} className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-semibold transition ${!advanced ? 'bg-accent-solid text-accent-fg shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}><Sparkles className="h-3.5 w-3.5" />Modo Fácil</button>
      <button type="button" aria-pressed={advanced} onClick={() => setAdvanced(true)} className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-semibold transition ${advanced ? 'bg-accent-solid text-accent-fg shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}><SlidersHorizontal className="h-3.5 w-3.5" />Filtros Pro</button>
    </div>

    <section className="space-y-2 rounded-xl border border-border bg-surface p-3">
      <div className="flex items-center justify-between text-[11px] text-text-secondary"><span>Fuente de observaciones</span>{props.degradedMode && <span className="rounded border border-warning/40 px-1.5 py-0.5 text-[10px] uppercase text-warning">Caché</span>}</div>
      <select aria-label="Fuente de datos" value={props.sourceMode} onChange={(event) => props.onSourceModeChange(event.target.value as ObservationSourceMode)} className="w-full rounded-lg border border-border-strong bg-input-bg px-2.5 py-2 text-[11px] text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><option value="fusion">Combinado · IDEAM + NASA FIRMS</option><option value="ideam">IDEAM · SMByC</option><option value="firms">NASA FIRMS · NRT 7 días</option><option value="historical">Histórico muestreado · 2024–hoy</option></select>
      <label className="block space-y-1 text-[11px] text-text-secondary">Cobertura<select aria-label="Cobertura territorial" value={props.region} onChange={(event) => props.onRegionChange(event.target.value as 'antioquia_ideam' | 'colombia')} className="w-full rounded-xl border border-border-strong bg-input-bg px-3 py-2 text-text-primary"><option value="antioquia_ideam">Antioquia</option><option value="colombia">Colombia</option></select></label>
      <div className="grid grid-cols-2 gap-2"><label className="space-y-1 text-[11px] text-text-secondary">Desde (UTC)<input aria-label="Fecha inicial" type="date" value={props.dateFrom} max={props.dateTo} disabled={firmsMode || historicalMode} onChange={(event) => props.onDateFromChange(event.target.value)} className="w-full rounded-lg border border-border bg-input-bg px-2 py-2 text-[11px] text-text-primary disabled:opacity-50" /></label><label className="space-y-1 text-[11px] text-text-secondary">Hasta (UTC)<input aria-label="Fecha final" type="date" value={props.dateTo} min={props.dateFrom} disabled={firmsMode || historicalMode} onChange={(event) => props.onDateToChange(event.target.value)} className="w-full rounded-lg border border-border bg-input-bg px-2 py-2 text-[11px] text-text-primary disabled:opacity-50" /></label></div>
      <p className="text-[11px] leading-4 text-text-secondary">{historicalMode ? 'Cobertura desde 2024-01-01 hasta hoy (hora Colombia), por cortes semimensuales y datos recientes.' : firmsMode ? 'NASA FIRMS entrega su feed NRT público de los últimos 7 días.' : 'Rango inclusivo, máximo 90 días. Fechas interpretadas en UTC.'}</p>
      {props.warning && <p role="status" className="rounded-md border border-warning/40 bg-warning-soft px-2 py-1.5 text-[11px] leading-4 text-text-primary">{props.warning}</p>}
      <p className="text-[11px] leading-4 text-text-secondary">Procedencia: <span className="text-text-primary">{props.provenance}</span></p>
    </section>

    <section className="rounded-xl border border-border bg-surface p-3">
      <div className="flex items-center justify-between text-[11px] text-text-secondary"><span>Observaciones encontradas:</span><button type="button" onClick={props.onReset} aria-label="Restablecer filtros" title="Restablecer filtros" className="rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary"><RotateCcw className="h-3 w-3" /></button></div>
      <p className="mt-1 font-mono text-sm"><span className="font-bold text-accent">{props.visibleCount.toLocaleString()}</span><span className="text-text-secondary"> / {props.recordCount.toLocaleString()}</span></p>
      <p className="mt-1 text-[11px] text-text-secondary">{props.recordCount.toLocaleString()} cargadas · {props.totalMatching.toLocaleString()} recibidas</p>
      {props.isTruncated && <p className="mt-2 rounded-md border border-warning/40 bg-warning-soft px-2 py-1 text-[11px] text-text-primary">El resultado recibido está limitado por la fuente.</p>}
      {historicalMode && <div role="status" className="mt-2 space-y-1 rounded-lg border border-warning/40 bg-warning-soft p-2 text-[11px] leading-4 text-text-primary"><p className="font-semibold">Histórico muestreado · tope 9.000 registros</p><p>Se muestran {props.recordCount.toLocaleString()} observaciones, elegidas entre hasta {props.sampling?.rawCount?.toLocaleString() ?? '—'} registros originales. No es una serie diaria continua: los intervalos sin puntos cargados no indican ausencia de focos.</p>{props.sampling?.from && props.sampling.to && <p>Ventana: {props.sampling.from} — {props.sampling.to}.</p>}{props.sampling?.filesLoaded && <p>{props.sampling.filesLoaded.length.toLocaleString()} archivos y feeds consultados.</p>}</div>}
      {props.degradedMode && <p className="mt-2 text-[11px] leading-4 text-text-primary">La fuente remota no respondió; se muestran datos de caché auténticos.</p>}
    </section>

    <section className="space-y-2 border-t border-border pt-3">
      <h2 className="font-noto text-xs font-bold text-text-primary">Sensor</h2>
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-input-bg p-1" aria-label="Filtrar por sensor">
        {(['ALL', 'VIIRS', 'MODIS'] as const).map((item) => <button key={item} type="button" onClick={() => props.onSensorChange(item)} aria-pressed={props.sensor === item} className={`rounded-md px-2 py-2 text-[11px] font-semibold transition ${props.sensor === item ? 'bg-surface-hover text-white ring-1 ring-border-strong' : 'text-text-secondary hover:text-text-primary'}`}>{item === 'ALL' ? 'Todos' : item}</button>)}
      </div>
    </section>

    <section className="space-y-2 border-t border-border pt-3">
      <h2 className="font-noto text-xs font-bold text-text-primary">Ubicación</h2>
      <label className="flex items-center gap-2 rounded-xl border border-border-strong bg-input-bg px-3 py-2 text-text-secondary"><Search className="h-3.5 w-3.5" /><input value={props.municipalitySearch} onChange={(event) => props.onMunicipalitySearchChange(event.target.value)} aria-label="Buscar por municipio" placeholder="Buscar municipio..." className="min-w-0 flex-1 bg-transparent text-[11px] text-text-primary outline-none placeholder:text-text-secondary" /></label>
      <label className="block space-y-1 text-[11px] text-text-secondary">Departamento<select aria-label="Departamento" value={props.department} onChange={(event) => props.onDepartmentChange(event.target.value)} className="w-full rounded-xl border border-border-strong bg-input-bg px-3 py-2 text-text-primary"><option value="ALL">Todos los departamentos</option>{departments.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label className="block space-y-1 text-[11px] text-text-secondary">Municipio<select aria-label="Municipio" value={props.municipality} onChange={(event) => props.onMunicipalityChange(event.target.value)} className="w-full rounded-xl border border-border-strong bg-input-bg px-3 py-2 text-text-primary"><option value="ALL">Todos los municipios</option>{municipalities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
    </section>

    {advanced && <section className="space-y-3 border-t border-border pt-3">
      <h2 className="font-noto text-xs font-bold text-text-primary">Filtros adicionales</h2>
      <label className="block space-y-1 text-[11px] text-text-secondary">FRP mínima (MW)<input type="number" min="0" step="0.1" value={props.minimumFrp} onChange={(event) => props.onMinimumFrpChange(event.target.value)} placeholder="Sin mínimo" className="w-full rounded-xl border border-border-strong bg-input-bg px-3 py-2 text-text-primary placeholder:text-text-secondary" /><span className="block text-[11px] text-text-secondary">Las observaciones sin FRP no coinciden con un mínimo.</span></label>
      <label className="block space-y-1 text-[11px] text-text-secondary">Confianza original<select aria-label="Confianza original" value={props.confidenceRaw} onChange={(event) => props.onConfidenceRawChange(event.target.value)} className="w-full rounded-xl border border-border-strong bg-input-bg px-3 py-2 text-text-primary"><option value="ALL">Todas las categorías</option>{confidenceValues.map((value) => <option key={value} value={value}>{value}</option>)}</select><span className="block text-[11px] text-text-secondary">Filtro exacto del valor de origen; no armoniza escalas.</span></label>
      <fieldset><legend className="mb-1 text-[11px] text-text-secondary">Paso orbital</legend><div className="grid grid-cols-3 gap-1">{([{ key: 'ALL', label: 'Todos' }, { key: 'D', label: 'Día' }, { key: 'N', label: 'Noche' }] as const).map(({ key, label }) => <button key={key} type="button" aria-pressed={props.daynight === key} onClick={() => props.onDaynightChange(key)} className={`rounded-md px-2 py-1.5 text-[11px] font-semibold ${props.daynight === key ? 'bg-info-soft text-info' : 'bg-input-bg text-text-secondary hover:text-text-primary'}`}>{label}</button>)}</div></fieldset>
    </section>}

    <div className="mt-auto border-t border-border pt-3 text-[11px] leading-4 text-text-secondary"><p className="font-semibold text-text-secondary">Lectura de los datos</p><p className="mt-1">Una observación no equivale necesariamente a un incendio independiente. Los conteos se mantienen separados por sensor.</p></div>
    </div>
  </aside>;
}
