import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ExplorerSidebar from './ExplorerSidebar';
import type { Observation } from '@/types/api/observations';

const observations: Observation[] = [
  { observation_id: 'sample-1', sensor: 'VIIRS', latitude: 6, longitude: -75, acquired_at: '2026-11-12T13:00:00Z', frp_mw: 25, confidence_raw: 'n', source: 'IDEAM', department: 'Antioquia', municipality: 'Puerto Berrío', daynight: 'D' },
];

function renderSidebar(sourceMode: 'fusion' | 'historical' = 'fusion') {
  const callbacks = {
    onSensorChange: vi.fn(), onSourceModeChange: vi.fn(), onRegionChange: vi.fn(),
    onDateFromChange: vi.fn(), onDateToChange: vi.fn(), onDepartmentChange: vi.fn(),
    onMunicipalityChange: vi.fn(), onMunicipalitySearchChange: vi.fn(), onDaynightChange: vi.fn(),
    onMinimumFrpChange: vi.fn(), onConfidenceRawChange: vi.fn(), onReset: vi.fn(),
    onToggleCategory: vi.fn(), onApplySourcePreset: vi.fn(),
  };
  render(<ExplorerSidebar {...callbacks} categories={{ viirs: true, modis: true, highIntensity: true, citizen: true }} categoryCounts={{ viirs: 1, modis: 0, highIntensity: 0, citizen: 0 }} sensor="ALL" sourceMode={sourceMode} region="antioquia_ideam" dateFrom="2026-11-08" dateTo="2026-11-14" department="ALL" municipality="ALL" municipalitySearch="" daynight="ALL" minimumFrp="" confidenceRaw="ALL" observations={observations} visibleCount={4} recordCount={1} totalMatching={1} provenance="IDEAM + NASA FIRMS" sampling={sourceMode === 'historical' ? { from: '2024-01-01', to: '2026-11-14', rawCount: 11539, filesLoaded: ['day.csv'] } : undefined} isTruncated onReset={callbacks.onReset} />);
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

  it('announces the bounded, sampled historical source and disables date range inputs', async () => {
    renderSidebar('historical');

    expect(screen.getByText(/Histórico muestreado · tope 9.000 registros/)).toBeInTheDocument();
    expect(screen.getByText(/No es una serie diaria continua/)).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha inicial')).toBeDisabled();
    expect(screen.getByLabelText('Fecha final')).toBeDisabled();
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

  it('toggles visual categories and applies source presets', async () => {
    const user = userEvent.setup();
    const callbacks = renderSidebar();

    await user.click(screen.getByRole('checkbox', { name: 'Mostrar Alta (≥30MW)' }));
    expect(callbacks.onToggleCategory).toHaveBeenCalledWith('highIntensity');
    await user.click(screen.getByRole('button', { name: /IDEAM 45 días Antioquia/ }));
    expect(callbacks.onApplySourcePreset).toHaveBeenCalledWith({ sourceMode: 'ideam', region: 'antioquia_ideam', days: 45 });
    await user.click(screen.getByRole('button', { name: 'NASA FIRMS 7d' }));
    expect(callbacks.onApplySourcePreset).toHaveBeenCalledWith({ sourceMode: 'firms', region: 'antioquia_ideam' });
  });
});
