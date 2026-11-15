import { ApiError, requestJson } from './httpClient';

export interface EndpointCheck {
  label: string;
  path: string;
  apiPrefix: '/api' | '/api/v1';
}

export interface EndpointResult extends EndpointCheck {
  ok: boolean;
  httpStatus: number | null;
  latencyMs: number;
  detail: string;
}

const isoDay = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);

/** Endpoints reales del Backend-API v0.2 que usa la interfaz (consultas cortas para no cargar el servidor). */
export function diagnosticEndpoints(): EndpointCheck[] {
  const range = `from=${isoDay(-1)}&to=${isoDay(0)}`;
  return [
    { label: 'Salud del Backend-API', path: '/health', apiPrefix: '/api' },
    { label: 'IDEAM · SMByC (Antioquia, 2 días)', path: `/ideam/observations?region=antioquia_ideam&${range}`, apiPrefix: '/api' },
    { label: 'NASA FIRMS · NRT (Antioquia)', path: '/firms/observations?region=antioquia_ideam', apiPrefix: '/api' },
    { label: 'Fusión IDEAM + FIRMS (Antioquia, 2 días)', path: `/fusion/observations?region=antioquia_ideam&${range}`, apiPrefix: '/api' },
    { label: 'Directorio de archivos IDEAM', path: '/ideam/directory', apiPrefix: '/api' },
  ];
}

export async function checkEndpoint(endpoint: EndpointCheck): Promise<EndpointResult> {
  const started = performance.now();
  try {
    const { status } = await requestJson(endpoint.path, { apiPrefix: endpoint.apiPrefix, timeoutMs: 30_000 });
    return { ...endpoint, ok: status >= 200 && status < 300, httpStatus: status, latencyMs: Math.round(performance.now() - started), detail: `HTTP ${status}` };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - started);
    if (error instanceof ApiError) return { ...endpoint, ok: false, httpStatus: error.status, latencyMs, detail: error.status ? `HTTP ${error.status}` : error.kind === 'timeout' ? 'Tiempo de espera agotado' : 'Sin conexión' };
    return { ...endpoint, ok: false, httpStatus: null, latencyMs, detail: 'Error inesperado' };
  }
}
