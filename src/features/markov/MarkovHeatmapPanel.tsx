import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Compass, Info, MapPin, Thermometer, Wind, X } from 'lucide-react';
import ObservationMap from '@/features/explorer/ObservationMap';
import { MAP_STYLE_PRESETS, PROBABILITY_SCALE, probabilityColor, type MapFocusPreset } from '@/features/explorer/mapPresets';
import { useUiStore } from '@/stores/uiStore';
import type { Observation } from '@/types/api/observations';
import { STATE_CODES, runMarkovEngine, type MarkovCell } from '@/utils/markovEngine';
import { fetchWeatherContext } from '@/services/api/weatherService';
import type { WeatherContext } from '@/types/api/weather';
import { ANTIOQUIA_VIEWPORT, SUBREGIONS, computeSubregionMatrix, locationLabel, resolveSubregion, type SubregionConfig, type SubregionId } from '@/utils/subregions';

const DARK_STYLE = MAP_STYLE_PRESETS.find((style) => style.id === 'dark') ?? MAP_STYLE_PRESETS[0];
const LIGHT_STYLE = MAP_STYLE_PRESETS.find((style) => style.id === 'positron') ?? MAP_STYLE_PRESETS[0];
const CARD = 'rounded-2xl border border-border bg-card shadow-sm';
const HORIZON_KEYS = ['p24', 'p48', 'p72'] as const;
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

interface MarkovHeatmapPanelProps {
  observations: Observation[];
  provenance: string;
}

interface CellWithSubregion { cell: MarkovCell; sub: SubregionConfig | null }

/**
 * Mapa de Calor Markov (distribución de la carpeta `ejemplo`) con la estimación
 * EXPLORATORIA de `utils/markovEngine.ts` calculada con las observaciones reales
 * cargadas. El contexto meteorológico solo aplica una modulación experimental
 * explícita y no constituye un modelo físico ni publicado.
 */
export default function MarkovHeatmapPanel({ observations, provenance }: MarkovHeatmapPanelProps) {
  const [subregion, setSubregion] = useState<'all' | SubregionId>('all');
  const [horizon, setHorizon] = useState<0 | 1 | 2>(0);
  const [selected, setSelected] = useState<Observation | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [cellFocus, setCellFocus] = useState<MapFocusPreset | null>(null);
  const [includeWeather, setIncludeWeather] = useState(true);
  const [weather, setWeather] = useState<WeatherContext | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const theme = useUiStore((state) => state.theme);
  const matrix = useMemo(() => computeSubregionMatrix(observations), [observations]);
  const result = useMemo(() => runMarkovEngine(observations), [observations]);
  const ready = result.status !== 'insufficient';
  const key = HORIZON_KEYS[horizon];
  useEffect(() => {
    const controller = new AbortController();
    setWeatherError(null);
    fetchWeatherContext(6.4, -75.6, 'Antioquia', controller.signal)
      .then(setWeather)
      .catch((error: unknown) => { if (!controller.signal.aborted) setWeatherError(error instanceof Error ? error.message : 'No fue posible consultar el clima.'); });
    return () => controller.abort();
  }, []);
  const weatherFactor = useMemo(() => {
    if (!weather?.available) return 1;
    const temperature = weather.current.temperatureC ?? 24;
    const humidity = weather.current.relativeHumidityPct ?? 65;
    const rain = weather.current.precipitationMm ?? 0;
    const wind = weather.current.windSpeedKmh ?? 8;
    return Math.min(1.4, Math.max(0.7, 1 + (temperature - 24) * 0.01 + (65 - humidity) * 0.004 + wind * 0.006 - rain * 0.08));
  }, [weather]);
  const adjustProbability = (value: number) => includeWeather ? Math.min(1, Math.max(0, value * weatherFactor)) : value;

  const antioquiaObservations = useMemo(() => observations.filter((item) => {
    const id = resolveSubregion(item);
    return id !== null && (subregion === 'all' || id === subregion);
  }), [observations, subregion]);

  /** Celdas de Antioquia con su subregión (por municipio de referencia). */
  const antioquiaCells: CellWithSubregion[] = useMemo(() => result.cells
    .map((cell) => ({ cell, sub: SUBREGIONS.find((item) => item.id === resolveSubregion({ municipality: cell.municipality, department: cell.department })) ?? null }))
    .filter((item) => item.sub !== null), [result]);
  const visibleCells = antioquiaCells.filter((item) => subregion === 'all' || item.sub?.id === subregion);

  const breakdown = useMemo(() => SUBREGIONS.map((sub) => {
    const cells = antioquiaCells.filter((item) => item.sub?.id === sub.id).map((item) => item.cell[key]);
    return { sub, cells: cells.length, max: cells.length ? Math.max(...cells) : 0, mean: cells.length ? cells.reduce((a, b) => a + b, 0) / cells.length : 0, observations: matrix.totals[sub.id], avgFrp: matrix.overallAvgFrp[sub.id] };
  }).sort((a, b) => b.max - a.max || b.observations - a.observations), [antioquiaCells, key, matrix]);

  const topCells = [...visibleCells].sort((a, b) => b.cell[key] - a.cell[key]).slice(0, 5);
  const selectedCell = antioquiaCells.find((item) => item.cell.id === selectedCellId) ?? null;

  const subregionFocus: MapFocusPreset = useMemo(() => {
    const config = SUBREGIONS.find((item) => item.id === subregion);
    return config
      ? { id: config.id, label: config.label, center: config.center, zoom: config.zoom }
      : { id: 'antioquia-all', label: 'Antioquia (Todas)', center: ANTIOQUIA_VIEWPORT.center, zoom: ANTIOQUIA_VIEWPORT.zoom };
  }, [subregion]);
  const focus = cellFocus ?? subregionFocus;

  const chooseSubregion = (id: 'all' | SubregionId) => { setSubregion(id); setCellFocus(null); setSelected(null); setSelectedCellId(null); };
  const focusCell = (cell: MarkovCell) => { setCellFocus({ id: `cell-${cell.id}`, label: cell.municipality ?? 'Celda', center: [cell.centerLon, cell.centerLat], zoom: 10 }); setSelected(null); setSelectedCellId(cell.id); };
  const mapCells = visibleCells.map(({ cell }) => ({ id: cell.id, center: [cell.centerLon, cell.centerLat] as [number, number], sizeDeg: result.gridDeg, p: adjustProbability(cell[key]) }));
  const regional = result.horizons[horizon] ? { ...result.horizons[horizon], activity: adjustProbability(result.horizons[horizon].activity) } : undefined;

  return <div className="mx-auto w-full max-w-7xl space-y-5 overflow-x-hidden p-4 text-text-primary sm:p-6 lg:p-8">
    <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 lg:flex-row lg:items-center">
      <div className="min-w-0">
        <span className="mb-1.5 inline-block rounded border border-warning/40 bg-warning-soft px-2 py-0.5 font-source text-[11px] font-bold uppercase text-warning">Estimación exploratoria</span>
        <h1 className="font-noto text-xl font-bold tracking-tight sm:text-2xl">Mapa de Calor Markov — Predictibilidad Espacial</h1>
        <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">Visualización cartográfica de probabilidades P(S1 ∪ S2) por celdas y subregiones de Antioquia, calculadas con las observaciones reales cargadas. No es un modelo publicado y no modifica las capas del Mapa principal.</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1" role="group" aria-label="Horizonte de predicción">
          {(['+24h', '+48h', '+72h'] as const).map((label, index) => <button key={label} type="button" disabled={!ready} aria-pressed={horizon === index} onClick={() => setHorizon(index as 0 | 1 | 2)} className={`whitespace-nowrap rounded-lg px-3 py-1 font-source text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${ready && horizon === index ? 'bg-accent-solid text-accent-fg' : 'text-text-secondary hover:text-text-primary'}`}>{label}</button>)}
        </div>
        <button type="button" aria-pressed={includeWeather} onClick={() => setIncludeWeather((value) => !value)} title="Modulación contextual experimental, no modelo oficial" className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-1.5 font-noto text-xs font-bold ${includeWeather ? 'border-info/50 bg-info-soft text-info' : 'border-border bg-card text-text-secondary'}`}><Wind className="h-3.5 w-3.5 shrink-0" aria-hidden />{includeWeather ? '+ Clima' : 'Satelital'}</button>
      </div>
    </div>

    {weather && <div className={`flex items-start gap-3 p-4 ${CARD}`}>
      <Thermometer className="mt-0.5 h-5 w-5 shrink-0 text-info" aria-hidden />
      <div className="text-xs"><p className="font-semibold text-info">Contexto ambiental: {weather.locationName}</p><p className="mt-1 text-text-secondary">Temperatura {weather.current.temperatureC ?? '—'} °C · Humedad {weather.current.relativeHumidityPct ?? '—'}% · Lluvia {weather.current.precipitationMm ?? '—'} mm · Viento {weather.current.windSpeedKmh ?? '—'} km/h.</p><p className="mt-1 text-[10px] text-text-secondary">{weather.note} Factor experimental aplicado: {weatherFactor.toFixed(2)}×.</p></div>
    </div>}
    {weatherError && <p role="status" className="rounded-xl border border-warning/40 bg-warning-soft p-3 text-xs text-warning">Clima no disponible: {weatherError} El mapa continúa con probabilidades satelitales.</p>}
    {!ready && <div className={`flex items-start gap-3 p-5 ${CARD}`}>
      <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-warning" aria-hidden />
      <div className="space-y-1"><h2 className="font-noto text-sm font-bold text-warning">Historial insuficiente para el mapa de calor</h2><p className="text-xs leading-relaxed text-text-primary">{result.message} Mientras tanto se muestran las observaciones por subregión.</p></div>
    </div>}

    <div className={`flex flex-wrap items-center justify-between gap-2 p-3 ${CARD}`}>
      <div className="-mx-1 flex max-w-full items-center gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] sm:flex-wrap" role="group" aria-label="Enfocar subregión">
        <span className="flex shrink-0 items-center gap-1 px-1.5 font-noto text-[11px] font-semibold text-text-secondary"><Compass className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />Subregión:</span>
        <button type="button" aria-pressed={subregion === 'all'} onClick={() => chooseSubregion('all')} className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1 font-noto text-xs font-semibold transition-colors ${subregion === 'all' ? 'bg-accent-solid font-bold text-accent-fg' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}>Todas (Antioquia)</button>
        {SUBREGIONS.map((sub) => <button key={sub.id} type="button" aria-pressed={subregion === sub.id} onClick={() => chooseSubregion(sub.id)} className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 font-noto text-xs transition-colors ${subregion === sub.id ? 'bg-surface-hover font-bold text-text-primary' : 'font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}><span className={`h-2 w-2 shrink-0 rounded-full ${sub.dotClass}`} />{sub.label}</button>)}
      </div>
      {regional && <div className="flex items-center gap-3 px-1.5 font-source text-[11px] tabular-nums text-text-secondary">
        <span>Regional +{regional.hours}h: <strong className="text-predictive">{pct(regional.activity)}</strong></span>
        <span>Observaciones: <strong className="text-info">{antioquiaObservations.length.toLocaleString()}</strong></span>
      </div>}
    </div>

    <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
      <div className={`relative flex min-h-[420px] flex-col overflow-hidden lg:col-span-8 lg:min-h-[580px] ${CARD}`}>
        <div className="relative h-[max(420px,60dvh)] w-full flex-1 lg:h-auto lg:min-h-[580px]">
          <div className="absolute inset-0"><ObservationMap observations={antioquiaObservations} selected={selected} onSelect={(item) => { setSelectedCellId(null); setSelected(item); }} focusTarget={focus} mapStyle={theme === 'light' ? LIGHT_STYLE : DARK_STYLE} layers={{ heatmap: false, points: !ready, markov: ready }} cells={mapCells} cellStyle="heat" onSelectCell={(id) => { setSelected(null); setSelectedCellId(id); }} /></div>
        </div>

        <div className="pointer-events-none absolute left-3 top-3 z-10">
          <div className="pointer-events-auto max-w-[270px] space-y-0.5 rounded-xl border border-border-strong bg-card px-3 py-2 shadow-lg">
            <div className="flex items-center gap-1.5 font-noto text-xs font-bold text-predictive"><Thermometer className="h-3.5 w-3.5 shrink-0" aria-hidden />{ready ? `Heatmap Markov +${regional?.hours ?? 24}h (satelital)` : 'Capa: observaciones satelitales'}</div>
            <p className="font-source text-[10px] leading-tight text-text-secondary">{focus.label} · {ready ? 'haz clic en cualquier zona de calor para ver las métricas de la celda.' : 'toca un punto para ver su ficha.'}</p>
          </div>
        </div>

        <div className="absolute bottom-4 left-3 z-10 max-w-[calc(100%-1.5rem)] space-y-1.5 rounded-xl border border-border-strong bg-card px-3 py-2.5 font-source text-[10px] shadow-lg sm:max-w-[280px]">
          <div className="flex items-center justify-between gap-3 font-noto font-bold text-text-primary"><span>Probabilidad predictiva P(S1 ∪ S2)</span><span className="font-normal text-text-secondary">{ready ? SUBREGIONS.find((sub) => sub.id === subregion)?.label ?? 'Antioquia' : 'Sin datos'}</span></div>
          <div className={`grid grid-cols-5 gap-1 pt-0.5 ${ready ? '' : 'opacity-50'}`}>{PROBABILITY_SCALE.map((step) => <div key={step.label} className="space-y-1 text-center"><div className="h-2 rounded-xs" style={{ backgroundColor: step.color }} /><span className="block text-[9px] text-text-secondary">{step.label}</span></div>)}</div>
        </div>

        {selectedCell && !selected && <div className="absolute inset-x-3 top-3 z-20 space-y-2.5 rounded-2xl border border-border-strong bg-card p-3.5 text-xs shadow-2xl sm:inset-x-auto sm:right-12 sm:w-80">
          <div className="flex items-start justify-between gap-2 border-b border-border pb-2">
            <div className="min-w-0"><h3 className="truncate font-noto text-sm font-bold text-text-primary">{selectedCell.cell.municipality ?? 'Celda sin municipio'}</h3><p className="truncate font-source text-[10px] font-semibold text-predictive">{selectedCell.sub?.label ?? 'Antioquia'} · Celda {selectedCell.cell.centerLat.toFixed(2)}, {selectedCell.cell.centerLon.toFixed(2)}</p></div>
            <button type="button" onClick={() => setSelectedCellId(null)} aria-label="Cerrar detalle de celda" className="rounded-lg p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary"><X className="h-3.5 w-3.5" /></button>
          </div>
          <dl className="grid grid-cols-2 gap-2 font-source text-[11px] tabular-nums">
            <div className="rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">P(+{regional?.hours ?? 24}h)</dt><dd className="text-base font-black text-predictive">{pct(adjustProbability(selectedCell.cell[key]))}</dd></div>
            <div className="rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">Estado / vecinos</dt><dd className="text-sm font-bold text-accent">{STATE_CODES[selectedCell.cell.state]} · {selectedCell.cell.activeNeighbors}/8</dd></div>
            <div className="rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">24h / 48h / 72h</dt><dd className="font-bold text-text-primary">{(adjustProbability(selectedCell.cell.p24) * 100).toFixed(0)}% / {(adjustProbability(selectedCell.cell.p48) * 100).toFixed(0)}% / {(adjustProbability(selectedCell.cell.p72) * 100).toFixed(0)}%</dd></div>
            <div className="rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">Detecciones</dt><dd className="font-bold text-info">{selectedCell.cell.detections} reg.</dd></div>
          </dl>
        </div>}

        {selected && <div className="absolute inset-x-3 top-3 z-20 space-y-2.5 rounded-2xl border border-border-strong bg-card p-3.5 text-xs shadow-2xl sm:inset-x-auto sm:right-12 sm:w-80">
          <div className="flex items-start justify-between gap-2 border-b border-border pb-2">
            <div className="min-w-0"><h3 className="truncate font-noto text-sm font-bold text-text-primary">{selected.municipality ? locationLabel(selected) : 'Observación seleccionada'}</h3><p className="truncate font-source text-[10px] font-semibold text-predictive">{SUBREGIONS.find((sub) => sub.id === resolveSubregion(selected))?.label ?? 'Sin subregión'} · {selected.sensor}</p></div>
            <button type="button" onClick={() => setSelected(null)} aria-label="Cerrar inspector" className="rounded-lg p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary"><X className="h-3.5 w-3.5" /></button>
          </div>
          <dl className="grid grid-cols-2 gap-2 font-source text-[11px] tabular-nums">
            <div className="rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">Adquisición UTC</dt><dd className="font-bold text-text-primary">{selected.acquired_at.slice(0, 16).replace('T', ' ')}</dd></div>
            <div className="rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">FRP</dt><dd className="font-bold text-accent">{selected.frp_mw === null ? 'No disponible' : `${selected.frp_mw} MW`}</dd></div>
            <div className="col-span-2 rounded-lg border border-border bg-surface p-2"><dt className="block text-[10px] text-text-secondary">Confianza original</dt><dd className="font-bold text-text-primary">{String(selected.confidence_raw)}</dd></div>
          </dl>
        </div>}
      </div>

      <div className="flex flex-col gap-4 lg:col-span-4">
        <div className={`flex-1 space-y-3 p-4 ${CARD}`}>
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <h2 className="flex items-center gap-1.5 font-noto text-sm font-bold text-text-primary"><MapPin className="h-4 w-4 shrink-0 text-accent" aria-hidden />Subregiones de Antioquia</h2>
            <span className="font-source text-[10px] text-text-secondary">+{regional?.hours ?? 24}h satelital</span>
          </div>
          <div className="space-y-1">
            {breakdown.map((item) => {
              const active = subregion === item.sub.id;
              return <button key={item.sub.id} type="button" onClick={() => chooseSubregion(active ? 'all' : item.sub.id)} aria-pressed={active} className={`w-full space-y-1.5 rounded-xl px-1.5 py-2 text-left transition-opacity ${active ? 'opacity-100' : subregion !== 'all' ? 'opacity-60 hover:opacity-100' : 'hover:opacity-85'}`}>
                <div className="flex items-center justify-between gap-2"><span className={`flex items-center gap-1.5 truncate font-noto text-xs font-bold ${active ? 'text-accent' : 'text-text-primary'}`}><span className={`h-2 w-2 shrink-0 rounded-full ${item.sub.dotClass}`} /><span className="truncate">{item.sub.label}</span></span><span className="shrink-0 font-source text-xs font-black tabular-nums text-predictive">{ready && item.cells ? `Máx ${pct(item.max)}` : '—'}</span></div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border"><div className="h-full rounded-full transition-all duration-300" style={{ width: `${ready && item.cells ? Math.max(4, item.max * 100) : 0}%`, backgroundColor: probabilityColor(item.max) }} /></div>
                <div className="flex items-center justify-between font-source text-[10px] tabular-nums text-text-secondary"><span>{item.cells} celdas{ready && item.cells ? ` · Prom ${pct(item.mean)}` : ''}</span><span>{item.observations.toLocaleString()} obs.{item.avgFrp !== null ? ` · FRP ${item.avgFrp.toFixed(1)} MW` : ''}</span></div>
              </button>;
            })}
          </div>
        </div>

        <div className={`space-y-2.5 p-4 ${CARD}`}>
          <div className="flex items-center justify-between"><h3 className="font-noto text-xs font-bold text-text-primary">Celdas Prioritarias en Mapa de Calor</h3><span className="font-source text-[10px] text-text-secondary">Top {topCells.length}</span></div>
          {!ready || topCells.length === 0
            ? <p className="py-2 text-[11px] text-text-secondary">{ready ? 'Sin celdas estimadas en esta subregión.' : 'Disponibles cuando haya historial suficiente.'}</p>
            : <div className="space-y-1.5">{topCells.map(({ cell, sub }) => <button key={cell.id} type="button" onClick={() => focusCell(cell)} className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 font-source text-[11px] transition-colors ${selectedCellId === cell.id ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:bg-surface-hover'}`}>
                <span className="truncate text-left"><strong className="text-text-primary">{cell.municipality ?? 'Celda'}</strong><span className="ml-1.5 text-[10px] text-text-secondary">({sub?.label})</span></span>
                <span className="shrink-0 font-bold tabular-nums text-predictive">{pct(cell[key])}</span>
              </button>)}</div>}
        </div>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded border border-success/40 bg-success-soft px-2.5 py-0.5 font-source text-[11px] font-bold uppercase text-success">Datos reales</span>
      <span className="font-source text-xs tabular-nums text-text-secondary">{visibleCells.length} celdas activas · ~{Math.round(result.gridDeg * 111)} km ({result.gridDeg.toFixed(2)}°) · {provenance}</span>
    </div>

    <div className="flex items-start gap-2 pt-1 text-[11px] text-text-secondary">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden />
      <p className="leading-relaxed">Este mapa de calor muestra la probabilidad estadística P(S1 ∪ S2) de registrar anomalías térmicas satelitales por celda Markov ({result.gridDeg.toFixed(2)}°), estimada en el navegador. El ajuste climático es contextual y experimental, no un modelo publicado. Revise la validación retrospectiva en Predictibilidad. No representa ignición física ni superficie quemada.</p>
    </div>
  </div>;
}
