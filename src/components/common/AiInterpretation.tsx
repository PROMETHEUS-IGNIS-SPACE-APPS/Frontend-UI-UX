import { AlertTriangle, Loader2, Sparkles, X } from 'lucide-react';
import type { AiInterpretationState as AiState } from '@/hooks/useAiInterpretation';

export function AiInterpretButton({ ai, buildPayload, disabled }: { ai: AiState; buildPayload: () => Record<string, unknown>; disabled?: boolean }) {
  return <button
    type="button"
    onClick={() => ai.mutate(buildPayload())}
    disabled={disabled || ai.isPending}
    title={disabled ? 'No hay datos suficientes para interpretar' : 'Lectura en lenguaje claro generada por IA (Gemini) con las cifras de esta pestaña'}
    className="ignis-action ignis-action-secondary disabled:cursor-not-allowed disabled:opacity-50"
  >
    {ai.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Sparkles className="h-3.5 w-3.5" aria-hidden />}
    {ai.isPending ? 'Interpretando…' : 'Interpretar con IA'}
  </button>;
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return <div>
    <h3 className="mb-1 font-noto text-xs font-bold text-text-primary">{title}</h3>
    <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed text-text-primary">{items.map((item) => <li key={item}>{item}</li>)}</ul>
  </div>;
}

export function AiInterpretationPanel({ ai }: { ai: AiState }) {
  if (ai.isIdle) return null;
  if (ai.isPending) {
    return <div role="status" className="flex items-center gap-2 rounded-2xl border border-info/40 bg-info-soft p-4 text-xs text-text-primary">
      <Loader2 className="h-4 w-4 animate-spin text-info" aria-hidden />La IA está leyendo las cifras de esta pestaña…
    </div>;
  }
  if (ai.isError) {
    return <div role="alert" className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-xs text-text-primary">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
      <div className="flex-1 space-y-1">
        <p className="font-noto text-sm font-bold text-warning">No se pudo obtener la interpretación con IA</p>
        <p className="leading-relaxed">{ai.error.message}</p>
        <p className="text-text-secondary">Los cálculos y mapas de la plataforma siguen funcionando sin la IA.</p>
      </div>
      <button type="button" onClick={() => ai.reset()} aria-label="Cerrar aviso de IA" className="rounded-lg p-1 text-text-secondary hover:bg-surface-hover"><X className="h-4 w-4" aria-hidden /></button>
    </div>;
  }
  const { structured, model, cached, disclaimer } = ai.data;
  return <section aria-label="Interpretación con IA" className="space-y-4 rounded-2xl border border-info/40 bg-card p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
      <div>
        <h2 className="flex items-center gap-2 font-noto text-base font-bold text-text-primary"><Sparkles className="h-4 w-4 text-info" aria-hidden />Interpretación con IA</h2>
        <p className="mt-0.5 font-source text-[11px] text-text-secondary">Modelo {model}{cached ? ' · respuesta en caché' : ''}</p>
      </div>
      <button type="button" onClick={() => ai.reset()} aria-label="Cerrar interpretación con IA" className="rounded-lg p-1 text-text-secondary hover:bg-surface-hover"><X className="h-4 w-4" aria-hidden /></button>
    </div>
    <p className="text-sm leading-relaxed text-text-primary">{structured.resumenEjecutivo}</p>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <List title="Hallazgos clave" items={structured.hallazgosClave} />
      <div className="space-y-3">
        <div><h3 className="mb-1 font-noto text-xs font-bold text-text-primary">Sensores</h3><p className="text-xs leading-relaxed text-text-primary">{structured.interpretacionSensores}</p></div>
        <div><h3 className="mb-1 font-noto text-xs font-bold text-text-primary">Estimación Markov</h3><p className="text-xs leading-relaxed text-text-primary">{structured.interpretacionMarkov}</p></div>
      </div>
      <List title="Limitaciones y cautela" items={structured.limitacionesYCautela} />
      <List title="Recomendaciones" items={structured.recomendacionesOperativas} />
    </div>
    <p className="border-t border-border pt-3 text-[11px] leading-relaxed text-text-secondary">{disclaimer} Un foco de calor satelital no es un incendio confirmado; ante una emergencia, llame al 123.</p>
  </section>;
}
