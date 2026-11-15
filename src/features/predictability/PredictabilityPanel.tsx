import { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, FileDown, FlaskConical, Info, MapPin, ShieldCheck, TrendingUp } from 'lucide-react';
import PredictabilityReport from './PredictabilityReport';
import { AiInterpretButton, AiInterpretationPanel } from '@/components/common/AiInterpretation';
import { useAiInterpretation } from '@/hooks/useAiInterpretation';
import { ModuleHeader, ModulePage } from '@/components/common/ModuleLayout';
import type { Observation } from '@/types/api/observations';
import { HIGH_COUNT, HIGH_FRP_MW, MIN_DAYS_VALIDATED, SMOOTHING_ALPHA, STATE_CODES, runMarkovEngine, type MarkovResult } from '@/utils/markovEngine';

const STATES = [
  { label: 'Sin detección', color: 'text-success', detail: 'Celdas sin observaciones ese día.' },
  { label: 'Actividad térmica baja', color: 'text-warning', detail: `Celdas con FRP máxima < ${HIGH_FRP_MW} MW y menos de ${HIGH_COUNT} detecciones.` },
  { label: 'Intensidad térmica alta', color: 'text-danger', detail: `Celdas con FRP ≥ ${HIGH_FRP_MW} MW o ≥ ${HIGH_COUNT} detecciones en el día.` },
];

const pct = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;
const CARD = 'rounded-2xl border border-border bg-card shadow-sm';

interface PredictabilityPanelProps {
  observations: Observation[];
  provenance: string;
  /** Lleva al Mapa centrado en una celda. */
  onShowCell?: (center: [number, number]) => void;
  /** Carga la ventana real IDEAM 45 días (Antioquia) para estimar y validar mejor. */
  onLoadLongerWindow?: () => void;
}

/**
 * Motor Predictivo de Cadenas de Markov 3×3 (S0 · S1 · S2). Estimación
 * EXPLORATORIA calculada en el navegador con las observaciones reales cargadas;
 * no es un modelo publicado por el AI-Pipeline.
 */
export default function PredictabilityPanel({ observations, provenance, onShowCell, onLoadLongerWindow }: PredictabilityPanelProps) {
  const [horizon, setHorizon] = useState<0 | 1 | 2>(0);
  const [reportOpen, setReportOpen] = useState(false);
  const result: MarkovResult = useMemo(() => runMarkovEngine(observations), [observations]);
  const forecast = result.horizons[horizon];
  const ready = result.status !== 'insufficient';
  const validation = result.validation;
  const pKey = (['p24', 'p48', 'p72'] as const)[horizon];
  const ai = useAiInterpretation('predictability');
  const round = (value: number) => Math.round(value * 10_000) / 10_000;
  const buildAiPayload = () => ({
    procedencia: provenance,
    estado: result.status,
    mensaje: result.message,
    ventana: result.window,
    celdaGrados: result.gridDeg,
    observacionesUsadas: result.observationsUsed,
    transiciones: result.transitions,
    definicionEstados: { S0: 'sin detección', S1: `actividad baja (FRP < ${HIGH_FRP_MW} MW y < ${HIGH_COUNT} detecciones)`, S2: `intensidad alta (FRP ≥ ${HIGH_FRP_MW} MW o ≥ ${HIGH_COUNT} detecciones)` },
    matrizTransicion: result.matrix.map((row) => row.map(round)),
    conteosTransicion: result.counts,
    pronosticoRegional: result.horizons.map((item) => ({ horas: item.hours, S0: round(item.vector[0]), S1: round(item.vector[1]), S2: round(item.vector[2]), actividadS1oS2: round(item.activity) })),
    validacion: validation,
    rankingTop10: [...result.cells].sort((a, b) => b.p24 - a.p24).slice(0, 10).map((cell) => ({ municipio: cell.municipality, departamento: cell.department, lat: cell.centerLat, lon: cell.centerLon, estado: STATE_CODES[cell.state], vecinosActivos: cell.activeNeighbors, p24: round(cell.p24), p48: round(cell.p48), p72: round(cell.p72), detecciones: cell.detections })),
  });

  return <ModulePage>
    <ModuleHeader
      badge={{ label: 'Estimación exploratoria', tone: 'warning' }}
      meta={`Calculada en el navegador · ${provenance}`}
      icon={TrendingUp}
      title="Motor Predictivo de Cadenas de Markov 3×3 (S0 · S1 · S2)"
      description="Estima la probabilidad estadística de registrar detecciones térmicas satelitales en celdas geográficas en los próximos días. No equivale a predicción de ignición ni de propagación física."
      actions={<>
        <AiInterpretButton ai={ai} buildPayload={buildAiPayload} disabled={!ready} />
        <button type="button" onClick={() => setReportOpen(true)} disabled={!ready} className="ignis-action ignis-action-primary disabled:cursor-not-allowed disabled:opacity-50"><FileDown className="h-3.5 w-3.5" aria-hidden />Informe PDF con Mapa</button>
      </>}
    />
    <AiInterpretationPanel ai={ai} />
    {reportOpen && <PredictabilityReport result={result} provenance={provenance} onClose={() => setReportOpen(false)} />}

    <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-text-primary">
      <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
      <div className="space-y-1 text-xs leading-relaxed">
        <h2 className="font-noto text-sm font-bold text-warning">No es un modelo publicado</h2>
        <p>Estas cifras se recalculan con las observaciones reales que tenga cargadas (cambian si cambia la fuente o las fechas). No usan datos sintéticos ni clima. El modelo oficial lo publicará el AI-Pipeline con su evaluación; mientras tanto, lea siempre la validación retrospectiva de abajo.</p>
      </div>
    </div>

    {!ready && <div className={`flex items-start gap-3 p-5 ${CARD}`}>
      <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-warning" aria-hidden />
      <div className="space-y-1">
        <h2 className="font-noto text-sm font-bold text-warning">Historial insuficiente para estimar el modelo</h2>
        <p className="text-xs leading-relaxed text-text-primary">{result.message}</p>
        {onLoadLongerWindow && <button type="button" onClick={onLoadLongerWindow} className="ignis-action ignis-action-primary mt-2">Cargar ventana real IDEAM 45 días (Antioquia)</button>}
      </div>
    </div>}

    <section className={`space-y-4 p-5 ${CARD}`}>
      <div className="flex flex-col justify-between gap-3 border-b border-border pb-3 sm:flex-row sm:items-center">
        <div>
          <span className="font-source text-[10px] uppercase text-info">Distribución futura π(t+h) = π(t)·Pʰ</span>
          <p className="mt-1 font-source text-xs text-text-primary">Ventana: <strong>{result.window.start ?? '—'} a {result.window.end ?? '—'}</strong> <span className="text-text-secondary">({result.window.days} días con datos de {result.window.calendarDays} · {result.transitions.toLocaleString()} transiciones · celdas de {result.gridDeg.toFixed(2)}° ≈ {Math.round(result.gridDeg * 111)} km)</span></p>
          <p className="mt-0.5 text-[11px] text-text-secondary">{result.message}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-surface p-1" role="group" aria-label="Horizonte de predicción">
          {(['24 horas', '48 horas', '72 horas'] as const).map((label, index) => <button key={label} type="button" disabled={!ready} aria-pressed={horizon === index} onClick={() => setHorizon(index as 0 | 1 | 2)} className={`rounded-lg px-3 py-1.5 font-source text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${horizon === index && ready ? 'bg-accent-solid text-accent-fg' : 'text-text-secondary hover:text-text-primary'}`}>{label}</button>)}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATES.map((state, index) => <article key={state.label} className="space-y-1 rounded-xl border border-border bg-surface p-4">
          <span className="font-source text-[11px] text-text-secondary">{STATE_CODES[index]} · {state.label}</span>
          <p className={`font-source text-3xl font-extrabold ${state.color}`}>{forecast ? pct(forecast.vector[index]) : '—'}</p>
          <p className="text-[11px] leading-snug text-text-secondary">{state.detail}</p>
        </article>)}
        <article className="space-y-1 rounded-xl border border-predictive/40 bg-predictive-soft p-4">
          <span className="font-source text-[11px] font-bold text-predictive">Markov P(S1 ∪ S2)</span>
          <p className="font-source text-3xl font-extrabold text-predictive">{forecast ? pct(forecast.activity) : '—'}</p>
          <p className="text-[11px] leading-snug text-text-secondary">Proporción esperada de celdas con actividad a +{forecast?.hours ?? 24} h. No equivale a ignición física.</p>
        </article>
      </div>
    </section>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <article className={`space-y-4 p-5 ${CARD}`}>
        <div className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-noto text-base font-bold"><BarChart3 className="h-4 w-4 text-accent" aria-hidden />Matriz empírica 3×3 P(i → j)</h2><span className="font-source text-[11px] text-text-secondary">Laplace α = {SMOOTHING_ALPHA}</span></div>
        <div className="overflow-x-auto"><table className="w-full text-left font-source text-xs">
          <thead><tr className="border-b border-border text-[11px] text-text-secondary"><th className="py-2">Estado t \ t+1</th><th className="py-2 text-success">S0</th><th className="py-2 text-warning">S1</th><th className="py-2 text-danger">S2</th></tr></thead>
          <tbody className="divide-y divide-border">{STATES.map((state, i) => <tr key={state.label}><th scope="row" className="py-2.5 font-bold text-text-primary">{STATE_CODES[i]} ({state.label})</th>{[0, 1, 2].map((j) => <td key={j} className="py-2.5 tabular-nums">{ready ? <><span className="font-bold text-text-primary">{pct(result.matrix[i][j])}</span> <span className="text-[10px] text-text-secondary">N={result.counts[i][j].toLocaleString()}</span></> : <span className="text-text-secondary">—</span>}</td>)}</tr>)}</tbody>
        </table></div>
        <p className="text-[11px] leading-relaxed text-text-secondary">Cada fila suma 100 %. N(i,j) son las transiciones reales contadas entre días consecutivos; el suavizado evita probabilidades de 0 % por falta de casos.</p>
      </article>

      <article className={`space-y-4 p-5 ${CARD}`}>
        <h2 className="flex items-center gap-2 font-noto text-base font-bold"><ShieldCheck className="h-4 w-4 text-success" aria-hidden />Validación retrospectiva (out-of-sample)</h2>
        {validation ? <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ['Brier Markov', validation.brierMarkov.toFixed(4)],
              ['Brier Skill Score', validation.brierSkillPct === null ? '—' : `${validation.brierSkillPct > 0 ? '+' : ''}${validation.brierSkillPct}%`],
              ['ROC-AUC', validation.rocAuc === null ? '—' : validation.rocAuc.toFixed(3)],
              ['Brier persistencia / clim.', `${validation.brierPersistence.toFixed(3)} / ${validation.brierClimatology.toFixed(3)}`],
              ['Precisión / Recall', `${validation.precision === null ? '—' : pct(validation.precision, 0)} / ${validation.recall === null ? '—' : pct(validation.recall, 0)}`],
              ['Log-Loss', validation.logLoss.toFixed(3)],
            ].map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-surface p-3"><span className="block font-source text-[10px] text-text-secondary">{label}:</span><span className="font-source text-lg font-bold tabular-nums text-text-primary">{value}</span></div>)}
          </div>
          <p className={`border-t border-border pt-3 font-source text-[11px] font-semibold ${validation.brierSkillPct !== null && validation.brierSkillPct > 0 ? 'text-success' : 'text-warning'}`}>
            {validation.brierSkillPct !== null && validation.brierSkillPct > 0 ? 'Mejora a la climatología' : 'No supera a la climatología'} en {validation.testTransitions.toLocaleString()} transiciones de prueba ({validation.trainDays} días para estimar, {validation.testDays} para evaluar; umbral {validation.threshold} calibrado solo con días de entrenamiento).
          </p>
          {onLoadLongerWindow && result.window.days < 30 && <button type="button" onClick={onLoadLongerWindow} className="ignis-action ignis-action-secondary">Ampliar a IDEAM 45 días (Antioquia) para validar con más historia</button>}
        </> : <p className="rounded-xl border border-border bg-surface p-4 text-xs text-text-secondary">Se necesitan al menos {MIN_DAYS_VALIDATED} días con datos para separar días de entrenamiento y de prueba. Cargue una ventana más larga (por ejemplo, IDEAM 45 días Antioquia en la pestaña Mapa).</p>}
      </article>
    </div>

    <section className={`space-y-3 p-5 ${CARD}`}>
      <div className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-noto text-base font-bold"><MapPin className="h-4 w-4 text-accent" aria-hidden />Ranking territorial: celdas con mayor P(S1 ∪ S2) a +{forecast?.hours ?? 24} h</h2><span className="font-source text-[11px] text-text-secondary">Top {Math.min(10, result.cells.length)}</span></div>
      {result.cells.length ? <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left font-source text-xs">
        <thead><tr className="border-b border-border text-[11px] text-text-secondary"><th className="py-2">Municipio / celda</th><th className="py-2">Estado hoy</th><th className="py-2">Vecinos activos</th><th className="py-2">P(24h)</th><th className="py-2">P(48h)</th><th className="py-2">P(72h)</th><th className="py-2">Detecciones</th><th className="py-2" /></tr></thead>
        <tbody className="divide-y divide-border">{[...result.cells].sort((a, b) => b[pKey] - a[pKey]).slice(0, 10).map((cell) => <tr key={cell.id}>
          <td className="py-2"><strong className="text-text-primary">{cell.municipality ?? 'Sin municipio cercano'}</strong><span className="block text-[10px] text-text-secondary">{cell.centerLat.toFixed(2)}, {cell.centerLon.toFixed(2)}</span></td>
          <td className={`py-2 font-bold ${['text-success', 'text-warning', 'text-danger'][cell.state]}`}>{STATE_CODES[cell.state]}</td>
          <td className="py-2 tabular-nums">{cell.activeNeighbors}/8</td>
          {(['p24', 'p48', 'p72'] as const).map((key) => <td key={key} className={`py-2 tabular-nums ${key === pKey ? 'font-bold text-predictive' : 'text-text-primary'}`}>{pct(cell[key])}</td>)}
          <td className="py-2 tabular-nums">{cell.detections}</td>
          <td className="py-2 text-right">{onShowCell && <button type="button" onClick={() => onShowCell([cell.centerLon, cell.centerLat])} className="rounded-lg border border-border px-2 py-1 font-noto text-[11px] font-semibold text-accent hover:bg-surface-hover">Ver en mapa</button>}</td>
        </tr>)}</tbody>
      </table></div> : <p className="text-xs text-text-secondary">Sin celdas estimadas con el conjunto actual.</p>}
    </section>

    <div className="flex items-start gap-2 text-[11px] leading-relaxed text-text-secondary">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden />
      <p><strong className="text-text-primary">Metodología y límites.</strong> Solo se evalúan días con al menos una observación y celdas que tuvieron alguna detección; nubes y horarios orbitales pueden ocultar actividad, así que un S0 no prueba ausencia de fuego. La probabilidad a 24 h se condiciona a si alguna celda vecina estuvo activa (con contracción hacia la matriz homogénea); a 48 y 72 h se propaga con la matriz. P(S1 ∪ S2) es actividad térmica satelital, no incendio confirmado, superficie quemada ni ignición.</p>
    </div>
  </ModulePage>;
}
