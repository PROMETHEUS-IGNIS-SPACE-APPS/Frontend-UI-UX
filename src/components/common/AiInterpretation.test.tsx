import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AiInterpretButton, AiInterpretationPanel } from './AiInterpretation';
import { useAiInterpretation } from '@/hooks/useAiInterpretation';

function Harness() {
  const ai = useAiInterpretation('predictability');
  return <>
    <AiInterpretButton ai={ai} buildPayload={() => ({ p24: 0.31 })} />
    <AiInterpretationPanel ai={ai} />
  </>;
}

const renderHarness = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}><Harness /></QueryClientProvider>);

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('AiInterpretation', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sends the figures to /api/ai/explain and shows the structured reading', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://backend.test');
    const fetchMock = vi.fn().mockResolvedValue(json(200, {
      ok: true,
      model: 'gemini-2.5-flash',
      cached: false,
      disclaimer: 'Lectura generada por IA.',
      structured: {
        resumenEjecutivo: 'La actividad estimada a 24 h es moderada.',
        hallazgosClave: ['P(24h) regional 31 %'],
        interpretacionSensores: 'VIIRS y MODIS por separado.',
        interpretacionMarkov: 'El BSS es negativo.',
        limitacionesYCautela: ['Un foco no es un incendio confirmado.'],
        recomendacionesOperativas: ['Verificar en terreno.'],
      },
    }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderHarness();

    await user.click(screen.getByRole('button', { name: /Interpretar con IA/ }));

    expect(await screen.findByText('La actividad estimada a 24 h es moderada.')).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('http://backend.test/api/ai/explain');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ mode: 'predictability', payload: { p24: 0.31 }, language: 'es' });
    expect(screen.getByText('P(24h) regional 31 %')).toBeInTheDocument();
  });

  it('shows the backend message when the AI key is not configured', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://backend.test');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(503, { detail: 'La interpretación con IA no está configurada: falta GEMINI_API_KEY en el Backend-API.' })));
    const user = userEvent.setup();
    renderHarness();

    await user.click(screen.getByRole('button', { name: /Interpretar con IA/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('falta GEMINI_API_KEY');
  });
});
