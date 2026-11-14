import { Activity, AlertTriangle, CalendarDays, Flame, Satellite } from 'lucide-react';
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
  const monthlyMap = new Map<string, { viirs: number; modis: number }>();
  for (const item of observations) {
    const month = item.acquired_at.slice(0, 7);
    const counts = monthlyMap.get(month) ?? { viirs: 0, modis: 0 };
    counts[item.sensor === 'VIIRS' ? 'viirs' : 'modis'] += 1;
    monthlyMap.set(month, counts);
  }
  const monthly = [...monthlyMap.entries()].sort(([left], [right]) => left.localeCompare(right)).slice(-12).map(([key, counts]) => ({
    key,
    label: new Intl.DateTimeFormat('es', { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(new Date(`${key}-01T00:00:00Z`)),
    ...counts,
  }));
  const maxMonthly = Math.max(1, ...monthly.flatMap((item) => [item.viirs, item.modis]));
  const dailyMap = new Map<string, { viirs: number; modis: number; frpCount: number; frpTotal: number; frpMaximum: number | null }>();
  for (const item of observations) {
    const day = item.acquired_at.slice(0, 10);
    const summary = dailyMap.get(day) ?? { viirs: 0, modis: 0, frpCount: 0, frpTotal: 0, frpMaximum: null };
    summary[item.sensor === 'VIIRS' ? 'viirs' : 'modis'] += 1;
    if (item.frp_mw !== null) {
      summary.frpCount += 1;
      summary.frpTotal += item.frp_mw;
      summary.frpMaximum = Math.max(summary.frpMaximum ?? item.frp_mw, item.frp_mw);
    }
    dailyMap.set(day, summary);
  }
  const daily = [...dailyMap.entries()].sort(([left], [right]) => right.localeCompare(left)).slice(0, 14);
  const maxDaily = Math.max(1, ...daily.map(([, value]) => value.viirs + value.modis));

  return (
    <section className="mx-auto w-full max-w-[1440px] space-y-5 p-4 text-slate-100 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">Observaciones del conjunto consultado</p><h1 className="mt-1 flex items-center gap-2 text-xl font-semibold"><Activity className="h-5 w-5 text-amber-400" />Analítica &amp; Tiempos</h1><p className="mt-1 text-xs text-slate-400">Conteos y resumen descriptivo de registros recibidos del Backend-API.</p></div>
        <span className="rounded-lg border border-slate-700 bg-[#101827] px-3 py-2 font-mono text-[10px] text-slate-300">{observations.length.toLocaleString()} observaciones</span>
      </div>
      <div className="flex items-start gap-3 rounded-xl border border-amber-800/50 bg-amber-950/20 p-3 text-xs leading-5 text-amber-100/90"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /><p>MODIS y VIIRS tienen resoluciones y horarios de observación distintos. Se muestran por separado: más detecciones no significa necesariamente más incendios.</p></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Detecciones VIIRS" value={viirs.length.toLocaleString()} detail="Conteo de observaciones VIIRS" color="text-red-400" icon={<Satellite className="h-4 w-4" />} />
        <KpiCard label="Detecciones MODIS" value={modis.length.toLocaleString()} detail="Conteo de observaciones MODIS" color="text-yellow-300" icon={<Satellite className="h-4 w-4" />} />
        <KpiCard label="Índice de Recurrencia" value={hasObservations ? `${recurrenceScore} / 100` : 'No disponible'} detail={hasObservations ? recurrenceLevel : 'Sin observaciones para calcularlo'} color="text-amber-300" icon={<Activity className="h-4 w-4" />} />
        <KpiCard label="FRP promedio / máxima" value={frpValues.length ? `${(frpValues.reduce((sum, value) => sum + value, 0) / frpValues.length).toFixed(1)} / ${maximumFrp} MW` : 'No disponible'} detail={`${frpValues.length} observaciones con FRP disponible`} color="text-orange-300" icon={<Flame className="h-4 w-4" />} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <article className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Distribución mensual</h2><p className="mt-1 text-[10px] text-slate-500">Conteos separados por instrumento · UTC</p></div><div className="flex gap-3 text-[10px]"><span className="text-red-400">● VIIRS</span><span className="text-yellow-300">● MODIS</span></div></div>
          <div className="mt-5 grid h-48 grid-cols-12 items-end gap-1 border-b border-l border-slate-700 px-1 sm:gap-2">
            {monthly.map((item) => <div key={item.key} className="flex h-full min-w-0 flex-col items-center justify-end gap-1"><div className="flex h-[88%] w-full items-end justify-center gap-0.5"><div title={`VIIRS: ${item.viirs}`} className="w-1/2 rounded-t-sm bg-red-500/80" style={{ height: `${Math.max(item.viirs ? 4 : 0, (item.viirs / maxMonthly) * 100)}%` }} /><div title={`MODIS: ${item.modis}`} className="w-1/2 rounded-t-sm bg-yellow-400/80" style={{ height: `${Math.max(item.modis ? 4 : 0, (item.modis / maxMonthly) * 100)}%` }} /></div><span className="pb-1 text-[8px] uppercase text-slate-500 sm:text-[9px]">{item.label}</span></div>)}
          </div>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-5"><h2 className="text-sm font-semibold">Índice de Recurrencia Histórica</h2><p className="mt-1 text-[10px] text-slate-500">Nivel ordinal: <span className="text-amber-300">{hasObservations ? recurrenceLevel : 'No disponible'}</span></p><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${hasObservations ? recurrenceScore : 0}%` }} /></div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-[9px] text-slate-500"><span><b className="block text-slate-200">{distinctDays}</b>días activos</span><span><b className="block text-slate-200">{observations.length}</b>detecciones</span><span><b className="block text-slate-200">{maximumFrp ?? '—'}</b>FRP máx. MW</span></div><p className="mt-4 border-t border-slate-800 pt-3 text-[10px] leading-4 text-slate-400">Este índice resume el conjunto descargado; no es una probabilidad de incendio futuro.</p></article>
      </div>
      <article className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-5">
        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-cyan-300" /><div><h2 className="text-sm font-semibold">Calendario de actividad</h2><p className="mt-1 text-[10px] text-slate-500">Últimos 14 días con observaciones en los registros cargados · UTC</p></div></div>
        {daily.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-[10px]"><thead className="text-slate-500"><tr><th className="px-2 py-2 font-medium">Fecha (UTC)</th><th className="px-2 py-2 font-medium text-red-300">VIIRS</th><th className="px-2 py-2 font-medium text-yellow-200">MODIS</th><th className="px-2 py-2 font-medium">Actividad</th><th className="px-2 py-2 font-medium">FRP promedio</th><th className="px-2 py-2 font-medium">FRP máxima</th></tr></thead><tbody>{daily.map(([date, summary]) => { const count = summary.viirs + summary.modis; return <tr key={date} className="border-t border-slate-800"><th scope="row" className="whitespace-nowrap px-2 py-2 font-mono font-medium text-slate-300">{date}</th><td className="px-2 py-2 text-red-300">{summary.viirs}</td><td className="px-2 py-2 text-yellow-200">{summary.modis}</td><td className="px-2 py-2"><div className="flex h-2 min-w-24 overflow-hidden rounded-full bg-slate-800" aria-label={`${count} observaciones`}><span className="bg-red-500" style={{ width: `${(summary.viirs / maxDaily) * 100}%` }} /><span className="bg-yellow-400" style={{ width: `${(summary.modis / maxDaily) * 100}%` }} /></div></td><td className="px-2 py-2 text-slate-300">{summary.frpCount ? `${(summary.frpTotal / summary.frpCount).toFixed(1)} MW` : 'No disponible'}</td><td className="px-2 py-2 text-slate-300">{summary.frpMaximum === null ? 'No disponible' : `${summary.frpMaximum} MW`}</td></tr>; })}</tbody></table></div> : <p className="mt-4 rounded-lg border border-slate-800 bg-[#080d17] p-3 text-xs text-slate-400">Sin días con observaciones en el conjunto cargado.</p>}
        <p className="mt-3 text-[9px] leading-4 text-slate-500">Los días sin registros no se interpretan como ausencia de incendios. El calendario resume únicamente el conjunto recibido, que puede estar truncado.</p>
      </article>
      <p className="text-[10px] leading-4 text-slate-500">Procedencia: {provenance === 'synthetic_demo' ? 'Datos sintéticos de demostración; no son observaciones reales de NASA' : provenance}. El análisis cubre {observations.length} registros cargados de {totalMatching} coincidentes; sus resultados dependen del límite de consulta.</p>
      {observations.length === 0 && <p className="rounded-xl border border-slate-800 bg-[#0b1220] p-4 text-sm text-slate-400">La consulta no contiene observaciones para resumir.</p>}
    </section>
  );
}

function KpiCard({ label, value, detail, color, icon }: { label: string; value: string; detail: string; color: string; icon: ReactNode }) {
  return <article className="rounded-xl border border-slate-800 bg-[#0b1220] p-4"><div className="flex items-center justify-between text-[10px] text-slate-400"><span>{label}</span><span className={color}>{icon}</span></div><p className={`mt-3 font-mono text-xl font-bold ${color}`}>{value}</p><p className="mt-1 text-[9px] text-slate-500">{detail}</p></article>;
}
