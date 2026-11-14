import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ExplorerSidebar from './ExplorerSidebar';
import type { Observation } from '@/types/api/observations';

const observations: Observation[] = [
  { observation_id: 'sample-1', sensor: 'VIIRS', latitude: 6, longitude: -75, acquired_at: '2026-11-12T13:00:00Z', frp_mw: 25, confidence_raw: 'n', source: 'IDEAM', department: 'Antioquia', municipality: 'Puerto Berrío', daynight: 'D' },
];

function renderSidebar() {
  const callbacks = {
    onSensorChange: vi.fn(), onSourceModeChange: vi.fn(), onRegionChange: vi.fn(),
    onDateFromChange: vi.fn(), onDateToChange: vi.fn(), onDepartmentChange: vi.fn(),
    onMunicipalityChange: vi.fn(), onMunicipalitySearchChange: vi.fn(), onDaynightChange: vi.fn(),
    onMinimumFrpChange: vi.fn(), onConfidenceRawChange: vi.fn(), onReset: vi.fn(),
  };
  render(<ExplorerSidebar {...callbacks} sensor="ALL" sourceMode="fusion" region="antioquia_ideam" dateFrom="2026-11-08" dateTo="2026-11-14" department="ALL" municipality="ALL" municipalitySearch="" daynight="ALL" minimumFrp="" confidenceRaw="ALL" observations={observations} visibleCount={4} recordCount={4} totalMatching={5} provenance="IDEAM + NASA FIRMS" isTruncated onReset={callbacks.onReset} />);
  return callbacks;
}

describe('ExplorerSidebar', () => {
  afterEach(() => cleanup());

  it('exposes available source, regional filters and truncation state', async () => {
    const user = userEvent.setup();
    const callbacks = renderSidebar();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Fuente de datos' }), 'ideam');
    expect(callbacks.onSourceModeChange).toHaveBeenCalledWith('ideam');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Departamento' }), 'Antioquia');
    expect(callbacks.onDepartmentChange).toHaveBeenCalledWith('Antioquia');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Municipio' }), 'Puerto Berrío');
    expect(callbacks.onMunicipalityChange).toHaveBeenCalledWith('Puerto Berrío');
    expect(screen.getByText(/limitado por la fuente/)).toBeInTheDocument();
  });

  it('shows advanced FRP, original confidence and day/night controls', async () => {
    const user = userEvent.setup();
    const callbacks = renderSidebar();

    await user.click(screen.getByRole('button', { name: 'Filtros Pro' }));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Confianza original' }), 'n');
    expect(callbacks.onConfidenceRawChange).toHaveBeenCalledWith('n');
    await user.click(screen.getByRole('button', { name: 'Noche' }));
    expect(callbacks.onDaynightChange).toHaveBeenCalledWith('N');
    expect(screen.getByRole('spinbutton')).toBeEnabled();
  });
});
