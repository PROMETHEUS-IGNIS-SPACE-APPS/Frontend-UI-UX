import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Printer, X } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Fuentes de datos',
    items: [
      'IDEAM · SMByC: archivos diarios Puntos_de_calor_Colombia_AAAA-MM-DD.csv, separados por punto y coma, con coma decimal y hora local de Colombia (UTC-5).',
      'NASA FIRMS: feed NRT público de los últimos 7 días. MODIS (Terra/Aqua, ~1 km) y VIIRS (Suomi-NPP, NOAA-20, NOAA-21, ~375 m), horas en UTC.',
      'Combinado IDEAM + NASA FIRMS: fusión deduplicada que entrega el Backend-API. Rango inclusivo máximo de 90 días.',
      'Histórico muestreado: desde 2024-01-01 hasta hoy, por cortes semimensuales, con un tope de 9.000 registros. No es una serie diaria continua.',
      'CSV local: archivos IDEAM o FIRMS que la persona carga en su navegador. No se envían al servidor y se pierden al recargar.',
    ],
  },
  {
    title: '2. Código de colores del mapa',
    items: [
      'Puntos rojos: observaciones VIIRS.',
      'Puntos amarillos: observaciones MODIS.',
      'Densidad térmica: capa ponderada por FRP informada; las observaciones sin FRP no participan y no se tratan como cero.',
    ],
  },
  {
    title: '3. Reglas de lectura responsable',
    items: [
      'Una observación satelital es una anomalía térmica; por sí sola no confirma un incendio ni un evento independiente.',
      'Los conteos MODIS y VIIRS se presentan por separado: tienen resoluciones y horarios orbitales distintos.',
      'La confianza se muestra con su valor original (confidence_raw); no se inventa una escala común.',
      'FRP nula se muestra como “No disponible”, nunca como 0 MW.',
      'La ausencia de datos en un paso orbital o en un día no equivale a ausencia de incendios.',
    ],
  },
  {
    title: '4. Módulos de la plataforma',
    items: [
      'Mapa: exploración de observaciones con filtros, capas, línea de tiempo y ficha por punto.',
      'Predictibilidad y Mapa de Calor Markov: se habilitan solo cuando el AI-Pipeline publique un modelo con método, horizonte y validación. No se calculan probabilidades en el navegador.',
      'Calendario: actividad por día, por mes y por subregión de Antioquia (subregión aproximada a partir del municipio de referencia del Backend-API).',
      'Aula Pedagógica: lecciones, preguntas de repaso y matriz ordinal de riesgo 5×5 (ejercicio educativo, no evaluación de una zona real).',
      'Analítica: indicadores descriptivos del conjunto consultado.',
      'Modelos IA: fichas de modelos publicados por el AI-Pipeline.',
      'Fuentes/API: estado del Backend-API, endpoints y límites de cada fuente.',
    ],
  },
  {
    title: '5. Emergencias',
    items: [
      'Ante una emergencia real, comunícate con la línea nacional 123 o con Bomberos 119. Las detecciones del mapa son contexto y no verifican un incidente.',
      'El botón Reportar Novedad todavía no recibe ni guarda reportes ciudadanos.',
    ],
  },
];

/** Botón “Instructivo (.PDF)”: muestra el manual y lo imprime o guarda como PDF desde el navegador. */
export default function ManualAccess() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.classList.add('print-manual');
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('print-manual'); window.removeEventListener('keydown', onKey); };
  }, [isOpen]);

  return <>
    <button type="button" onClick={() => setIsOpen(true)} aria-label="Abrir Instructivo metodológico" title="Instructivo metodológico (guardar como .PDF)" className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 font-noto text-xs font-semibold text-text-primary transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">
      <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="hidden sm:inline">Instructivo (.PDF)</span>
    </button>

    {isOpen && createPortal(<div id="manual-print-root" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 print:static print:block print:bg-white print:p-0" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="manual-title" className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border-strong bg-card text-text-primary shadow-2xl print:max-h-none print:max-w-none print:overflow-visible print:border-0 print:bg-white print:text-black print:shadow-none">
        <header className="flex items-start justify-between gap-3 border-b border-border p-4 print:border-black/20">
          <div>
            <h2 id="manual-title" className="font-noto text-base font-bold">PROMETHEUS IGNIS — Manual Metodológico</h2>
            <p className="mt-0.5 text-xs text-text-secondary print:text-black/70">Plataforma de Inteligencia Territorial · Semillero ITM · NASA Space Apps Challenge 2026</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 print:hidden">
            <button type="button" onClick={() => window.print()} className="ignis-action ignis-action-primary"><Printer className="h-3.5 w-3.5" aria-hidden />Guardar como PDF</button>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar instructivo" className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"><X className="h-4 w-4" aria-hidden /></button>
          </div>
        </header>
        <div className="space-y-5 overflow-y-auto p-5 text-xs leading-5 print:overflow-visible print:text-[11pt]">
          <p className="rounded-xl border border-info/40 bg-info-soft p-3 print:hidden">Usa “Guardar como PDF” y elige <strong>Guardar como PDF</strong> en el destino del diálogo de impresión.</p>
          {SECTIONS.map((section) => <section key={section.title} className="space-y-2 break-inside-avoid">
            <h3 className="font-noto text-sm font-bold text-accent print:text-black">{section.title}</h3>
            <ul className="list-disc space-y-1 pl-5">{section.items.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>)}
        </div>
      </section>
    </div>, document.body)}
  </>;
}
