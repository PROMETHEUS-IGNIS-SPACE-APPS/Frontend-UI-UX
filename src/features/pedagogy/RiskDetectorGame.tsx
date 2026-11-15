import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Award, BookOpen, ChartColumn, CircleAlert, CircleCheck, Gamepad2, RotateCcw, Search, SquareCheck, TriangleAlert, X } from 'lucide-react';
import { RISK_NORMS, RISK_POINTS, RISK_SCENARIOS, type Nfpa704Rating, type RiskItem, type RiskScenario, type ScenarioId } from './riskDetectorContent';
import { RiskScene } from './riskDetectorScenes';

type Filter = 'all' | 'pending' | 'hazard' | 'safe';
type ModalState = { kind: 'inspect'; itemId: string; wasNew: boolean } | { kind: 'summary' } | { kind: 'guide' } | null;

interface SavedProgress { activeId: ScenarioId; inspected: string[]; completed: ScenarioId[] }

const STORAGE_KEY = 'kairos-risk-detector-v1';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Sin revisar' },
  { id: 'hazard', label: 'Peligros' },
  { id: 'safe', label: 'Seguros' },
];

const ACCENT_BUTTON = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#D9692B] px-4 py-2 font-sans text-sm font-bold text-[#FDECCD] transition-colors hover:bg-[#B8531E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B3314]';
const SOFT_BUTTON = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#D9B98F] bg-[#FDECCD] px-4 py-2 font-sans text-sm font-bold text-[#5C260E] transition-colors hover:bg-[#F6DDB4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B3314]';

const isScenarioId = (value: unknown): value is ScenarioId => RISK_SCENARIOS.some((scenario) => scenario.id === value);

function loadProgress(): SavedProgress {
  const empty: SavedProgress = { activeId: 'kitchen', inspected: [], completed: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return empty;
    const record = parsed as Record<string, unknown>;
    return {
      activeId: isScenarioId(record.activeId) ? record.activeId : 'kitchen',
      inspected: Array.isArray(record.inspected) ? record.inspected.filter((id): id is string => typeof id === 'string') : [],
      completed: Array.isArray(record.completed) ? record.completed.filter(isScenarioId) : [],
    };
  } catch {
    return empty;
  }
}

function scenarioStats(scenario: RiskScenario, inspected: ReadonlySet<string>) {
  let hazardsFound = 0, totalHazards = 0, safeFound = 0, totalSafe = 0, score = 0;
  for (const item of scenario.items) {
    const done = inspected.has(item.id);
    if (item.type === 'hazard') { totalHazards += 1; if (done) hazardsFound += 1; }
    else { totalSafe += 1; if (done) safeFound += 1; }
    if (done) score += RISK_POINTS[item.type];
  }
  const pct = totalHazards > 0 ? Math.round((hazardsFound / totalHazards) * 100) : 0;
  return { hazardsFound, totalHazards, safeFound, totalSafe, score, pct, complete: hazardsFound === totalHazards };
}

function Nfpa704Diamond({ rating, size = 104 }: { rating?: Nfpa704Rating; size?: number }) {
  const values = rating ?? { flam: 'I', health: 'S', react: 'R', special: 'ESP', label: '' };
  return <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
    <g transform="translate(50,50) rotate(45)">
      <rect x="-32" y="-32" width="32" height="32" fill="#C62828" stroke="#4A2E1B" strokeWidth="2" />
      <rect x="0" y="-32" width="32" height="32" fill="#EAB308" stroke="#4A2E1B" strokeWidth="2" />
      <rect x="-32" y="0" width="32" height="32" fill="#1B5FA8" stroke="#4A2E1B" strokeWidth="2" />
      <rect x="0" y="0" width="32" height="32" fill="#FFFFFF" stroke="#4A2E1B" strokeWidth="2" />
    </g>
    <text x="50" y="31" textAnchor="middle" fontSize="15" fontWeight="800" fill="#FFFFFF">{values.flam}</text>
    <text x="27" y="55" textAnchor="middle" fontSize="15" fontWeight="800" fill="#FFFFFF">{values.health}</text>
    <text x="73" y="55" textAnchor="middle" fontSize="15" fontWeight="800" fill="#4A2E1B">{values.react}</text>
    <text x="50" y="77" textAnchor="middle" fontSize="12" fontWeight="800" fill="#4A2E1B">{values.special || '—'}</text>
  </svg>;
}

function Nfpa704Box({ rating }: { rating?: Nfpa704Rating }) {
  const row = (color: string, label: ReactNode) => <div className="flex items-center gap-1.5"><span className={`h-3 w-3 shrink-0 rounded-sm border border-[#4A2E1B] ${color}`} />{label}</div>;
  return <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#D9B98F] bg-[#F6E6CB] p-3">
    <Nfpa704Diamond rating={rating} />
    <div className="grid min-w-[12rem] flex-1 grid-cols-1 gap-1 font-noto text-xs sm:grid-cols-2">
      {rating && <p className="font-bold text-[#5C260E] sm:col-span-2">Rombo NFPA 704: {rating.label}</p>}
      {row('bg-[#1B5FA8]', rating ? <span>Salud: <strong>{rating.health}</strong></span> : <span><strong>Salud (0–4):</strong> toxicidad</span>)}
      {row('bg-[#C62828]', rating ? <span>Inflamabilidad: <strong>{rating.flam}</strong></span> : <span><strong>Inflamabilidad (0–4)</strong></span>)}
      {row('bg-[#EAB308]', rating ? <span>Inestabilidad: <strong>{rating.react}</strong></span> : <span><strong>Inestabilidad (0–4)</strong></span>)}
      {row('bg-white', rating ? <span>Especial: <strong>{rating.special || 'ninguno'}</strong></span> : <span><strong>Especial:</strong> OX, W, SA</span>)}
    </div>
  </div>;
}

interface DialogProps { label: string; tone: 'safe' | 'hazard' | 'neutral'; banner: ReactNode; onClose: () => void; footer: ReactNode; children: ReactNode }

function GameDialog({ label, tone, banner, onClose, footer, children }: DialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onCloseRef.current(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); previous?.focus(); };
  }, []);
  const bannerColor = tone === 'safe' ? 'bg-[#2E7D32]' : tone === 'hazard' ? 'bg-[#C62828]' : 'bg-[#7B3314]';
  return <div role="dialog" aria-modal="true" aria-label={label} className="fixed inset-0 z-[60] flex items-center justify-center bg-[#3B1E0D]/75 p-3 sm:p-6" onClick={onClose}>
    <div className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-[#FDECCD] text-[#4A2E1B] shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <div className={`flex items-center justify-between gap-3 px-4 py-3 text-white sm:px-5 ${bannerColor}`}>
        <div className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider">{banner}</div>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><X className="h-4 w-4" aria-hidden /></button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">{children}</div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-[#E4D1B1] bg-[#F6E6CB] px-4 py-3 sm:px-5">{footer}</div>
    </div>
  </div>;
}

function NormCallout({ tone, title, children }: { tone: 'safe' | 'hazard' | 'neutral'; title: string; children: ReactNode }) {
  const color = tone === 'safe' ? 'border-[#2E7D32] bg-[#EAF5EB]' : tone === 'hazard' ? 'border-[#C62828] bg-[#FBE9E3]' : 'border-[#D9692B] bg-[#F6E6CB]';
  return <div className={`rounded-r-xl border-l-4 p-3 ${color}`}>
    <p className="mb-1 font-sans text-[11px] font-bold uppercase tracking-wider text-[#5C260E]">{title}</p>
    <div className="font-noto text-sm leading-relaxed">{children}</div>
  </div>;
}

/** Detector de Riesgos Cotidianos: juego de inspección con escenas 2D, NFPA 101 y NFPA 704. */
export default function RiskDetectorGame() {
  const [initial] = useState(loadProgress);
  const [activeId, setActiveId] = useState<ScenarioId>(initial.activeId);
  const [inspectedList, setInspectedList] = useState<string[]>(initial.inspected);
  const [completed, setCompleted] = useState<ScenarioId[]>(initial.completed);
  const [filter, setFilter] = useState<Filter>('all');
  const [modal, setModal] = useState<ModalState>(null);
  const [resetArmed, setResetArmed] = useState(false);

  const inspected = useMemo(() => new Set(inspectedList), [inspectedList]);
  const scenario = RISK_SCENARIOS.find((item) => item.id === activeId) ?? RISK_SCENARIOS[0];
  const stats = scenarioStats(scenario, inspected);
  const allStats = RISK_SCENARIOS.map((item) => ({ scenario: item, stats: scenarioStats(item, inspected) }));
  const totalScore = allStats.reduce((sum, entry) => sum + entry.stats.score, 0);
  const totalHazards = allStats.reduce((sum, entry) => sum + entry.stats.totalHazards, 0);
  const totalHazardsFound = allStats.reduce((sum, entry) => sum + entry.stats.hazardsFound, 0);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeId, inspected: inspectedList, completed } satisfies SavedProgress));
    } catch {
      // Progress is a per-browser convenience; the game works without storage.
    }
  }, [activeId, inspectedList, completed]);

  useEffect(() => {
    if (!resetArmed) return undefined;
    const timer = window.setTimeout(() => setResetArmed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [resetArmed]);

  const switchScenario = (id: ScenarioId) => { setActiveId(id); setFilter('all'); };

  const inspect = (itemId: string) => {
    const wasNew = !inspected.has(itemId);
    if (wasNew) setInspectedList((list) => [...list, itemId]);
    setModal({ kind: 'inspect', itemId, wasNew });
  };

  const closeInspect = () => {
    if (stats.complete && !completed.includes(scenario.id)) {
      setCompleted((list) => [...list, scenario.id]);
      setModal({ kind: 'summary' });
    } else {
      setModal(null);
    }
  };

  const nextScenario = RISK_SCENARIOS[(RISK_SCENARIOS.findIndex((item) => item.id === scenario.id) + 1) % RISK_SCENARIOS.length];

  const handleReset = () => {
    if (!resetArmed) { setResetArmed(true); return; }
    setResetArmed(false);
    setInspectedList([]);
    setCompleted([]);
    setFilter('all');
    setModal(null);
  };

  const visibleItems = scenario.items.filter((item) => {
    const done = inspected.has(item.id);
    if (filter === 'pending') return !done;
    if (filter === 'hazard') return done && item.type === 'hazard';
    if (filter === 'safe') return done && item.type === 'safe';
    return true;
  });

  const modalItem: RiskItem | undefined = modal?.kind === 'inspect' ? scenario.items.find((item) => item.id === modal.itemId) : undefined;

  return <section aria-labelledby="risk-detector-title" className="risk-detector w-full space-y-5 rounded-2xl bg-[#EEDFC5] p-4 sm:space-y-6 sm:p-8">
    <header className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#7B3314]/70 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#7B3314] px-2.5 py-1 font-sans text-[11px] font-bold uppercase tracking-wider text-[#FDECCD]"><Gamepad2 className="h-3.5 w-3.5" aria-hidden />Actividad interactiva</span>
          <span className="font-source text-xs font-semibold uppercase tracking-wide text-[#8E431E]">NFPA 101 · NFPA 704 · Seguridad doméstica y ocupacional</span>
        </div>
        <span className="font-source text-xs font-semibold uppercase tracking-wide text-[#8E431E]">Progreso total: {totalHazardsFound} de {totalHazards} peligros</span>
      </div>
      <h2 id="risk-detector-title" className="font-sans text-2xl font-bold leading-tight text-[#7B3314] sm:text-3xl">Detector de Riesgos Cotidianos</h2>
      <p className="max-w-3xl font-noto text-sm leading-relaxed sm:text-base">Explora cada escenario, toca los objetos e instalaciones e identifica riesgos eléctricos, químicos, de incendio y de evacuación antes de que ocurra un accidente. Muchos incendios forestales también empiezan en casa: prevenir aquí es prevenir allá.</p>
    </header>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1 rounded-xl border border-[#D9B98F] bg-[#FDECCD] p-4">
        <span className="flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-[#8E431E]"><TriangleAlert className="h-3.5 w-3.5" aria-hidden />Peligros encontrados</span>
        <span className="font-source text-2xl font-bold tabular-nums text-[#5C260E]">{stats.hazardsFound} de {stats.totalHazards}</span>
        <span className="font-noto text-xs">{scenario.title}</span>
      </div>
      <div className="flex flex-col gap-1 rounded-xl border border-[#D9B98F] bg-[#FDECCD] p-4">
        <span className="flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-[#8E431E]"><ChartColumn className="h-3.5 w-3.5" aria-hidden />Avance del escenario</span>
        <span className="font-source text-2xl font-bold tabular-nums text-[#5C260E]">{stats.pct}%</span>
        <div role="progressbar" aria-label="Avance del escenario" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats.pct} className="h-2.5 w-full overflow-hidden rounded-full border border-[#D9B98F] bg-[#F6E6CB]">
          <div className={`h-full rounded-full transition-[width] duration-200 ${stats.complete ? 'bg-[#2E7D32]' : 'bg-[#D9692B]'}`} style={{ width: `${stats.pct}%` }} />
        </div>
      </div>
      <div className="flex flex-col gap-1 rounded-xl border border-[#D9B98F] bg-[#FDECCD] p-4">
        <span className="flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-[#8E431E]"><Award className="h-3.5 w-3.5" aria-hidden />Puntos acumulados</span>
        <span className="font-source text-2xl font-bold tabular-nums text-[#5C260E]">{totalScore} pts</span>
        <span className="font-noto text-xs">Elementos seguros: {stats.safeFound} de {stats.totalSafe}</span>
      </div>
      <div className="flex flex-col justify-center gap-2 rounded-xl border border-[#D9B98F] bg-[#FDECCD] p-4">
        <button type="button" onClick={() => setModal({ kind: 'guide' })} className={ACCENT_BUTTON}><BookOpen className="h-4 w-4" aria-hidden />Guía NFPA 101 / 704</button>
        <button type="button" onClick={handleReset} className={resetArmed ? 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#A93E08] px-4 py-2 font-sans text-sm font-bold text-white' : SOFT_BUTTON}>
          {resetArmed ? <><CircleAlert className="h-4 w-4" aria-hidden />¿Confirmar reinicio?</> : <><RotateCcw className="h-4 w-4" aria-hidden />Reiniciar progreso</>}
        </button>
      </div>
    </div>

    <div role="tablist" aria-label="Escenarios del detector de riesgos" className="grid grid-cols-1 gap-2 rounded-xl bg-[#E4D1B1]/70 p-2 md:grid-cols-3">
      {allStats.map(({ scenario: item, stats: itemStats }) => {
        const active = item.id === scenario.id;
        return <button key={item.id} type="button" role="tab" aria-selected={active} onClick={() => switchScenario(item.id)} className={`flex min-h-12 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${active ? 'border-[#7B3314] bg-[#7B3314] text-[#FDECCD]' : 'border-[#D9B98F] bg-[#FDECCD] text-[#5C260E] hover:bg-[#F6DDB4]'}`}>
          <span className="flex items-center gap-2">
            <span className={`rounded-lg px-1.5 py-0.5 font-source text-xs font-bold ${active ? 'bg-[#D9692B] text-[#FDECCD]' : 'bg-[#F6E6CB] text-[#B8531E]'}`}>{item.num}</span>
            <span className="font-sans text-sm font-bold leading-tight">{item.title}</span>
          </span>
          <span className={`whitespace-nowrap rounded-full px-2 py-0.5 font-source text-xs font-bold ${itemStats.complete ? 'bg-[#2E7D32] text-white' : active ? 'bg-white/15' : 'bg-[#F6E6CB] text-[#8E431E]'}`}>{itemStats.hazardsFound} / {itemStats.totalHazards}</span>
        </button>;
      })}
    </div>

    {stats.complete && <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl border border-[#2E7D32] bg-[#EAF5EB] px-4 py-2.5 font-sans text-sm font-bold">
      <CircleCheck className="h-5 w-5 text-[#2E7D32]" aria-hidden />
      <span>¡{scenario.title} completada! Encontraste los {stats.totalHazards} peligros.</span>
      <button type="button" onClick={() => setModal({ kind: 'summary' })} className={`${ACCENT_BUTTON} ml-auto min-h-9 py-1.5 text-xs`}>Ver resumen</button>
    </div>}

    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#D9B98F] pb-2">
      <div>
        <h3 className="font-sans text-lg font-bold text-[#5C260E] sm:text-xl">Escenario {scenario.num}: {scenario.title}</h3>
        <p className="mt-1 max-w-2xl font-noto text-sm">{scenario.subtitle} Toca los elementos de la ilustración o las tarjetas.</p>
      </div>
      <div className="flex flex-wrap gap-3 font-source text-xs font-semibold">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#D9692B]" />Sin revisar</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#2E7D32]" />Seguro (+{RISK_POINTS.safe} pts)</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#C62828]" />Peligro (+{RISK_POINTS.hazard} pts)</span>
      </div>
    </div>

    <div className="overflow-hidden rounded-xl border border-[#D9B98F] bg-[#F7EBD6]">
      <RiskScene scenario={scenario} inspected={inspected} onInspect={inspect} />
    </div>

    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-sans text-base font-bold text-[#5C260E]">Elementos del escenario</h3>
      <div role="group" aria-label="Filtrar elementos" className="flex flex-wrap gap-1.5">
        {FILTERS.map((option) => <button key={option.id} type="button" aria-pressed={filter === option.id} onClick={() => setFilter(option.id)} className={`min-h-9 rounded-full border px-3.5 font-sans text-xs font-bold transition-colors ${filter === option.id ? 'border-[#D9692B] bg-[#D9692B] text-[#FDECCD]' : 'border-[#D9B98F] bg-[#FDECCD] text-[#8E431E] hover:bg-[#F6DDB4]'}`}>{option.id === 'all' ? `${option.label} (${scenario.items.length})` : option.label}</button>)}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {visibleItems.length === 0 && <p className="rounded-xl border border-[#D9B98F] bg-[#FDECCD] p-4 font-noto text-sm sm:col-span-2 lg:col-span-4">No hay elementos en esta categoría. Cambia el filtro a «Todos» o inspecciona más objetos en la ilustración.</p>}
      {visibleItems.map((item) => {
        const done = inspected.has(item.id);
        const Icon = item.icon;
        const tone = !done ? 'border-[#D9B98F] bg-[#FDECCD] hover:bg-[#F6DDB4]' : item.type === 'safe' ? 'border-[#2E7D32] bg-[#EAF5EB] ring-1 ring-[#2E7D32]' : 'border-[#C62828] bg-[#FBE9E3] ring-1 ring-[#C62828]';
        const chip = !done ? { cls: 'bg-[#F6E6CB] text-[#8E431E]', icon: Search, label: 'Pendiente' } : item.type === 'safe' ? { cls: 'bg-[#2E7D32] text-white', icon: CircleCheck, label: 'Seguro' } : { cls: 'bg-[#C62828] text-white', icon: TriangleAlert, label: 'Peligro' };
        const ChipIcon = chip.icon;
        return <button key={item.id} type="button" onClick={() => inspect(item.id)} className={`flex flex-col justify-between gap-2 rounded-xl border p-3 text-left transition-colors ${tone}`}>
          <span className="flex w-full items-center justify-between gap-2">
            <span className="font-source text-xs font-bold text-[#B8531E]">ELEMENTO {item.num}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-source text-[11px] font-bold uppercase ${chip.cls}`}><ChipIcon className="h-3 w-3" aria-hidden />{chip.label}</span>
          </span>
          <span className="flex items-start gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-[#FFFDF8] ${!done ? 'border-[#D9B98F] text-[#7B3314]' : item.type === 'safe' ? 'border-[#2E7D32] text-[#2E7D32]' : 'border-[#C62828] text-[#C62828]'}`}><Icon className="h-5 w-5" aria-hidden /></span>
            <span>
              <span className="block font-sans text-sm font-bold leading-snug text-[#5C260E]">{item.name}</span>
              <span className="mt-0.5 block font-noto text-xs text-[#6E3B21]">{item.zone}</span>
            </span>
          </span>
          <span className="flex w-full items-center justify-between border-t border-[#D9B98F]/70 pt-1.5 font-sans text-xs font-bold text-[#B8531E]">
            <span className="truncate">{done ? item.norm.split('·')[0].trim() : 'Inspeccionar elemento'}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </span>
        </button>;
      })}
    </div>

    <div className="grid grid-cols-1 gap-4 border-t-2 border-[#7B3314]/70 pt-4 md:grid-cols-3">
      {RISK_NORMS.map((norm) => <div key={norm.title}>
        <h4 className="mb-1 font-sans text-sm font-bold text-[#5C260E]">{norm.title}</h4>
        <p className="font-noto text-xs leading-relaxed">{norm.text}</p>
      </div>)}
    </div>

    {modal?.kind === 'inspect' && modalItem && <GameDialog
      label={modalItem.name}
      tone={modalItem.type}
      onClose={closeInspect}
      banner={<>{modalItem.type === 'hazard' ? <TriangleAlert className="h-4 w-4" aria-hidden /> : <CircleCheck className="h-4 w-4" aria-hidden />}{modalItem.type === 'hazard' ? 'Peligro detectado' : 'Elemento seguro'} · {modal.wasNew ? `+${RISK_POINTS[modalItem.type]} pts` : 'ya revisado'}</>}
      footer={<button type="button" onClick={closeInspect} className={ACCENT_BUTTON}>{stats.complete && !completed.includes(scenario.id) ? 'Ver resumen del escenario' : 'Seguir inspeccionando'}</button>}
    >
      <div>
        <p className="font-source text-xs font-semibold uppercase tracking-wide text-[#8E431E]">{scenario.title} · {modalItem.zone}</p>
        <h3 className="font-sans text-lg font-bold leading-snug text-[#5C260E] sm:text-xl">{modalItem.name}</h3>
      </div>
      <p className="font-noto text-sm leading-relaxed">{modalItem.description}</p>
      {modalItem.nfpa704 && <Nfpa704Box rating={modalItem.nfpa704} />}
      <NormCallout tone={modalItem.type} title="Fundamento normativo">{modalItem.norm}</NormCallout>
      <div className="flex items-start gap-2 rounded-xl border border-[#D9B98F] bg-[#F6E6CB] p-3 font-noto text-sm">
        <SquareCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#D9692B]" aria-hidden />
        <p><strong className="text-[#7B3314]">Acción recomendada: </strong>{modalItem.action}</p>
      </div>
    </GameDialog>}

    {modal?.kind === 'summary' && <GameDialog
      label={`Resumen: ${scenario.title}`}
      tone="neutral"
      onClose={() => setModal(null)}
      banner={<><Award className="h-4 w-4" aria-hidden />Escenario completado</>}
      footer={<>
        <button type="button" onClick={() => setModal(null)} className={SOFT_BUTTON}>Seguir explorando</button>
        <button type="button" onClick={() => { setModal(null); switchScenario(nextScenario.id); }} className={ACCENT_BUTTON}>Ir a {nextScenario.title}<ArrowRight className="h-4 w-4" aria-hidden /></button>
      </>}
    >
      <div>
        <p className="font-source text-xs font-semibold uppercase tracking-wide text-[#8E431E]">Resumen educativo · {scenario.title}</p>
        <h3 className="font-sans text-lg font-bold text-[#5C260E] sm:text-xl">{totalHazardsFound === totalHazards ? '¡Inspección completa en los tres espacios!' : '¡Escenario completado!'}</h3>
      </div>
      <p className="font-noto text-sm">{scenario.summaryIntro}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[[`${stats.hazardsFound} / ${stats.totalHazards}`, 'Peligros detectados'], [`${stats.safeFound} / ${stats.totalSafe}`, 'Seguros revisados'], [`${totalScore} pts`, 'Puntuación total']].map(([value, label]) => <div key={label} className="rounded-xl border border-[#D9B98F] bg-[#F6E6CB] p-3 text-center">
          <p className="font-source text-xl font-bold text-[#5C260E]">{value}</p>
          <p className="font-source text-[11px] font-semibold uppercase text-[#8E431E]">{label}</p>
        </div>)}
      </div>
      <NormCallout tone="safe" title="Claves de prevención de este espacio">
        <ul className="list-disc space-y-1.5 pl-5">{scenario.takeaways.map((text) => <li key={text}>{text}</li>)}</ul>
      </NormCallout>
    </GameDialog>}

    {modal?.kind === 'guide' && <GameDialog
      label="Guía NFPA 101 y NFPA 704"
      tone="neutral"
      onClose={() => setModal(null)}
      banner={<><BookOpen className="h-4 w-4" aria-hidden />Marco normativo de referencia</>}
      footer={<button type="button" onClick={() => setModal(null)} className={ACCENT_BUTTON}>Entendido</button>}
    >
      <h3 className="font-sans text-lg font-bold text-[#5C260E] sm:text-xl">NFPA 101, NFPA 704 y prevención</h3>
      <Nfpa704Box />
      <NormCallout tone="neutral" title="NFPA 101 · Código de Seguridad Humana">Requisitos mínimos para proteger vidas: salidas libres de obstáculos, iluminación y señalización de emergencia y diseño seguro contra caídas.</NormCallout>
      <NormCallout tone="hazard" title="Regla de oro en fuegos de cocina">Cocinar sin vigilancia es la principal causa de incendios en el hogar. Nunca eches agua sobre aceite en llamas: el vapor proyecta el fuego. Cúbrelo con una tapa metálica o usa un extintor Clase K.</NormCallout>
    </GameDialog>}
  </section>;
}
