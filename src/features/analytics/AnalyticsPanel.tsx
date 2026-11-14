import { Activity, AlertTriangle, Calendar, Flame, Info, Moon, Satellite, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Observation } from '@/types/api/observations';
import { ModuleHeader, ModulePage, ProvenanceNote } from '@/components/common/ModuleLayout';

interface AnalyticsPanelProps {
  observations: Observation[];
  totalMatching: number;
  provenance: string;
}

export default function AnalyticsPanel({ observations, totalMatching, provenance }: AnalyticsPanelProps) {
  const viirs = observations.filter((item) => item.sensor === 'VIIRS');
  const modis = observations.filter((item) => item.sensor === 'MODIS');
  const hasObservations = observations.length > 0;
  const frpValues = observations.flatMap((item) => item.frp_mw === null ? [] : [item.frp_mw]);
  const distinctDays = new Set(observations.map((item) => item.acquired_at.slice(0, 10))).size;
  const maximumFrp = frpValues.length ? Math.max(...frpValues) : null;
  const recurrenceScore = Math.min(100, Math.max(0, Math.round(
    Math.min(50, (distinctDays / 40) * 50)
    + Math.min(30, (observations.length / 100) * 30)
    + Math.min(20, ((maximumFrp ?? 0) / 80) * 20),
  )));
  const recurrenceLevel = recurrenceScore <= 20 ? 'Muy baja' : recurrenceScore <= 40 ? 'Baja' : recurrenceScore <= 60 ? 'Moderada' : recurrenceScore <= 80 ? 'Alta' : 'Muy alta';

  const months = new Map<string, { VIIRS: number; MODIS: number }>();
  for (const item of observations) {
    const key = item.acquired_at.slice(0, 7);
    const value = months.get(key) ?? { VIIRS: 0, MODIS: 0 };
    value[item.sensor] += 1;
    months.set(key, value);
  }
  const monthly = [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-12);
  const maxMonthly = Math.max(1, ...monthly.flatMap(([, value]) => [value.VIIRS, value.MODIS]));
  const dayCount = observations.filter((item) => item.daynight?.toUpperCase() === 'D').length;
  const nightCount = observations.filter((item) => item.daynight?.toUpperCase() === 'N').length;
  const unknownPass = observations.length - dayCount - nightCount;

  return <ModulePage>
    <ModuleHeader
      badge={{ label: 'Datos observados', tone: 'success' }}
      meta={`${observations.length.toLocaleString()} observaciones`}
      icon={Activity}
      title="Analítica Territorial"
      description="Indicadores descriptivos de los registros recibidos del Backend-API, separados por instrumento."
    />

    <div className="flex items-start gap-3 rounded-2xl bg-warning-soft p-4 text-xs text-text-primary">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
      <div className="space-y-1"><p className="font-semibold text-warning">Regla metodológica de armonización:</p><p className="text-[11px] leading-relaxed text-text-secondary">MODIS y VIIRS tienen resoluciones y horarios de observación distintos. Se muestran por separado: más detecciones no significa necesariamente más incendios.</p></div>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Sensor VIIRS (~375 m)" tag="Detecciones" value={viirs.length.toLocaleString()} detail="Conteo de observaciones VIIRS" color="text-sensor-viirs" icon={<Satellite className="h-4 w-4" />} />
      <KpiCard label="Sensor MODIS (~1 km)" tag="Detecciones" value={modis.length.toLocaleString()} detail="Conteo de observaciones MODIS" color="text-sensor-modis" icon={<Satellite className="h-4 w-4" />} />
      <KpiCard label="Índice de Recurrencia" tag="Ordinal" value={hasObservations ? `${recurrenceScore} / 100` : 'No disponible'} detail={hasObservations ? recurrenceLevel : 'Sin observaciones para calcularlo'} color="text-info" icon={<Activity className="h-4 w-4" />} />
      <KpiCard label="FRP promedio / máxima" tag="MW" value={frpValues.length ? `${(frpValues.reduce((sum, value) => sum + value, 0) / frpValues.length).toFixed(1)} / ${maximumFrp} MW` : 'No disponible'} detail={`${frpValues.length} observaciones con FRP disponible`} color="text-danger" icon={<Flame className="h-4 w-4" />} />
    </div>

    <article className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div><h2 className="flex items-center gap-2 font-noto text-base font-bold text-text-primary"><Calendar className="h-4 w-4 text-info" />Distribución temporal mensual</h2><p className="text-xs text-text-secondary">Hasta 12 meses del conjunto cargado · barras separadas por sensor</p></div>
        <div className="flex items-center gap-3 font-source text-xs"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-xs bg-red-500" /><span className="text-text-primary">VIIRS</span></span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-xs bg-yellow-400" /><span className="text-text-primary">MODIS</span></span></div>
      </div>
      <div className="flex h-56 items-end gap-2 border-b border-border pb-2 pt-6">
        {monthly.length ? monthly.map(([month, value]) => <div key={month} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${month}: VIIRS ${value.VIIRS} · MODIS ${value.MODIS}`}>
          <div className="flex h-full w-full items-end justify-center gap-1">
            <span className="w-1/2 max-w-[14px] rounded-t-xs bg-red-500/85" style={{ height: `${Math.max(value.VIIRS ? 3 : 0, (value.VIIRS / maxMonthly) * 100)}%` }} />
            <span className="w-1/2 max-w-[14px] rounded-t-xs bg-yellow-400/85" style={{ height: `${Math.max(value.MODIS ? 3 : 0, (value.MODIS / maxMonthly) * 100)}%` }} />
          </div>
          <span className="mt-1 font-source text-[10px] text-text-secondary">{month}</span>
        </div>) : <div className="flex h-full w-full items-center justify-center text-xs text-text-secondary">Sin meses para graficar.</div>}
      </div>
    </article>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <article className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-noto text-sm font-bold text-text-primary"><Sun className="h-4 w-4 text-accent" />Paso orbital día / noche</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><div className="flex items-center gap-1.5 font-noto text-xs font-semibold text-warning"><Sun className="h-3.5 w-3.5" />Diurno</div><div className="font-source text-2xl font-bold text-text-primary">{dayCount}</div><span className="text-[11px] text-text-secondary">Observaciones con indicador D</span></div>
          <div className="space-y-1"><div className="flex items-center gap-1.5 font-noto text-xs font-semibold text-predictive"><Moon className="h-3.5 w-3.5" />Nocturno</div><div className="font-source text-2xl font-bold text-text-primary">{nightCount}</div><span className="text-[11px] text-text-secondary">Observaciones con indicador N</span></div>
        </div>
        <div className="rounded-lg bg-surface p-2.5 text-[11px] text-text-secondary">{unknownPass > 0 ? `${unknownPass} observaciones no informan el paso orbital y no se asignan a ninguno de los dos grupos.` : 'Todas las observaciones cargadas informan su paso orbital.'}</div>
      </article>

      <article className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-noto text-sm font-bold text-text-primary"><Info className="h-4 w-4 text-info" />Matriz técnica de resolución espacial</h2>
        <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-xs">
          <thead><tr className="border-b border-border font-noto text-[11px] text-text-secondary"><th className="py-2">Sensor</th><th className="py-2">Plataformas</th><th className="py-2">Resolución</th><th className="py-2">Implicación territorial</th></tr></thead>
          <tbody className="divide-y divide-border font-source text-[11px]">
            <tr><td className="py-2 font-bold text-sensor-viirs">VIIRS</td><td className="py-2 text-text-primary">Suomi-NPP, NOAA-20/21</td><td className="py-2 text-text-primary">~375 m</td><td className="py-2 font-sans text-[10px] text-text-secondary">Detecta anomalías térmicas más pequeñas.</td></tr>
            <tr><td className="py-2 font-bold text-sensor-modis">MODIS</td><td className="py-2 text-text-primary">Terra, Aqua</td><td className="py-2 text-text-primary">~1000 m</td><td className="py-2 font-sans text-[10px] text-text-secondary">Serie histórica más larga, menor detalle espacial.</td></tr>
          </tbody>
        </table></div>
      </article>
    </div>

    <article className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-noto text-sm font-bold">Índice de Recurrencia Histórica</h2>
      <p className="text-[11px] text-text-secondary">Nivel ordinal: <span className="font-semibold text-info">{hasObservations ? recurrenceLevel : 'No disponible'}</span></p>
      <div className="h-2 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-accent-solid" style={{ width: `${hasObservations ? recurrenceScore : 0}%` }} /></div>
      <div className="grid grid-cols-3 gap-2 text-center font-source text-[11px] text-text-secondary">
        <span className="rounded-xl border border-border bg-surface p-2"><b className="block text-base text-text-primary">{distinctDays}</b>días activos</span>
        <span className="rounded-xl border border-border bg-surface p-2"><b className="block text-base text-text-primary">{observations.length}</b>observaciones</span>
        <span className="rounded-xl border border-border bg-surface p-2"><b className="block text-base text-text-primary">{maximumFrp ?? '—'}</b>FRP máx. MW</span>
      </div>
      <p className="border-t border-border pt-3 text-[11px] leading-4 text-text-secondary">Este índice resume el conjunto descargado; no es una probabilidad de incendio futuro.</p>
    </article>

    {!hasObservations && <p className="rounded-2xl border border-border bg-card p-4 text-sm text-text-secondary">La consulta no contiene observaciones para resumir.</p>}
    <ProvenanceNote provenance={provenance}>El análisis cubre {observations.length} registros cargados de {totalMatching} coincidentes; sus resultados dependen del límite de consulta.</ProvenanceNote>
  </ModulePage>;
}

function KpiCard({ label, tag, value, detail, color, icon }: { label: string; tag: string; value: string; detail: string; color: string; icon: ReactNode }) {
  return <article className="relative space-y-2 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm">
    <div className="flex items-center justify-between text-xs text-text-secondary"><span className="font-source">{label}</span><span className={`flex items-center gap-1 font-source text-[10px] font-semibold ${color}`}>{tag}{icon}</span></div>
    <p className={`font-source text-3xl font-extrabold ${color}`}>{value}</p>
    <span className="block text-[11px] text-text-secondary">{detail}</span>
  </article>;
}
