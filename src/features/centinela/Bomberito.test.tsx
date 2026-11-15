import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Bomberito from './Bomberito';
import { useCitizenReportsStore } from '@/stores/citizenReportsStore';

const model = {
  schema_version: 'centinela-v1', model_version: '0.1.0', model_id: 'abc', trained_at: '2026-11-14T15:57:52Z', observations: 1469158, sources_count: 35, sources_products: ['MODIS_SP'],
  settings: { grid: 'wgs84-0.25', bbox: [-76.25, 5.75, -74.5, 8.5], end_month: '2026-10', cutoff: '2020-12', min_transitions: 12, alpha: 1 , target_filter: 'type=0' },
  meaning: 'Probabilidad experimental de detección térmica; no de incendio', operational_alerts_enabled: false,
  evaluation: { cutoff: '2020-12', protocol: 'fixed', status: 'evaluated', beats_baselines: false, evaluated_pairs: 4066, metrics: { markov: { n: 4066, brier: 0.1548 }, frequency: { n: 4066, brier: 0.1654 }, seasonal_frequency: { n: 4066, brier: 0.1319 } } },
  forecasts: [{ cell_id: 'wgs84-0.25:420:390', product: 'MODIS', bounds: [-75.25, 7.75, -75, 8], target_month: '2026-11', last_state: null,
    p01: { probability: 0.3, interval_95: [0.2, 0.4], n: 50, status: 'experimental' }, p11: { probability: 0.6, interval_95: [0.5, 0.7], n: 40, status: 'experimental' },
    prediction: { probability: null, interval_95: null, n: 0, status: 'insufficient_data' }, known_months: 150, unknown_months: 150, historical_frequency: 0.55 }],
};

describe('Bomberito', () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); useCitizenReportsStore.getState().clearReports(); localStorage.clear(); });

  it('presents the published CENTINELA model without inventing a forecast', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => url.includes('centinela') ? new Response(JSON.stringify(model)) : new Response('{}', { status: 200 })));
    const user = userEvent.setup();
    render(<QueryClientProvider client={new QueryClient()}><Bomberito observations={[]} /></QueryClientProvider>);

    await user.click(screen.getByRole('button', { name: 'Abrir Bomberito Centinela' }));
    expect(screen.getByRole('dialog', { name: 'Bomberito Centinela' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: /Cerca de Caucasia/ }));
    expect(screen.getByText('Datos insuficientes: falta cobertura del mes anterior')).toBeInTheDocument();
    expect(screen.getByText('30.0 %')).toBeInTheDocument();
    expect(screen.getByText(/no a la estacional/)).toBeInTheDocument();
    expect(screen.getByText(/No es una alerta oficial/)).toBeInTheDocument();
  });

  it('stops announcing an alert once the panel has been opened', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => url.includes('centinela') ? new Response(JSON.stringify(model)) : new Response('{}', { status: 200 })));
    useCitizenReportsStore.getState().addReport({ id: `reporte-${Date.now()}`, createdAt: 'hoy', latitude: 7.9, longitude: -75.1, sector: null, intensity: 'Alta', note: 'humo', role: 'habitante o testigo', experience: null, name: null, contact: null });
    const user = userEvent.setup();
    render(<QueryClientProvider client={new QueryClient()}><Bomberito observations={[]} /></QueryClientProvider>);

    const button = await screen.findByRole('button', { name: /1 aviso\(s\) nuevo\(s\)/ });
    expect(screen.getByText(/¡Atención!/)).toBeInTheDocument();
    await user.click(button);
    expect(screen.getByRole('region', { name: 'Avisos de focos' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar Bomberito' }));

    expect(screen.getByRole('button', { name: 'Abrir Bomberito Centinela' })).toBeInTheDocument();
    expect(screen.queryByText(/¡Atención!/)).not.toBeInTheDocument();
    expect(screen.getByText('¡Hola! ¿Necesitas ayuda?')).toBeInTheDocument();
  });
});
