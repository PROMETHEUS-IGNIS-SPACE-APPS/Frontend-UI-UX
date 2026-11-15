import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import { ANTIOQUIA_SUBREGIONS_GEOJSON } from '@/data/schematicBoundaries';
import { PROBABILITY_SCALE, probabilityColor } from '@/features/explorer/mapPresets';
import { STATE_CODES, type MarkovResult } from '@/utils/markovEngine';

interface PredictabilityReportProps {
  result: MarkovResult;
  provenance: string;
  onClose: () => void;
}

const pct = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;
const BROWN = 'text-[#6B2A12]';

/** Mapa SVG de Antioquia (contornos esquemáticos) con las celdas coloreadas por P(24 h). */
function CellsMap({ result }: { result: MarkovResult }) {
  const lonMin = -77.2; const lonMax = -73.8; const latMin = 5.3; const latMax = 8.95;
  const width = 520; const height = Math.round(width * ((latMax - latMin) / (lonMax - lonMin)));
  const x = (lon: number) => ((lon - lonMin) / (lonMax - lonMin)) * width;
  const y = (lat: number) => ((latMax - lat) / (latMax - latMin)) * height;
  const cellPx = (result.gridDeg / (lonMax - lonMin)) * width;
  const polygons = ANTIOQUIA_SUBREGIONS_GEOJSON.features.flatMap((feature) => feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates[0] as number[][]] : []);
  const cells = result.cells.filter((cell) => cell.centerLon > lonMin && cell.centerLon < lonMax && cell.centerLat > latMin && cell.centerLat < latMax);
  return <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full max-w-[520px] rounded-md border border-[#E3CDB0] bg-[#FBF5EC]" role="img" aria-label="Mapa de celdas Markov sobre Antioquia">
    {polygons.map((ring, index) => <polygon key={index} points={ring.map(([lon, lat]) => `${x(lon)},${y(lat)}`).join(' ')} fill="#0284c7" fillOpacity={0.05} stroke="#d97706" strokeWidth={1.2} />)}
    {cells.map((cell) => <rect key={cell.id} x={x(cell.centerLon) - cellPx / 2} y={y(cell.centerLat) - cellPx / 2} width={cellPx} height={cellPx} fill={probabilityColor(cell.p24)} fillOpacity={0.85} stroke="#ffffff" strokeWidth={0.4} />)}
    <text x={8} y={height - 8} fontSize={10} fill="#7A6555">Contornos esquemáticos, no oficiales · celdas de {result.gridDeg.toFixed(2)}°</text>
  </svg>;
}

/** Informe imprimible (Guardar como PDF) de la estimación exploratoria Markov. */
export default function PredictabilityReport({ result, provenance, onClose }: PredictabilityReportProps) {
  useEffect(() => {
    document.body.classList.add('print-manual');
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('print-manual'); window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const v = result.validation;
  const generated = new Date().toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });

  return createPortal(<div id="manual-print-root" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-2 sm:p-4 print:static print:block print:bg-white print:p-0" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-label="Informe de predictibilidad" className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white text-[#2B1D14] shadow-2xl print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:shadow-none">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#E3CDB0] bg-[#FBF5EC] px-3 py-2 print:hidden">
        <span className="font-noto text-xs font-semibold text-[#6B2A12]">Informe PDF con Mapa</span>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-[#6B2A12] px-3 py-1.5 font-noto text-xs font-bold text-white hover:bg-[#55210E]"><Printer className="h-3.5 w-3.5" aria-hidden />Guardar como PDF</button>
          <button type="button" onClick={onClose} aria-label="Cerrar informe" className="rounded-lg p-1.5 text-[#6B2A12] hover:bg-[#F2E3CF]"><X className="h-4 w-4" aria-hidden /></button>
        </div>
      </div>

      <div className="space-y-5 overflow-y-auto px-4 py-5 text-[13px] leading-6 sm:px-8 print:overflow-visible print:px-0 print:text-[10.5pt]">
        <header className="overflow-hidden rounded-md">
          <div className="bg-[#6B2A12] px-5 py-4 text-white"><h2 className="font-noto text-2xl font-extrabold">PROMETHEUS IGNIS</h2><p className="text-[#F6D9B8]">Informe de Predictibilidad · Cadenas de Markov 3×3 (S0 · S1 · S2)</p></div>
          <div className="bg-[#C9531F] px-5 py-1 text-xs font-bold text-white">Estimación exploratoria calculada en el navegador · no es un modelo publicado</div>
        </header>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-[12px] sm:grid-cols-2">
          <div><dt className="inline font-bold">Generado: </dt><dd className="inline">{generated}</dd></div>
          <div><dt className="inline font-bold">Ventana: </dt><dd className="inline">{result.window.start ?? '—'} a {result.window.end ?? '—'} ({result.window.days} días con datos)</dd></div>
          <div><dt className="inline font-bold">Transiciones: </dt><dd className="inline">{result.transitions.toLocaleString()} · celdas de {result.gridDeg.toFixed(2)}°</dd></div>
          <div><dt className="inline font-bold">Procedencia: </dt><dd className="inline">{provenance}</dd></div>
        </dl>

        <section className="space-y-2 break-inside-avoid">
          <h3 className={`border-b-2 border-[#C9531F] pb-1 font-noto text-base font-bold ${BROWN}`}>1. Pronóstico regional</h3>
          <table className="w-full border-collapse text-left text-[12px]">
            <thead><tr>{['Horizonte', 'S0', 'S1', 'S2', 'P(S1 ∪ S2)'].map((head) => <th key={head} className="border border-[#E3CDB0] bg-[#6B2A12] px-2 py-1 text-white">{head}</th>)}</tr></thead>
            <tbody>{result.horizons.map((h) => <tr key={h.hours}><td className="border border-[#E3CDB0] bg-[#F2E3CF] px-2 py-1 font-bold">+{h.hours} h</td>{h.vector.map((value, index) => <td key={index} className="border border-[#E3CDB0] px-2 py-1">{pct(value)}</td>)}<td className="border border-[#E3CDB0] px-2 py-1 font-bold">{pct(h.activity)}</td></tr>)}</tbody>
          </table>
        </section>

        <section className="space-y-2 break-inside-avoid">
          <h3 className={`border-b-2 border-[#C9531F] pb-1 font-noto text-base font-bold ${BROWN}`}>2. Mapa de celdas P(+24 h)</h3>
          <CellsMap result={result} />
          <div className="flex flex-wrap items-center gap-2 text-[11px]">{PROBABILITY_SCALE.map((step) => <span key={step.label} className="flex items-center gap-1"><span className="inline-block h-3 w-4 rounded-sm" style={{ backgroundColor: step.color }} />{step.label}</span>)}</div>
        </section>

        <section className="space-y-2 break-inside-avoid">
          <h3 className={`border-b-2 border-[#C9531F] pb-1 font-noto text-base font-bold ${BROWN}`}>3. Validación retrospectiva (out-of-sample)</h3>
          {v ? <p>Brier Markov <strong>{v.brierMarkov.toFixed(4)}</strong> · Brier persistencia {v.brierPersistence.toFixed(4)} · Brier climatología {v.brierClimatology.toFixed(4)} · Brier Skill Score <strong>{v.brierSkillPct === null ? '—' : `${v.brierSkillPct}%`}</strong> · ROC-AUC <strong>{v.rocAuc === null ? '—' : v.rocAuc.toFixed(3)}</strong> · Log-Loss {v.logLoss.toFixed(3)} · Precisión {v.precision === null ? '—' : pct(v.precision, 0)} / Recall {v.recall === null ? '—' : pct(v.recall, 0)} ({v.testTransitions.toLocaleString()} transiciones de prueba; {v.trainDays} días para estimar y {v.testDays} para evaluar). {v.brierSkillPct !== null && v.brierSkillPct > 0 ? 'La estimación mejora a la climatología.' : 'La estimación no supera a la climatología: interprétela con cautela.'}</p>
            : <p>Sin validación: se necesitan al menos 5 días con datos.</p>}
        </section>

        <section className="space-y-2 break-inside-avoid">
          <h3 className={`border-b-2 border-[#C9531F] pb-1 font-noto text-base font-bold ${BROWN}`}>4. Ranking territorial (top 10 por P 24 h)</h3>
          <table className="w-full border-collapse text-left text-[11px]">
            <thead><tr>{['Municipio / celda', 'Estado', 'Vecinos', 'P(24h)', 'P(48h)', 'P(72h)', 'Detecciones'].map((head) => <th key={head} className="border border-[#E3CDB0] bg-[#6B2A12] px-2 py-1 text-white">{head}</th>)}</tr></thead>
            <tbody>{result.cells.slice(0, 10).map((cell) => <tr key={cell.id}><td className="border border-[#E3CDB0] bg-[#F2E3CF] px-2 py-1">{cell.municipality ?? 'Sin municipio cercano'} ({cell.centerLat.toFixed(2)}, {cell.centerLon.toFixed(2)})</td><td className="border border-[#E3CDB0] px-2 py-1">{STATE_CODES[cell.state]}</td><td className="border border-[#E3CDB0] px-2 py-1">{cell.activeNeighbors}/8</td><td className="border border-[#E3CDB0] px-2 py-1 font-bold">{pct(cell.p24)}</td><td className="border border-[#E3CDB0] px-2 py-1">{pct(cell.p48)}</td><td className="border border-[#E3CDB0] px-2 py-1">{pct(cell.p72)}</td><td className="border border-[#E3CDB0] px-2 py-1">{cell.detections}</td></tr>)}</tbody>
          </table>
        </section>

        <p className="break-inside-avoid border-l-4 border-[#B3261E] bg-[#FBE6DD] px-3 py-2 text-[12px]"><strong>Importante / Rigor científico:</strong> P(S1 ∪ S2) es una probabilidad de actividad térmica satelital estimada con los datos cargados; no confirma ni predice incendios, ni superficie quemada. Las nubes y el horario orbital pueden ocultar actividad. El modelo oficial lo publicará el AI-Pipeline con su evaluación. Ante una emergencia, llame al 123.</p>
        <footer className="border-t border-[#E3CDB0] pt-2 text-[11px] text-[#7A6555]">PROMETHEUS IGNIS · Semillero de Astronomía ITM · NASA Space Apps Challenge 2026</footer>
      </div>
    </section>
  </div>, document.body);
}
