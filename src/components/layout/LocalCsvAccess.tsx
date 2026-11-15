import { useEffect, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, FileSpreadsheet, ShieldCheck, Trash2, Upload, X } from 'lucide-react';
import { parseLocalCsv } from '@/services/csv/localCsvParser';
import { useLocalCsvStore } from '@/stores/localCsvStore';
import { useCitizenReportsStore } from '@/stores/citizenReportsStore';

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
  const reportsCount = useCitizenReportsStore((state) => state.reports.length);
  const clearReports = useCitizenReportsStore((state) => state.clearReports);
  const canClear = datasets.length > 0 || reportsCount > 0;
  const [messages, setMessages] = useState<{ ok: boolean; text: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const totalRecords = datasets.reduce((sum, item) => sum + item.observations.length, 0);
  useEscape(managerOpen, () => setManagerOpen(false));
  useEscape(confirmOpen, () => setConfirmOpen(false));

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const notes: { ok: boolean; text: string }[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_BYTES) { notes.push({ ok: false, text: `${file.name}: supera 25 MB y no se cargó.` }); continue; }
      const result = parseLocalCsv(await file.text(), file.name);
      if (!result.format || result.error) { notes.push({ ok: false, text: `${file.name}: ${result.error ?? 'formato no reconocido.'}` }); continue; }
      if (!result.observations.length) { notes.push({ ok: false, text: `${file.name}: no contiene filas válidas (${result.skipped} descartadas).` }); continue; }
      addDataset({ id: `${file.name}-${file.lastModified}`, fileName: file.name, format: result.format, observations: result.observations, skipped: result.skipped, loadedAt: new Date().toISOString() });
      notes.push({ ok: true, text: `${file.name}: ${result.observations.length.toLocaleString()} observaciones ${result.format === 'IDEAM' ? 'IDEAM' : 'NASA FIRMS'}${result.skipped ? `, ${result.skipped} filas descartadas` : ''}.` });
    }
    setMessages(notes);
    if (inputRef.current) inputRef.current.value = '';
  };

  return <>
    <button type="button" onClick={() => setManagerOpen(true)} className={`${BUTTON} text-accent`} title="Cargar o gestionar archivos .CSV locales (IDEAM / NASA FIRMS)">
      <Upload className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="hidden sm:inline">Cargar / Gestionar .CSV</span><span className="sm:hidden">Cargar CSV</span>
      {datasets.length > 0 && <span className="rounded bg-surface-hover px-1.5 py-0.5 font-source text-[10px] font-bold tabular-nums text-accent">+{totalRecords.toLocaleString()} ({datasets.length})</span>}
    </button>
    <button type="button" onClick={() => setConfirmOpen(true)} disabled={!canClear} aria-label="Limpiar .CSV" className={`${BUTTON} text-danger`} title={canClear ? 'Borrar reportes ciudadanos y archivos .CSV de este dispositivo' : 'No hay reportes ni archivos .CSV en este dispositivo'}>
      <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="hidden sm:inline">Limpiar .CSV</span>
    </button>

    {managerOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setManagerOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="csv-title" className="flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border-strong bg-card text-xs text-text-primary shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="rounded-xl border border-border-strong bg-card p-2 text-accent"><FileSpreadsheet className="h-4 w-4" aria-hidden /></span>
            <div>
              <h2 id="csv-title" className="font-noto text-sm font-bold">Cargar / Gestionar Archivos .CSV</h2>
              <p className="text-[11px] text-text-secondary">Compatible con formato IDEAM SMByC (;) y NASA FIRMS (,)</p>
            </div>
          </div>
          <button type="button" onClick={() => setManagerOpen(false)} aria-label="Cerrar gestor de archivos CSV" className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"><X className="h-4 w-4" aria-hidden /></button>
        </header>

        <div className="space-y-4 overflow-y-auto p-5">
          <div
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); void handleFiles(event.dataTransfer.files); }}
            className={`space-y-2.5 rounded-xl border-2 border-dashed p-5 text-center transition-colors ${dragging ? 'border-accent bg-accent-soft' : 'border-accent/60 bg-background hover:border-accent'}`}
          >
            <Upload className="mx-auto h-6 w-6 text-accent" aria-hidden />
            <div>
              <p className="font-semibold text-text-primary">Arrastra uno o varios archivos .CSV aquí o selecciónalos desde tu equipo</p>
              <p className="mt-0.5 text-[11px] text-text-secondary">Las observaciones válidas se suman al mapa activo sin duplicar identificadores. Máximo 25 MB por archivo.</p>
            </div>
            <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg bg-accent-solid px-4 py-2 font-bold text-accent-fg transition-opacity hover:opacity-90">
              <Upload className="h-3.5 w-3.5" aria-hidden />Seleccionar archivo(s) .CSV
            </button>
            <input ref={inputRef} type="file" accept=".csv,text/csv" multiple aria-label="Seleccionar archivos CSV" className="sr-only" tabIndex={-1} onChange={(event) => void handleFiles(event.target.files)} />
          </div>

          {messages.length > 0 && <ul role="status" className="space-y-1.5">{messages.map((message) => <li key={message.text} className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-[11px] ${message.ok ? 'border-success/40 bg-success-soft text-success' : 'border-danger/40 bg-danger-soft text-danger'}`}>
            {message.ok ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> : <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />}<span>{message.text}</span>
          </li>)}</ul>}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-noto text-xs font-semibold">Archivos .CSV cargados ({datasets.length})</h3>
              {totalRecords > 0 && <span className="font-source text-[11px] font-bold tabular-nums text-accent">+{totalRecords.toLocaleString()} observaciones agregadas</span>}
            </div>
            {datasets.length ? <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">{datasets.map((dataset) => <li key={dataset.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
              <div className="flex min-w-0 items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{dataset.fileName}</p>
                  <p className="font-source text-[10px] tabular-nums text-text-secondary">{dataset.format === 'IDEAM' ? 'IDEAM' : 'NASA FIRMS'} · +{dataset.observations.length.toLocaleString()} observaciones{dataset.skipped ? ` · ${dataset.skipped} filas descartadas` : ''} · {new Date(dataset.loadedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <button type="button" onClick={() => removeDataset(dataset.id)} aria-label={`Quitar ${dataset.fileName}`} className="shrink-0 rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger-soft hover:text-danger"><Trash2 className="h-3.5 w-3.5" aria-hidden /></button>
            </li>)}</ul> : <p className="rounded-xl border border-border bg-surface p-4 text-center text-[11px] text-text-secondary">No hay archivos .CSV locales cargados en esta sesión.</p>}
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-info/40 bg-info-soft p-3 text-[11px] leading-5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden />
            <p>Los archivos se leen solo en este navegador: no se envían al Backend-API y se pierden al recargar. Aparecen con la procedencia “CSV local” y, como no traen municipio ni departamento, no entran en filtros por ubicación ni en el agrupamiento por subregión.</p>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-surface px-5 py-3.5">
          <button type="button" disabled={!canClear} onClick={() => setConfirmOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-danger/50 bg-danger-soft px-3 py-1.5 font-semibold text-danger transition-colors hover:border-danger disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" aria-hidden />Limpiar todos (.CSV)</button>
          <button type="button" onClick={() => setManagerOpen(false)} className="rounded-lg bg-accent-solid px-4 py-1.5 font-bold text-accent-fg transition-opacity hover:opacity-90">Listo</button>
        </footer>
      </section>
    </div>}

    {confirmOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="csv-clear-title" className="w-full max-w-md overflow-hidden rounded-2xl border border-border-strong bg-card text-xs text-text-primary shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-border bg-surface px-5 py-4">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0 rounded-xl border border-danger/30 bg-danger-soft p-2 text-danger"><Trash2 className="h-4 w-4" aria-hidden /></span>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-danger">Confirmación</span>
              <h2 id="csv-clear-title" className="font-noto text-sm font-bold">Limpiar Reportes Ciudadanos (.CSV)</h2>
            </div>
          </div>
          <button type="button" onClick={() => setConfirmOpen(false)} aria-label="Cerrar confirmación" className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"><X className="h-4 w-4" aria-hidden /></button>
        </header>
        <div className="space-y-4 p-5">
          <div className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger-soft p-3 text-[11px] leading-relaxed">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
            <p>Se borrarán de este dispositivo <strong className="tabular-nums">{reportsCount}</strong> reporte(s) ciudadano(s) y <strong className="tabular-nums">{datasets.length}</strong> archivo(s) .CSV con <strong className="tabular-nums">{totalRecords.toLocaleString()}</strong> observaciones locales. Los datos del Backend-API no cambian.</p>
          </div>
          <p className="text-[11px] leading-5 text-text-secondary">Si necesitas conservar los reportes, usa primero “Descargar Reportes (.CSV)”. Esta acción no se puede deshacer.</p>
          <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
            <button type="button" onClick={() => setConfirmOpen(false)} className="rounded-xl border border-border-strong bg-surface px-4 py-2 font-medium transition-colors hover:bg-surface-hover">Cancelar</button>
            <button type="button" onClick={() => { clear(); clearReports(); setMessages([]); setConfirmOpen(false); }} className="inline-flex items-center gap-1.5 rounded-xl bg-[#B9200B] px-4 py-2 font-noto font-bold text-white shadow-sm transition-colors hover:bg-[#9C1B09]"><Trash2 className="h-3.5 w-3.5" aria-hidden />Confirmar Limpieza</button>
          </div>
        </div>
      </section>
    </div>}
  </>;
}
