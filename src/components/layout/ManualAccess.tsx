import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Printer, X } from 'lucide-react';
import { MANUAL_SECTIONS, type ManualBlock } from './manualContent';

const BROWN = 'text-[#6B2A12]';
const ORANGE = 'text-[#C9531F]';

function Callout({ text, tone }: { text: string; tone: 'tip' | 'warn' }) {
  const split = text.indexOf(':');
  return <p className={`break-inside-avoid border-l-4 px-3 py-2 ${tone === 'tip' ? 'border-[#3F8F3F] bg-[#E7F1E3]' : 'border-[#B3261E] bg-[#FBE6DD]'}`}>
    <strong>{text.slice(0, split + 1)}</strong>{text.slice(split + 1)}
  </p>;
}

function Block({ block }: { block: ManualBlock }) {
  switch (block.kind) {
    case 'p': return <p>{block.text}</p>;
    case 'h': return <h4 className={`pt-1 font-bold ${BROWN}`}>{block.text}</h4>;
    case 'list': return <ul className="list-disc space-y-1 pl-5 marker:text-[#C9531F]">{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
    case 'steps': return <ol className="list-decimal space-y-1 pl-5 marker:font-bold marker:text-[#C9531F]">{block.items.map((item) => <li key={item}>{item}</li>)}</ol>;
    case 'tip': return <Callout text={block.text} tone="tip" />;
    case 'warn': return <Callout text={block.text} tone="warn" />;
    case 'table': return <div className="overflow-x-auto"><table className="w-full break-inside-avoid border-collapse text-left">
      <thead><tr>{block.head.map((cell) => <th key={cell} className="border border-[#E3CDB0] bg-[#6B2A12] px-2.5 py-1.5 font-bold text-white">{cell}</th>)}</tr></thead>
      <tbody>{block.rows.map((row) => <tr key={row.join('|')}>{row.map((cell, index) => <td key={`${index}-${cell}`} className={`border border-[#E3CDB0] px-2.5 py-1.5 align-top ${index === 0 ? 'bg-[#F2E3CF]' : 'bg-white'}`}>{cell}</td>)}</tr>)}</tbody>
    </table></div>;
  }
}

/** Botón “Instructivo (.PDF)”: muestra el instructivo oficial y lo guarda como PDF con el diálogo de impresión. */
export default function ManualAccess() {
  const [isOpen, setIsOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.classList.add('print-manual');
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('print-manual'); window.removeEventListener('keydown', onKey); };
  }, [isOpen]);

  const goTo = (id: string) => bodyRef.current?.querySelector(`#manual-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return <>
    <button type="button" onClick={() => setIsOpen(true)} aria-label="Abrir Instructivo metodológico" title="Instructivo oficial de uso (guardar como .PDF)" className="flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-card px-2.5 font-noto text-xs font-semibold text-text-primary transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">
      <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="hidden sm:inline">Instructivo (.PDF)</span>
    </button>

    {isOpen && createPortal(<div id="manual-print-root" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-2 sm:p-4 print:static print:block print:bg-white print:p-0" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-label="Instructivo oficial de uso" className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border-strong bg-white text-[#2B1D14] shadow-2xl print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:border-0 print:shadow-none">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#E3CDB0] bg-[#FBF5EC] px-3 py-2 print:hidden">
          <span className="font-noto text-xs font-semibold text-[#6B2A12]">Instructivo oficial de uso</span>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-[#6B2A12] px-3 py-1.5 font-noto text-xs font-bold text-white hover:bg-[#55210E]"><Printer className="h-3.5 w-3.5" aria-hidden />Guardar como PDF</button>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar instructivo" className="rounded-lg p-1.5 text-[#6B2A12] hover:bg-[#F2E3CF]"><X className="h-4 w-4" aria-hidden /></button>
          </div>
        </div>

        <div ref={bodyRef} className="space-y-6 overflow-y-auto px-4 py-5 font-sans text-[13px] leading-6 sm:px-8 print:overflow-visible print:px-0 print:text-[11pt]">
          <header className="break-after-page space-y-4">
            <div className="overflow-hidden rounded-md">
              <div className="bg-[#6B2A12] px-5 pb-5 pt-6 text-white">
                <h2 className="font-noto text-3xl font-extrabold tracking-tight sm:text-4xl">PROMETHEUS IGNIS</h2>
                <p className="mt-2 text-lg text-[#F6D9B8] sm:text-xl">Instructivo oficial de uso</p>
              </div>
              <div className="bg-[#C9531F] px-5 py-1.5 text-xs font-bold text-white sm:text-sm">Plataforma de Inteligencia Territorial · Semillero ITM</div>
            </div>
            <div>
              <p className={`font-noto text-base font-bold ${BROWN}`}>Guía para conocer, recorrer y aprovechar la plataforma</p>
              <p>Pensada para que la use cualquier persona: campesinos, líderes comunitarios, estudiantes, docentes, brigadistas y profesionales.</p>
              <p className="mt-2 text-xs text-[#7A6555]">Noviembre de 2026 · NASA Space Apps Challenge Medellín</p>
            </div>
            <nav aria-label="Contenido del instructivo" className="rounded-md border border-[#E3CDB0] bg-[#FBF5EC] p-4">
              <h3 className={`mb-2 font-noto text-lg font-bold ${BROWN}`}>Contenido</h3>
              <ul className="space-y-0.5">
                {MANUAL_SECTIONS.map((section) => <li key={section.id} className={section.level === 2 ? 'pl-4' : 'pt-1'}>
                  <button type="button" onClick={() => goTo(section.id)} className={`text-left hover:underline ${section.level === 1 ? `font-bold ${BROWN}` : 'text-[#3B2A1E]'}`}>{section.title}</button>
                </li>)}
              </ul>
            </nav>
          </header>

          {MANUAL_SECTIONS.map((section) => <section key={section.id} id={`manual-${section.id}`} className={`scroll-mt-3 space-y-2.5 ${section.level === 1 ? 'pt-2' : ''}`}>
            {section.level === 1
              ? <h3 className={`border-b-2 border-[#C9531F] pb-1 font-noto text-xl font-bold ${BROWN}`}>{section.title}</h3>
              : <h3 className={`font-noto text-base font-bold ${ORANGE}`}>{section.title}</h3>}
            {section.blocks.map((block, index) => <Block key={`${section.id}-${index}`} block={block} />)}
          </section>)}

          <footer className="border-t border-[#E3CDB0] pt-2 text-[11px] text-[#7A6555]">PROMETHEUS IGNIS · Instructivo oficial · Semillero de Astronomía ITM</footer>
        </div>
      </section>
    </div>, document.body)}
  </>;
}
