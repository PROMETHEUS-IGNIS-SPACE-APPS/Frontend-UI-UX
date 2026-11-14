import { useState } from 'react';
import { AlertTriangle, MapPin, PhoneCall, X } from 'lucide-react';

export default function NoveltyReportAccess() {
  const [isOpen, setIsOpen] = useState(false);

  return <>
    <button type="button" onClick={() => setIsOpen(true)} aria-label="Reportar una novedad territorial" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-orange-500/70 bg-orange-600 px-2.5 py-2 text-[10px] font-bold text-white shadow-sm transition hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 sm:px-3">
      <MapPin className="h-3.5 w-3.5" aria-hidden />
      <span>Reportar Novedad</span>
    </button>

    {isOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="novelty-title" className="w-full max-w-md overflow-hidden rounded-2xl border border-orange-500/50 bg-[#080e19] text-slate-100 shadow-2xl shadow-black/50">
        <header className="flex items-start justify-between gap-3 border-b border-slate-800 bg-orange-950/25 p-4">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-orange-600/20 p-2 text-orange-300"><MapPin className="h-4 w-4" aria-hidden /></span><div><h2 id="novelty-title" className="font-mono text-sm font-bold">Reporte de novedad</h2><p className="mt-1 text-[10px] text-slate-400">Recepción de reportes en desarrollo</p></div></div>
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar aviso de reporte" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><X className="h-4 w-4" aria-hidden /></button>
        </header>
        <div className="space-y-4 p-4">
          <div role="status" className="flex items-start gap-2.5 rounded-xl border border-amber-700/50 bg-amber-950/30 p-3 text-[11px] leading-5 text-amber-100"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden /><p>Esta versión todavía no recibe ni guarda reportes ciudadanos. No se enviará información desde este botón.</p></div>
          <p className="text-[11px] leading-5 text-slate-300">Si hay una emergencia activa, comunícate directamente con las autoridades; las detecciones del mapa son señales satelitales y no verifican un incidente.</p>
          <div className="grid gap-2 sm:grid-cols-2"><a href="tel:123" className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><PhoneCall className="h-3.5 w-3.5" aria-hidden />Emergencias 123</a><a href="tel:119" className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><PhoneCall className="h-3.5 w-3.5" aria-hidden />Bomberos 119</a></div>
        </div>
      </section>
    </div>}
  </>;
}
