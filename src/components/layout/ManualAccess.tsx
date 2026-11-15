import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, ExternalLink, FileText, X } from 'lucide-react';

/** Instructivo oficial del equipo (PDF de 14 páginas, noviembre 2026), servido desde `public/docs`. */
const MANUAL_PDF_URL = '/docs/PROMETHEUS_IGNIS_Instructivo_Oficial_de_Uso.pdf';

/** Botón “Instructivo (.PDF)”: abre el PDF oficial del equipo en un visor dentro de la página. */
export default function ManualAccess() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return <>
    <button type="button" onClick={() => setIsOpen(true)} aria-label="Abrir Instructivo metodológico" title="Instructivo oficial de uso (.PDF)" className="flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-card px-2.5 font-noto text-xs font-semibold text-text-primary transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">
      <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="hidden sm:inline">Instructivo (.PDF)</span>
    </button>

    {isOpen && createPortal(<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-2 sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-label="Instructivo oficial de uso" className="flex h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border-strong bg-white text-[#2B1D14] shadow-2xl">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#E3CDB0] bg-[#FBF5EC] px-3 py-2">
          <span className="font-noto text-xs font-semibold text-[#6B2A12]">PROMETHEUS IGNIS — Instructivo oficial de uso</span>
          <div className="flex items-center gap-1.5">
            <a href={MANUAL_PDF_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[#6B2A12]/40 px-3 py-1.5 font-noto text-xs font-bold text-[#6B2A12] hover:bg-[#F2E3CF]"><ExternalLink className="h-3.5 w-3.5" aria-hidden /><span className="hidden sm:inline">Abrir en pestaña nueva</span><span className="sm:hidden">Abrir</span></a>
            <a href={MANUAL_PDF_URL} download className="inline-flex items-center gap-1.5 rounded-lg bg-[#6B2A12] px-3 py-1.5 font-noto text-xs font-bold text-white hover:bg-[#55210E]"><Download className="h-3.5 w-3.5" aria-hidden />Descargar PDF</a>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar instructivo" className="rounded-lg p-1.5 text-[#6B2A12] hover:bg-[#F2E3CF]"><X className="h-4 w-4" aria-hidden /></button>
          </div>
        </div>
        <iframe title="Instructivo oficial de uso (PDF)" src={`${MANUAL_PDF_URL}#view=FitH`} className="min-h-0 w-full flex-1 border-0 bg-[#525659]" />
        <p className="shrink-0 border-t border-[#E3CDB0] bg-[#FBF5EC] px-3 py-1.5 text-[11px] text-[#7A6555]">¿No se ve el documento? Algunos celulares no muestran PDF dentro de la página: use “Abrir” o “Descargar PDF”.</p>
      </section>
    </div>, document.body)}
  </>;
}
