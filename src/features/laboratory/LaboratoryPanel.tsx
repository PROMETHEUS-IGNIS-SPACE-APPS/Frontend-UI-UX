import { useState } from 'react';
import { Cpu, Database, FlaskConical, ShieldCheck } from 'lucide-react';
import { ModuleHeader, ModulePage } from '@/components/common/ModuleLayout';
import { useCentinelaModel } from '@/features/centinela/centinelaFormat';
import type { CentinelaMetric } from '@/types/api/centinela';

const MODELS = [
  { id: 'centinela', label: 'CENTINELA v0.1.0 · Markov mensual' },
  { id: 'random-forest', label: 'Random Forest · intensidad (pendiente)' },
] as const;

const METRIC_LABELS: Record<string, string> = { markov: 'Markov (CENTINELA)', frequency: 'Frecuencia histórica', seasonal_frequency: 'Frecuencia por mes del año' };
const fmt = (value: number | undefined, digits = 3) => value === undefined ? '—' : value.toFixed(digits);
const pct = (value: number | undefined) => value === undefined ? '—' : `${(value * 100).toFixed(1)} %`;

export default function LaboratoryPanel({ provenance }: { provenance: string }) {
  const [showInfo, setShowInfo] = useState(false);
  const [modelId, setModelId] = useState<(typeof MODELS)[number]['id']>('centinela');
  const model = useCentinelaModel(modelId === 'centinela');
  const data = model.data;
  const metrics = data?.evaluation.metrics ?? {};
  const best = Object.entries(metrics).sort(([, a], [, b]) => a.brier - b.brier)[0]?.[0];

  return <ModulePage>
    <ModuleHeader
      badge={{ label: data ? '1 modelo publicado' : 'En desarrollo', tone: data ? 'success' : 'neutral' }}
      icon={Cpu}
      title="Laboratorio IA"
      description={<>Fichas de modelos y evaluación documentada del <code className="font-source text-accent">AI-Pipeline</code>.</>}
    />

    <div className="flex items-start gap-3 rounded-2xl border border-info/40 bg-info-soft p-4 text-xs text-text-primary">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-info" aria-hidden />
      <div className="space-y-1">
        <p className="font-noto font-semibold text-info">Reglas éticas y científicas del módulo:</p>
        <ul className="list-inside list-disc space-y-0.5 text-[11px] text-text-secondary">
          <li><strong className="text-text-primary">Sin ejecución en el navegador:</strong> los modelos no se entrenan aquí; solo se leen sus artefactos publicados.</li>
          <li><strong className="text-text-primary">Solo artefactos verificables:</strong> cada métrica viene del artefacto con su identificador, commit y protocolo.</li>
          <li><strong className="text-text-primary">Honestidad epistémica:</strong> una probabilidad de detección térmica no equivale a predecir incendios.</li>
        </ul>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Modelos documentados">
      {MODELS.map((item) => <button key={item.id} type="button" aria-pressed={modelId === item.id} onClick={() => setModelId(item.id)} className={`rounded-xl border px-3 py-1.5 font-noto text-xs font-semibold transition-colors ${modelId === item.id ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-card text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}>{item.label}</button>)}
    </div>

    {modelId === 'random-forest' && <article className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><span className="block font-noto text-[10px] font-semibold uppercase tracking-wider text-accent">Ficha del modelo</span><h2 className="mt-0.5 font-source text-base font-bold">Random Forest de intensidad térmica</h2></div><span className="rounded border border-border-strong bg-surface px-2 py-0.5 font-source text-xs">Pendiente</span></div>
      <p className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 font-source text-xs text-text-secondary"><FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />El modelo se conserva en el AI-Pipeline, pero aún no publica artefactos con métricas verificables. No se muestran las cifras de prueba de la carpeta Ejemplo.</p>
    </article>}

    {modelId === 'centinela' && <>
      {model.isPending && <p role="status" className="text-xs text-text-secondary">Cargando el artefacto del modelo…</p>}
      {model.isError && <p role="alert" className="rounded-xl border border-danger/40 bg-danger-soft p-3 text-xs text-danger">{model.error.message}</p>}
      {data && <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <article className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-7">
          <div className="flex items-start justify-between gap-3">
            <div><span className="block font-noto text-[10px] font-semibold uppercase tracking-wider text-accent">Ficha del modelo</span><h2 className="mt-0.5 font-source text-base font-bold">CENTINELA {data.model_version}: cadena de Markov mensual por celda</h2></div>
            <span className="rounded border border-success/40 bg-success-soft px-2 py-0.5 font-source text-xs font-bold text-success">Publicado</span>
          </div>
          <p className="text-xs leading-relaxed text-text-secondary"><strong className="text-text-primary">Objetivo:</strong> estimar la probabilidad experimental de que una celda de {data.settings.grid.replace('wgs84-', '')}° registre detección térmica de vegetación (FIRMS type=0) el mes siguiente, a partir de su estado observado del mes anterior. Prior Beta({data.settings.alpha},{data.settings.alpha}), mínimo {data.settings.min_transitions} transiciones por estado, intervalos creíbles del 95 %.</p>
          <div className="grid grid-cols-2 gap-3 font-source text-xs sm:grid-cols-4">
            {[['Brier Markov', fmt(metrics.markov?.brier)], ['Precisión', pct(metrics.markov?.precision)], ['Recall', pct(metrics.markov?.recall)], ['Falsas alarmas', pct(metrics.markov?.false_alarm_rate)]].map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-surface p-3"><span className="block text-[10px] text-text-secondary">{label}:</span><span className="text-xl font-bold">{value}</span></div>)}
          </div>
          <div className="overflow-x-auto"><table className="w-full min-w-[460px] text-left font-source text-[11px]">
            <thead><tr className="border-b border-border text-[10px] text-text-secondary"><th className="py-1.5 pr-2">Modelo (mismos {data.evaluation.evaluated_pairs.toLocaleString()} pares)</th><th className="py-1.5 pr-2">Brier ↓</th><th className="py-1.5 pr-2">Precisión</th><th className="py-1.5 pr-2">Recall</th><th className="py-1.5">Falsas alarmas</th></tr></thead>
            <tbody className="divide-y divide-border">{Object.entries(metrics).map(([key, value]: [string, CentinelaMetric]) => <tr key={key} className={key === best ? 'font-bold text-success' : ''}><td className="py-1.5 pr-2">{METRIC_LABELS[key] ?? key}</td><td className="py-1.5 pr-2">{fmt(value.brier, 4)}</td><td className="py-1.5 pr-2">{pct(value.precision)}</td><td className="py-1.5 pr-2">{pct(value.recall)}</td><td className="py-1.5">{value.false_alarms ?? '—'}</td></tr>)}</tbody>
          </table></div>
          <p className={`rounded-lg border p-2.5 text-[11px] ${data.evaluation.beats_baselines ? 'border-success/40 bg-success-soft' : 'border-warning/40 bg-warning-soft'}`}>{data.evaluation.beats_baselines ? 'El modelo supera a ambas referencias.' : 'El modelo mejora a la frecuencia histórica, pero la frecuencia por mes del año obtiene mejor Brier: no supera ambas referencias.'} Umbral de decisión fijo en {metrics.markov?.threshold ?? 0.5}. Evaluación con parámetros fijados hasta {data.evaluation.cutoff} y meses posteriores como prueba.</p>
        </article>

        <article className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-5">
          <h3 className="flex items-center gap-2 font-noto text-sm font-bold"><Database className="h-4 w-4 text-info" aria-hidden />Procedencia del artefacto</h3>
          <dl className="space-y-1.5 font-source text-[11px]">
            {[['Entrenado', new Date(data.trained_at).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })], ['Observaciones', `${data.observations.toLocaleString()} (NASA FIRMS)`], ['Archivos fuente', `${data.sources_count} · ${data.sources_products.join(', ')}`], ['Área', `Caja WGS84 [${data.settings.bbox.join(', ')}] (aprox. Antioquia, no límite oficial)`], ['Último mes', data.settings.end_month], ['ID del modelo', `${data.model_id.slice(0, 16)}…`], ['Commit fuente', data.source_commit?.slice(0, 12) ?? '—']].map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-border pb-1"><dt className="text-text-secondary">{label}</dt><dd className="break-all text-right font-semibold">{value}</dd></div>)}
          </dl>
          <button type="button" aria-expanded={showInfo} onClick={() => setShowInfo((value) => !value)} className="font-source text-[11px] font-semibold text-accent hover:underline">{showInfo ? 'Ocultar' : 'Ver'} datos de la consulta actual</button>
          {showInfo && <p className="border-t border-border pt-2 text-xs text-text-secondary">Procedencia de las observaciones del Mapa: <span className="text-text-primary">{provenance}</span>.</p>}
          <p className="text-[11px] leading-relaxed text-text-secondary">{data.meaning}. Las alertas operativas están {data.operational_alerts_enabled ? 'activadas' : 'desactivadas'}.</p>
        </article>
      </div>}
    </>}
  </ModulePage>;
}
