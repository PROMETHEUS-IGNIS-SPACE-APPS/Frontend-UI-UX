import { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { GLOSSARY_SECTIONS } from './glossaryTerms';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Glosario por secciones (estructura de la carpeta Ejemplo). Los 7 términos
 * canónicos de PROJECT_CONTEXT.md §3.5 conservan su texto oficial exacto.
 */
export default function GlossaryModal({ isOpen, onClose }: GlossaryModalProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ '1': true });
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const normalizedQuery = query.trim().toLocaleLowerCase('es');
  const sections = useMemo(() => GLOSSARY_SECTIONS
    .map((section) => ({ ...section, terms: normalizedQuery ? section.terms.filter((item) => `${item.term} ${item.definition}`.toLocaleLowerCase('es').includes(normalizedQuery)) : section.terms }))
    .filter((section) => section.terms.length > 0), [normalizedQuery]);
  const totalTerms = GLOSSARY_SECTIONS.reduce((sum, section) => sum + section.terms.length, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="glossary-modal-title" aria-describedby="glossary-modal-subtitle" className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border-strong bg-card text-text-primary shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border bg-surface p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-info/30 bg-info-soft p-2 text-info"><BookOpen className="h-5 w-5" aria-hidden /></div>
            <div>
              <h2 id="glossary-modal-title" className="font-noto text-base font-bold text-text-primary">Glosario Científico & Marco Epistémico</h2>
              <p id="glossary-modal-subtitle" className="text-xs text-text-secondary">PROMETHEUS IGNIS — Semillero de Astronomía del ITM (NASA Space Apps Medellín 2026)</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar glosario" className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"><X className="h-5 w-5" aria-hidden /></button>
        </div>

        <div className="space-y-3 overflow-y-auto p-5 text-xs">
          <label className="flex items-center gap-2 rounded-xl border border-border-strong bg-input-bg px-3 py-2 text-text-secondary">
            <Search className="h-3.5 w-3.5" aria-hidden />
            <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Buscar en el glosario" placeholder={`Buscar entre ${totalTerms} términos…`} className="min-w-0 flex-1 bg-transparent text-xs text-text-primary outline-none placeholder:text-text-secondary" />
          </label>
          {sections.length === 0 && <p className="rounded-xl border border-border bg-surface p-4 text-text-secondary">No hay términos que coincidan con “{query}”.</p>}
          {sections.map((section) => {
            const open = Boolean(normalizedQuery) || Boolean(expanded[section.id]);
            return <div key={section.id} className="overflow-hidden rounded-xl border border-border bg-surface">
              <button type="button" onClick={() => setExpanded((current) => ({ ...current, [section.id]: !current[section.id] }))} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-surface-hover">
                <span className="flex min-w-0 items-center gap-2">
                  {open ? <ChevronDown className="h-4 w-4 shrink-0 text-accent" aria-hidden /> : <ChevronRight className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden />}
                  <span className="font-noto text-xs font-bold tracking-wide text-text-primary">{section.title}</span>
                </span>
                <span className="shrink-0 font-source text-[11px] text-text-secondary">{section.terms.length}</span>
              </button>
              {open && <div className="space-y-3 border-t border-border px-3.5 pb-3.5 pt-3">
                {section.terms.map((item) => <div key={item.term} className="space-y-1.5">
                  <h3 className="font-noto text-sm font-bold text-accent">{item.term}</h3>
                  <p className="text-[11px] leading-relaxed text-text-secondary">{item.definition}</p>
                </div>)}
              </div>}
            </div>;
          })}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface p-4 text-xs">
          <span className="font-source text-[11px] text-text-secondary">Fuentes: Giglio et al. (2016), Schroeder et al. (2014), NASA FIRMS, UNDRR Sendai Framework (2015).</span>
          <button type="button" onClick={onClose} className="ignis-action ignis-action-primary shrink-0">Entendido</button>
        </div>
      </div>
    </div>
  );
}
