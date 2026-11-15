import { useMemo, useState } from 'react';
import { CalendarDays, Filter, Info } from 'lucide-react';
import SubregionLineChart from '@/components/charts/SubregionLineChart';
import { MONTHS_FULL, SUBREGIONS, computeSubregionMatrix, resolveSubregion, type SubregionId } from '@/utils/subregions';
import { runMarkovEngine } from '@/utils/markovEngine';
import type { Observation } from '@/types/api/observations';
import { ModuleHeader, ModulePage } from '@/components/common/ModuleLayout';
import { AiInterpretButton, AiInterpretationPanel } from '@/components/common/AiInterpretation';
import { useAiInterpretation } from '@/hooks/useAiInterpretation';

interface ActivityCalendarPanelProps {
  observations: Observation[];
  totalMatching: number;
  provenance: string;
  onSelectDate: (date: string) => void;
}

interface DaySummary { VIIRS: number; MODIS: number; highFrp: number; frpTotal: number; frpCount: number; frpMaximum: number | null }

export default function ActivityCalendarPanel({ observations, totalMatching, provenance, onSelectDate }: ActivityCalendarPanelProps) {
  const { monthly, daily } = useMemo(() => {
    const months = new Map<string, { VIIRS: number; MODIS: number }>();
    const days = new Map<string, DaySummary>();
    for (const observation of observations) {
      const month = observation.acquired_at.slice(0, 7);
      const monthCounts = months.get(month) ?? { VIIRS: 0, MODIS: 0 };
      monthCounts[observation.sensor] += 1;
      months.set(month, monthCounts);

      const date = observation.acquired_at.slice(0, 10);
      const day = days.get(date) ?? { VIIRS: 0, MODIS: 0, highFrp: 0, frpTotal: 0, frpCount: 0, frpMaximum: null };
      day[observation.sensor] += 1;
      if (observation.frp_mw !== null) {
        day.frpTotal += observation.frp_mw;
        day.frpCount += 1;
        day.frpMaximum = Math.max(day.frpMaximum ?? observation.frp_mw, observation.frp_mw);
        if (observation.frp_mw >= 30) day.highFrp += 1;
      }
      days.set(date, day);
    }

    return {
      monthly: [...months.entries()].sort(([left], [right]) => left.localeCompare(right)).slice(-12),
      daily: [...days.entries()].sort(([left], [right]) => right.localeCompare(left)).slice(0, 16),
    };
  }, [observations]);
  const maxMonthly = Math.max(1, ...monthly.flatMap(([, count]) => [count.VIIRS, count.MODIS]));
  const maxDaily = Math.max(1, ...daily.map(([, day]) => day.VIIRS + day.MODIS));
  const matrix = useMemo(() => computeSubregionMatrix(observations), [observations]);
  const [selectedSubregions, setSelectedSubregions] = useState<SubregionId[]>(SUBREGIONS.map((sub) => sub.id));
  const allSelected = selectedSubregions.length === SUBREGIONS.length;
  const visibleSubregions = SUBREGIONS.filter((sub) => selectedSubregions.includes(sub.id));
  const toggleSubregion = (id: SubregionId) => setSelectedSubregions((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const insights = useMemo(() => {
    const ranked = visibleSubregions.map((sub) => ({ sub, total: matrix.totals[sub.id] })).sort((a, b) => b.total - a.total);
    const monthTotals = Array.from({ length: 12 }, (_, month) => visibleSubregions.reduce((sum, sub) => sum + matrix.counts[sub.id][month], 0));
    const peakMonthFoci = Math.max(0, ...monthTotals);
    const intensity = visibleSubregions
      .flatMap((sub) => { const avg = matrix.overallAvgFrp[sub.id]; return avg === null ? [] : [{ sub, avg }]; })
      .sort((a, b) => b.avg - a.avg)[0] ?? null;
    const withData = ranked.filter((item) => item.total > 0);
    const peakOf = (id: SubregionId) => { const counts = matrix.counts[id]; const max = Math.max(...counts); return max > 0 ? MONTHS_FULL[counts.indexOf(max)] : null; };
    return {
      leader: ranked[0]?.total ? ranked[0] : null,
      top: withData.slice(0, 2).map((item) => ({ ...item, peak: peakOf(item.sub.id) })),
      middle: withData.slice(2, 4),
      rest: withData.slice(4),
      peakMonth: peakMonthFoci > 0 ? { name: MONTHS_FULL[monthTotals.indexOf(peakMonthFoci)], foci: peakMonthFoci } : null,
      intensity,
    };
  }, [matrix, visibleSubregions]);
  /** Cruce con la estimación exploratoria de Predictibilidad (misma función, mismos datos). */
  const markov = useMemo(() => {
    const result = runMarkovEngine(observations);
    if (result.status === 'insufficient' || !result.horizons.length) return null;
    const topCell = result.cells
      .map((cell) => ({ cell, sub: SUBREGIONS.find((item) => item.id === resolveSubregion({ municipality: cell.municipality, department: cell.department })) }))
      .filter((item) => item.sub && selectedSubregions.includes(item.sub.id))
      .sort((a, b) => b.cell.p24 - a.cell.p24)[0] ?? null;
    return { regional: result.horizons[0].activity, topCell, validated: result.validation !== null, beatsClimatology: (result.validation?.brierSkillPct ?? -1) > 0 };
  }, [observations, selectedSubregions]);

  const ai = useAiInterpretation('calendar');
  const buildAiPayload = () => ({
    procedencia: provenance,
    registrosCargados: observations.length,
    registrosQueCoincidenEnLaFuente: totalMatching,
    registrosClasificadosEnSubregiones: matrix.classifiedCount,
    meses: MONTHS_FULL,
    calendarMatrices: visibleSubregions.map((sub) => ({
      subregion: sub.label,
      frecuenciaPorMes: matrix.counts[sub.id],
      frpPromedioMwPorMes: matrix.avgFrp[sub.id].map((value) => (value === null ? null : Math.round(value * 10) / 10)),
      total: matrix.totals[sub.id],
      frpPromedioMwGeneral: matrix.overallAvgFrp[sub.id] === null ? null : Math.round((matrix.overallAvgFrp[sub.id] as number) * 10) / 10,
    })),
    subregionCrossRisk: markov ? {
      markovPActividad24hRegional: Math.round(markov.regional * 10_000) / 10_000,
      validado: markov.validated,
      superaClimatologia: markov.beatsClimatology,
      celdaMayorP24h: markov.topCell ? { subregion: markov.topCell.sub?.label ?? null, municipio: markov.topCell.cell.municipality, p24: Math.round(markov.topCell.cell.p24 * 10_000) / 10_000 } : null,
    } : 'historial insuficiente para la estimación Markov',
  });

  return <ModulePage>
    <ModuleHeader
      actions={<AiInterpretButton ai={ai} buildPayload={buildAiPayload} disabled={matrix.classifiedCount === 0} />}
      badge={{ label: 'Calendario real (IDEAM / FIRMS)', tone: 'success' }}
      meta={`${matrix.classifiedCount.toLocaleString()} registros clasificados en Antioquia`}
      icon={CalendarDays}
      title="Calendario Estacional y Dinámica Térmica Subregional"
      description="Observaciones agregadas por mes del año y por subregión de Antioquia, sin combinar con predicciones."
    />
    <AiInterpretationPanel ai={ai} />

    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar subregiones">
          {SUBREGIONS.map((sub) => {
            const isActive = selectedSubregions.includes(sub.id);
            return <button key={sub.id} type="button" onClick={() => toggleSubregion(sub.id)} aria-pressed={isActive} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 font-noto text-xs transition-all ${isActive ? 'bg-text-primary/[0.08] font-bold text-text-primary' : 'font-semibold text-text-secondary opacity-60 hover:bg-text-primary/[0.05] hover:opacity-100'}`}><span className={`h-2 w-2 shrink-0 rounded-full ${sub.dotClass}`} />{sub.label}</button>;
          })}
        </div>
        <button type="button" onClick={() => setSelectedSubregions(SUBREGIONS.map((sub) => sub.id))} aria-pressed={allSelected} className={`ml-auto whitespace-nowrap rounded-full border px-3.5 py-1.5 font-noto text-xs font-bold transition-colors ${allSelected ? 'border-accent bg-accent-solid text-accent-fg' : 'border-border-strong bg-surface text-text-primary hover:bg-surface-hover'}`}>Todas</button>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <SubregionLineChart title="Frecuencia de observaciones por zona y mes" badge="Total observaciones" series={visibleSubregions.map((sub) => ({ subregion: sub, values: matrix.counts[sub.id] }))} showArea unit="obs." />
      <SubregionLineChart title="Intensidad térmica promedio por zona (FRP)" badge="FRP promedio (MW)" series={visibleSubregions.map((sub) => ({ subregion: sub, values: matrix.avgFrp[sub.id] }))} unit="MW" decimals={1} />
    </div>


    <div className="flex items-start gap-3 text-xs text-text-primary">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
      <p className="leading-relaxed">El calendario resume únicamente registros recibidos. Un día sin observaciones en este conjunto no prueba ausencia de incendios; la consulta puede estar truncada.</p>
    </div>

    <article className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div><h2 className="font-noto text-sm font-bold text-text-primary">Frecuencia mensual</h2><p className="mt-0.5 font-source text-[11px] text-text-secondary">Hasta 12 meses disponibles · conteos por instrumento</p></div>
        <div className="flex gap-3 font-source text-[11px] font-bold"><span className="text-sensor-viirs">● VIIRS</span><span className="text-sensor-modis">● MODIS</span></div>
      </div>
      {monthly.length ? <div className="grid min-h-48 grid-cols-3 items-end gap-3 border-b border-l border-border-strong px-2 sm:grid-cols-6 lg:grid-cols-12">{monthly.map(([month, count]) => <div key={month} className="flex h-48 min-w-0 flex-col items-center justify-end gap-1"><div className="flex h-[86%] w-full items-end justify-center gap-1"><span title={`VIIRS: ${count.VIIRS}`} className="w-1/2 rounded-t-sm bg-red-500/80" style={{ height: `${Math.max(count.VIIRS ? 4 : 0, (count.VIIRS / maxMonthly) * 100)}%` }} /><span title={`MODIS: ${count.MODIS}`} className="w-1/2 rounded-t-sm bg-yellow-400/80" style={{ height: `${Math.max(count.MODIS ? 4 : 0, (count.MODIS / maxMonthly) * 100)}%` }} /></div><span className="pb-1 font-source text-[10px] uppercase text-text-secondary">{new Intl.DateTimeFormat('es', { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`))}</span></div>)}</div> : <p className="rounded-xl border border-border bg-surface p-4 text-xs text-text-secondary">No hay fechas para resumir en la consulta.</p>}
    </article>

    {daily.length ? <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {daily.map(([date, day]) => {
        const total = day.VIIRS + day.MODIS;
        return <article key={date} className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-accent">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-source text-sm font-bold text-text-primary">{date}</span>
            <span className="rounded-lg border border-accent/30 bg-accent-soft px-2 py-0.5 font-source text-xs font-bold text-accent">{total} reg.</span>
          </div>
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div style={{ width: `${Math.max(8, Math.round((total / maxDaily) * 100))}%` }} className={`h-full rounded-full ${day.highFrp > 0 ? 'bg-danger' : 'bg-accent-solid'}`} />
          </div>
          <dl className="grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-surface p-2.5 font-source text-[11px]">
            <div className="flex items-center justify-between"><dt className="font-semibold text-sensor-viirs">VIIRS:</dt><dd className="font-bold text-text-primary">{day.VIIRS}</dd></div>
            <div className="flex items-center justify-between"><dt className="font-semibold text-sensor-modis">MODIS:</dt><dd className="font-bold text-text-primary">{day.MODIS}</dd></div>
            <div className="flex items-center justify-between"><dt className="font-semibold text-danger">FRP≥30:</dt><dd className="font-bold text-text-primary">{day.highFrp}</dd></div>
            <div className="col-span-2 flex items-center justify-between"><dt className="font-semibold text-info">FRP promedio:</dt><dd className="font-bold text-text-primary">{day.frpCount ? `${(day.frpTotal / day.frpCount).toFixed(1)} MW` : 'No disponible'}</dd></div>
          </dl>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-text-secondary">
            <span>Max FRP: <strong className="text-text-primary">{day.frpMaximum === null ? 'No disponible' : `${day.frpMaximum} MW`}</strong></span>
            <button type="button" onClick={() => onSelectDate(date)} className="flex items-center gap-1 rounded font-semibold text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><Filter className="h-3 w-3" aria-hidden />Ver mapa</button>
          </div>
        </article>;
      })}
    </div> : <div className="space-y-2 rounded-2xl border border-border bg-card p-10 text-center shadow-sm"><CalendarDays className="mx-auto h-8 w-8 text-text-secondary" /><p className="text-sm font-bold text-text-primary">Sin observaciones en el conjunto cargado</p><p className="text-xs text-text-secondary">Ajusta el rango de fechas o la fuente desde el panel lateral del Mapa.</p></div>}

    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-success/40 bg-success-soft px-2.5 py-0.5 font-source text-[11px] font-bold uppercase text-success">Calendario real (IDEAM / FIRMS)</span>
        <span className="font-source text-xs tabular-nums text-text-secondary">{matrix.classifiedCount.toLocaleString()} registros clasificados en Antioquia · {observations.length.toLocaleString()} cargados de {totalMatching.toLocaleString()} coincidentes · {provenance === 'synthetic_demo' ? 'datos sintéticos de demostración' : provenance}</span>
      </div>

      <article className="space-y-3 rounded-2xl border border-border bg-card p-4 text-xs leading-relaxed shadow-sm sm:p-6">
        <h2 className="flex items-center gap-2 font-noto text-sm font-bold text-text-primary"><Info className="h-4 w-4 shrink-0 text-info" aria-hidden />Interpretación Científica:</h2>
        {insights.leader ? <>
          <p className="text-text-secondary">
            La distribución mensual de anomalías térmicas registradas en Antioquia muestra diferencias claras entre subregiones.{' '}
            {insights.top.map((item, index) => <span key={item.sub.id}>{index > 0 && ' y '}<strong className="text-text-primary">{item.sub.label}</strong></span>)}{' '}
            {insights.top.length > 1 ? 'concentran' : 'concentra'} la mayor cantidad de observaciones del conjunto cargado
            ({insights.top.map((item) => `${item.total.toLocaleString()}${item.peak ? ` con pico en ${item.peak}` : ''}`).join(' y ')}).
          </p>
          <p className="text-text-secondary">
            {insights.middle.length > 0 && <>En contraste, {insights.middle.map((item, index) => <span key={item.sub.id}>{index > 0 && ' y '}<strong className="text-text-primary">{item.sub.label}</strong> ({item.total.toLocaleString()})</span>)} registran una actividad intermedia</>}
            {insights.rest.length > 0 && <>, mientras {insights.rest.map((item, index) => <span key={item.sub.id}>{index > 0 && (index === insights.rest.length - 1 ? ' y ' : ', ')}<strong className="text-text-primary">{item.sub.label}</strong> ({item.total.toLocaleString()})</span>)} {insights.rest.length > 1 ? 'presentan' : 'presenta'} menos observaciones</>}
            {(insights.middle.length > 0 || insights.rest.length > 0) && '. '}
            {insights.peakMonth && <>En la selección activa, el mes con más registros es <strong className="text-info">{insights.peakMonth.name}</strong> ({insights.peakMonth.foci.toLocaleString()} observaciones)</>}
            {insights.intensity && <> y la intensidad térmica promedio más alta la tiene <strong className="text-accent">{insights.intensity.sub.label}</strong> ({insights.intensity.avg.toFixed(1)} MW)</>}.
            {markov && <> En cruce con la estimación exploratoria Markov 3×3 (+24 h), la probabilidad regional de actividad es <strong className="text-predictive">{(markov.regional * 100).toFixed(1)}%</strong>{markov.topCell && markov.topCell.sub && <>, con la celda más alta en <strong className="text-accent">{markov.topCell.sub.label}</strong> ({(markov.topCell.cell.p24 * 100).toFixed(1)}%)</>}{markov.validated ? (markov.beatsClimatology ? '; en la validación retrospectiva supera a la climatología.' : '; en la validación retrospectiva todavía no supera a la climatología.') : '; aún no hay días suficientes para validarla.'}</>}
          </p>
        </> : <p className="text-text-secondary">No hay observaciones clasificadas en las subregiones seleccionadas.</p>}
        <p className="border-t border-border pt-3 text-[11px] text-text-secondary">Los meses agregan todos los años cargados. La subregión se deriva del municipio de referencia que asigna el Backend-API por cercanía, así que es aproximada.{matrix.unclassifiedAntioquiaCount > 0 && ` ${matrix.unclassifiedAntioquiaCount.toLocaleString()} observaciones de Antioquia quedan fuera de estas seis agrupaciones (por ejemplo, Oriente).`} Un mes sin registros no prueba ausencia de incendios. FRP nula se mantiene como no disponible.</p>
      </article>
    </div>
  </ModulePage>;
}
