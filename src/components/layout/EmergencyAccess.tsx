import { useEffect, useState } from 'react';
import { Flame, Phone, PhoneCall, ShieldAlert, X } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';

/**
 * Líneas nacionales de Colombia (mismas del ejemplo). Se omite la línea de
 * DAGRAN Antioquia porque el ejemplo no trae un número verificado.
 */
const EMERGENCY_LINES = [
  { number: '123', name: 'Línea Única de Emergencias', detail: 'Atención integral de emergencias, policía, salud y gestión del riesgo', primary: true },
  { number: '119', name: 'Cuerpo Oficial de Bomberos', detail: 'Respuesta directa ante incendios forestales, estructurales y quemas fuera de control', primary: false },
  { number: '144', name: 'Defensa Civil Colombiana', detail: 'Búsqueda, rescate y apoyo comunitario en emergencias ambientales', primary: false },
  { number: '132', name: 'Cruz Roja Colombiana', detail: 'Asistencia humanitaria y atención prehospitalaria', primary: false },
];

export default function EmergencyAccess() {
  const [isOpen, setIsOpen] = useState(false);
  const openNovelty = useUiStore((state) => state.setNoveltyOpen);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  return <>
    <button type="button" onClick={() => setIsOpen(true)} aria-label="Abrir líneas de emergencia de Colombia" className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#B9200B] px-2.5 py-1.5 font-noto text-[11px] font-extrabold text-white shadow-sm transition-colors hover:bg-[#9C1B09] active:bg-[#821607] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">
      <PhoneCall className="h-3.5 w-3.5" aria-hidden />
      <span>123 SOS</span>
    </button>

    {isOpen && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="emergency-title" className="max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-red-500/50 bg-card text-xs text-text-primary shadow-2xl sm:rounded-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-red-600/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="rounded-xl bg-red-600 p-2 text-white shadow-md"><Phone className="h-4 w-4" aria-hidden /></span>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-red-500">Protocolo de Respuesta Inmediata</span>
              <h2 id="emergency-title" className="font-noto text-sm font-bold">Líneas de Emergencia · 123 SOS</h2>
            </div>
          </div>
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar líneas de emergencia" className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"><X className="h-4 w-4" aria-hidden /></button>
        </header>

        <div className="space-y-4 p-5">
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
            <p className="text-[11px] leading-relaxed">Si observas fuego activo cerca de viviendas, infraestructura o ecosistemas estratégicos, <strong>comunícate de inmediato con la línea 123 o Bomberos (119)</strong> antes de registrar la novedad en la plataforma. Las observaciones satelitales son contexto y no confirman por sí solas un incendio.</p>
          </div>
          <div className="space-y-2">
            {EMERGENCY_LINES.map((line) => <div key={line.number} className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${line.primary ? 'border-red-500/50 bg-red-600/10' : 'border-border bg-surface'}`}>
              <div className="min-w-0"><p className="text-xs font-bold">{line.name}</p><p className="text-[11px] text-text-secondary">{line.detail}</p></div>
              <a href={`tel:${line.number}`} aria-label={`Llamar al ${line.number}`} className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${line.primary ? 'bg-red-600 text-white hover:bg-red-500' : 'border border-border-strong bg-card text-text-primary hover:bg-surface-hover'}`}><Phone className="h-3.5 w-3.5" aria-hidden />{line.number}</a>
            </div>)}
          </div>
          <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] leading-4 text-text-secondary">La llamada solo se inicia si eliges una línea. La disponibilidad puede variar según el operador.</p>
            <button type="button" onClick={() => { setIsOpen(false); openNovelty(true); }} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent-solid px-3 py-2 font-noto text-[11px] font-bold text-accent-fg hover:opacity-90"><Flame className="h-3.5 w-3.5" aria-hidden />Ir a Reportar Novedad</button>
          </div>
        </div>
      </section>
    </div>}
  </>;
}
