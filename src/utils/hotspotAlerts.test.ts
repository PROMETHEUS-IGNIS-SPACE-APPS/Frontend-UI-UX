import { describe, expect, it } from 'vitest';
import type { CentinelaModel } from '@/types/api/centinela';
import type { Observation } from '@/types/api/observations';
import type { CitizenReport } from '@/stores/citizenReportsStore';
import { computeHotspotAlerts } from './hotspotAlerts';

const est = { probability: null, interval_95: null, n: 0, status: 'x' };
const cell = (id: string, product: string, bounds: [number, number, number, number], freq: number) => ({ cell_id: id, product, bounds, target_month: '2026-11', last_state: null, p01: est, p11: est, prediction: est, known_months: 150, unknown_months: 10, historical_frequency: freq });
const model = { forecasts: [
  cell('quiet', 'VIIRS_NOAA20', [-75.5, 6, -75.25, 6.25], 0.05),
  cell('quiet', 'MODIS', [-75.5, 6, -75.25, 6.25], 0.05),
  cell('busy', 'VIIRS_NOAA20', [-74.75, 7, -74.5, 7.25], 0.6),
  cell('busy', 'MODIS', [-74.75, 7, -74.5, 7.25], 0.6),
  cell('town', 'MODIS', [-75.75, 6, -75.5, 6.25], 0.5),
] } as unknown as CentinelaModel;
const obs = (id: string, lat: number, lon: number, at: string, sensor: 'VIIRS' | 'MODIS' = 'VIIRS', frp: number | null = 5): Observation => ({ observation_id: id, sensor, latitude: lat, longitude: lon, acquired_at: at, frp_mw: frp, confidence_raw: 'n', source: 'test_fixture' });
const NOW = Date.parse('2026-11-15T12:00:00Z');
const report = (lat: number, lon: number, hoursAgo: number): CitizenReport => ({ id: `reporte-${NOW - hoursAgo * 3_600_000}`, createdAt: '', latitude: lat, longitude: lon, sector: null, intensity: 'Alta', note: 'humo', role: 'habitante o testigo', experience: null, name: null, contact: null });

describe('computeHotspotAlerts', () => {
  it('flags recent activity where the model says the cell is usually quiet', () => {
    const alerts = computeHotspotAlerts([obs('a', 6.1, -75.4, '2026-11-15T06:00:00Z'), obs('b', 7.1, -74.6, '2026-11-15T06:00:00Z')], model, [], NOW);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({ kind: 'unusual-satellite', cellId: 'quiet', viirs: 1, unusualProducts: ['VIIRS'] });
  });

  it('ignores detections older than 24 h before the latest one', () => {
    const alerts = computeHotspotAlerts([obs('old', 6.1, -75.4, '2026-11-13T06:00:00Z'), obs('new', 7.1, -74.6, '2026-11-15T06:00:00Z')], model, [], NOW);
    expect(alerts).toHaveLength(0);
  });

  it('ranks satellite + citizen coincidence first and keeps citizen-only reports', () => {
    const alerts = computeHotspotAlerts([obs('a', 7.1, -74.6, '2026-11-15T06:00:00Z', 'MODIS', 40)], model, [report(7.12, -74.62, 2), report(6.1, -75.6, 1), report(6.1, -75.4, 30)], NOW);
    expect(alerts.map((item) => item.kind)).toEqual(['satellite-and-citizen', 'citizen-only']);
    expect(alerts[0]).toMatchObject({ cellId: 'busy', modis: 1, viirs: 0, highFrp: 1, citizenReports: 1 });
    expect(alerts[1].cellId).toBe('town');
  });
});
