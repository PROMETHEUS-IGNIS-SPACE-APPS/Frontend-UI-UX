import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ExplorerSidebar from './ExplorerSidebar';
import type { Observation, ObservationSourceMode } from '@/types/api/observations';

const observations: Observation[] = [
  { observation_id: 'sample-1', sensor: 'VIIRS', latitude: 6, longitude: -75, acquired_at: '2026-11-12T13:00:00Z', frp_mw: 25, confidence_raw: 'n', source: 'IDEAM', department: 'Antioquia', municipality: 'Puerto Berrío', daynight: 'D' },
];

function renderSidebar(sourceMode: ObservationSourceMode = 'fusion') {
  const callbacks = {
    onSensorChange: vi.fn(), onSourceModeChange: vi.fn(), onRegionChange: vi.fn(),
    onDateFromChange: vi.fn(), onDateToChange: vi.fn(), onDepartmentChange: vi.fn(),
    onMunicipalityChange: vi.fn(), onMunicipalitySearchChange: vi.fn(), onDaynightChange: vi.fn(),
    onMinimumFrpChange: vi.fn(), onConfidenceRawChange: vi.fn(), onReset: vi.fn(),
  };
  render(<ExplorerSidebar {...callbacks} sensor="ALL" sourceMode={sourceMode} region="antioquia_ideam" dateFrom="2026-11-08" dateTo="2026-11-14" department="ALL" municipality="ALL" municipalitySearch="" daynight="ALL" minimumFrp="" confidenceRaw="ALL" observations={observations} visibleCount={4} recordCount={1} totalMatching={1} provenance="IDEAM + NASA FIRMS" isTruncated onReset={callbacks.onReset} />);
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

  it('disables the date range inputs in FIRMS mode (7-day NRT feed)', async () => {
    renderSidebar('firms');

    expect(screen.getByLabelText('Fecha inicial')).toBeDisabled();
    expect(screen.getByLabelText('Fecha final')).toBeDisabled();
    expect(screen.getByText(/feed NRT público de los últimos 7 días/)).toBeInTheDocument();
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

  it('allows mobile users to expand and collapse the filters', async () => {
    const user = userEvent.setup();
    renderSidebar();

    const toggle = screen.getByRole('button', { name: /Filtros \(4 observaciones\)/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Modo Fácil' })).toBeVisible();
  });
});
