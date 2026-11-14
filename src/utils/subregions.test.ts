import { describe, expect, it } from 'vitest';
import type { Observation } from '@/types/api/observations';
import { computeSubregionMatrix, resolveSubregion } from './subregions';

const base = { latitude: 7, longitude: -75, confidence_raw: 'n', source: 'test_fixture', sensor: 'VIIRS' as const };
const observations: Observation[] = [
  { ...base, observation_id: 'a', acquired_at: '2025-01-10T00:00:00Z', frp_mw: 10, department: 'Antioquia', municipality: 'Caucasia' },
  { ...base, observation_id: 'b', acquired_at: '2026-01-02T00:00:00Z', frp_mw: 30, department: 'Antioquia', municipality: 'Caucasia' },
  { ...base, observation_id: 'c', acquired_at: '2026-03-02T00:00:00Z', frp_mw: null, department: 'Antioquia', municipality: 'Caucasia' },
  { ...base, observation_id: 'd', acquired_at: '2026-03-02T00:00:00Z', frp_mw: 5, department: 'Antioquia', municipality: 'Rionegro' },
  { ...base, observation_id: 'e', acquired_at: '2026-03-02T00:00:00Z', frp_mw: 5, department: 'Meta', municipality: 'Puerto Gaitán' },
];

describe('subregions', () => {
  it('maps backend reference municipalities and ignores other departments', () => {
    expect(resolveSubregion({ department: 'Antioquia', municipality: 'Medellín' })).toBe('valle_aburra');
    expect(resolveSubregion({ department: 'Antioquia', municipality: 'Ituango' })).toBe('norte_occidente');
    expect(resolveSubregion({ department: 'Meta', municipality: 'Puerto Gaitán' })).toBeNull();
  });

  it('aggregates by calendar month and keeps missing FRP as null', () => {
    const matrix = computeSubregionMatrix(observations);
    expect(matrix.counts.bajo_cauca[0]).toBe(2);
    expect(matrix.counts.bajo_cauca[2]).toBe(1);
    expect(matrix.avgFrp.bajo_cauca[0]).toBe(20);
    expect(matrix.avgFrp.bajo_cauca[2]).toBeNull();
    expect(matrix.avgFrp.bajo_cauca[5]).toBeNull();
    expect(matrix.overallAvgFrp.bajo_cauca).toBe(20);
    expect(matrix.classifiedCount).toBe(3);
    expect(matrix.unclassifiedAntioquiaCount).toBe(1);
  });
});
