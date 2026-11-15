/**
 * Artefacto publicado del modelo CENTINELA v0.1.0 (AI-Pipeline, entrenado el
 * 2026-11-14 con 1.469.158 observaciones FIRMS reales). El archivo
 * `public/models/centinela-v1.json` es un extracto de `resultados/modelo-real.json`
 * sin el historial completo; se conservan los valores originales.
 */

export interface CentinelaEstimate {
  probability: number | null;
  interval_95: [number, number] | null;
  n: number;
  positives?: number;
  status: string;
}

export interface CentinelaForecast {
  cell_id: string;
  product: string;
  /** [oeste, sur, este, norte] en grados WGS84. */
  bounds: [number, number, number, number];
  target_month: string;
  last_state: 0 | 1 | null;
  p01: CentinelaEstimate;
  p11: CentinelaEstimate;
  prediction: CentinelaEstimate;
  known_months: number;
  unknown_months: number;
  historical_frequency: number | null;
}

export interface CentinelaMetric {
  n: number;
  brier: number;
  precision?: number;
  recall?: number;
  false_alarm_rate?: number;
  false_alarms?: number;
  threshold?: number;
}

export interface CentinelaModel {
  schema_version: string;
  model_version: string;
  model_id: string;
  trained_at: string;
  observations: number;
  sources_count: number;
  sources_products: string[];
  settings: { grid: string; bbox: [number, number, number, number]; end_month: string; cutoff: string; min_transitions: number; alpha: number; target_filter: string };
  meaning: string;
  operational_alerts_enabled: boolean;
  evaluation: { cutoff: string; protocol: string; status: string | null; beats_baselines: boolean | null; evaluated_pairs: number; metrics: Record<string, CentinelaMetric> };
  forecasts: CentinelaForecast[];
}
