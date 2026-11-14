import { Activity, AlertTriangle, Flame, Satellite } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Observation } from '@/types/api/observations';

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

  return <section className="mx-auto w-full max-w-[1440px] space-y-5 p-4 text-slate-100 sm:p-6">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">Observaciones del conjunto consultado</p><h1 className="mt-1 flex items-center gap-2 text-xl font-semibold"><Activity className="h-5 w-5 text-amber-400" />Analítica</h1><p className="mt-1 text-xs text-slate-400">Indicadores descriptivos de los registros recibidos del Backend-API.</p></div><span className="rounded-lg border border-slate-700 bg-[#101827] px-3 py-2 font-mono text-[10px] text-slate-300">{observations.length.toLocaleString()} observaciones</span></header>
    <div className="flex items-start gap-3 rounded-xl border border-amber-800/50 bg-amber-950/20 p-3 text-xs leading-5 text-amber-100/90"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /><p>MODIS y VIIRS tienen resoluciones y horarios de observación distintos. Se muestran por separado: más detecciones no significa necesariamente más incendios.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Detecciones VIIRS" value={viirs.length.toLocaleString()} detail="Conteo de observaciones VIIRS" color="text-red-400" icon={<Satellite className="h-4 w-4" />} />
      <KpiCard label="Detecciones MODIS" value={modis.length.toLocaleString()} detail="Conteo de observaciones MODIS" color="text-yellow-300" icon={<Satellite className="h-4 w-4" />} />
      <KpiCard label="Índice de Recurrencia" value={hasObservations ? `${recurrenceScore} / 100` : 'No disponible'} detail={hasObservations ? recurrenceLevel : 'Sin observaciones para calcularlo'} color="text-amber-300" icon={<Activity className="h-4 w-4" />} />
      <KpiCard label="FRP promedio / máxima" value={frpValues.length ? `${(frpValues.reduce((sum, value) => sum + value, 0) / frpValues.length).toFixed(1)} / ${maximumFrp} MW` : 'No disponible'} detail={`${frpValues.length} observaciones con FRP disponible`} color="text-orange-300" icon={<Flame className="h-4 w-4" />} />
    </div>
    <article className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-5"><h2 className="text-sm font-semibold">Índice de Recurrencia Histórica</h2><p className="mt-1 text-[10px] text-slate-500">Nivel ordinal: <span className="text-amber-300">{hasObservations ? recurrenceLevel : 'No disponible'}</span></p><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${hasObservations ? recurrenceScore : 0}%` }} /></div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-[9px] text-slate-500"><span><b className="block text-slate-200">{distinctDays}</b>días activos</span><span><b className="block text-slate-200">{observations.length}</b>observaciones</span><span><b className="block text-slate-200">{maximumFrp ?? '—'}</b>FRP máx. MW</span></div><p className="mt-4 border-t border-slate-800 pt-3 text-[10px] leading-4 text-slate-400">Este índice resume el conjunto descargado; no es una probabilidad de incendio futuro.</p></article>
    <p className="text-[10px] leading-4 text-slate-500">Procedencia: {provenance === 'synthetic_demo' ? 'Datos sintéticos de demostración; no son observaciones reales de NASA' : provenance}. El análisis cubre {observations.length} registros cargados de {totalMatching} coincidentes; sus resultados dependen del límite de consulta.</p>
    {!hasObservations && <p className="rounded-xl border border-slate-800 bg-[#0b1220] p-4 text-sm text-slate-400">La consulta no contiene observaciones para resumir.</p>}
  </section>;
}

function KpiCard({ label, value, detail, color, icon }: { label: string; value: string; detail: string; color: string; icon: ReactNode }) {
  return <article className="rounded-xl border border-slate-800 bg-[#0b1220] p-4"><div className="flex items-center justify-between text-[10px] text-slate-400"><span>{label}</span><span className={color}>{icon}</span></div><p className={`mt-3 font-mono text-xl font-bold ${color}`}>{value}</p><p className="mt-1 text-[9px] text-slate-500">{detail}</p></article>;
}
