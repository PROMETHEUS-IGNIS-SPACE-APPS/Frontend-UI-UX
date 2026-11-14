import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchIngestedObservations } from './ingestionService';

const liveObservation = {
  observation_id: 'IDEAM_VIIRS_SAMPLE',
  sensor: 'VIIRS',
  latitude: 6.2,
  longitude: -75.5,
  acquired_at: '2026-11-12T18:00:00Z',
  frp_mw: null,
  confidence_raw: 'Nominal',
  source: 'IDEAM (VIIRS)',
  source_origin: 'IDEAM',
  is_synthetic: false,
  department: 'Antioquia',
  municipality: 'Medellín',
  daynight: 'D',
};

describe('ingestionService', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('requests fusion observations and preserves provenance and optional real-data fields', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://backend.test');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      cached: true,
      degradedMode: false,
      warning: null,
      metadata: { source: 'IDEAM + NASA FIRMS', deduplicatedCount: 1 },
      observations: [liveObservation],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchIngestedObservations({ sourceMode: 'fusion', from: '2026-11-08', to: '2026-11-14', region: 'antioquia_ideam' });

    expect(String(fetchMock.mock.calls[0][0])).toBe('http://backend.test/api/fusion/observations?region=antioquia_ideam&from=2026-11-08&to=2026-11-14');
    expect(result.data_provenance).toBe('IDEAM + NASA FIRMS');
    expect(result.data[0].municipality).toBe('Medellín');
    expect(result.data[0].confidence_raw).toBe('Nominal');
    expect(result.data[0].frp_mw).toBeNull();
    expect(result.degradedMode).toBe(false);
  });

  it('rejects responses that do not match the live ingestion contract', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://backend.test');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 })));

    await expect(fetchIngestedObservations({ sourceMode: 'ideam', from: '2026-11-08', to: '2026-11-14', region: 'colombia' })).rejects.toThrow('no coincide con el contrato API v0.2');
  });
});
