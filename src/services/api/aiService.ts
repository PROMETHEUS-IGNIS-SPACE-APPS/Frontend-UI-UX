import { ApiError, postJson } from './httpClient';

/** Interpretación con IA del Backend-API (`POST /api/ai/explain`, Gemini en el servidor). */

export type AiMode = 'predictability' | 'calendar';

export interface AiExplanation {
  resumenEjecutivo: string;
  hallazgosClave: string[];
  interpretacionSensores: string;
  interpretacionMarkov: string;
  limitacionesYCautela: string[];
  recomendacionesOperativas: string[];
}

export interface AiExplainResult {
  model: string;
  cached: boolean;
  structured: AiExplanation;
  disclaimer: string;
}

const AI_TIMEOUT_MS = 60_000;

const isString = (value: unknown): value is string => typeof value === 'string';
const isStringList = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);

function parseExplanation(value: unknown): AiExplanation | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (
    !isString(item.resumenEjecutivo) || !isStringList(item.hallazgosClave)
    || !isString(item.interpretacionSensores) || !isString(item.interpretacionMarkov)
    || !isStringList(item.limitacionesYCautela) || !isStringList(item.recomendacionesOperativas)
  ) return null;
  return {
    resumenEjecutivo: item.resumenEjecutivo,
    hallazgosClave: item.hallazgosClave,
    interpretacionSensores: item.interpretacionSensores,
    interpretacionMarkov: item.interpretacionMarkov,
    limitacionesYCautela: item.limitacionesYCautela,
    recomendacionesOperativas: item.recomendacionesOperativas,
  };
}

export async function explainWithAi(mode: AiMode, payload: Record<string, unknown>): Promise<AiExplainResult> {
  const { body } = await postJson('/ai/explain', { mode, payload, language: 'es' }, { apiPrefix: '/api', timeoutMs: AI_TIMEOUT_MS });
  const record = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  const structured = parseExplanation(record.structured);
  if (!structured) throw new ApiError('http', 'La respuesta de la IA no tiene el formato esperado.', 502);
  return {
    model: isString(record.model) ? record.model : 'desconocido',
    cached: record.cached === true,
    structured,
    disclaimer: isString(record.disclaimer) ? record.disclaimer : 'Lectura generada por IA a partir de las cifras de la plataforma.',
  };
}
