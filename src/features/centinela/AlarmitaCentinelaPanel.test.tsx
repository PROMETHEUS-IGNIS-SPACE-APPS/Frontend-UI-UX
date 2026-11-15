import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AlarmitaCentinelaPanel from './AlarmitaCentinelaPanel';

const estimate = (p: number | null) => ({ probability: p, interval_95: p === null ? null : [p - 0.1, p + 0.1], n: 30, status: p === null ? 'insufficient_data' : 'experimental' });
const forecast = (cell: string, product: string, bounds: number[], freq: number | null, p01: number | null) => ({ cell_id: cell, product, bounds, target_month: '2026-11', last_state: null, p01: estimate(p01), p11: estimate(null), prediction: estimate(null), known_months: 150, unknown_months: 150, historical_frequency: freq });
const model = {
  schema_version: 'centinela-v1', model_version: '0.1.0', model_id: 'abc', trained_at: '2026-11-14T15:57:52Z', observations: 1469158, sources_count: 35, sources_products: ['MODIS_SP'],
  settings: { grid: 'wgs84-0.25', bbox: [-76.25, 5.75, -74.5, 8.5], end_month: '2026-10', cutoff: '2020-12', min_transitions: 12, alpha: 1, target_filter: 'type=0' },
  meaning: 'x', operational_alerts_enabled: false,
  evaluation: { cutoff: '2020-12', protocol: 'fixed', status: 'evaluated', beats_baselines: false, evaluated_pairs: 4066, metrics: {} },
  forecasts: [
    forecast('low', 'MODIS', [-76.25, 5.75, -76, 6], 0.05, 0.07),
    forecast('segovia', 'MODIS', [-74.75, 7, -74.5, 7.25], 0.62, 0.53),
    forecast('segovia', 'VIIRS_NOAA20', [-74.75, 7, -74.5, 7.25], null, null),
  ],
};

describe('AlarmitaCentinelaPanel', () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it('starts on the most active cell and keeps missing values as insufficient data', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(model))));
    render(<QueryClientProvider client={new QueryClient()}><AlarmitaCentinelaPanel /></QueryClientProvider>);

    expect(await screen.findByRole('heading', { name: 'Probabilidades reales CENTINELA por sensor y celda' }, { timeout: 8000 })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Celda CENTINELA' })).toHaveValue('segovia');
    expect(screen.getByText('MODIS: 53.0 %')).toBeInTheDocument();
    expect(screen.getAllByText('VIIRS NOAA-20: Datos insuficientes').length).toBeGreaterThan(0);
    expect(screen.getByText(/no publica estimación en ninguna celda/)).toBeInTheDocument();
  });
});
