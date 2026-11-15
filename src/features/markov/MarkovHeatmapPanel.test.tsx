import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Observation } from '@/types/api/observations';

vi.mock('@/features/explorer/ObservationMap', () => ({
  default: function MockObservationMap({ observations }: { observations: Observation[] }) { return <div aria-label="Mapa de prueba">{observations.length} puntos</div>; },
}));

import MarkovHeatmapPanel from './MarkovHeatmapPanel';

const base = { latitude: 7, longitude: -75, confidence_raw: 'n', source: 'test_fixture', sensor: 'VIIRS' as const, department: 'Antioquia' };
const observations: Observation[] = [
  { ...base, observation_id: 'a', acquired_at: '2026-01-10T00:00:00Z', frp_mw: 40, municipality: 'Caucasia' },
  { ...base, observation_id: 'b', acquired_at: '2026-01-11T00:00:00Z', frp_mw: 10, municipality: 'Turbo' },
];

describe('MarkovHeatmapPanel', () => {
  afterEach(() => cleanup());

  it('shows observed subregion data without inventing probabilities', async () => {
    const user = userEvent.setup();
    render(<MarkovHeatmapPanel observations={observations} provenance="test_fixture" />);

    expect(screen.getByText('Sin modelo publicado')).toBeInTheDocument();
    expect(screen.getByText('Capa predictiva pendiente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '24h' })).toBeDisabled();
    expect(screen.getByLabelText('Mapa de prueba')).toHaveTextContent('2 puntos');

    await user.click(screen.getByRole('button', { name: 'Urabá' }));
    expect(screen.getByLabelText('Mapa de prueba')).toHaveTextContent('1 puntos');
  });
});
