import { useEffect, useRef } from 'react';
import { Map as MapLibre, NavigationControl, setWorkerUrl, type GeoJSONSource, type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// MapLibre resolves its worker relative to `import.meta.url`, which breaks when Vite pre-bundles
// the library into node_modules/.vite/deps. Pinning the worker URL keeps tiles rendering.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { Observation } from '@/types/api/observations';
import { ANTIOQUIA_SUBREGIONS_GEOJSON, COLOMBIA_BOUNDARIES_GEOJSON } from '@/data/schematicBoundaries';
import { DEFAULT_MAP_LAYERS, observationCategory, type MapFocusPreset, type MapLayerState, type MapStylePreset } from './mapPresets';

interface ObservationMapProps {
  observations: Observation[];
  selected: Observation | null;
  onSelect: (observation: Observation | null) => void;
  focusTarget: MapFocusPreset;
  mapStyle: MapStylePreset;
  /** Capas visibles; las categorías (VIIRS/MODIS/alta) ya llegan filtradas en `observations`. */
  layers?: Partial<MapLayerState>;
}

const CATEGORY_COLORS = { viirs: '#ef4444', modis: '#facc15', highIntensity: '#f97316' };
const POINT_LAYERS = ['observation-halo', 'observation-points'];

export default function ObservationMap({ observations, selected, onSelect, focusTarget, mapStyle, layers }: ObservationMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const currentObservations = useRef(observations);
  currentObservations.current = observations;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const focusTargetRef = useRef(focusTarget);
  focusTargetRef.current = focusTarget;
  const mapStyleIdRef = useRef(mapStyle.id);
  const initialStyleRef = useRef(mapStyle.style);
  const layerState: MapLayerState = { ...DEFAULT_MAP_LAYERS, ...layers };
  const layerStateRef = useRef(layerState);
  layerStateRef.current = layerState;

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
      addDataLayers(map, currentObservations.current);
      applyVisibility(map, layerStateRef.current);
    });
    map.on('click', (event) => {
      if (!map.getLayer('observation-points')) return;
      const feature = map.queryRenderedFeatures(event.point, { layers: ['observation-points'] })[0];
      const id = feature?.properties?.id;
      const hit = currentObservations.current.find((item) => item.observation_id === id);
      if (hit) onSelectRef.current(hit);
    });
    map.on('mousemove', (event) => {
      const hit = map.getLayer('observation-points') && map.queryRenderedFeatures(event.point, { layers: ['observation-points'] }).length > 0;
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
    mapRef.current?.flyTo({ center: focusTarget.center, zoom: focusTarget.zoom, duration: 900 });
  }, [focusTarget.center, focusTarget.zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && mapStyle.id !== mapStyleIdRef.current) {
      mapStyleIdRef.current = mapStyle.id;
      map.setStyle(mapStyle.style, { diff: false });
    }
  }, [mapStyle]);

  const { points, heatmap, colombiaBoundary, antioquiaSubregions } = layerState;
  useEffect(() => {
    if (mapRef.current) applyVisibility(mapRef.current, { ...DEFAULT_MAP_LAYERS, points, heatmap, colombiaBoundary, antioquiaSubregions });
  }, [points, heatmap, colombiaBoundary, antioquiaSubregions]);

  useEffect(() => {
    if (selected) mapRef.current?.flyTo({ center: [selected.longitude, selected.latitude], zoom: 9 });
  }, [selected]);

  return <div ref={container} className="h-full min-h-[420px] w-full" aria-label="Mapa de observaciones MODIS y VIIRS" />;
}

function addDataLayers(map: MapLibreMap, observations: Observation[]) {
  if (!map.getSource('colombia-boundaries')) {
    map.addSource('colombia-boundaries', { type: 'geojson', data: COLOMBIA_BOUNDARIES_GEOJSON });
    map.addLayer({ id: 'colombia-boundary-line', type: 'line', source: 'colombia-boundaries', paint: { 'line-color': '#0284c7', 'line-width': 2.5, 'line-dasharray': [3, 2], 'line-opacity': 0.9 } });
  }
  if (!map.getSource('antioquia-subregions')) {
    map.addSource('antioquia-subregions', { type: 'geojson', data: ANTIOQUIA_SUBREGIONS_GEOJSON });
    map.addLayer({ id: 'antioquia-subregions-fill', type: 'fill', source: 'antioquia-subregions', paint: { 'fill-color': '#0284c7', 'fill-opacity': 0.05 } });
    map.addLayer({ id: 'antioquia-subregions-line', type: 'line', source: 'antioquia-subregions', paint: { 'line-color': '#d97706', 'line-width': 2, 'line-opacity': 0.85 } });
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

function applyVisibility(map: MapLibreMap, state: MapLayerState) {
  const set = (id: string, visible: boolean) => { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none'); };
  POINT_LAYERS.forEach((id) => set(id, state.points));
  set('observation-heatmap', state.heatmap);
  set('colombia-boundary-line', state.colombiaBoundary);
  set('antioquia-subregions-fill', state.antioquiaSubregions);
  set('antioquia-subregions-line', state.antioquiaSubregions);
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
