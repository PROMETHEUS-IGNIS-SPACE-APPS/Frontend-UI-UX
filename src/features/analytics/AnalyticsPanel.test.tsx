import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import AnalyticsPanel from './AnalyticsPanel';
import type { Observation } from '@/types/api/observations';

const testObservations: Observation[] = [
  { observation_id: 'test-viirs-1', sensor: 'VIIRS', latitude: 6, longitude: -75, acquired_at: '2026-01-01T00:00:00Z', frp_mw: 40, confidence_raw: 'n', source: 'test_fixture' },
  { observation_id: 'test-viirs-2', sensor: 'VIIRS', latitude: 6.1, longitude: -75.1, acquired_at: '2026-02-01T00:00:00Z', frp_mw: null, confidence_raw: 'h', source: 'test_fixture' },
  { observation_id: 'test-modis-1', sensor: 'MODIS', latitude: 6.2, longitude: -75.2, acquired_at: '2026-02-01T01:00:00Z', frp_mw: 80, confidence_raw: 70, source: 'test_fixture' },
];

describe('AnalyticsPanel', () => {
  afterEach(() => cleanup());

  it('keeps sensor counts separate and computes the approved recurrence index', () => {
    render(<AnalyticsPanel observations={testObservations} totalMatching={3} provenance="test_fixture" />);

    expect(screen.getByText('2', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('1', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('23 / 100')).toBeInTheDocument();
    expect(screen.getAllByText('Baja')).toHaveLength(2);
    expect(screen.getByText('60.0 / 80 MW')).toBeInTheDocument();
  });

  it('reports FRP unavailable when every received FRP value is null', () => {
    const withoutFrp = testObservations.map((item) => ({ ...item, frp_mw: null }));
    render(<AnalyticsPanel observations={withoutFrp} totalMatching={3} provenance="test_fixture" />);

    expect(screen.getByText('No disponible')).toBeInTheDocument();
    expect(screen.getAllByText('Muy baja')).toHaveLength(2);
  });

  it('does not convert an empty collection into a recurrence score', () => {
    render(<AnalyticsPanel observations={[]} totalMatching={0} provenance="backend" />);

    expect(screen.getAllByText('No disponible')).toHaveLength(3);
    expect(screen.getByText('La consulta no contiene observaciones para resumir.')).toBeInTheDocument();
  });

});
