import type { StyleSpecification } from 'maplibre-gl';

export interface MapFocusPreset {
  id: string;
  label: string;
  center: [number, number];
  zoom: number;
}

export interface MapStylePreset {
  id: 'liberty' | 'satellite' | 'topographic' | 'dark' | 'positron';
  label: string;
  style: string | StyleSpecification;
}

function rasterStyle(id: string, tiles: string[], attribution: string, extra?: { id: string; tiles: string[] }): StyleSpecification {
  return {
    version: 8,
    sources: {
      [id]: { type: 'raster', tiles, tileSize: 256, attribution },
      ...(extra ? { [extra.id]: { type: 'raster' as const, tiles: extra.tiles, tileSize: 256 } } : {}),
    },
    layers: [
      { id: `${id}-layer`, type: 'raster', source: id },
      ...(extra ? [{ id: `${extra.id}-layer`, type: 'raster' as const, source: extra.id }] : []),
    ],
  };
}

/** Mapas base del ejemplo: OpenFreeMap (vectorial), Esri (satélite y topográfico) y Carto (oscuro). */
export const MAP_STYLE_PRESETS: MapStylePreset[] = [
  { id: 'liberty', label: 'Liberty', style: 'https://tiles.openfreemap.org/styles/liberty' },
  {
    id: 'satellite',
    label: 'Satélite',
    style: rasterStyle(
      'esri-satellite',
      ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      '© Esri, Maxar, Earthstar Geographics',
      { id: 'esri-labels', tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'] },
    ),
  },
  {
    id: 'topographic',
    label: 'Topográfico',
    style: rasterStyle('esri-topo', ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'], '© Esri, USGS, NOAA'),
  },
  { id: 'dark', label: 'Oscuro', style: 'https://tiles.openfreemap.org/styles/dark' },
  { id: 'positron', label: 'Claro', style: 'https://tiles.openfreemap.org/styles/positron' },
];

export const MAP_FOCUS_PRESETS: MapFocusPreset[] = [
  { id: 'antioquia', label: 'Antioquia', center: [-75.6, 6.4], zoom: 7.2 },
  { id: 'colombia', label: 'Colombia', center: [-73.5, 4.5], zoom: 5.2 },
  { id: 'valle-aburra', label: 'Valle de Aburrá', center: [-75.58, 6.25], zoom: 11 },
  { id: 'bajo-cauca', label: 'Bajo Cauca', center: [-75.1, 7.75], zoom: 8.6 },
  { id: 'uraba', label: 'Urabá', center: [-76.7, 8.1], zoom: 8.8 },
];

/** Umbral de alta intensidad del ejemplo (FRP en MW). */
export const HIGH_INTENSITY_FRP_MW = 30;

/** Visibilidad de capas y categorías del mapa. */
export interface MapLayerState {
  viirs: boolean;
  modis: boolean;
  highIntensity: boolean;
  points: boolean;
  heatmap: boolean;
  colombiaBoundary: boolean;
  antioquiaSubregions: boolean;
}

export const DEFAULT_MAP_LAYERS: MapLayerState = {
  viirs: true,
  modis: true,
  highIntensity: true,
  points: true,
  heatmap: false,
  colombiaBoundary: true,
  antioquiaSubregions: true,
};

/** Categoría visual de una observación: la alta intensidad tiene prioridad sobre el sensor. */
export function observationCategory(item: { sensor: string; frp_mw: number | null }): 'viirs' | 'modis' | 'highIntensity' {
  if (item.frp_mw !== null && item.frp_mw >= HIGH_INTENSITY_FRP_MW) return 'highIntensity';
  return item.sensor === 'MODIS' ? 'modis' : 'viirs';
}
