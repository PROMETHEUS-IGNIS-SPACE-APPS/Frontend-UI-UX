import type { FeatureCollection } from 'geojson';

/**
 * Contornos ESQUEMÁTICOS copiados de la carpeta Ejemplo: polígonos simplificados
 * dibujados a mano, útiles solo como referencia visual. No son límites oficiales
 * (DANE / IGAC) y no deben usarse para asignar observaciones a un territorio.
 */
// Antioquia department & subregional divisions
export const ANTIOQUIA_SUBREGIONS_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Urabá (Turbo, Apartadó, Necoclí)', code: 'URABA' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-76.85, 8.85], [-76.45, 8.70], [-76.30, 8.10], [-76.35, 7.50],
          [-76.70, 7.20], [-77.10, 7.40], [-77.15, 8.00], [-76.90, 8.45],
          [-76.85, 8.85]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Bajo Cauca (Caucasia, El Bagre, Tarazá)', code: 'BAJO_CAUCA' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-75.60, 8.15], [-74.70, 8.10], [-74.65, 7.50], [-75.10, 7.35],
          [-75.55, 7.45], [-75.60, 8.15]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Nordeste (Segovia, Remedios, Amalfi)', code: 'NORDESTE' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-75.10, 7.35], [-74.50, 7.30], [-74.45, 6.70], [-74.95, 6.75],
          [-75.15, 7.05], [-75.10, 7.35]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Magdalena Medio (Puerto Berrío, Yondó)', code: 'MAGDALENA_MEDIO' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-74.50, 7.30], [-73.85, 7.15], [-74.20, 6.00], [-74.65, 6.10],
          [-74.45, 6.70], [-74.50, 7.30]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Norte (Yarumal, Santa Rosa de Osos, Ituango)', code: 'NORTE' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-75.85, 7.50], [-75.30, 7.45], [-75.25, 6.60], [-75.65, 6.55],
          [-75.95, 7.00], [-75.85, 7.50]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Valle de Aburrá (Medellín, Bello, Envigado)', code: 'VALLE_ABURRA' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-75.68, 6.42], [-75.48, 6.40], [-75.45, 6.08], [-75.65, 6.05],
          [-75.72, 6.25], [-75.68, 6.42]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Oriente (Rionegro, Sonsón, Marinilla)', code: 'ORIENTE' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-75.45, 6.30], [-74.90, 6.25], [-75.05, 5.60], [-75.45, 5.75],
          [-75.45, 6.30]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Suroeste (Jericó, Andes, Ciudad Bolívar)', code: 'SUROESTE' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-76.05, 6.15], [-75.65, 6.05], [-75.50, 5.50], [-76.00, 5.50],
          [-76.05, 6.15]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Occidente (Dabeiba, Frontino, Santa Fe de Antioquia)', code: 'OCCIDENTE' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-76.45, 7.15], [-75.95, 7.00], [-75.65, 6.40], [-76.20, 6.20],
          [-76.45, 7.15]
        ]]
      }
    }
  ]
};

// Colombia National Border & Major Department Perimeters
export const COLOMBIA_BOUNDARIES_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'República de Colombia (contorno esquemático)' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-71.14, 12.46], [-71.85, 11.80], [-72.50, 11.45], [-72.85, 10.75],
          [-73.15, 9.35], [-72.40, 8.45], [-72.48, 7.85], [-71.95, 7.15],
          [-70.70, 7.05], [-69.80, 6.20], [-67.48, 5.25], [-67.85, 1.25],
          [-66.85, 1.20], [-69.85, -1.25], [-69.95, -4.20], [-70.40, -4.25],
          [-74.15, -0.15], [-75.25, -0.10], [-77.85, 0.85], [-79.00, 1.45],
          [-77.80, 5.50], [-77.35, 7.20], [-77.30, 8.65], [-76.70, 8.85],
          [-75.80, 9.40], [-74.80, 11.00], [-72.95, 11.55], [-71.14, 12.46]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Departamento de Antioquia (contorno esquemático)' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-76.85, 8.85], [-76.45, 8.70], [-75.60, 8.15], [-74.70, 8.10],
          [-73.85, 7.15], [-74.20, 6.00], [-74.65, 5.75], [-75.05, 5.60],
          [-75.50, 5.50], [-76.00, 5.50], [-76.45, 7.15], [-77.10, 7.40],
          [-77.15, 8.00], [-76.90, 8.45], [-76.85, 8.85]
        ]
      }
    }
  ]
};
