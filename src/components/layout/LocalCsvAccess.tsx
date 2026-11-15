import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, FileSpreadsheet, ShieldCheck, Trash2, Upload, X } from 'lucide-react';
import { parseLocalCsv } from '@/services/csv/localCsvParser';
import { useLocalCsvStore } from '@/stores/localCsvStore';

const BUTTON = 'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 font-noto text-[11px] font-semibold transition-colors hover:bg-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 disabled:cursor-not-allowed disabled:opacity-40';
const MAX_FILE_BYTES = 25 * 1024 * 1024;

function useEscape(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, close]);
}

/** Botones “Cargar / Gestionar .CSV” y “Limpiar .CSV” de la barra superior. */
export default function LocalCsvAccess() {
  const datasets = useLocalCsvStore((state) => state.datasets);
  const addDataset = useLocalCsvStore((state) => state.addDataset);
  const removeDataset = useLocalCsvStore((state) => state.removeDataset);
  const clear = useLocalCsvStore((state) => state.clear);
  const managerOpen = useLocalCsvStore((state) => state.managerOpen);
  const setManagerOpen = useLocalCsvStore((state) => state.setManagerOpen);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const totalRecords = datasets.reduce((sum, item) => sum + item.observations.length, 0);
  useEscape(managerOpen, () => setManagerOpen(false));
  useEscape(confirmOpen, () => setConfirmOpen(false));

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const notes: string[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_BYTES) { notes.push(`${file.name}: supera 25 MB y no se cargó.`); continue; }
      const result = parseLocalCsv(await file.text(), file.name);
      if (!result.format || result.error) { notes.push(`${file.name}: ${result.error ?? 'formato no reconocido.'}`); continue; }
      if (!result.observations.length) { notes.push(`${file.name}: no contiene filas válidas (${result.skipped} descartadas).`); continue; }
      addDataset({ id: `${file.name}-${file.lastModified}`, fileName: file.name, format: result.format, observations: result.observations, skipped: result.skipped, loadedAt: new Date().toISOString() });
      notes.push(`${file.name}: ${result.observations.length.toLocaleString()} observaciones ${result.format === 'IDEAM' ? 'IDEAM' : 'NASA FIRMS'}${result.skipped ? `, ${result.skipped} filas descartadas` : ''}.`);
    }
    setMessages(notes);
    if (inputRef.current) inputRef.current.value = '';
  };

  return <>
    <button type="button" onClick={() => setManagerOpen(true)} className={`${BUTTON} text-accent`} title="Cargar o gestionar archivos .CSV locales (IDEAM / NASA FIRMS)">
      <Upload className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>Cargar / Gestionar .CSV</span>
      {datasets.length > 0 && <span className="rounded bg-surface-hover px-1.5 py-0.5 font-source text-[10px] font-bold tabular-nums text-accent">+{totalRecords.toLocaleString()} ({datasets.length})</span>}
    </button>
    <button type="button" onClick={() => setConfirmOpen(true)} disabled={!datasets.length} className={`${BUTTON} text-danger`} title={datasets.length ? 'Quitar los archivos .CSV cargados' : 'No hay archivos .CSV cargados'}>
      <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>Limpiar .CSV</span>
    </button>

    {managerOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setManagerOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="csv-title" className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border-strong bg-card text-text-primary shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-accent-soft p-2 text-accent"><FileSpreadsheet className="h-4 w-4" aria-hidden /></span><div><h2 id="csv-title" className="font-noto text-sm font-bold">Archivos .CSV locales</h2><p className="mt-0.5 text-[11px] text-text-secondary">IDEAM (Puntos_de_calor_Colombia_*.csv) o NASA FIRMS</p></div></div>
          <button type="button" onClick={() => setManagerOpen(false)} aria-label="Cerrar gestor de archivos CSV" className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"><X className="h-4 w-4" aria-hidden /></button>
        </header>
        <div className="space-y-4 overflow-y-auto p-4 text-xs">
          <div className="flex items-start gap-2.5 rounded-xl border border-info/40 bg-info-soft p-3 leading-5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden /><p>Los archivos se leen solo en este navegador: no se envían al Backend-API y se pierden al recargar. Sus observaciones se suman al mapa y a los módulos con la procedencia “CSV local”.</p></div>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface p-5 text-center hover:bg-surface-hover">
            <Upload className="h-5 w-5 text-accent" aria-hidden />
            <span className="font-noto font-bold">Seleccionar archivos .CSV</span>
            <span className="text-[11px] text-text-secondary">Máximo 25 MB por archivo. Puedes elegir varios.</span>
            <input ref={inputRef} type="file" accept=".csv,text/csv" multiple aria-label="Seleccionar archivos CSV" className="sr-only" onChange={(event) => void handleFiles(event.target.files)} />
          </label>
          {messages.length > 0 && <ul role="status" className="space-y-1 rounded-xl border border-border bg-surface p-3 text-[11px] text-text-secondary">{messages.map((message) => <li key={message}>{message}</li>)}</ul>}
          <div>
            <h3 className="mb-2 font-noto text-xs font-bold">Archivos cargados ({datasets.length})</h3>
            {datasets.length ? <ul className="space-y-1.5">{datasets.map((dataset) => <li key={dataset.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2">
              <div className="min-w-0"><p className="truncate font-semibold">{dataset.fileName}</p><p className="font-source text-[11px] text-text-secondary">{dataset.format === 'IDEAM' ? 'IDEAM' : 'NASA FIRMS'} · {dataset.observations.length.toLocaleString()} observaciones{dataset.skipped ? ` · ${dataset.skipped} descartadas` : ''}</p></div>
              <button type="button" onClick={() => removeDataset(dataset.id)} aria-label={`Quitar ${dataset.fileName}`} className="rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-danger"><Trash2 className="h-3.5 w-3.5" aria-hidden /></button>
            </li>)}</ul> : <p className="text-[11px] text-text-secondary">Todavía no has cargado archivos.</p>}
          </div>
          <p className="text-[11px] leading-4 text-text-secondary">Las observaciones de CSV no traen municipio ni departamento, así que no aparecen en filtros por ubicación ni en el agrupamiento por subregión.</p>
        </div>
      </section>
    </div>}

    {confirmOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="csv-clear-title" className="w-full max-w-sm space-y-4 rounded-2xl border border-danger/50 bg-card p-4 text-text-primary shadow-2xl">
        <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden /><div><h2 id="csv-clear-title" className="font-noto text-sm font-bold">¿Quitar los archivos .CSV?</h2><p className="mt-1 text-xs text-text-secondary">Se quitarán {datasets.length} archivo(s) y {totalRecords.toLocaleString()} observaciones locales. Los datos del Backend-API no cambian.</p></div></div>
        <div className="flex justify-end gap-2"><button type="button" onClick={() => setConfirmOpen(false)} className="ignis-action ignis-action-secondary">Cancelar</button><button type="button" onClick={() => { clear(); setMessages([]); setConfirmOpen(false); }} className="ignis-action border-transparent bg-danger font-bold text-background">Quitar archivos</button></div>
      </section>
    </div>}
  </>;
}
