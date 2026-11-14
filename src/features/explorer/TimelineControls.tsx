import { AlertCircle, Clock, Pause, Play, SkipBack, SkipForward } from 'lucide-react';

interface TimelineControlsProps {
  dates: string[];
  countsByDate: Record<string, number>;
  activeDate: string | null;
  isPlaying: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onStep: (direction: -1 | 1) => void;
  onTogglePlay: () => void;
  onSelectIndex: (index: number) => void;
}

const SPEEDS = [1, 2, 5];

export default function TimelineControls({ dates, countsByDate, activeDate, isPlaying, speed, onSpeedChange, onStep, onTogglePlay, onSelectIndex }: TimelineControlsProps) {
  const activeIndex = activeDate ? dates.indexOf(activeDate) : -1;
  const maxCount = Math.max(1, ...dates.map((date) => countsByDate[date] ?? 0));
  const stepLabel = activeIndex >= 0 ? `Paso temporal: ${activeIndex + 1} de ${dates.length}` : `${dates.length} fechas disponibles`;

  return (
    <div className="shrink-0 select-none border-t border-border bg-card p-3 text-xs">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => onStep(-1)} disabled={!dates.length || activeIndex === 0} aria-label="Paso anterior" title="Día anterior" className="p-1.5 text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30">
              <SkipBack className="h-4 w-4" />
            </button>
            <button type="button" onClick={onTogglePlay} disabled={dates.length < 2} aria-label={isPlaying ? 'Pausar línea de tiempo' : 'Reproducir línea de tiempo'} title={isPlaying ? 'Pausar evolución temporal' : 'Reproducir evolución temporal'} className="p-1.5 font-bold text-accent transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => onStep(1)} disabled={!dates.length || activeIndex >= dates.length - 1} aria-label="Paso siguiente" title="Día siguiente" className="p-1.5 text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30">
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-info" />
            <div>
              <div className="font-source text-sm font-bold tracking-wide text-text-primary">{activeDate ?? 'Todos los pasos'}</div>
              <div className="font-source text-[10px] text-text-secondary">{stepLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-source text-[11px]" role="group" aria-label="Velocidad de reproducción">
            {SPEEDS.map((value) => <button key={value} type="button" aria-pressed={speed === value} onClick={() => onSpeedChange(value)} className={`rounded px-1.5 py-0.5 transition-colors ${speed === value ? 'border border-accent/40 bg-accent-soft font-bold text-accent' : 'border border-transparent text-text-secondary hover:text-text-primary'}`}>{value}x</button>)}
          </div>
        </div>

        <div className="flex w-full max-w-xl flex-1 flex-col gap-1">
          <div className="flex h-6 w-full items-end gap-0.5 px-1" aria-hidden>
            {dates.slice(-100).map((date) => {
              const count = countsByDate[date] ?? 0;
              const index = dates.indexOf(date);
              const isPassed = activeIndex < 0 || index <= activeIndex;
              return <div key={date} style={{ height: `${Math.max(10, Math.round((count / maxCount) * 100))}%` }} className={`flex-1 rounded-t-xs transition-colors ${isPassed ? 'bg-accent-solid' : 'bg-border-strong'}`} title={`${date}: ${count} observaciones`} />;
            })}
          </div>
          <input type="range" aria-label="Fecha de la línea de tiempo" min={0} max={Math.max(0, dates.length - 1)} value={activeIndex < 0 ? Math.max(0, dates.length - 1) : activeIndex} onChange={(event) => onSelectIndex(Number(event.target.value))} disabled={!dates.length} className="h-1.5 w-full cursor-pointer rounded-lg bg-border-strong accent-accent" />
        </div>

        <div className="hidden max-w-[235px] items-center gap-1.5 text-[10px] leading-tight text-text-secondary lg:flex">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-warning" />
          <span>La ausencia de datos en un paso orbital no equivale a ausencia de incendios.</span>
        </div>
      </div>
    </div>
  );
}
