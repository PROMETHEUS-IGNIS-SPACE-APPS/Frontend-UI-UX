import { Activity, CalendarClock, CircleHelp, ShieldAlert, TrendingUp } from 'lucide-react';

export default function PredictabilityPanel() {
  return <section className="ignis-page mx-auto w-full max-w-[1200px] space-y-5 p-4 text-slate-100 sm:p-6">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-4">
      <div><p className="ignis-eyebrow">Modelos y pronósticos</p><h1 className="mt-1 flex items-center gap-2 text-xl font-semibold"><TrendingUp className="h-5 w-5 text-amber-400" />Predictibilidad</h1><p className="mt-1 text-xs text-slate-400">Consulta de predicciones solo cuando exista un modelo publicado y evaluado.</p></div>
      <span className="rounded-full border border-amber-800/60 bg-amber-950/30 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider text-amber-200">Sin modelo publicado</span>
    </header>
    <div className="grid gap-4 md:grid-cols-3">
      <article className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5"><CalendarClock className="h-5 w-5 text-cyan-300" /><h2 className="mt-3 text-sm font-semibold">Horizonte</h2><p className="mt-1 text-xs leading-5 text-slate-400">No disponible hasta que se publique el horizonte temporal validado por el equipo del modelo.</p></article>
      <article className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5"><Activity className="h-5 w-5 text-amber-300" /><h2 className="mt-3 text-sm font-semibold">Estimación</h2><p className="mt-1 text-xs leading-5 text-slate-400">No se calcula una probabilidad ni un riesgo futuro a partir de los conteos observados.</p></article>
      <article className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5"><ShieldAlert className="h-5 w-5 text-red-300" /><h2 className="mt-3 text-sm font-semibold">Validación</h2><p className="mt-1 text-xs leading-5 text-slate-400">No hay métricas verificables de desempeño, cobertura o incertidumbre para presentar.</p></article>
    </div>
    <article className="flex gap-3 rounded-2xl border border-amber-900/60 bg-amber-950/20 p-4 text-xs leading-5 text-amber-100/90"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><p>Las tendencias históricas describen observaciones pasadas, no predicen incendios. Esta vista se habilitará cuando el AI-Pipeline publique artefactos reproducibles con procedencia, método, horizonte y evaluación.</p></article>
  </section>;
}
