import type { Observation } from '@/types/api/observations';
import { isNearReference } from './subregions';

/**
 * Estimación EXPLORATORIA de Cadenas de Markov 3×3 calculada en el navegador
 * con las observaciones reales cargadas (decisión del equipo, 2026-11-14).
 * No es un modelo publicado por el AI-Pipeline: no usa datos sintéticos, clima
 * ni factores inventados, y siempre va acompañada de su validación cronológica.
 *
 * Estados por celda y día UTC evaluado (días con al menos una observación):
 *   S0 = sin detección en la celda ese día
 *   S1 = detecciones con FRP máxima < 30 MW y menos de 4 detecciones
 *   S2 = FRP máxima ≥ 30 MW o 4 o más detecciones
 * Solo se cuentan transiciones entre días consecutivos.
 */

export type MarkovState = 0 | 1 | 2;
export const STATE_CODES = ['S0', 'S1', 'S2'] as const;

export const HIGH_FRP_MW = 30;
export const HIGH_COUNT = 4;
export const SMOOTHING_ALPHA = 0.5;
/** Peso del prior (matriz homogénea) al condicionar por vecinos activos. */
const NEIGHBOR_PRIOR_WEIGHT = 10;
export const MIN_DAYS_TRAINED = 3;
export const MIN_DAYS_VALIDATED = 5;

export interface MarkovCell {
  id: string;
  centerLat: number;
  centerLon: number;
  municipality: string | null;
  department: string | null;
  state: MarkovState;
  activeNeighbors: number;
  p24: number;
  p48: number;
  p72: number;
  detections: number;
}

export interface MarkovValidation {
  trainDays: number;
  testDays: number;
  testTransitions: number;
  brierMarkov: number;
  brierPersistence: number;
  brierClimatology: number;
  /** Mejora porcentual del Brier frente a climatología (negativo = peor). */
  brierSkillPct: number | null;
  rocAuc: number | null;
  logLoss: number;
  threshold: number;
  precision: number | null;
  recall: number | null;
  f1: number | null;
}

export interface MarkovResult {
  status: 'insufficient' | 'trained' | 'validated';
  message: string;
  gridDeg: number;
  window: { start: string | null; end: string | null; days: number; calendarDays: number };
  observationsUsed: number;
  transitions: number;
  counts: number[][];
  matrix: number[][];
  currentVector: [number, number, number];
  horizons: { hours: 24 | 48 | 72; vector: [number, number, number]; activity: number }[];
  cells: MarkovCell[];
  validation: MarkovValidation | null;
}

const DAY_MS = 86_400_000;
const isNextDay = (a: string, b: string) => Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`) === DAY_MS;
const round = (value: number, digits = 4) => Number(value.toFixed(digits));

export function classifyCellDay(items: Pick<Observation, 'frp_mw'>[]): MarkovState {
  if (items.length === 0) return 0;
  const maxFrp = Math.max(0, ...items.map((item) => item.frp_mw ?? 0));
  return maxFrp >= HIGH_FRP_MW || items.length >= HIGH_COUNT ? 2 : 1;
}

export function estimateMatrix(histories: Map<string, Map<string, MarkovState>>, dates: string[], alpha = SMOOTHING_ALPHA) {
  const counts = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  let transitions = 0;
  for (const days of histories.values()) {
    for (let t = 0; t < dates.length - 1; t += 1) {
      if (!isNextDay(dates[t], dates[t + 1])) continue;
      counts[days.get(dates[t]) ?? 0][days.get(dates[t + 1]) ?? 0] += 1;
      transitions += 1;
    }
  }
  const matrix = counts.map((row) => {
    const denominator = row[0] + row[1] + row[2] + 3 * alpha;
    return row.map((count) => (count + alpha) / denominator);
  });
  return { counts, matrix, transitions };
}

export function propagate(vector: [number, number, number], matrix: number[][], steps: number): [number, number, number] {
  let current = vector;
  for (let step = 0; step < steps; step += 1) {
    current = [0, 1, 2].map((j) => current[0] * matrix[0][j] + current[1] * matrix[1][j] + current[2] * matrix[2][j]) as [number, number, number];
  }
  return current;
}

/** ROC-AUC exacto por rangos (empates promediados). */
export function rocAuc(scores: number[], labels: number[]): number | null {
  const positives = labels.filter((label) => label === 1).length;
  const negatives = labels.length - positives;
  if (!positives || !negatives) return null;
  const pairs = scores.map((score, index) => ({ score, label: labels[index] })).sort((a, b) => a.score - b.score);
  let rankSum = 0;
  for (let i = 0; i < pairs.length;) {
    let j = i;
    while (j < pairs.length && pairs[j].score === pairs[i].score) j += 1;
    const rank = (i + 1 + j) / 2;
    for (let k = i; k < j; k += 1) if (pairs[k].label === 1) rankSum += rank;
    i = j;
  }
  return round((rankSum - (positives * (positives + 1)) / 2) / (positives * negatives));
}

function neighborsActive(id: string, date: string, histories: Map<string, Map<string, MarkovState>>) {
  const [row, col] = id.split(':').map(Number);
  let active = 0;
  for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
    if ((dr || dc) && (histories.get(`${row + dr}:${col + dc}`)?.get(date) ?? 0) > 0) active += 1;
  }
  return active;
}

/**
 * P(actividad mañana | estado, ¿algún vecino activo hoy?) estimada en `dates`,
 * con contracción bayesiana hacia la matriz homogénea (prior de peso 10).
 */
function fitNeighborConditional(histories: Map<string, Map<string, MarkovState>>, dates: string[], matrix: number[][]) {
  const positives = new Map<string, number>();
  const totals = new Map<string, number>();
  for (const [id, days] of histories) {
    for (let t = 0; t < dates.length - 1; t += 1) {
      if (!isNextDay(dates[t], dates[t + 1])) continue;
      const key = `${days.get(dates[t]) ?? 0}|${neighborsActive(id, dates[t], histories) > 0 ? 1 : 0}`;
      totals.set(key, (totals.get(key) ?? 0) + 1);
      if ((days.get(dates[t + 1]) ?? 0) > 0) positives.set(key, (positives.get(key) ?? 0) + 1);
    }
  }
  return (id: string, state: MarkovState, date: string) => {
    const key = `${state}|${neighborsActive(id, date, histories) > 0 ? 1 : 0}`;
    const prior = matrix[state][1] + matrix[state][2];
    return ((positives.get(key) ?? 0) + NEIGHBOR_PRIOR_WEIGHT * prior) / ((totals.get(key) ?? 0) + NEIGHBOR_PRIOR_WEIGHT);
  };
}

function validate(histories: Map<string, Map<string, MarkovState>>, dates: string[]): MarkovValidation | null {
  const split = Math.max(MIN_DAYS_TRAINED, Math.floor(dates.length * 0.7));
  const trainDates = dates.slice(0, split);
  const testDates = dates.slice(split - 1);
  const { matrix } = estimateMatrix(histories, trainDates);
  const predict = fitNeighborConditional(histories, trainDates, matrix);

  let trainCells = 0; let trainActive = 0;
  const trainScores: number[] = []; const trainLabels: number[] = [];
  for (const [id, days] of histories) {
    for (const date of trainDates) { trainCells += 1; if ((days.get(date) ?? 0) > 0) trainActive += 1; }
    for (let t = 0; t < trainDates.length - 1; t += 1) {
      if (!isNextDay(trainDates[t], trainDates[t + 1])) continue;
      trainScores.push(predict(id, days.get(trainDates[t]) ?? 0, trainDates[t]));
      trainLabels.push((days.get(trainDates[t + 1]) ?? 0) > 0 ? 1 : 0);
    }
  }
  const climatology = trainCells ? trainActive / trainCells : 0;

  // Umbral de decisión calibrado SOLO con días de entrenamiento (sin fuga).
  let threshold = 0.15; let bestF1 = -1;
  for (const candidate of [0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5]) {
    let tp = 0; let fp = 0; let fn = 0;
    trainScores.forEach((score, index) => { const predicted = score >= candidate; if (predicted && trainLabels[index]) tp += 1; else if (predicted) fp += 1; else if (trainLabels[index]) fn += 1; });
    const f1 = 2 * tp + fp + fn ? (2 * tp) / (2 * tp + fp + fn) : 0;
    if (f1 > bestF1) { bestF1 = f1; threshold = candidate; }
  }

  let n = 0; let brierMarkov = 0; let brierPersistence = 0; let brierClim = 0; let logLoss = 0; let tp = 0; let fp = 0; let fn = 0;
  const scores: number[] = []; const labels: number[] = [];
  for (const [id, days] of histories) {
    for (let t = 0; t < testDates.length - 1; t += 1) {
      if (!isNextDay(testDates[t], testDates[t + 1])) continue;
      const state = days.get(testDates[t]) ?? 0;
      const actual = (days.get(testDates[t + 1]) ?? 0) > 0 ? 1 : 0;
      const p = predict(id, state, testDates[t]);
      brierMarkov += (p - actual) ** 2;
      brierPersistence += ((state > 0 ? 1 : 0) - actual) ** 2;
      brierClim += (climatology - actual) ** 2;
      const clipped = Math.min(0.9999, Math.max(0.0001, p));
      logLoss += -(actual * Math.log(clipped) + (1 - actual) * Math.log(1 - clipped));
      scores.push(p); labels.push(actual);
      if (p >= threshold && actual) tp += 1; else if (p >= threshold) fp += 1; else if (actual) fn += 1;
      n += 1;
    }
  }
  if (!n) return null;
  const precision = tp + fp ? round(tp / (tp + fp)) : null;
  const recall = tp + fn ? round(tp / (tp + fn)) : null;
  const clim = brierClim / n;
  return {
    trainDays: trainDates.length,
    testDays: testDates.length - 1,
    testTransitions: n,
    brierMarkov: round(brierMarkov / n),
    brierPersistence: round(brierPersistence / n),
    brierClimatology: round(clim),
    brierSkillPct: clim > 0 ? round(((clim - brierMarkov / n) / clim) * 100, 1) : null,
    rocAuc: rocAuc(scores, labels),
    logLoss: round(logLoss / n),
    threshold,
    precision,
    recall,
    f1: precision !== null && recall !== null && precision + recall > 0 ? round((2 * precision * recall) / (precision + recall)) : null,
  };
}

export function runMarkovEngine(observations: Observation[]): MarkovResult {
  const gridDeg = observations.length >= 120 ? 0.1 : 0.14;
  const histories = new Map<string, Map<string, MarkovState>>();
  const meta = new Map<string, { lat: number; lon: number; detections: number; municipality: string | null; department: string | null }>();
  const cellDay = new Map<string, Observation[]>();
  const dateSet = new Set<string>();

  for (const item of observations) {
    const date = item.acquired_at.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    dateSet.add(date);
    const row = Math.floor(item.latitude / gridDeg);
    const col = Math.floor(item.longitude / gridDeg);
    const id = `${row}:${col}`;
    // El municipio del backend solo se acepta si la referencia está a ≤ 50 km (ver utils/subregions).
    const near = isNearReference(item);
    const municipality = near ? item.municipality ?? null : null;
    const department = near ? item.department ?? null : null;
    if (!meta.has(id)) { meta.set(id, { lat: round((row + 0.5) * gridDeg), lon: round((col + 0.5) * gridDeg), detections: 0, municipality, department }); histories.set(id, new Map()); }
    const cell = meta.get(id)!;
    cell.detections += 1;
    cell.municipality ??= municipality;
    cell.department ??= department;
    const key = `${id}|${date}`;
    cellDay.set(key, [...(cellDay.get(key) ?? []), item]);
  }
  for (const [key, items] of cellDay) {
    const [id, date] = key.split('|');
    histories.get(id)!.set(date, classifyCellDay(items));
  }

  const dates = [...dateSet].sort();
  const start = dates[0] ?? null;
  const end = dates[dates.length - 1] ?? null;
  const calendarDays = start && end ? Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY_MS) + 1 : 0;
  const { counts, matrix, transitions } = estimateMatrix(histories, dates);
  const base = { gridDeg, window: { start, end, days: dates.length, calendarDays }, observationsUsed: observations.length, transitions, counts, matrix };

  if (dates.length < MIN_DAYS_TRAINED || transitions === 0) {
    return {
      ...base,
      status: 'insufficient',
      message: dates.length < MIN_DAYS_TRAINED
        ? `Datos insuficientes: ${dates.length} día(s) con observaciones. Se necesitan al menos ${MIN_DAYS_TRAINED} días consecutivos; cargue una ventana más larga (por ejemplo IDEAM 45 días Antioquia).`
        : 'No hay días consecutivos en el conjunto cargado (por ejemplo, el histórico muestreado salta entre fechas), así que no se pueden contar transiciones diarias.',
      currentVector: [1, 0, 0],
      horizons: [],
      cells: [],
      validation: null,
    };
  }

  const predict = fitNeighborConditional(histories, dates, matrix);
  const latest = dates[dates.length - 1];
  const latestCounts = [0, 0, 0];
  const cells: MarkovCell[] = [...histories].map(([id, days]) => {
    const state = days.get(latest) ?? 0;
    latestCounts[state] += 1;
    const p24 = predict(id, state, latest);
    // Día 1: probabilidad condicionada a vecinos, repartida entre S1/S2 según la fila de P.
    // Días 2 y 3: propagación homogénea con P (la información de vecinos ya no se conoce).
    const activeShare = matrix[state][1] + matrix[state][2];
    const day1: [number, number, number] = [1 - p24, (p24 * matrix[state][1]) / activeShare, (p24 * matrix[state][2]) / activeShare];
    const f48 = propagate(day1, matrix, 1); const f72 = propagate(day1, matrix, 2);
    const cell = meta.get(id)!;
    return {
      id, centerLat: cell.lat, centerLon: cell.lon, municipality: cell.municipality, department: cell.department,
      state, activeNeighbors: neighborsActive(id, latest, histories), detections: cell.detections,
      p24: round(p24), p48: round(f48[1] + f48[2]), p72: round(f72[1] + f72[2]),
    };
  });
  const total = Math.max(1, cells.length);
  const currentVector: [number, number, number] = [latestCounts[0] / total, latestCounts[1] / total, latestCounts[2] / total];
  const horizons = ([24, 48, 72] as const).map((hours, index) => {
    const vector = propagate(currentVector, matrix, index + 1);
    return { hours, vector, activity: round(vector[1] + vector[2]) };
  });
  const validation = dates.length >= MIN_DAYS_VALIDATED ? validate(histories, dates) : null;

  return {
    ...base,
    status: validation ? 'validated' : 'trained',
    message: validation
      ? `Estimación con ${dates.length} días y ${transitions.toLocaleString('es-CO')} transiciones; validada fuera de muestra en los últimos ${validation.testDays} días.`
      : `Estimación con ${dates.length} días; se necesitan al menos ${MIN_DAYS_VALIDATED} para validarla fuera de muestra.`,
    currentVector,
    horizons,
    cells: cells.sort((a, b) => b.p24 - a.p24 || b.activeNeighbors - a.activeNeighbors || b.detections - a.detections),
    validation,
  };
}
