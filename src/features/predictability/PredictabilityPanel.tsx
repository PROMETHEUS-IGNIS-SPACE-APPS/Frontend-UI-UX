import { AlertTriangle, BarChart3, ShieldCheck, TrendingUp } from 'lucide-react';
import { ModuleHeader, ModulePage } from '@/components/common/ModuleLayout';

const STATES = [
  { code: 'S0', label: 'Sin detección', color: 'text-success', detail: 'Celdas en estado basal en cobertura evaluable.' },
  { code: 'S1', label: 'Actividad térmica baja', color: 'text-warning', detail: 'Celdas con anomalía térmica moderada/baja (FRP < 30 MW).' },
  { code: 'S2', label: 'Intensidad térmica alta', color: 'text-danger', detail: 'Celdas con registro elevado (FRP ≥ 30 MW o ≥4 focos/día).' },
];

const VALIDATION_METRICS = ['Brier Score', 'Brier Skill Score', 'ROC-AUC (out-of-sample)', 'Log-Loss', 'Precisión / Recall', 'Bloque de prueba'];

export default function PredictabilityPanel() {
  return <ModulePage>
    <ModuleHeader
      badge={{ label: 'Sin modelo publicado', tone: 'warning' }}
      meta="Esperando artefactos del AI-Pipeline"
      icon={TrendingUp}
      title="Predictibilidad"
      description="Consulta de predicciones solo cuando exista un modelo publicado y evaluado. No equivale a predicción de ignición ni propagación física."
    />

    <div className="flex items-start gap-3 text-text-primary">
      <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-warning" />
      <div className="space-y-1">
        <h2 className="font-noto text-sm font-bold text-warning">Vista pendiente de un modelo verificable</h2>
        <p className="text-xs leading-relaxed">Las tendencias históricas describen observaciones pasadas, no predicen incendios. Esta vista se habilitará cuando el AI-Pipeline publique artefactos reproducibles con procedencia, método, horizonte y evaluación.</p>
      </div>
    </div>

    <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-border pb-3 sm:flex-row sm:items-center">
        <div>
          <span className="font-source text-[10px] uppercase text-text-secondary">Distribución futura por estados</span>
          <p className="mt-1 font-source text-xs text-text-primary">Ventana: <strong>no disponible</strong> <span className="font-semibold text-info">(sin transiciones publicadas)</span></p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1" role="group" aria-label="Horizonte de predicción">
          {['24 horas', '48 horas', '72 horas'].map((label) => <button key={label} type="button" disabled className="cursor-not-allowed rounded-lg px-3 py-1.5 font-source text-xs font-medium text-text-secondary opacity-60">{label}</button>)}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATES.map((state) => <article key={state.code} className="space-y-1 rounded-xl border border-border bg-surface p-4">
          <span className="font-source text-[11px] text-text-secondary">{state.code} · {state.label}</span>
          <p className={`font-source text-3xl font-extrabold ${state.color} opacity-50`}>—</p>
          <p className="text-[11px] leading-snug text-text-secondary">{state.detail}</p>
        </article>)}
        <article className="space-y-1 rounded-xl border border-predictive/40 bg-predictive-soft p-4">
          <span className="font-source text-[11px] font-bold text-predictive">Actividad modelada P(S1 ∪ S2)</span>
          <p className="font-source text-3xl font-extrabold text-predictive opacity-50">—</p>
          <p className="text-[11px] leading-snug text-text-secondary">Se mostrará con su horizonte y métricas de validación cuando exista un modelo publicado.</p>
        </article>
      </div>
    </section>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <article className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-noto text-base font-bold"><BarChart3 className="h-4 w-4 text-accent" />Matriz de transición 3×3 P(i → j)</h2><span className="font-source text-[11px] text-text-secondary">Pendiente</span></div>
        <div className="overflow-x-auto"><table className="w-full text-left font-source text-xs">
          <thead><tr className="border-b border-border text-[11px] text-text-secondary"><th className="py-2">Estado t \ t+1</th><th className="py-2 text-success">S0</th><th className="py-2 text-warning">S1</th><th className="py-2 text-danger">S2</th></tr></thead>
          <tbody className="divide-y divide-border">{STATES.map((state) => <tr key={state.code}><th scope="row" className="py-2.5 font-bold text-text-primary">{state.code} ({state.label})</th>{STATES.map((target) => <td key={target.code} className="py-2.5 text-text-secondary">—</td>)}</tr>)}</tbody>
        </table></div>
        <p className="text-[11px] leading-relaxed text-text-secondary">Los conteos empíricos N(i,j) y sus probabilidades se mostrarán tal como los publique el pipeline. No se calculan en el navegador.</p>
      </article>

      <article className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-noto text-base font-bold"><ShieldCheck className="h-4 w-4 text-success" />Validación retrospectiva (out-of-sample)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {VALIDATION_METRICS.map((metric) => <div key={metric} className="rounded-xl border border-border bg-surface p-3"><span className="block font-source text-[10px] text-text-secondary">{metric}:</span><span className="font-source text-lg font-bold text-text-secondary">—</span></div>)}
        </div>
        <p className="border-t border-border pt-3 font-source text-[11px] font-semibold text-warning">Suficiencia estadística: sin métricas verificables para presentar.</p>
      </article>
    </div>
  </ModulePage>;
}
