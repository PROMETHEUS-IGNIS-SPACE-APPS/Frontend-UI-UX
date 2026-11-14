import { useEffect, useState } from 'react';
import { AlertTriangle, Flame, PhoneCall, ShieldAlert, X } from 'lucide-react';

export default function EmergencyAccess() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  return <>
    <button
      type="button"
      onClick={() => setIsOpen(true)}
      aria-label="Abrir líneas de emergencia de Colombia"
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#B9200B] px-2.5 py-1.5 font-noto text-[11px] font-extrabold text-white shadow-sm transition-colors hover:bg-[#9C1B09] active:bg-[#821607] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
    >
      <PhoneCall className="h-3.5 w-3.5" aria-hidden />
      <span>123 SOS</span>
    </button>

    {isOpen && <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="emergency-title" className="w-full max-w-md overflow-hidden rounded-2xl border border-red-500/50 bg-[#080e19] text-slate-100 shadow-2xl shadow-black/50">
        <header className="flex items-start justify-between gap-3 border-b border-slate-800 bg-red-950/30 p-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-red-600 p-2 text-white"><ShieldAlert className="h-4 w-4" aria-hidden /></span>
            <div>
              <h2 id="emergency-title" className="font-mono text-sm font-bold">Líneas de emergencia · Colombia</h2>
              <p className="mt-1 text-[10px] text-slate-400">La llamada solo se inicia si eliges una línea.</p>
            </div>
          </div>
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar líneas de emergencia" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><X className="h-4 w-4" aria-hidden /></button>
        </header>

        <div className="space-y-4 p-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-700/50 bg-amber-950/30 p-3 text-[11px] leading-5 text-amber-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
            <p>Usa estas líneas solo ante una emergencia real. Las observaciones satelitales son información de contexto y no confirman por sí solas un incendio activo.</p>
          </div>
          <div className="grid gap-2.5">
            <a href="tel:123" className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-mono font-extrabold text-white transition hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><PhoneCall className="h-4 w-4" aria-hidden />Llamar a la línea nacional 123</a>
            <a href="tel:119" className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><Flame className="h-4 w-4" aria-hidden />Llamar a Bomberos 119</a>
          </div>
          <p className="text-[9px] leading-4 text-slate-500">Líneas nacionales de Colombia. La disponibilidad y el enrutamiento pueden variar según el operador y la ubicación.</p>
        </div>
      </section>
    </div>}
  </>;
}
