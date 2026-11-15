import { useEffect, useRef } from 'react';
import { Map as MapLibre, NavigationControl, setWorkerUrl, type GeoJSONSource, type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// MapLibre resolves its worker relative to `import.meta.url`, which breaks when Vite pre-bundles
// the library into node_modules/.vite/deps. Pinning the worker URL keeps tiles rendering.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { Observation } from '@/types/api/observations';
import { ANTIOQUIA_SUBREGIONS_GEOJSON, COLOMBIA_BOUNDARIES_GEOJSON } from '@/data/schematicBoundaries';
import { DEFAULT_MAP_LAYERS, observationCategory, probabilityColor, type MapFocusPreset, type MapLayerState, type MapProbabilityCell, type MapStylePreset } from './mapPresets';

interface ObservationMapProps {
  observations: Observation[];
  selected: Observation | null;
  onSelect: (observation: Observation | null) => void;
  focusTarget: MapFocusPreset;
  mapStyle: MapStylePreset;
  /** Capas visibles; las categorías (VIIRS/MODIS/alta) ya llegan filtradas en `observations`. */
  layers?: Partial<MapLayerState>;
  /** Celdas Markov exploratorias (se muestran si `layers.markov`). */
  cells?: MapProbabilityCell[];
  onSelectCell?: (id: string) => void;
  /** `squares`: celdas cuadradas (Mapa). `heat`: mancha difuminada por celda (Mapa de Calor, como el ejemplo). */
  cellStyle?: 'squares' | 'heat';
}

const CATEGORY_COLORS = { viirs: '#ef4444', modis: '#facc15', highIntensity: '#f97316' };
const POINT_LAYERS = ['observation-halo', 'observation-points'];

export default function ObservationMap({ observations, selected, onSelect, focusTarget, mapStyle, layers, cells = [], onSelectCell, cellStyle = 'heat' }: ObservationMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const currentObservations = useRef(observations);
  currentObservations.current = observations;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const currentCells = useRef(cells);
  currentCells.current = cells;
  const onSelectCellRef = useRef(onSelectCell);
  onSelectCellRef.current = onSelectCell;
  const focusTargetRef = useRef(focusTarget);
  focusTargetRef.current = focusTarget;
  const mapStyleIdRef = useRef(mapStyle.id);
  const initialStyleRef = useRef(mapStyle.style);
  const layerState: MapLayerState = { ...DEFAULT_MAP_LAYERS, ...layers };
  const layerStateRef = useRef(layerState);
  layerStateRef.current = layerState;
  const cellStyleRef = useRef(cellStyle);
  cellStyleRef.current = cellStyle;

  useEffect(() => {
    if (!container.current) return;
    setWorkerUrl(maplibreWorkerUrl);
    const map = new MapLibre({
      container: container.current,
      style: initialStyleRef.current,
      center: focusTargetRef.current.center,
      zoom: focusTargetRef.current.zoom,
    });
    mapRef.current = map;
    map.addControl(new NavigationControl(), 'top-right');
    map.on('style.load', () => {
      addDataLayers(map, currentObservations.current, currentCells.current);
      applyVisibility(map, layerStateRef.current, cellStyleRef.current);
    });
    map.on('click', (event) => {
      if (!map.getLayer('observation-points')) return;
      const feature = map.queryRenderedFeatures(event.point, { layers: ['observation-points'] })[0];
      const id = feature?.properties?.id;
      const hit = currentObservations.current.find((item) => item.observation_id === id);
      if (hit) { onSelectRef.current(hit); return; }
      const cellLayers = ['markov-cells', 'markov-heat-hit'].filter((id) => map.getLayer(id) && map.getLayoutProperty(id, 'visibility') !== 'none');
      const cell = cellLayers.length ? map.queryRenderedFeatures(event.point, { layers: cellLayers })[0] : undefined;
      if (cell?.properties?.id) onSelectCellRef.current?.(String(cell.properties.id));
    });
    map.on('mousemove', (event) => {
      const layersUnderCursor = ['observation-points', 'markov-cells', 'markov-heat-hit'].filter((id) => map.getLayer(id) && map.getLayoutProperty(id, 'visibility') !== 'none');
      const hit = layersUnderCursor.length > 0 && map.queryRenderedFeatures(event.point, { layers: layersUnderCursor }).length > 0;
      map.getCanvas().style.cursor = hit ? 'pointer' : '';
    });
    // El contenedor cambia de tamaño con el diseño (paneles, rejillas, móvil):
    // MapLibre solo escucha `window.resize`, así que se observa el propio contenedor.
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => map.resize()) : null;
    resizeObserver?.observe(container.current);
    return () => { resizeObserver?.disconnect(); map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const source = mapRef.current?.getSource('observations') as GeoJSONSource | undefined;
    source?.setData(featureCollection(observations));
  }, [observations]);

  useEffect(() => {
    (mapRef.current?.getSource('markov-cells') as GeoJSONSource | undefined)?.setData(cellCollection(cells));
    (mapRef.current?.getSource('markov-centroids') as GeoJSONSource | undefined)?.setData(centroidCollection(cells));
  }, [cells]);

  useEffect(() => {
    mapRef.current?.flyTo({ center: focusTarget.center, zoom: focusTarget.zoom, duration: 900 });
  }, [focusTarget.center, focusTarget.zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && mapStyle.id !== mapStyleIdRef.current) {
      mapStyleIdRef.current = mapStyle.id;
      map.setStyle(mapStyle.style, { diff: false });
    }
  }, [mapStyle]);

  const { points, heatmap, colombiaBoundary, antioquiaSubregions, markov } = layerState;
  useEffect(() => {
    if (mapRef.current) applyVisibility(mapRef.current, { ...DEFAULT_MAP_LAYERS, points, heatmap, colombiaBoundary, antioquiaSubregions, markov }, cellStyle);
  }, [points, heatmap, colombiaBoundary, antioquiaSubregions, markov, cellStyle]);

  useEffect(() => {
    if (selected) mapRef.current?.flyTo({ center: [selected.longitude, selected.latitude], zoom: 9 });
  }, [selected]);

  return <div ref={container} className="h-full min-h-[420px] w-full" aria-label="Mapa de observaciones MODIS y VIIRS" />;
}

function addDataLayers(map: MapLibreMap, observations: Observation[], cells: MapProbabilityCell[]) {
  if (!map.getSource('colombia-boundaries')) {
    map.addSource('colombia-boundaries', { type: 'geojson', data: COLOMBIA_BOUNDARIES_GEOJSON });
    map.addLayer({ id: 'colombia-boundary-line', type: 'line', source: 'colombia-boundaries', paint: { 'line-color': '#0284c7', 'line-width': 2.5, 'line-dasharray': [3, 2], 'line-opacity': 0.9 } });
  }
  if (!map.getSource('antioquia-subregions')) {
    map.addSource('antioquia-subregions', { type: 'geojson', data: ANTIOQUIA_SUBREGIONS_GEOJSON });
    map.addLayer({ id: 'antioquia-subregions-fill', type: 'fill', source: 'antioquia-subregions', paint: { 'fill-color': '#0284c7', 'fill-opacity': 0.05 } });
    map.addLayer({ id: 'antioquia-subregions-line', type: 'line', source: 'antioquia-subregions', paint: { 'line-color': '#d97706', 'line-width': 2, 'line-opacity': 0.85 } });
  }
  if (!map.getSource('markov-cells')) {
    map.addSource('markov-cells', { type: 'geojson', data: cellCollection(cells) });
    map.addLayer({ id: 'markov-cells', type: 'fill', source: 'markov-cells', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.55 } });
    map.addLayer({ id: 'markov-cells-line', type: 'line', source: 'markov-cells', paint: { 'line-color': ['get', 'color'], 'line-width': 1, 'line-opacity': 0.95 } });
    map.addSource('markov-centroids', { type: 'geojson', data: centroidCollection(cells) });
    // Mancha difuminada por celda con el color de SU probabilidad (sin sumar densidades,
    // para que muchas celdas al 20 % no aparezcan rojas como si fueran >70 %).
    // El radio sigue el tamaño real de la celda (~0,1° ≈ 11 km) en cada nivel de zoom.
    map.addLayer({
      id: 'markov-heat', type: 'circle', source: 'markov-centroids',
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 4, ['*', ['get', 'sizeDeg'], 30], 12, ['*', ['get', 'sizeDeg'], 7500]],
        'circle-blur': 0.85,
        'circle-opacity': 0.6,
      },
    });
    // Círculos invisibles para poder tocar una celda en el modo difuminado.
    map.addLayer({ id: 'markov-heat-hit', type: 'circle', source: 'markov-centroids', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 6, 9, 16, 12, 30], 'circle-opacity': 0 } });
  }
  if (map.getSource('observations')) return;
  map.addSource('observations', { type: 'geojson', data: featureCollection(observations) });
  map.addLayer({
    id: 'observation-heatmap', type: 'heatmap', source: 'observations',
    filter: ['!=', ['get', 'frp_mw'], null],
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'frp_mw'], 0, 0.2, 50, 0.9, 150, 1.6],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 5, 0.8, 10, 2.4],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 5, 12, 9, 26, 12, 42],
      'heatmap-opacity': 0.82,
      'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,0,0,0)', 0.25, 'rgba(250,204,21,0.55)', 0.55, 'rgba(249,115,22,0.78)', 0.85, 'rgba(239,68,68,0.92)', 1, 'rgba(185,28,28,0.98)'],
    },
  });
  map.addLayer({
    id: 'observation-halo', type: 'circle', source: 'observations',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, ['case', ['==', ['get', 'sensor'], 'MODIS'], 8, 5.5], 10, ['case', ['==', ['get', 'sensor'], 'MODIS'], 15, 10], 14, ['case', ['==', ['get', 'sensor'], 'MODIS'], 26, 16]],
      'circle-color': ['get', 'color'],
      'circle-opacity': 0.35,
      'circle-blur': 0.45,
    },
  });
  map.addLayer({
    id: 'observation-points', type: 'circle', source: 'observations',
    paint: {
      'circle-radius': ['case', ['==', ['get', 'category'], 'highIntensity'], 7, ['==', ['get', 'sensor'], 'MODIS'], 6, 4.8],
      'circle-color': ['get', 'color'],
      'circle-stroke-width': 1.4,
      'circle-stroke-color': '#ffffff',
    },
  });
}

function applyVisibility(map: MapLibreMap, state: MapLayerState, cellStyle: 'squares' | 'heat' = 'squares') {
  const set = (id: string, visible: boolean) => { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none'); };
  POINT_LAYERS.forEach((id) => set(id, state.points));
  set('observation-heatmap', state.heatmap);
  set('colombia-boundary-line', state.colombiaBoundary);
  set('antioquia-subregions-fill', state.antioquiaSubregions);
  set('antioquia-subregions-line', state.antioquiaSubregions);
  set('markov-cells', state.markov && cellStyle === 'squares');
  set('markov-cells-line', state.markov && cellStyle === 'squares');
  set('markov-heat', state.markov && cellStyle === 'heat');
  set('markov-heat-hit', state.markov && cellStyle === 'heat');
}

function centroidCollection(cells: MapProbabilityCell[]) {
  return {
    type: 'FeatureCollection' as const,
    features: cells.map((cell) => ({ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: cell.center }, properties: { id: cell.id, p: cell.p, sizeDeg: cell.sizeDeg, color: probabilityColor(cell.p) } })),
  };
}

function cellCollection(cells: MapProbabilityCell[]) {
  return {
    type: 'FeatureCollection' as const,
    features: cells.map((cell) => {
      const half = cell.sizeDeg / 2;
      const [lon, lat] = cell.center;
      return {
        type: 'Feature' as const,
        geometry: { type: 'Polygon' as const, coordinates: [[[lon - half, lat - half], [lon + half, lat - half], [lon + half, lat + half], [lon - half, lat + half], [lon - half, lat - half]]] },
        properties: { id: cell.id, p: cell.p, color: probabilityColor(cell.p) },
      };
    }),
  };
}

function featureCollection(observations: Observation[]) {
  return {
    type: 'FeatureCollection' as const,
    features: observations.map((item) => {
      const category = observationCategory(item);
      return {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [item.longitude, item.latitude] },
        properties: { id: item.observation_id, sensor: item.sensor, frp_mw: item.frp_mw, category, color: CATEGORY_COLORS[category] },
      };
    }),
  };
}
