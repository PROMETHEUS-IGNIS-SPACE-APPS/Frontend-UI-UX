import { useState } from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';

const LEVELS = ['Muy bajo', 'Bajo', 'Moderado', 'Alto', 'Muy alto'];
const colorFor = (product: number, selected: boolean) => {
  if (selected) return 'ring-2 ring-accent bg-accent-solid text-accent-fg';
  if (product <= 4) return 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
  if (product <= 9) return 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
  if (product <= 15) return 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300';
  return 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300';
};

/** Herramienta ordinal de priorización; no representa una probabilidad científica. */
export default function RiskMatrix5x5() {
  const [threat, setThreat] = useState(3);
  const [consequence, setConsequence] = useState(3);
  const product = threat * consequence;

  return <section className="space-y-4 rounded-2xl bg-[#EEDFC5] p-5 text-[#4A2E1B] sm:p-7" aria-labelledby="risk-matrix-title">
    <div className="flex items-start gap-3">
      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#D9692B]" aria-hidden />
      <div>
        <h2 id="risk-matrix-title" className="font-sans text-xl font-bold text-[#5C260E]">Matriz de Gestión del Riesgo Territorial 5×5</h2>
        <p className="mt-1 text-xs leading-relaxed">Marco conceptual: Riesgo = Amenaza histórica × Exposición y vulnerabilidad.</p>
      </div>
    </div>
    <div className="flex items-start gap-2 rounded-xl border border-[#D9692B]/30 bg-[#FDECCD] p-3 text-[11px] leading-relaxed">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B8531E]" aria-hidden />
      <p>Es una herramienta ordinal ilustrativa de priorización. No estima riesgo probabilístico ni implica que la distancia entre niveles sea cuantitativamente equivalente.</p>
    </div>
    <div className="overflow-x-auto">
      <div className="min-w-[34rem]">
        <div className="mb-1 grid grid-cols-6 gap-1 text-center text-[10px] font-source">
          <span className="text-left font-bold">C \ A</span>
          {[1, 2, 3, 4, 5].map((value) => <span key={value}>{value} {LEVELS[value - 1]}</span>)}
        </div>
        {[5, 4, 3, 2, 1].map((c) => <div key={c} className="mb-1 grid grid-cols-6 gap-1">
          <span className="flex items-center text-[10px]">{c} {LEVELS[c - 1]}</span>
          {[1, 2, 3, 4, 5].map((a) => <button key={a} type="button" onClick={() => { setThreat(a); setConsequence(c); }} aria-label={`Amenaza ${a}, consecuencia ${c}`} className={`h-11 rounded-lg border text-center transition-transform hover:scale-[1.03] ${colorFor(a * c, threat === a && consequence === c)}`}><strong className="block font-source text-sm">{a * c}</strong><span className="text-[9px]">{a}×{c}</span></button>)}
        </div>)}
      </div>
    </div>
    <div className="grid gap-3 border-t border-[#D2B994] pt-3 sm:grid-cols-2">
      <label className="space-y-1 text-xs font-semibold">Nivel de amenaza: {threat} — {LEVELS[threat - 1]}<input type="range" min="1" max="5" value={threat} onChange={(event) => setThreat(Number(event.target.value))} className="w-full accent-[#D9692B]" /></label>
      <label className="space-y-1 text-xs font-semibold">Nivel de consecuencia: {consequence} — {LEVELS[consequence - 1]}<input type="range" min="1" max="5" value={consequence} onChange={(event) => setConsequence(Number(event.target.value))} className="w-full accent-[#1B5FA8]" /></label>
    </div>
    <p className="text-sm font-bold text-[#7B3314]">Producto ordinal P = {threat} × {consequence} = {product}</p>
  </section>;
}
