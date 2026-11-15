import { describe, expect, it } from 'vitest';
import type { Observation } from '@/types/api/observations';
import { classifyCellDay, estimateMatrix, propagate, rocAuc, runMarkovEngine, type MarkovState } from './markovEngine';

const obs = (id: string, date: string, lat: number, lon: number, frp: number | null = 5): Observation => ({
  observation_id: id, acquired_at: `${date}T06:00:00Z`, latitude: lat, longitude: lon, frp_mw: frp,
  confidence_raw: 'n', source: 'test_fixture', sensor: 'VIIRS', department: 'Antioquia', municipality: 'Caucasia',
});

describe('markovEngine', () => {
  it('classifies cell-days with the S0/S1/S2 rules', () => {
    expect(classifyCellDay([])).toBe(0);
    expect(classifyCellDay([{ frp_mw: 10 }])).toBe(1);
    expect(classifyCellDay([{ frp_mw: 31 }])).toBe(2);
    expect(classifyCellDay([{ frp_mw: null }, { frp_mw: null }, { frp_mw: 1 }, { frp_mw: 2 }])).toBe(2);
  });

  it('builds a row-stochastic matrix only from consecutive days', () => {
    const histories = new Map<string, Map<string, MarkovState>>([['0:0', new Map<string, MarkovState>([['2026-11-01', 1], ['2026-11-02', 1], ['2026-11-05', 2]])]]);
    const { counts, matrix, transitions } = estimateMatrix(histories, ['2026-11-01', '2026-11-02', '2026-11-05']);
    expect(transitions).toBe(1);
    expect(counts[1][1]).toBe(1);
    matrix.forEach((row) => expect(row[0] + row[1] + row[2]).toBeCloseTo(1, 10));
    expect(propagate([1, 0, 0], matrix, 3).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
  });

  it('computes ROC-AUC with ties', () => {
    expect(rocAuc([0.1, 0.4, 0.35, 0.8], [0, 0, 1, 1])).toBe(0.75);
    expect(rocAuc([0.5, 0.5], [0, 1])).toBe(0.5);
    expect(rocAuc([0.2], [1])).toBeNull();
  });

  it('refuses to estimate with fewer than 3 days', () => {
    const result = runMarkovEngine([obs('a', '2026-11-01', 7, -75), obs('b', '2026-11-02', 7, -75)]);
    expect(result.status).toBe('insufficient');
    expect(result.horizons).toHaveLength(0);
  });

  it('estimates and validates with a week of real-shaped data', () => {
    const items: Observation[] = [];
    for (let day = 1; day <= 8; day += 1) {
      const date = `2026-11-0${day}`;
      items.push(obs(`a${day}`, date, 7.01, -75.01, day % 2 ? 40 : 8));
      if (day % 3 === 0) items.push(obs(`b${day}`, date, 7.31, -75.31));
    }
    const result = runMarkovEngine(items);
    expect(result.status).toBe('validated');
    expect(result.window.days).toBe(8);
    expect(result.horizons.map((h) => h.hours)).toEqual([24, 48, 72]);
    result.horizons.forEach((h) => expect(h.vector.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 8));
    expect(result.cells[0].p24).toBeGreaterThan(0);
    expect(result.validation?.testTransitions).toBeGreaterThan(0);
  });
});
