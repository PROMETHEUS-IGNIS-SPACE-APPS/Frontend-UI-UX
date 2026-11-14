import { useState } from 'react';
import { Cpu, Database, FlaskConical, ShieldCheck } from 'lucide-react';
import { ModuleHeader, ModulePage } from '@/components/common/ModuleLayout';

const MODEL_FIELDS = ['CV F1-Score', 'Recall', 'Precisión', 'ROC-AUC'];

export default function LaboratoryPanel({ provenance }: { provenance: string }) {
  const [showInfo, setShowInfo] = useState(false);
  return <ModulePage>
    <ModuleHeader
      badge={{ label: 'En desarrollo', tone: 'neutral' }}
      icon={Cpu}
      title="Laboratorio IA"
      description={<>Fichas de modelos y evaluación documentada del <code className="font-source text-accent">AI-Pipeline</code>.</>}
    />

    <div className="flex items-start gap-3 rounded-2xl border border-info/40 bg-info-soft p-4 text-xs text-text-primary">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-info" />
      <div className="space-y-1">
        <p className="font-noto font-semibold text-info">Reglas éticas y científicas del módulo:</p>
        <ul className="list-inside list-disc space-y-0.5 text-[11px] text-text-secondary">
          <li><strong className="text-text-primary">Sin ejecución en el navegador:</strong> los modelos no se entrenan ni se ejecutan aquí.</li>
          <li><strong className="text-text-primary">Solo artefactos verificables:</strong> las métricas se mostrarán cuando el pipeline las publique con procedencia.</li>
          <li><strong className="text-text-primary">Honestidad epistémica:</strong> clasificar intensidades observadas no equivale a predecir incendios futuros.</li>
        </ul>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <article className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-7">
        <div className="flex items-start justify-between gap-3">
          <div><span className="block font-noto text-[10px] font-semibold uppercase tracking-wider text-accent">Ficha del modelo</span><h2 className="mt-0.5 font-source text-base font-bold text-text-primary">No hay fichas de modelos disponibles</h2></div>
          <span className="rounded border border-border-strong bg-surface px-2 py-0.5 font-source text-xs text-text-primary">Pendiente</span>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 font-source text-xs text-text-secondary">
          <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <p>La API conectada entrega observaciones y estado de salud; aún no expone artefactos del AI-Pipeline. Esta vista no usa los resultados de prueba incluidos en la carpeta Ejemplo.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 font-source text-xs sm:grid-cols-4">
          {MODEL_FIELDS.map((field) => <div key={field} className="rounded-xl border border-border bg-surface p-3"><span className="block text-[10px] text-text-secondary">{field}:</span><span className="text-xl font-bold text-text-secondary">—</span></div>)}
        </div>
      </article>

      <article className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-5">
        <button type="button" aria-expanded={showInfo} onClick={() => setShowInfo((value) => !value)} className="flex w-full items-center justify-between gap-3 text-left">
          <span className="flex items-center gap-2 font-noto text-sm font-bold text-text-primary"><Database className="h-4 w-4 text-info" />Estado de la fuente de datos</span>
          <span className="font-source text-[11px] font-semibold text-accent">{showInfo ? 'Ocultar' : 'Ver detalle'}</span>
        </button>
        {showInfo && <p className="border-t border-border pt-3 text-xs text-text-secondary">Procedencia actual: <span className="text-text-primary">{provenance}</span>. No se afirma conexión con un modelo de IA.</p>}
        <p className="text-[11px] leading-relaxed text-text-secondary">Cuando existan modelos publicados, aquí aparecerá la lista para elegir uno y comparar sus métricas de validación cruzada.</p>
      </article>
    </div>
  </ModulePage>;
}
