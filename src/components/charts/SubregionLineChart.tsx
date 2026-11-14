import { useState } from 'react';
import { MONTHS_FULL, MONTHS_SHORT, type SubregionConfig } from '@/utils/subregions';

interface SubregionLineChartProps {
  title: string;
  badge: string;
  series: Array<{ subregion: SubregionConfig; values: (number | null)[] }>;
  showArea?: boolean;
  unit: string;
  decimals?: number;
}

const WIDTH = 640;
const HEIGHT = 270;
const PAD = { left: 44, right: 18, top: 18, bottom: 34 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

function niceMax(raw: number, floor: number) {
  if (raw <= 0) return floor;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= raw) ?? 10;
  return Math.max(floor, step * magnitude);
}

/** Gráfica de líneas Ene–Dic por subregión, con el diseño de la carpeta Ejemplo. */
export default function SubregionLineChart({ title, badge, series, showArea = false, unit, decimals = 0 }: SubregionLineChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const values = series.flatMap((item) => item.values.filter((value): value is number => value !== null));
  const yMax = niceMax(Math.max(0, ...values), decimals > 0 ? 20 : 10);
  const isEmpty = !values.some((value) => value > 0);
  const x = (index: number) => PAD.left + (index / 11) * PLOT_W;
  const y = (value: number) => PAD.top + PLOT_H - (Math.min(yMax, Math.max(0, value)) / yMax) * PLOT_H;

  /** Separa la serie en tramos continuos para no unir meses sin dato. */
  const segments = (points: (number | null)[]) => {
    const result: Array<Array<[number, number]>> = [];
    let current: Array<[number, number]> = [];
    points.forEach((value, index) => {
      if (value === null) { if (current.length) result.push(current); current = []; return; }
      current.push([x(index), y(value)]);
    });
    if (current.length) result.push(current);
    return result;
  };

  return <article className="relative space-y-3 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
    <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
      <h2 className="truncate font-noto text-xs font-bold text-text-primary sm:text-sm">{title}</h2>
      <span className="shrink-0 whitespace-nowrap rounded-md border border-border bg-surface px-2.5 py-0.5 font-source text-[11px] font-semibold text-text-secondary">{badge}</span>
    </div>

    <div className="relative w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full select-none overflow-visible" role="img" aria-label={title} onMouseLeave={() => setHovered(null)}>
        {Array.from({ length: 5 }).map((_, index) => {
          const value = (yMax / 4) * index;
          return <g key={index}>
            <line x1={PAD.left} y1={y(value)} x2={WIDTH - PAD.right} y2={y(value)} stroke="currentColor" className="text-border" strokeDasharray={index === 0 ? undefined : '3 4'} strokeWidth={index === 0 ? 1.2 : 0.9} />
            <text x={PAD.left - 8} y={y(value) + 3.5} textAnchor="end" className="fill-text-secondary font-source text-[10px]">{Math.round(value)}</text>
          </g>;
        })}
        {MONTHS_SHORT.map((month, index) => <text key={month} x={x(index)} y={HEIGHT - 10} textAnchor="middle" className={`font-source text-[10px] ${hovered === index ? 'fill-text-primary font-bold' : 'fill-text-secondary'}`}>{month}</text>)}

        {showArea && series.map(({ subregion, values: points }) => segments(points).map((segment, index) => {
          const path = `M ${segment[0][0]},${y(0)} ${segment.map(([px, py]) => `L ${px},${py}`).join(' ')} L ${segment[segment.length - 1][0]},${y(0)} Z`;
          return <path key={`${subregion.id}-area-${index}`} d={path} fill={subregion.color} fillOpacity={0.12} />;
        }))}

        {series.map(({ subregion, values: points }) => <g key={subregion.id}>
          {segments(points).map((segment, index) => <polyline key={index} fill="none" stroke={subregion.color} strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" points={segment.map(([px, py]) => `${px},${py}`).join(' ')} />)}
          {points.map((value, index) => value === null ? null : <circle key={index} cx={x(index)} cy={y(value)} r={hovered === index ? 4.2 : 2.5} fill={subregion.color} stroke="var(--card)" strokeWidth={1.2} />)}
        </g>)}

        {hovered !== null && <line x1={x(hovered)} y1={PAD.top} x2={x(hovered)} y2={y(0)} stroke="currentColor" className="text-text-secondary/50" strokeDasharray="3 3" strokeWidth={1} />}
        {MONTHS_SHORT.map((month, index) => <rect key={`hover-${month}`} x={x(index) - PLOT_W / 22} y={PAD.top} width={PLOT_W / 11} height={PLOT_H} fill="transparent" className="cursor-crosshair" onMouseEnter={() => setHovered(index)} />)}
      </svg>

      {isEmpty && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="rounded-lg border border-border bg-card px-3 py-1.5 font-noto text-[11px] text-text-secondary">Sin registros en las subregiones seleccionadas para el conjunto cargado</span></div>}

      {hovered !== null && !isEmpty && <div className="pointer-events-none absolute top-2 z-20 min-w-[180px] rounded-xl border border-border-strong bg-card px-3 py-2 font-source text-[11px] shadow-xl" style={{ left: `${Math.min(70, Math.max(2, (x(hovered) / WIDTH) * 100 - 12))}%` }}>
        <div className="mb-1 border-b border-border pb-1 font-noto font-bold text-text-primary">{MONTHS_FULL[hovered]}</div>
        <div className="space-y-0.5">{series.map(({ subregion, values: points }) => <div key={subregion.id} className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5 text-text-secondary"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: subregion.color }} />{subregion.label}</span><span className="font-bold tabular-nums text-text-primary">{points[hovered] === null ? 'Sin dato' : `${points[hovered]?.toFixed(decimals)} ${unit}`}</span></div>)}</div>
      </div>}
    </div>

    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-2 font-source text-[11px]">
      {series.map(({ subregion }) => <span key={subregion.id} className="flex items-center gap-1.5 text-text-secondary"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: subregion.color }} />{subregion.label}</span>)}
    </div>
  </article>;
}
