import { useEffect, type ReactNode } from 'react';
import { BookOpen, Compass, X } from 'lucide-react';
import { CITIZEN_COLOR, HIGH_INTENSITY_FRP_MW, MARKOV_PURPLE_SCALE } from './mapPresets';

interface CartographicGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGlossary: () => void;
}

const Dot = ({ color, ring }: { color: string; ring?: string }) => <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border-2" style={{ backgroundColor: color, borderColor: ring ?? '#ffffff' }} aria-hidden />;

function Row({ symbol, title, children }: { symbol: ReactNode; title: string; children: ReactNode }) {
  return <li className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3">
    <span className="mt-0.5 flex w-14 shrink-0 items-center justify-center gap-1">{symbol}</span>
    <div className="min-w-0"><p className="font-bold text-text-primary">{title}</p><p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">{children}</p></div>
  </li>;
}

/** Botón “Guía” del mapa: explica símbolos, colores y capas del lienzo cartográfico. */
export default function CartographicGuideModal({ isOpen, onClose, onOpenGlossary }: CartographicGuideModalProps) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="carto-guide-title" className="flex max-h-[94dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-border-strong bg-card text-xs text-text-primary shadow-2xl sm:rounded-2xl">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="rounded-xl border border-border-strong bg-card p-2 text-accent"><Compass className="h-4 w-4" aria-hidden /></span>
          <div><span className="block text-[10px] font-bold uppercase tracking-wider text-accent">Guía del mapa</span><h2 id="carto-guide-title" className="font-noto text-sm font-bold">Convención Cartográfica</h2></div>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar convención cartográfica" className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"><X className="h-4 w-4" aria-hidden /></button>
      </header>

      <div className="space-y-4 overflow-y-auto p-5">
        <div className="space-y-2">
          <h3 className="font-noto text-xs font-bold">Marcadores</h3>
          <ul className="space-y-2">
            <Row symbol={<Dot color="#ef4444" />} title="VIIRS (rojo)">Anomalía térmica del sensor VIIRS (~375 m). Detecta focos pequeños y bordes activos.</Row>
            <Row symbol={<Dot color="#facc15" />} title="MODIS (amarillo)">Anomalía térmica del sensor MODIS (~1 km). Píxel más grande, menos detalle espacial.</Row>
            <Row symbol={<Dot color="#f97316" />} title={`Alta intensidad (naranja, FRP ≥ ${HIGH_INTENSITY_FRP_MW} MW)`}>Tiene prioridad sobre el color del sensor. Las observaciones sin FRP nunca se marcan como alta.</Row>
            <Row symbol={<><Dot color="#93c5fd" ring={CITIZEN_COLOR} /><Dot color={CITIZEN_COLOR} /></>} title="Reporte ciudadano (azul)">Reportes preparados en este dispositivo. Claro con borde azul: pendiente; azul sólido: verificado por usted. Es información declarada, no confirmada.</Row>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-noto text-xs font-bold">Capas</h3>
          <ul className="space-y-2">
            <Row symbol={<span className="h-3.5 w-12 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(250,204,21,0.5), rgba(239,68,68,0.9))' }} aria-hidden />} title="Mapa Calor Observado">Densidad de observaciones ponderada por FRP informada. Las observaciones sin FRP no participan.</Row>
            <Row symbol={<span className="flex gap-0.5" aria-hidden>{MARKOV_PURPLE_SCALE.map((step) => <span key={step.label} className="h-3.5 w-2 rounded-xs border border-[#6d28d9]" style={{ backgroundColor: `rgba(139, 92, 246, ${step.opacity})` }} />)}</span>} title="Capa Predictiva Markov">Cuadros morados por celda: más intenso = mayor P(S1 ∪ S2) ({MARKOV_PURPLE_SCALE.map((step) => step.label).join(' · ')}). En la pestaña Mapa de Calor la misma probabilidad se muestra en amarillo-rojo. Estimación exploratoria con los datos cargados; no es un modelo publicado ni predice ignición.</Row>
            <Row symbol={<span className="h-0 w-12 border-t-2 border-dashed border-[#0284c7]" aria-hidden />} title="Límite de Colombia">Línea azul punteada de referencia.</Row>
            <Row symbol={<span className="h-3.5 w-12 rounded-sm border-2 border-[#d97706] bg-[#0284c7]/10" aria-hidden />} title="Subregiones de Antioquia">Contornos naranja esquemáticos de referencia visual; no son límites oficiales.</Row>
          </ul>
        </div>

        <p className="rounded-xl border border-warning/40 bg-warning-soft p-3 text-[11px] leading-relaxed">Los satélites pasan por una zona solo algunas veces al día y las nubes ocultan el fuego: la ausencia de puntos no prueba ausencia de incendios. Un punto satelital es una anomalía térmica, no un incendio confirmado.</p>
      </div>

      <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-surface px-5 py-3">
        <button type="button" onClick={() => { onClose(); onOpenGlossary(); }} className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-card px-3 py-1.5 font-semibold hover:bg-surface-hover"><BookOpen className="h-3.5 w-3.5 text-info" aria-hidden />Glosario completo</button>
        <button type="button" onClick={onClose} className="rounded-lg bg-accent-solid px-4 py-1.5 font-bold text-accent-fg hover:opacity-90">Entendido</button>
      </footer>
    </section>
  </div>;
}
