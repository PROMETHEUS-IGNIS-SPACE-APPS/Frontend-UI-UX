import { describe, expect, it } from 'vitest';
import { colombiaLocalToUtcIso, parseLocalCsv } from './localCsvParser';

describe('parseLocalCsv', () => {
  it('reads IDEAM files with semicolons, comma decimals and UTC-5 times', () => {
    const csv = 'Fecha;Lat;Lon;Fuente;Radiación (MW);Confianza;Captura\n2026-11-10 13:30;7,5;-75,2;VIIRS NOAA-20;12,5;n;D\n2026-11-10 14:00;x;-75;MODIS;;;N\n2026-11-10 14:10;7,1;-75,1;OTRO;1;h;D';
    const result = parseLocalCsv(csv, 'ideam.csv');

    expect(result.format).toBe('IDEAM');
    expect(result.observations).toHaveLength(1);
    expect(result.skipped).toBe(2);
    expect(result.observations[0]).toMatchObject({ sensor: 'VIIRS', satellite: 'NOAA-20', latitude: 7.5, longitude: -75.2, frp_mw: 12.5, acquired_at: '2026-11-10T18:30:00.000Z', daynight: 'D', source_origin: 'CSV_LOCAL', is_synthetic: false });
  });

  it('reads NASA FIRMS files in UTC and keeps missing FRP as null', () => {
    const csv = 'latitude,longitude,bright_ti4,acq_date,acq_time,satellite,instrument,confidence,frp,daynight\n6.2,-75.5,330,2026-11-12,0545,N20,VIIRS,n,,N\n6.3,-75.6,320,2026-11-12,1720,A,MODIS,80,40.1,D';
    const result = parseLocalCsv(csv, 'firms.csv');

    expect(result.format).toBe('NASA_FIRMS');
    expect(result.observations.map((item) => item.sensor)).toEqual(['VIIRS', 'MODIS']);
    expect(result.observations[0].frp_mw).toBeNull();
    expect(result.observations[0].acquired_at).toBe('2026-11-12T05:45:00.000Z');
    expect(result.observations[1].satellite).toBe('Aqua');
  });

  it('rejects unknown formats without producing observations', () => {
    expect(parseLocalCsv('a,b\n1,2', 'x.csv')).toMatchObject({ format: null, observations: [] });
    expect(colombiaLocalToUtcIso('2026-01-01 23:00')).toBe('2026-01-02T04:00:00.000Z');
  });
});
