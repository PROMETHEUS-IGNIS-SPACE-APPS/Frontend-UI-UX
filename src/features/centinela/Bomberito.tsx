import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, PhoneCall, ShieldAlert, X } from 'lucide-react';
import { fetchCentinelaModel } from '@/services/models/centinelaModelService';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import type { CentinelaEstimate, CentinelaForecast } from '@/types/api/centinela';
import type { Observation } from '@/types/api/observations';
import { nearestReferenceName } from '@/utils/subregions';

interface BomberitoProps {
  observations: Observation[];
  /** Lleva al Mapa centrado en [lon, lat]. */
  onShowCell?: (center: [number, number]) => void;
}

const BOMBERITO_IMAGE = `${import.meta.env.BASE_URL}assets/centinela/bomberito.webp`;
const SEEN_KEY = 'prometheus-ignis-bomberito-visto';
const readSeen = () => { try { return globalThis.localStorage?.getItem(SEEN_KEY) === '1'; } catch { return false; } };

const pct = (value: number | null | undefined) => value === null || value === undefined ? 'Datos insuficientes' : `${(value * 100).toFixed(1)} %`;
const productLabel = (product: string) => product === 'VIIRS_NOAA20' ? 'VIIRS NOAA-20' : product;
const centerOf = (forecast: CentinelaForecast): [number, number] => [(forecast.bounds[0] + forecast.bounds[2]) / 2, (forecast.bounds[1] + forecast.bounds[3]) / 2];
function cellName(forecast: CentinelaForecast) {
  const [lon, lat] = centerOf(forecast);
  const near = nearestReferenceName(lat, lon);
  return `${near ? `Cerca de ${near}` : 'Celda'} (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
}

function Estimate({ label, estimate }: { label: string; estimate: CentinelaEstimate }) {
  return <div className="rounded-lg border border-border bg-surface p-2">
    <dt className="text-[10px] text-text-secondary">{label}</dt>
    <dd className="font-bold text-text-primary">{pct(estimate.probability)}</dd>
    <dd className="text-[10px] text-text-secondary">{estimate.interval_95 ? `IC 95 %: ${pct(estimate.interval_95[0])} – ${pct(estimate.interval_95[1])}` : 'Sin intervalo'} · n={estimate.n}</dd>
  </div>;
}

/**
 * BOMBERITO CENTINELA: asistente flotante que presenta el modelo CENTINELA
 * publicado por el AI-Pipeline (artefacto estático) y las detecciones recientes
 * cargadas. Información experimental: no emite alertas.
 */
export default function Bomberito({ observations, onShowCell }: BomberitoProps) {
  const [open, setOpen] = useState(false);
  /** Tras la primera apertura la invitación se calma (solo un rebote suave). */
  const [seen, setSeen] = useState(readSeen);
  const toggle = () => {
    setOpen((value) => !value);
    if (!seen) { setSeen(true); try { globalThis.localStorage?.setItem(SEEN_KEY, '1'); } catch { /* sin almacenamiento */ } }
  };
  const [cellId, setCellId] = useState('');
  const { outcome } = useBackendHealth();
  const model = useQuery({ queryKey: ['centinela-model'], queryFn: ({ signal }) => fetchCentinelaModel(signal), staleTime: Infinity, enabled: open });

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const forecasts = useMemo(() => model.data?.forecasts ?? [], [model.data]);
  const cells = useMemo(() => [...new Map(forecasts.map((item) => [item.cell_id, item])).values()].sort((a, b) => (b.historical_frequency ?? 0) - (a.historical_frequency ?? 0)), [forecasts]);
  const high = forecasts.filter((item) => item.historical_frequency !== null && item.historical_frequency >= 0.5 && item.known_months >= 12).sort((a, b) => (b.historical_frequency ?? 0) - (a.historical_frequency ?? 0)).slice(0, 5);
  const selected = forecasts.filter((item) => item.cell_id === cellId);
  const recent = useMemo(() => [...observations].sort((a, b) => b.acquired_at.localeCompare(a.acquired_at)).slice(0, 5), [observations]);
  const metrics = model.data?.evaluation.metrics;

  return <>
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-3 z-[44] flex items-center gap-1 md:bottom-28 md:right-6">
      {!open && <span aria-hidden className={`bomberito-bubble select-none whitespace-nowrap rounded-2xl rounded-r-sm border-2 border-[#B9200B] bg-white px-3 py-1.5 font-noto text-[11px] font-extrabold text-[#B9200B] shadow-lg ${seen ? 'bomberito-bubble--calm' : ''}`}>¡Hola! ¿Necesitas ayuda?</span>}
      {!open && <span aria-hidden className={`bomberito-point select-none text-2xl leading-none drop-shadow ${seen ? 'bomberito-point--calm' : ''}`}>👉</span>}
      <button type="button" onClick={toggle} aria-expanded={open} aria-label="Abrir Bomberito Centinela" title="Bomberito Centinela: toca para ver el modelo CENTINELA" className="group relative h-16 w-16 shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 md:h-[4.5rem] md:w-[4.5rem]">
        {!open && <span aria-hidden className={`bomberito-ring absolute inset-0 rounded-full border-4 border-[#facc15] ${seen ? 'bomberito-ring--calm' : ''}`} />}
        <span className="absolute inset-0 overflow-hidden rounded-full border-[3px] border-[#facc15] bg-[#7B1A0C] shadow-[0_6px_16px_rgba(0,0,0,0.45)] transition-transform group-hover:scale-105 group-active:scale-95">
          {/* Asoma la cabeza desde el borde inferior del círculo. */}
          <img src={BOMBERITO_IMAGE} alt="" width={96} height={96} className={`bomberito-head absolute left-1/2 top-[6%] h-auto w-[150%] max-w-none [image-rendering:pixelated] ${open ? '' : 'bomberito-peek'}`} />
        </span>
      </button>
    </div>

    {open && <section role="dialog" aria-label="Bomberito Centinela" className="fixed inset-x-2 bottom-[calc(9rem+env(safe-area-inset-bottom,0px))] z-[45] flex max-h-[70dvh] flex-col overflow-hidden rounded-2xl border border-border-strong bg-card text-xs text-text-primary shadow-2xl md:inset-x-auto md:bottom-[12rem] md:right-6 md:w-[24rem]">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-[#B9200B] px-4 py-3 text-white">
        <div className="flex items-center gap-2.5">
          <img src={BOMBERITO_IMAGE} alt="" width={40} height={40} className="h-10 w-10 object-contain [image-rendering:pixelated]" />
          <div><h2 className="font-noto text-sm font-extrabold tracking-wide">BOMBERITO CENTINELA</h2><p className="text-[10px] text-white/80">Asistente del modelo CENTINELA · experimental</p></div>
        </div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar Bomberito" className="rounded-lg p-1.5 hover:bg-white/15"><X className="h-4 w-4" aria-hidden /></button>
      </header>

      <div className="space-y-4 overflow-y-auto p-4">
        <p className="rounded-xl rounded-tl-none border border-border bg-surface p-3 leading-relaxed">¡Hola! Soy <strong>Bomberito</strong>. Te muestro lo que aprendió el modelo CENTINELA sobre la recurrencia mensual de detecciones térmicas en Antioquia. Elige una celda para ver sus probabilidades.</p>

        {model.isPending && <p role="status" className="text-text-secondary">Cargando el modelo…</p>}
        {model.isError && <p role="alert" className="rounded-lg border border-danger/40 bg-danger-soft p-2 text-danger">{model.error.message}</p>}

        {model.data && <>
          <section className="space-y-1.5">
            <h3 className="font-noto text-xs font-bold">Estado</h3>
            <dl className="grid grid-cols-2 gap-2 font-source text-[11px]">
              <div className="rounded-lg border border-border bg-surface p-2"><dt className="text-[10px] text-text-secondary">Último entrenamiento</dt><dd className="font-bold">{new Date(model.data.trained_at).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>
              <div className="rounded-lg border border-border bg-surface p-2"><dt className="text-[10px] text-text-secondary">Backend-API</dt><dd className={`font-bold ${outcome === 'connected' ? 'text-success' : 'text-warning'}`}>{outcome === 'connected' ? 'Conectado' : outcome === 'checking' ? 'Comprobando…' : 'No disponible'}</dd></div>
              <div className="col-span-2 rounded-lg border border-border bg-surface p-2"><dt className="text-[10px] text-text-secondary">Datos de entrenamiento</dt><dd>{model.data.observations.toLocaleString()} observaciones FIRMS reales ({model.data.sources_count} archivos: {model.data.sources_products.join(', ')}) · celdas {model.data.settings.grid}</dd></div>
            </dl>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-noto text-xs font-bold">Detecciones recientes (datos cargados)</h3>
            {recent.length ? <ul className="space-y-1 font-source text-[11px]">{recent.map((item) => <li key={item.observation_id} className="flex justify-between gap-2 rounded-lg border border-border bg-surface px-2 py-1"><span className={item.sensor === 'VIIRS' ? 'font-bold text-sensor-viirs' : 'font-bold text-sensor-modis'}>{item.sensor}</span><span className="truncate text-text-secondary">{item.acquired_at.slice(0, 16).replace('T', ' ')} UTC</span><span>{item.frp_mw === null ? 'FRP no disp.' : `${item.frp_mw} MW`}</span></li>)}</ul> : <p className="text-text-secondary">Sin observaciones cargadas.</p>}
          </section>

          <section className="space-y-1.5">
            <h3 className="font-noto text-xs font-bold">Frecuencia histórica elevada (≥ 50 %)</h3>
            {high.length ? <ul className="space-y-1">{high.map((item) => <li key={item.cell_id + item.product}><button type="button" onClick={() => setCellId(item.cell_id)} className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-left font-source text-[11px] transition-colors ${cellId === item.cell_id ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:bg-surface-hover'}`}><span className="truncate">{cellName(item)} · {productLabel(item.product)}</span><strong className="shrink-0 text-predictive">{pct(item.historical_frequency)}</strong></button></li>)}</ul> : <p className="text-text-secondary">Ninguna celda supera el 50 % con al menos 12 meses conocidos.</p>}
          </section>

          <section className="space-y-2">
            <label className="block space-y-1"><span className="font-noto text-xs font-bold">Consultar una celda</span>
              <select value={cellId} onChange={(event) => setCellId(event.target.value)} className="w-full rounded-xl border border-border-strong bg-input-bg px-2.5 py-2 text-text-primary">
                <option value="">— Elige una celda —</option>
                {cells.map((item) => <option key={item.cell_id} value={item.cell_id}>{cellName(item)}</option>)}
              </select>
            </label>
            {selected.map((item) => <article key={item.product} className="space-y-2 rounded-xl border border-border p-3">
              <div className="flex items-center justify-between gap-2"><h4 className="font-noto text-xs font-bold">{productLabel(item.product)} · pronóstico {item.target_month}</h4>{onShowCell && <button type="button" onClick={() => { onShowCell(centerOf(item)); setOpen(false); }} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[10px] font-semibold text-accent hover:bg-surface-hover"><MapPin className="h-3 w-3" aria-hidden />Ver en mapa</button>}</div>
              <dl className="grid grid-cols-2 gap-2 font-source text-[11px]">
                <div className="col-span-2 rounded-lg border border-predictive/40 bg-predictive-soft p-2"><dt className="text-[10px] text-text-secondary">Estimación experimental del próximo mes</dt><dd className="font-bold text-predictive">{item.prediction.probability === null ? 'Datos insuficientes: falta cobertura del mes anterior' : pct(item.prediction.probability)}</dd></div>
                <Estimate label="Nueva actividad P(1|0)" estimate={item.p01} />
                <Estimate label="Persistencia P(1|1)" estimate={item.p11} />
                <div className="rounded-lg border border-border bg-surface p-2"><dt className="text-[10px] text-text-secondary">Frecuencia histórica</dt><dd className="font-bold">{pct(item.historical_frequency)}</dd></div>
                <div className="rounded-lg border border-border bg-surface p-2"><dt className="text-[10px] text-text-secondary">Cobertura</dt><dd className="font-bold">{item.known_months} / {item.known_months + item.unknown_months} meses</dd></div>
              </dl>
            </article>)}
          </section>

          {metrics && <section className="space-y-1.5">
            <h3 className="font-noto text-xs font-bold">¿Qué tan bueno es el modelo?</h3>
            <p className="leading-relaxed text-text-secondary">Evaluado con {model.data.evaluation.evaluated_pairs.toLocaleString()} pares de meses posteriores a {model.data.evaluation.cutoff}. Brier (menor es mejor): Markov <strong className="text-text-primary">{metrics.markov?.brier.toFixed(3)}</strong> · frecuencia histórica {metrics.frequency?.brier.toFixed(3)} · frecuencia por mes del año <strong className="text-text-primary">{metrics.seasonal_frequency?.brier.toFixed(3)}</strong>. {model.data.evaluation.beats_baselines ? 'Supera a ambas referencias.' : 'Mejora a la frecuencia simple, pero no a la estacional: úsalo como apoyo, no como pronóstico.'}</p>
          </section>}
        </>}

        <div className="space-y-2 rounded-xl border border-warning/40 bg-warning-soft p-3 text-[11px] leading-relaxed">
          <p className="flex items-start gap-1.5"><ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden /><span>Información experimental: probabilidad de <strong>detección térmica</strong>, no de incendio. No es una alerta oficial ni una orden de evacuación.</span></p>
          <a href="tel:123" className="flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 font-bold text-white hover:bg-red-500"><PhoneCall className="h-3.5 w-3.5" aria-hidden />Emergencia: llamar al 123</a>
        </div>
      </div>
    </section>}
  </>;
}
