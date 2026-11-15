import { useMemo, useState } from 'react';
import { AlertTriangle, MapPin, Radar } from 'lucide-react';
import type { CentinelaForecast } from '@/types/api/centinela';
import { CENTINELA_UNKNOWN, cellCenter, cellName, intervalText, pctOrUnknown, productLabel, useCentinelaModel } from './centinelaFormat';

interface AlarmitaCentinelaPanelProps {
  /** Lleva al Mapa centrado en [lon, lat]. */
  onShowCell?: (center: [number, number]) => void;
}

const CARD = 'rounded-2xl border border-border bg-card shadow-sm';
const TABLE_PAGE = 12;

/**
 * Alarmita CENTINELA (como en la carpeta `ejemplo`): probabilidades reales del
 * modelo CENTINELA publicado por el AI-Pipeline, por sensor y celda de 0,25°.
 * Solo muestra campos que el artefacto contiene; lo que no publica queda como
 * «Datos insuficientes» (no hay probabilidad de incendio 24 h ni índices de impacto).
 */
export default function AlarmitaCentinelaPanel({ onShowCell }: AlarmitaCentinelaPanelProps) {
  const model = useCentinelaModel();
  const [cellId, setCellId] = useState('');
  const [showAll, setShowAll] = useState(false);
  const forecasts = useMemo(() => model.data?.forecasts ?? [], [model.data]);
  // Una entrada por celda, ordenada por la mayor frecuencia histórica entre sus sensores.
  const cells = useMemo(() => {
    const byCell = new Map<string, CentinelaForecast>();
    for (const item of forecasts) {
      const current = byCell.get(item.cell_id);
      if (!current || (item.historical_frequency ?? -1) > (current.historical_frequency ?? -1)) byCell.set(item.cell_id, item);
    }
    return [...byCell.values()].sort((a, b) => (b.historical_frequency ?? -1) - (a.historical_frequency ?? -1));
  }, [forecasts]);
  const activeCell = cellId || cells[0]?.cell_id || '';
  const selected = forecasts.filter((item) => item.cell_id === activeCell);
  const rows = useMemo(() => [...forecasts].sort((a, b) => (b.historical_frequency ?? -1) - (a.historical_frequency ?? -1)), [forecasts]);
  const visibleRows = showAll ? rows : rows.slice(0, TABLE_PAGE);
  const anyPrediction = forecasts.some((item) => item.prediction.probability !== null);

  const summaryFor = (pick: (item: CentinelaForecast) => string) => selected.length ? selected.map((item) => `${productLabel(item.product)}: ${pick(item)}`) : [CENTINELA_UNKNOWN];

  return <section aria-label="Panel Alarmita CENTINELA" className={`space-y-4 p-5 ${CARD}`}>
    <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 lg:flex-row lg:items-center">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Radar className="h-5 w-5 shrink-0 text-accent" aria-hidden />
          <h2 className="font-noto text-lg font-bold tracking-tight sm:text-xl">Alarmita CENTINELA</h2>
          <span className="rounded border border-success/40 bg-success-soft px-2 py-0.5 font-source text-[10px] font-bold uppercase text-success">Modelo publicado · experimental</span>
        </div>
        <p className="text-xs leading-relaxed text-text-secondary">Resultados del modelo <strong className="text-text-primary">CENTINELA {model.data?.model_version ?? ''}</strong> publicado por el AI-Pipeline: cadena de Markov mensual por celda de 0,25°, entrenada con {model.data ? model.data.observations.toLocaleString() : '…'} observaciones reales de NASA FIRMS. Los valores no publicados se muestran como <strong className="text-text-primary">{CENTINELA_UNKNOWN}</strong>.</p>
      </div>
      <label className="flex min-w-0 flex-col gap-1 text-xs lg:w-80">
        <span className="flex items-center gap-1.5 font-semibold text-text-secondary"><MapPin className="h-3.5 w-3.5 text-accent" aria-hidden />Ubicación (celda del modelo)</span>
        <select value={activeCell} onChange={(event) => setCellId(event.target.value)} className="rounded-xl border border-border-strong bg-input-bg px-2.5 py-2 text-text-primary" aria-label="Celda CENTINELA">
          {cells.map((item) => <option key={item.cell_id} value={item.cell_id}>{cellName(item)}</option>)}
        </select>
      </label>
    </div>

    {model.isPending && <p role="status" className="text-xs text-text-secondary">Cargando el modelo CENTINELA…</p>}
    {model.isError && <p role="alert" className="flex items-center gap-2 rounded-xl border border-danger/40 bg-danger-soft p-3 text-xs text-danger"><AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />{model.error.message}</p>}

    {model.data && <>
      <div className="grid grid-cols-1 gap-3 font-source text-xs sm:grid-cols-2 lg:grid-cols-5">
        <Tile label="Estimación próximo mes" value={summaryFor((item) => item.prediction.probability === null ? CENTINELA_UNKNOWN : pctOrUnknown(item.prediction.probability))} note={`Mes objetivo: ${selected[0]?.target_month ?? '—'}`} />
        <Tile label="Nueva actividad P(1|0)" value={summaryFor((item) => pctOrUnknown(item.p01.probability))} note="Mes sin detección → mes con detección" />
        <Tile label="Persistencia P(1|1)" value={summaryFor((item) => pctOrUnknown(item.p11.probability))} note="Mes con detección → sigue activo" />
        <Tile label="Último mes cubierto" value={model.data.settings.end_month} valueClass="text-info" note={`Entrenado: ${new Date(model.data.trained_at).toLocaleDateString('es-CO', { dateStyle: 'medium' })}`} />
        <Tile label="Cobertura de la celda" value={summaryFor((item) => `${item.known_months}/${item.known_months + item.unknown_months} meses`)} valueClass="text-predictive" note="Meses con observabilidad verificada" />
      </div>
      {onShowCell && selected[0] && <button type="button" onClick={() => onShowCell(cellCenter(selected[0]))} className="ignis-action ignis-action-secondary"><MapPin className="h-3.5 w-3.5" aria-hidden />Ver esta celda en el mapa</button>}

      {!anyPrediction && <p className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft p-3 text-[11px] leading-relaxed"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />Para {forecasts[0]?.target_month ?? 'el próximo mes'} el modelo no publica estimación en ninguna celda: falta cobertura verificada del mes anterior. Se muestran las probabilidades de transición aprendidas y la frecuencia histórica.</p>}

      <div className="space-y-2">
        <h3 className="font-noto text-sm font-bold">Probabilidades reales CENTINELA por sensor y celda</h3>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left font-source text-[11px]">
          <thead><tr className="border-b border-border text-[10px] text-text-secondary"><th className="py-2 pr-2">Celda</th><th className="py-2 pr-2">Sensor</th><th className="py-2 pr-2">Frecuencia histórica</th><th className="py-2 pr-2">Nueva actividad P(1|0)</th><th className="py-2 pr-2">Persistencia P(1|1)</th><th className="py-2 pr-2">Próximo mes</th><th className="py-2">Cobertura</th></tr></thead>
          <tbody className="divide-y divide-border">{visibleRows.map((item) => <tr key={item.cell_id + item.product} className={item.cell_id === activeCell ? 'bg-accent-soft' : ''}>
            <td className="py-1.5 pr-2"><button type="button" onClick={() => setCellId(item.cell_id)} className="text-left font-semibold text-text-primary hover:underline">{cellName(item)}</button></td>
            <td className="py-1.5 pr-2">{productLabel(item.product)}</td>
            <td className="py-1.5 pr-2 font-bold text-predictive">{pctOrUnknown(item.historical_frequency)}</td>
            <td className="py-1.5 pr-2">{pctOrUnknown(item.p01.probability)}<span className="block text-[9px] text-text-secondary">{intervalText(item.p01)}</span></td>
            <td className="py-1.5 pr-2">{pctOrUnknown(item.p11.probability)}<span className="block text-[9px] text-text-secondary">{intervalText(item.p11)}</span></td>
            <td className="py-1.5 pr-2">{pctOrUnknown(item.prediction.probability)}</td>
            <td className="py-1.5 tabular-nums">{item.known_months}/{item.known_months + item.unknown_months}</td>
          </tr>)}</tbody>
        </table></div>
        {rows.length > TABLE_PAGE && <button type="button" onClick={() => setShowAll((value) => !value)} className="text-xs font-semibold text-accent hover:underline">{showAll ? 'Mostrar menos' : `Ver las ${rows.length} filas`}</button>}
      </div>

      <p className="text-[11px] leading-relaxed text-text-secondary">Probabilidad experimental de <strong>detección térmica</strong> (FIRMS type=0, candidatos de vegetación), no de incendio. Evaluación fuera de muestra: Markov mejora a la frecuencia histórica pero no a la frecuencia por mes del año. No es una alerta oficial ni una orden de evacuación.</p>
    </>}
  </section>;
}

function Tile({ label, value, note, valueClass = 'text-text-primary' }: { label: string; value: string | string[]; note: string; valueClass?: string }) {
  return <div className="space-y-1 rounded-xl border border-border bg-surface p-3.5">
    <span className="block text-[10px] uppercase text-text-secondary">{label}</span>
    <div className={`space-y-0.5 text-sm font-bold ${valueClass}`}>{(Array.isArray(value) ? value : [value]).map((line) => <p key={line} className={line.endsWith(CENTINELA_UNKNOWN) ? 'text-xs font-semibold text-text-secondary' : ''}>{line}</p>)}</div>
    <span className="block text-[10px] text-text-secondary">{note}</span>
  </div>;
}
