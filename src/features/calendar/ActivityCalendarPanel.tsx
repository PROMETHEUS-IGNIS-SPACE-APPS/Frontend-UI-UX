import { useMemo } from 'react';
import { CalendarDays, ChevronRight } from 'lucide-react';
import type { Observation } from '@/types/api/observations';

interface ActivityCalendarPanelProps {
  observations: Observation[];
  totalMatching: number;
  provenance: string;
  onSelectDate: (date: string) => void;
}

export default function ActivityCalendarPanel({ observations, totalMatching, provenance, onSelectDate }: ActivityCalendarPanelProps) {
  const { monthly, daily } = useMemo(() => {
    const months = new Map<string, { VIIRS: number; MODIS: number }>();
    const days = new Map<string, { VIIRS: number; MODIS: number; frpTotal: number; frpCount: number; frpMaximum: number | null }>();
    for (const observation of observations) {
      const month = observation.acquired_at.slice(0, 7);
      const monthCounts = months.get(month) ?? { VIIRS: 0, MODIS: 0 };
      monthCounts[observation.sensor] += 1;
      months.set(month, monthCounts);

      const date = observation.acquired_at.slice(0, 10);
      const day = days.get(date) ?? { VIIRS: 0, MODIS: 0, frpTotal: 0, frpCount: 0, frpMaximum: null };
      day[observation.sensor] += 1;
      if (observation.frp_mw !== null) {
        day.frpTotal += observation.frp_mw;
        day.frpCount += 1;
        day.frpMaximum = Math.max(day.frpMaximum ?? observation.frp_mw, observation.frp_mw);
      }
      days.set(date, day);
    }

    return {
      monthly: [...months.entries()].sort(([left], [right]) => left.localeCompare(right)).slice(-12),
      daily: [...days.entries()].sort(([left], [right]) => right.localeCompare(left)).slice(0, 14),
    };
  }, [observations]);
  const maxMonthly = Math.max(1, ...monthly.flatMap(([, count]) => [count.VIIRS, count.MODIS]));

  return <section className="mx-auto w-full max-w-[1440px] space-y-5 p-4 text-slate-100 sm:p-6">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-4">
      <div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300">Resumen temporal del conjunto cargado</p><h1 className="mt-1 flex items-center gap-2 text-xl font-semibold"><CalendarDays className="h-5 w-5 text-amber-400" />Calendario de actividad</h1><p className="mt-1 text-xs text-slate-400">Observaciones agregadas por fecha UTC, sin combinar instrumentos.</p></div>
      <span className="rounded-lg border border-slate-700 bg-[#101827] px-3 py-2 font-mono text-[10px] text-slate-300">{daily.length} días con observaciones</span>
    </header>
    <div className="flex items-start gap-3 rounded-xl border border-cyan-900/60 bg-cyan-950/20 p-3 text-xs leading-5 text-cyan-100/90"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" /><p>El calendario resume únicamente registros recibidos. Un día sin observaciones en este conjunto no prueba ausencia de incendios; la consulta puede estar truncada.</p></div>
    <article className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Frecuencia mensual</h2><p className="mt-1 text-[10px] text-slate-500">Hasta 12 meses disponibles · conteos por instrumento</p></div><div className="flex gap-3 text-[10px]"><span className="text-red-400">● VIIRS</span><span className="text-yellow-300">● MODIS</span></div></div>
      {monthly.length ? <div className="mt-5 grid min-h-48 grid-cols-3 items-end gap-3 border-b border-l border-slate-700 px-2 sm:grid-cols-6 lg:grid-cols-12">{monthly.map(([month, count]) => <div key={month} className="flex h-48 min-w-0 flex-col items-center justify-end gap-1"><div className="flex h-[86%] w-full items-end justify-center gap-1"><span title={`VIIRS: ${count.VIIRS}`} className="w-1/2 rounded-t-sm bg-red-500/80" style={{ height: `${Math.max(count.VIIRS ? 4 : 0, (count.VIIRS / maxMonthly) * 100)}%` }} /><span title={`MODIS: ${count.MODIS}`} className="w-1/2 rounded-t-sm bg-yellow-400/80" style={{ height: `${Math.max(count.MODIS ? 4 : 0, (count.MODIS / maxMonthly) * 100)}%` }} /></div><span className="pb-1 text-[8px] uppercase text-slate-500 sm:text-[9px]">{new Intl.DateTimeFormat('es', { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`))}</span></div>)}</div> : <p className="mt-4 rounded-lg border border-slate-800 bg-[#080d17] p-4 text-xs text-slate-400">No hay fechas para resumir en la consulta.</p>}
    </article>
    <article className="rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-5">
      <div><h2 className="text-sm font-semibold">Actividad diaria</h2><p className="mt-1 text-[10px] text-slate-500">Selecciona una fecha para verla en el mapa.</p></div>
      {daily.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-[10px]"><thead className="text-slate-500"><tr><th className="px-2 py-2 font-medium">Fecha UTC</th><th className="px-2 py-2 font-medium text-red-300">VIIRS</th><th className="px-2 py-2 font-medium text-yellow-200">MODIS</th><th className="px-2 py-2 font-medium">FRP promedio</th><th className="px-2 py-2 font-medium">FRP máxima</th><th><span className="sr-only">Acción</span></th></tr></thead><tbody>{daily.map(([date, summary]) => <tr key={date} className="border-t border-slate-800"><th scope="row" className="whitespace-nowrap px-2 py-2 font-mono font-medium text-slate-300">{date}</th><td className="px-2 py-2 text-red-300">{summary.VIIRS}</td><td className="px-2 py-2 text-yellow-200">{summary.MODIS}</td><td className="px-2 py-2 text-slate-300">{summary.frpCount ? `${(summary.frpTotal / summary.frpCount).toFixed(1)} MW` : 'No disponible'}</td><td className="px-2 py-2 text-slate-300">{summary.frpMaximum === null ? 'No disponible' : `${summary.frpMaximum} MW`}</td><td className="px-2 py-2"><button type="button" onClick={() => onSelectDate(date)} className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-cyan-200 hover:border-cyan-700 hover:bg-cyan-950/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">Ver mapa<ChevronRight className="h-3 w-3" /></button></td></tr>)}</tbody></table></div> : <p className="mt-4 rounded-lg border border-slate-800 bg-[#080d17] p-4 text-xs text-slate-400">Sin observaciones en el conjunto cargado.</p>}
    </article>
    <p className="text-[10px] leading-4 text-slate-500">Procedencia: {provenance === 'synthetic_demo' ? 'Datos sintéticos de demostración; no son observaciones reales de NASA' : provenance}. {observations.length} registros cargados de {totalMatching} coincidentes. FRP nula se mantiene como no disponible.</p>
  </section>;
}
