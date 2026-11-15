import { useState } from 'react';
import { Activity, CheckCircle2, Copy, Database, FileSpreadsheet, RefreshCw, Server, ShieldAlert, XCircle } from 'lucide-react';
import { checkEndpoint, diagnosticEndpoints, type EndpointResult } from '@/services/api/diagnosticsService';
import { ModuleHeader, ModulePage } from '@/components/common/ModuleLayout';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { useLocalCsvStore } from '@/stores/localCsvStore';
import type { ObservationSourceMode } from '@/types/api/observations';

const ENDPOINTS = [
  { method: 'GET', path: '/api/health', use: 'Indicador de conexión del encabezado (se consulta cada 60 s).' },
  { method: 'GET', path: '/api/fusion/observations?from&to&region', use: 'Fuente “Combinado IDEAM + NASA FIRMS” del Mapa.' },
  { method: 'GET', path: '/api/ideam/observations?from&to&region', use: 'Fuente “IDEAM · SMByC”.' },
  { method: 'GET', path: '/api/firms/observations?region', use: 'Fuente “NASA FIRMS · NRT 7 días”.' },
  { method: 'GET', path: '/api/fusion/historical-all?region', use: 'Fuente “Histórico muestreado · 2024–hoy”.' },
];

const SOURCES = [
  { name: 'IDEAM · SMByC', detail: 'Archivos diarios de puntos de calor de Colombia. Hora local UTC-5, coma decimal.', limit: 'Rango inclusivo de hasta 90 días por consulta.' },
  { name: 'NASA FIRMS', detail: 'Feed NRT público. MODIS (~1 km) y VIIRS (~375 m), horas en UTC.', limit: 'Solo los últimos 7 días; no admite rango de fechas.' },
  { name: 'Combinado IDEAM + FIRMS', detail: 'Fusión con deduplicación multi-satélite hecha por el Backend-API.', limit: 'Rango inclusivo de hasta 90 días.' },
  { name: 'Histórico muestreado', detail: 'Cortes semimensuales desde 2024-01-01 más datos recientes.', limit: 'Tope de 9.000 registros; no es una serie diaria continua.' },
];

const STATUS = {
  checking: { label: 'Comprobando…', tone: 'neutral' as const, icon: RefreshCw, color: 'text-text-secondary' },
  connected: { label: 'Conectado', tone: 'success' as const, icon: CheckCircle2, color: 'text-success' },
  unavailable: { label: 'No disponible', tone: 'warning' as const, icon: XCircle, color: 'text-danger' },
};

interface SourcesPanelProps {
  sourceMode: ObservationSourceMode;
  provenance: string;
  loadedCount: number;
  totalMatching: number;
  warning?: string | null;
  degradedMode?: boolean;
}

const SOURCE_LABELS: Record<ObservationSourceMode, string> = {
  fusion: 'Combinado IDEAM + NASA FIRMS',
  ideam: 'IDEAM · SMByC',
  firms: 'NASA FIRMS · NRT 7 días',
  historical: 'Histórico muestreado',
};

export default function SourcesPanel({ sourceMode, provenance, loadedCount, totalMatching, warning, degradedMode }: SourcesPanelProps) {
  const { outcome, checkNow } = useBackendHealth();
  const datasets = useLocalCsvStore((state) => state.datasets);
  const status = STATUS[outcome];
  const StatusIcon = status.icon;
  const [results, setResults] = useState<EndpointResult[] | null>(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const testAll = async () => {
    setTesting(true);
    setResults(await Promise.all(diagnosticEndpoints().map(checkEndpoint)));
    setTesting(false);
    checkNow();
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); }
  };
  const baseUrl = typeof import.meta.env.VITE_API_BASE_URL === 'string' && import.meta.env.VITE_API_BASE_URL.trim() ? import.meta.env.VITE_API_BASE_URL : null;

  return <ModulePage>
    <ModuleHeader
      badge={{ label: `Backend ${status.label}`, tone: status.tone }}
      meta="Contrato API v0.2"
      icon={Server}
      title="Fuentes de Datos y Backend-API"
      description="Qué servicios consulta la plataforma, en qué estado están y qué límites tiene cada fuente."
      actions={<>
        <button type="button" onClick={() => void copyLink()} className="ignis-action ignis-action-secondary"><Copy className="h-3.5 w-3.5" aria-hidden />{copied ? '¡Enlace copiado!' : 'Copiar enlace'}</button>
        <button type="button" onClick={() => void testAll()} disabled={testing} className="ignis-action ignis-action-primary disabled:opacity-60"><Activity className={`h-3.5 w-3.5 ${testing ? 'animate-pulse' : ''}`} aria-hidden />{testing ? 'Probando…' : 'Probar todas las APIs'}</button>
        <button type="button" onClick={checkNow} className="ignis-action ignis-action-secondary"><RefreshCw className="h-3.5 w-3.5" aria-hidden />Comprobar conexión</button>
      </>}
    />

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <article className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-noto text-sm font-bold"><Server className="h-4 w-4 text-accent" />Backend-API</h2>
        <p className={`flex items-center gap-2 font-source text-2xl font-extrabold ${status.color}`}><StatusIcon className={`h-5 w-5 ${outcome === 'checking' ? 'animate-spin' : ''}`} aria-hidden />{status.label}</p>
        <dl className="space-y-1.5 font-source text-[11px]">
          <div><dt className="text-text-secondary">URL base</dt><dd className="break-all font-semibold text-text-primary">{baseUrl ?? 'No configurada (VITE_API_BASE_URL)'}</dd></div>
          <div><dt className="text-text-secondary">Comprobación</dt><dd className="text-text-primary">GET /api/health, automática cada 60 s</dd></div>
        </dl>
      </article>

      <article className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-noto text-sm font-bold"><Database className="h-4 w-4 text-info" />Consulta actual del Mapa</h2>
        <p className="font-source text-2xl font-extrabold text-text-primary">{loadedCount.toLocaleString()} <span className="text-sm font-normal text-text-secondary">/ {totalMatching.toLocaleString()} coincidentes</span></p>
        <dl className="space-y-1.5 font-source text-[11px]">
          <div><dt className="text-text-secondary">Fuente elegida</dt><dd className="font-semibold text-text-primary">{SOURCE_LABELS[sourceMode]}</dd></div>
          <div><dt className="text-text-secondary">Procedencia informada</dt><dd className="break-words text-text-primary">{provenance}</dd></div>
        </dl>
        {degradedMode && <p className="rounded-lg border border-warning/40 bg-warning-soft p-2 text-[11px] text-text-primary">La fuente remota no respondió; el backend entregó caché auténtica.</p>}
        {warning && <p className="rounded-lg border border-warning/40 bg-warning-soft p-2 text-[11px] text-text-primary">{warning}</p>}
      </article>

      <article className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-noto text-sm font-bold"><FileSpreadsheet className="h-4 w-4 text-success" />CSV locales</h2>
        <p className="font-source text-2xl font-extrabold text-text-primary">{datasets.length} <span className="text-sm font-normal text-text-secondary">archivo(s)</span></p>
        {datasets.length ? <ul className="space-y-1 font-source text-[11px]">{datasets.map((item) => <li key={item.id} className="flex justify-between gap-2"><span className="truncate text-text-primary">{item.fileName}</span><span className="shrink-0 text-text-secondary">{item.observations.length.toLocaleString()} obs.</span></li>)}</ul> : <p className="text-[11px] text-text-secondary">Usa “Cargar / Gestionar .CSV” en la barra superior. Los archivos no salen de este navegador.</p>}
      </article>
    </div>

    {results && <article className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-noto text-base font-bold"><Activity className="h-4 w-4 text-accent" aria-hidden />Diagnóstico en tiempo real</h2><span className="font-source text-[11px] text-text-secondary">{results.filter((item) => item.ok).length} de {results.length} responden</span></div>
      <ul className="divide-y divide-border">{results.map((item) => <li key={item.path} className="flex flex-wrap items-center justify-between gap-2 py-2 font-source text-[11px]">
        <span className="min-w-0"><span className="block font-semibold text-text-primary">{item.label}</span><span className="block break-all text-text-secondary">{item.apiPrefix}{item.path.split('?')[0]}</span></span>
        <span className="flex shrink-0 items-center gap-2"><span className="tabular-nums text-text-secondary">{item.latencyMs.toLocaleString()} ms</span><span className={`rounded px-2 py-0.5 font-bold ${item.ok ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>{item.ok ? 'OK' : 'FALLO'} · {item.detail}</span></span>
      </li>)}</ul>
      <p className="text-[10px] text-text-secondary">Consultas cortas (Antioquia, 2 días) para no recargar el servidor. La latencia incluye la descarga de la fuente cuando el backend no la tiene en caché.</p>
    </article>}

    <article className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-noto text-base font-bold">Endpoints consultados</h2>
      <div className="overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-left text-xs">
        <thead><tr className="border-b border-border font-noto text-[11px] text-text-secondary"><th className="py-2 pr-3">Método</th><th className="py-2 pr-3">Ruta</th><th className="py-2">Uso en la interfaz</th></tr></thead>
        <tbody className="divide-y divide-border font-source text-[11px]">{ENDPOINTS.map((endpoint) => <tr key={endpoint.path}><td className="py-2 pr-3 font-bold text-success">{endpoint.method}</td><td className="py-2 pr-3 font-semibold text-text-primary">{endpoint.path}</td><td className="py-2 text-text-secondary">{endpoint.use}</td></tr>)}</tbody>
      </table></div>
    </article>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {SOURCES.map((source) => <article key={source.name} className="space-y-1.5 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="font-noto text-sm font-bold text-text-primary">{source.name}</h3>
        <p className="text-xs text-text-secondary">{source.detail}</p>
        <p className="font-source text-[11px] font-semibold text-warning">Límite: {source.limit}</p>
      </article>)}
    </div>

    <div className="flex items-start gap-3 rounded-2xl border border-info/40 bg-info-soft p-4 text-xs">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-info" />
      <p className="leading-relaxed text-text-primary">La interfaz no tiene endpoints para recibir reportes ciudadanos ni para publicar modelos. Esos módulos lo indican explícitamente en lugar de simular datos.</p>
    </div>
  </ModulePage>;
}
