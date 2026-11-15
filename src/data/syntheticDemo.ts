import type { Observation, ObservationCollection } from '@/types/api/observations';

/**
 * Conjunto SINTÉTICO de demostración (modo “Demostración”), portado del
 * generador de la carpeta `ejemplo` (semilla 20261029, 520 registros, 2024–2025).
 * NO son observaciones reales de NASA ni del IDEAM: cada registro lleva
 * `is_synthetic: true`, `source_origin: 'SYNTHETIC'` y la procedencia
 * `synthetic_demo`, y la interfaz lo rotula en todos los módulos.
 * Decisión del usuario (2026-11-15) que revierte la exclusión documentada; requiere aprobación del equipo.
 */

export const SYNTHETIC_PROVENANCE = 'synthetic_demo';

function createPrng(seed: number) {
  let state = seed;
  return () => { state = (state * 9301 + 49297) % 233280; return state / 233280; };
}

interface DemoLocation { municipality: string; department: string; lat: number; lon: number }

const LOCATIONS: DemoLocation[] = [
  { municipality: 'Caucasia', department: 'Antioquia', lat: 7.985, lon: -75.195 },
  { municipality: 'El Bagre', department: 'Antioquia', lat: 7.601, lon: -74.808 },
  { municipality: 'Tarazá', department: 'Antioquia', lat: 7.585, lon: -75.402 },
  { municipality: 'Zaragoza', department: 'Antioquia', lat: 7.491, lon: -74.869 },
  { municipality: 'Segovia', department: 'Antioquia', lat: 7.079, lon: -74.701 },
  { municipality: 'Remedios', department: 'Antioquia', lat: 7.027, lon: -74.698 },
  { municipality: 'Amalfi', department: 'Antioquia', lat: 6.911, lon: -75.078 },
  { municipality: 'Puerto Berrío', department: 'Antioquia', lat: 6.491, lon: -74.404 },
  { municipality: 'Yondó', department: 'Antioquia', lat: 7.045, lon: -74.354 },
  { municipality: 'Turbo', department: 'Antioquia', lat: 8.093, lon: -76.728 },
  { municipality: 'Apartadó', department: 'Antioquia', lat: 7.883, lon: -76.634 },
  { municipality: 'Necoclí', department: 'Antioquia', lat: 8.424, lon: -76.784 },
  { municipality: 'Mutatá', department: 'Antioquia', lat: 7.245, lon: -76.435 },
  { municipality: 'Yarumal', department: 'Antioquia', lat: 6.963, lon: -75.417 },
  { municipality: 'Santa Rosa de Osos', department: 'Antioquia', lat: 6.647, lon: -75.461 },
  { municipality: 'Ituango', department: 'Antioquia', lat: 7.172, lon: -75.764 },
  { municipality: 'Dabeiba', department: 'Antioquia', lat: 7.001, lon: -76.262 },
  { municipality: 'Frontino', department: 'Antioquia', lat: 6.779, lon: -76.131 },
  { municipality: 'Medellín', department: 'Antioquia', lat: 6.244, lon: -75.581 },
  { municipality: 'Bello', department: 'Antioquia', lat: 6.337, lon: -75.558 },
  { municipality: 'Rionegro', department: 'Antioquia', lat: 6.155, lon: -75.374 },
  { municipality: 'Sonsón', department: 'Antioquia', lat: 5.711, lon: -75.311 },
  { municipality: 'Puerto Gaitán', department: 'Meta', lat: 4.313, lon: -72.081 },
  { municipality: 'Cumaribo', department: 'Vichada', lat: 4.445, lon: -69.801 },
  { municipality: 'San Vicente del Caguán', department: 'Caquetá', lat: 2.115, lon: -74.771 },
  { municipality: 'Yopal', department: 'Casanare', lat: 5.337, lon: -72.395 },
  { municipality: 'San José del Guaviare', department: 'Guaviare', lat: 2.572, lon: -72.646 },
  { municipality: 'Aracataca', department: 'Magdalena', lat: 10.591, lon: -74.189 },
];

function generate(count: number): Observation[] {
  const random = createPrng(20261029);
  const start = Date.parse('2024-01-01T00:00:00Z');
  const span = Date.parse('2025-12-31T23:59:59Z') - start;
  const out: Observation[] = [];
  for (let i = 0; i < count; i += 1) {
    const loc = LOCATIONS[Math.floor(random() * LOCATIONS.length)];
    const latitude = Number((loc.lat + (random() - 0.5) * 0.16).toFixed(5));
    const longitude = Number((loc.lon + (random() - 0.5) * 0.16).toFixed(5));
    const dateRandom = random();
    let iso: string;
    if (random() > 0.4) {
      // Temporada seca (enero–marzo), como el ejemplo.
      const year = random() > 0.5 ? 2024 : 2025;
      const month = Math.floor(random() * 3) + 1;
      const day = Math.floor(random() * 28) + 1;
      const hour = Math.floor(random() * 24);
      const minute = Math.floor(random() * 60);
      iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`;
    } else {
      iso = new Date(start + Math.floor(dateRandom * span)).toISOString().replace('.000Z', 'Z');
    }
    const hour = new Date(iso).getUTCHours();
    const isViirs = random() < 0.76;
    let satellite: string; let confidence: string | number; let frp: number; let brightness: number;
    if (isViirs) {
      satellite = random() > 0.45 ? 'Suomi-NPP' : 'NOAA-20';
      const c = random();
      confidence = c < 0.15 ? 'l' : c < 0.65 ? 'n' : 'h';
      random();
      frp = Number((2.5 + random() ** 2.2 * 140).toFixed(1));
      brightness = Number((310 + random() ** 1.5 * 55).toFixed(1));
    } else {
      satellite = random() > 0.5 ? 'Terra' : 'Aqua';
      confidence = Math.floor(25 + random() * 75);
      frp = Number((7 + random() ** 2 * 190).toFixed(1));
      brightness = Number((308 + random() ** 1.4 * 45).toFixed(1));
    }
    const conc = random();
    const sensor = isViirs ? 'VIIRS' : 'MODIS';
    out.push({
      observation_id: `DEMO_${sensor.slice(0, 3)}_${iso.slice(0, 10).replaceAll('-', '')}_${String(i + 1).padStart(4, '0')}`,
      sensor,
      latitude,
      longitude,
      acquired_at: iso,
      frp_mw: frp,
      confidence_raw: confidence,
      source: `${isViirs ? 'VIIRS' : 'MODIS'} (Simulado)`,
      source_origin: 'SYNTHETIC',
      department: loc.department,
      municipality: loc.municipality,
      daynight: hour >= 11 && hour <= 21 ? 'D' : 'N',
      satellite,
      brightness_k: brightness,
      scan_km: isViirs ? 0.39 : 1.05,
      track_km: isViirs ? 0.36 : 1.02,
      concordance: conc > 0.78 ? 'coincident_high' : conc > 0.62 ? 'coincident_moderate' : 'single_sensor',
      reference_url: null,
      is_synthetic: true,
    });
  }
  return out.sort((a, b) => b.acquired_at.localeCompare(a.acquired_at));
}

const ALL_DEMO = generate(520);

/** Colección de demostración con la misma forma que la respuesta del Backend-API. */
export function demoCollection(region: 'antioquia' | 'antioquia_ideam' | 'colombia'): ObservationCollection {
  const data = region === 'colombia' ? ALL_DEMO : ALL_DEMO.filter((item) => item.department === 'Antioquia');
  return {
    data,
    count: data.length,
    total_matching: data.length,
    data_provenance: SYNTHETIC_PROVENANCE,
    warning: 'Modo Demostración activo: los focos mostrados son sintéticos (2024–2025) para pruebas y capacitación; no son observaciones reales de NASA ni del IDEAM.',
    degradedMode: false,
  };
}
