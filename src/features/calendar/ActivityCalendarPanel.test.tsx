import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ActivityCalendarPanel from './ActivityCalendarPanel';
import type { Observation } from '@/types/api/observations';

const render = (ui: ReactElement) => rtlRender(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

const observations: Observation[] = [
  { observation_id: 'old-year', sensor: 'VIIRS', latitude: 6, longitude: -75, acquired_at: '2025-01-12T10:00:00Z', frp_mw: null, confidence_raw: 'n', source: 'test_fixture' },
  { observation_id: 'new-year', sensor: 'MODIS', latitude: 6.1, longitude: -75.1, acquired_at: '2026-01-12T11:00:00Z', frp_mw: 12, confidence_raw: 70, source: 'test_fixture' },
];

describe('ActivityCalendarPanel', () => {
  afterEach(() => cleanup());

  it('keeps the same month from different years separate and reports null FRP as unavailable', () => {
    render(<ActivityCalendarPanel observations={observations} totalMatching={2} provenance="test_fixture" onSelectDate={vi.fn()} />);

    expect(screen.getByText('2025-01-12')).toBeInTheDocument();
    expect(screen.getByText('2026-01-12')).toBeInTheDocument();
    expect(screen.getByText('ene 25')).toBeInTheDocument();
    expect(screen.getByText('ene 26')).toBeInTheDocument();
    expect(screen.getAllByText('No disponible')).toHaveLength(2);
  });

  it('opens the selected date in the map through the provided navigation action', async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();
    render(<ActivityCalendarPanel observations={observations} totalMatching={2} provenance="test_fixture" onSelectDate={onSelectDate} />);

    await user.click(screen.getAllByRole('button', { name: 'Ver mapa' })[0]);
    expect(onSelectDate).toHaveBeenCalledWith('2026-01-12');
  });
});
