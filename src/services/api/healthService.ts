import { ApiError, requestJson } from './httpClient';

/**
 * Servicio del endpoint de capacidades `GET /api/health` (API v0.2.0).
 *
 * La interfaz usa el health como **indicador pasivo** de disponibilidad:
 * la conectividad se decide por el estado HTTP; el cuerpo no se interpreta
 * y no sustituye datos. La validación de shape real del endpoint se
 * ampliará junto con el resto del contrato (Fase 2).
 */
export interface BackendHealthResult {
  connected: boolean;
  /** Código HTTP devuelto, null cuando el servicio no respondió. */
  httpStatus: number | null;
}

export async function checkBackendHealth(): Promise<BackendHealthResult> {
  try {
    const { status } = await requestJson('/health', { apiPrefix: '/api' });
    return { connected: status >= 200 && status < 300, httpStatus: status };
  } catch (error) {
    if (error instanceof ApiError) {
      return { connected: false, httpStatus: error.status };
    }
    return { connected: false, httpStatus: null };
  }
}
