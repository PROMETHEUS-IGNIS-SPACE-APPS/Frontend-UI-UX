export type Sensor = 'MODIS' | 'VIIRS';

export interface Observation {
  observation_id: string;
  sensor: Sensor;
  latitude: number;
  longitude: number;
  acquired_at: string;
  frp_mw: number | null;
  confidence_raw: string | number;
  source: string;
}

export interface ObservationCollection {
  data: Observation[];
  count: number;
  total_matching: number;
  data_provenance: string;
}
