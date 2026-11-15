import { AlertTriangle, Calendar, Clock, Download, Info, Moon, Sun } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import type { Observation } from '@/types/api/observations';
import { ModulePage } from '@/components/common/ModuleLayout';

interface AnalyticsPanelProps {
  observations: Observation[];
  totalMatching: number;
  provenance: string;
  /** Zona analizada (por ejemplo «Antioquia» o «Colombia»). */
  zoneLabel?: string;
  onExportCsv?: () => void;
}

const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
const frpOf = (items: Observation[]) => items.flatMap((item) => item.frp_mw === null ? [] : [item.frp_mw]);
const fmt = (value: number | null, digits = 1) => value === null ? 'No disponible' : `${value.toFixed(digits)} MW`;
/** Hora local de Colombia (UTC-5) de la adquisición. */
const colombiaHour = (iso: string) => { const ms = Date.parse(iso); return Number.isNaN(ms) ? null : new Date(ms - 5 * 3_600_000).getUTCHours(); };

function satellitesOf(items: Observation[], fallback: string) {
  const names = [...new Set(items.map((item) => item.satellite).filter((name): name is string => Boolean(name)))].sort();
  return names.length ? names.join(' · ') : fallback;
}

export default function AnalyticsPanel({ observations, totalMatching, provenance, zoneLabel = 'la zona consultada', onExportCsv }: AnalyticsPanelProps) {
  const [hoverMonth, setHoverMonth] = useState<string | null>(null);
  const stats = useMemo(() => {
    const viirs = observations.filter((item) => item.sensor === 'VIIRS');
    const modis = observations.filter((item) => item.sensor === 'MODIS');
    const frp = frpOf(observations);
    const distinctDays = new Set(observations.map((item) => item.acquired_at.slice(0, 10))).size;
    const maxFrp = frp.length ? Math.max(...frp) : null;
    const recurrenceScore = Math.min(100, Math.max(0, Math.round(Math.min(50, (distinctDays / 40) * 50) + Math.min(30, (observations.length / 100) * 30) + Math.min(20, ((maxFrp ?? 0) / 80) * 20))));
    const recurrenceLevel = recurrenceScore <= 20 ? 'Muy baja' : recurrenceScore <= 40 ? 'Baja' : recurrenceScore <= 60 ? 'Moderada' : recurrenceScore <= 80 ? 'Alta' : 'Muy alta';

    const months = new Map<string, { VIIRS: number; MODIS: number; frp: number[] }>();
    for (const item of observations) {
      const key = item.acquired_at.slice(0, 7);
      const value = months.get(key) ?? { VIIRS: 0, MODIS: 0, frp: [] };
      value[item.sensor] += 1;
      if (item.frp_mw !== null) value.frp.push(item.frp_mw);
      months.set(key, value);
    }
    const monthly = [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-12);

    const day = observations.filter((item) => item.daynight?.toUpperCase() === 'D');
    const night = observations.filter((item) => item.daynight?.toUpperCase() === 'N');
    const hours = Array.from({ length: 24 }, () => 0);
    for (const item of observations) { const hour = colombiaHour(item.acquired_at); if (hour !== null) hours[hour] += 1; }

    return { viirs, modis, frp, distinctDays, maxFrp, recurrenceScore, recurrenceLevel, monthly, day, night, hours };
  }, [observations]);

  const { viirs, modis, frp, distinctDays, maxFrp, recurrenceScore, recurrenceLevel, monthly, day, night, hours } = stats;
  const hasObservations = observations.length > 0;
  const maxMonthly = Math.max(1, ...monthly.flatMap(([, value]) => [value.VIIRS, value.MODIS]));
  const maxHour = Math.max(1, ...hours);
  const unknownPass = observations.length - day.length - night.length;
  const knownPass = day.length + night.length;
  const peakHour = hasObservations ? hours.indexOf(Math.max(...hours)) : null;

  return <ModulePage>
    <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h1 className="font-noto text-xl font-bold tracking-tight text-text-primary sm:text-2xl">Panel de Análisis Histórico &amp; Estadísticas</h1>
        <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">Evaluación territorial de recurrencia, estacionalidad y potencia radiativa para <strong className="text-accent">{zoneLabel}</strong>.</p>
        <p className="mt-1 font-source text-[11px] text-text-secondary">{observations.length.toLocaleString()} registros cargados de {totalMatching.toLocaleString()} coincidentes · {provenance === 'synthetic_demo' ? 'datos sintéticos de demostración' : provenance}</p>
      </div>
      {onExportCsv && <button type="button" onClick={onExportCsv} disabled={!hasObservations} className="ignis-action ignis-action-primary shrink-0 self-start disabled:opacity-50 sm:self-auto"><Download className="h-4 w-4" aria-hidden />Exportar Consulta CSV (<span className="font-source">{observations.length.toLocaleString()}</span>)</button>}
    </div>

    <section aria-label="Indicadores clave" className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl border border-border bg-card p-4 shadow-sm lg:grid-cols-4 lg:divide-x lg:divide-border lg:gap-0">
      <Kpi label="Sensor VIIRS (~375m)" tag={satellitesOf(viirs, 'SNPP · NOAA-20/21')} tagColor="text-accent" value={viirs.length.toLocaleString()} valueColor="text-accent" detail="Focos detectados con mayor sensibilidad espacial a eventos pequeños y bordes de fuego." />
      <Kpi label="Sensor MODIS (~1km)" tag={satellitesOf(modis, 'Terra · Aqua')} tagColor="text-warning" value={modis.length.toLocaleString()} valueColor="text-warning" detail="Serie histórica global de referencia operativa de largo plazo (desde 2000)." />
      <Kpi label="Índice Recurrencia" tag={hasObservations ? recurrenceLevel : '—'} tagColor="text-info" value={hasObservations ? String(recurrenceScore) : '—'} unit="/ 100" valueColor="text-info" detail={`${distinctDays} días con actividad registrada. No equivale a probabilidad futura.`} />
      <Kpi label="Potencia Radiativa (FRP)" tag={`Máx: ${maxFrp === null ? 'N/D' : `${maxFrp} MW`}`} tagColor="text-danger" value={frp.length ? average(frp)!.toFixed(1) : 'N/D'} unit={frp.length ? 'MW prom.' : '(sin FRP)'} valueColor="text-danger" detail={`Energía radiativa medida durante el barrido satelital (${frp.length.toLocaleString()} observaciones con FRP).`} />
    </section>

    <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div><h2 className="flex items-center gap-2 font-noto text-base font-bold text-text-primary"><Calendar className="h-4 w-4 text-info" aria-hidden />Evolución Mensual &amp; Estacionalidad Histórica</h2><p className="text-xs text-text-secondary">Detecciones agrupadas por mes de adquisición, diferenciando la contribución de cada sensor.</p></div>
        <div className="flex items-center gap-3 font-source text-xs"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-xs bg-orange-500" />VIIRS</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-xs bg-amber-400" />MODIS</span></div>
      </div>
      <div className="flex h-56 items-end gap-2 border-b border-border pb-2 pt-10">
        {monthly.length ? monthly.map(([month, value]) => <div key={month} className="relative flex h-full flex-1 flex-col items-center justify-end gap-1" onMouseEnter={() => setHoverMonth(month)} onMouseLeave={() => setHoverMonth(null)}>
          {hoverMonth === month && <div className="absolute -top-10 z-10 whitespace-nowrap rounded-lg border border-border-strong bg-card px-2.5 py-1 font-source text-[10px] shadow-lg"><p className="font-bold text-accent">{month}: {(value.VIIRS + value.MODIS).toLocaleString()} detecciones</p><p className="text-text-secondary">VIIRS: {value.VIIRS} | MODIS: {value.MODIS} | FRP: {fmt(average(value.frp))}</p></div>}
          <div className="flex h-full w-full items-end justify-center gap-1">
            <span className="w-1/2 max-w-[14px] rounded-t-xs bg-orange-500/85 transition-colors hover:bg-orange-400" style={{ height: `${Math.max(value.VIIRS ? 3 : 0, (value.VIIRS / maxMonthly) * 100)}%` }} />
            <span className="w-1/2 max-w-[14px] rounded-t-xs bg-amber-400/85 transition-colors hover:bg-amber-300" style={{ height: `${Math.max(value.MODIS ? 3 : 0, (value.MODIS / maxMonthly) * 100)}%` }} />
          </div>
          <span className="mt-1 font-source text-[10px] text-text-secondary">{month}</span>
        </div>) : <div className="flex h-full w-full items-center justify-center text-xs text-text-secondary">No hay registros disponibles para el rango seleccionado.</div>}
      </div>
    </section>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-noto text-sm font-bold text-text-primary"><Sun className="h-4 w-4 text-accent" aria-hidden />Distribución por Horario Orbital (Día / Noche)</h2>
        <div className="grid grid-cols-2 gap-4">
          <PassCard icon={<Sun className="h-3.5 w-3.5" aria-hidden />} title="Pases Diurnos" color="text-warning" items={day} total={knownPass} detail="Influenciados por radiación solar, mayor temperatura ambiente y actividad agrícola." />
          <PassCard icon={<Moon className="h-3.5 w-3.5" aria-hidden />} title="Pases Nocturnos" color="text-predictive" items={night} total={knownPass} detail="Mayor contraste térmico contra el suelo frío; menor incidencia de reflejos solares." />
        </div>
        {knownPass > 0 && <div className="flex h-2.5 overflow-hidden rounded-full bg-border" aria-hidden><div className="h-full bg-warning" style={{ width: `${(day.length / knownPass) * 100}%` }} /><div className="h-full bg-predictive/70" style={{ width: `${(night.length / knownPass) * 100}%` }} /></div>}

        <div className="space-y-2 rounded-xl border border-border bg-surface p-3">
          <div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-1.5 font-noto text-xs font-bold text-text-primary"><Clock className="h-3.5 w-3.5 text-accent" aria-hidden />Hora de adquisición (hora Colombia, UTC-5)</h3>{peakHour !== null && <span className="font-source text-[10px] text-text-secondary">Pico: {String(peakHour).padStart(2, '0')}:00</span>}</div>
          <div className="flex h-16 items-end gap-0.5" role="img" aria-label="Observaciones por hora del día">
            {hours.map((count, hour) => <span key={hour} title={`${String(hour).padStart(2, '0')}:00 · ${count} observaciones`} className={`flex-1 rounded-t-xs ${hour >= 6 && hour < 18 ? 'bg-warning/80' : 'bg-predictive/70'}`} style={{ height: `${count ? Math.max(6, (count / maxHour) * 100) : 0}%` }} />)}
          </div>
          <div className="flex justify-between font-source text-[9px] text-text-secondary"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
          <p className="text-[10px] leading-relaxed text-text-secondary">Las observaciones se agrupan en las horas de paso de cada satélite (órbita polar): el resto del día no hay observación, no ausencia de fuego.{unknownPass > 0 && ` ${unknownPass.toLocaleString()} observaciones no informan si el paso fue diurno o nocturno.`}</p>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-noto text-sm font-bold text-text-primary"><Info className="h-4 w-4 text-info" aria-hidden />Ficha Técnica Comparativa de Sensores</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[420px] border-collapse text-left text-xs">
          <thead><tr className="border-b border-border font-noto text-[11px] text-text-secondary"><th className="py-2 pr-2">Sensor</th><th className="py-2 pr-2">Plataformas</th><th className="py-2 pr-2">Resolución</th><th className="py-2">Implicación territorial</th></tr></thead>
          <tbody className="divide-y divide-border font-source text-[11px]">
            <tr><td className="py-2 pr-2 font-bold text-accent">VIIRS</td><td className="py-2 pr-2 text-text-primary">Suomi-NPP, NOAA-20/21</td><td className="py-2 pr-2 text-text-primary">~375 m</td><td className="py-2 font-sans text-[10px] text-text-secondary">Alta resolución espacial; detecta focos de menor escala y delineación fina.</td></tr>
            <tr><td className="py-2 pr-2 font-bold text-warning">MODIS</td><td className="py-2 pr-2 text-text-primary">Terra, Aqua</td><td className="py-2 pr-2 text-text-primary">~1000 m</td><td className="py-2 font-sans text-[10px] text-text-secondary">Píxeles grandes; registro histórico continuo más extenso (desde 2000).</td></tr>
          </tbody>
        </table></div>

        <div className="space-y-2 rounded-xl border border-border bg-surface p-3">
          <h3 className="font-noto text-xs font-bold text-text-primary">En el conjunto cargado</h3>
          <div className="overflow-x-auto"><table className="w-full min-w-[380px] border-collapse text-left font-source text-[11px]">
            <thead><tr className="text-[10px] text-text-secondary"><th className="py-1 pr-2">Sensor</th><th className="py-1 pr-2">Observaciones</th><th className="py-1 pr-2">Satélites</th><th className="py-1 pr-2">FRP prom.</th><th className="py-1">Diurno / Nocturno</th></tr></thead>
            <tbody className="divide-y divide-border">{([['VIIRS', viirs, 'text-accent'], ['MODIS', modis, 'text-warning']] as const).map(([name, items, color]) => <tr key={name}>
              <td className={`py-1.5 pr-2 font-bold ${color}`}>{name}</td>
              <td className="py-1.5 pr-2 tabular-nums text-text-primary">{items.length.toLocaleString()}</td>
              <td className="py-1.5 pr-2 text-text-primary">{satellitesOf(items, '—')}</td>
              <td className="py-1.5 pr-2 tabular-nums text-text-primary">{fmt(average(frpOf(items)))}</td>
              <td className="py-1.5 tabular-nums text-text-primary">{items.filter((item) => item.daynight?.toUpperCase() === 'D').length} / {items.filter((item) => item.daynight?.toUpperCase() === 'N').length}</td>
            </tr>)}</tbody>
          </table></div>
        </div>
        <p className="text-[10px] leading-relaxed text-text-secondary">* Referencias oficiales: Giglio et al. (2016) para MODIS Collection 6; Schroeder et al. (2014) para VIIRS 375 m.</p>
      </section>
    </div>

    <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-xs text-text-primary">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
      <div className="space-y-1">
        <p className="font-semibold text-warning">Regla Metodológica de Armonización:</p>
        <p className="text-[11px] leading-relaxed text-text-secondary">MODIS (~1 km nadir) y VIIRS (~375 m banda I) poseen resoluciones espaciales, horarios de paso y umbrales distintos. Contar detecciones de ambos sensores en conjunto sin armonización sesga el análisis histórico: <em>un mayor número de detecciones en VIIRS no implica necesariamente más incendios</em>. Por rigor científico, esta plataforma presenta y analiza los registros diferenciados por instrumento. El Índice de Recurrencia resume el conjunto descargado; no es una probabilidad de incendio futuro.</p>
      </div>
    </div>
  </ModulePage>;
}

function Kpi({ label, tag, tagColor, value, unit, valueColor, detail }: { label: string; tag: string; tagColor: string; value: string; unit?: string; valueColor: string; detail: string }) {
  return <div className="min-w-0 space-y-2 py-2 lg:px-5 lg:first:pl-0 lg:last:pr-0">
    <div className="flex items-start justify-between gap-2 text-xs text-text-secondary"><span className="font-source">{label}</span><span className={`text-right font-source text-[10px] font-semibold ${tagColor}`}>{tag}</span></div>
    <p className={`font-source text-2xl font-extrabold sm:text-3xl ${valueColor}`}>{value}{unit && <span className="text-sm font-normal text-text-secondary"> {unit}</span>}</p>
    <p className="text-[11px] leading-snug text-text-secondary">{detail}</p>
  </div>;
}

function PassCard({ icon, title, color, items, total, detail }: { icon: ReactNode; title: string; color: string; items: Observation[]; total: number; detail: string }) {
  const avg = average(frpOf(items));
  return <div className="space-y-1">
    <div className={`flex items-center gap-1.5 font-noto text-xs font-semibold ${color}`}>{icon}{title}</div>
    <p className="font-source text-2xl font-bold text-text-primary">{items.length.toLocaleString()} <span className="text-xs font-normal text-text-secondary">{total ? `${Math.round((items.length / total) * 100)}%` : ''}</span></p>
    <p className="font-source text-[11px] text-text-secondary">FRP prom.: <strong className="text-text-primary">{fmt(avg)}</strong></p>
    <p className="text-[11px] leading-snug text-text-secondary">{detail}</p>
  </div>;
}
