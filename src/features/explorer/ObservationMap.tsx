import { useEffect, useRef, useState } from 'react';
import { Map as MapLibre, NavigationControl, setWorkerUrl, type GeoJSONSource, type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// MapLibre resolves its worker relative to `import.meta.url`, which breaks when Vite pre-bundles
// the library into node_modules/.vite/deps. Pinning the worker URL keeps tiles rendering.
// @ts-ignore -- `?url` is a Vite-specific import.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { Observation } from '@/types/api/observations';
import type { MapFocusPreset, MapStylePreset } from './mapPresets';

interface ObservationMapProps {
  observations: Observation[];
  selected: Observation | null;
  onSelect: (observation: Observation | null) => void;
  focusTarget: MapFocusPreset;
  mapStyle: MapStylePreset;
  showViirs: boolean;
  showModis: boolean;
  showHeatmap: boolean;
}

interface LayerVisibility {
  showViirs: boolean;
  showModis: boolean;
  showHeatmap: boolean;
}

export default function ObservationMap({ observations, selected, onSelect, focusTarget, mapStyle, showViirs, showModis, showHeatmap }: ObservationMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const currentObservations = useRef(observations);
  currentObservations.current = observations;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const focusTargetRef = useRef(focusTarget);
  focusTargetRef.current = focusTarget;
  const mapStyleUrlRef = useRef(mapStyle.url);
  const layerVisibilityRef = useRef<LayerVisibility>({ showViirs, showModis, showHeatmap });
  layerVisibilityRef.current = { showViirs, showModis, showHeatmap };
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!container.current) return;
    setWorkerUrl(maplibreWorkerUrl);
    const map = new MapLibre({
      container: container.current,
      style: mapStyleUrlRef.current,
      center: focusTargetRef.current.center,
      zoom: focusTargetRef.current.zoom,
    });
    mapRef.current = map;
    map.addControl(new NavigationControl(), 'top-right');

    map.on('load', () => {
      setMapLoaded(true);
      addDataLayers(map, currentObservations.current);
      applyLayerVisibility(map, layerVisibilityRef.current);
      map.resize();
    });
    map.on('error', (event) => {
      const message = event?.error?.message ?? '';
      if (message && !message.includes('AbortError')) {
        console.warn('MapLibre warning:', message);
      }
    });
    map.on('click', (event) => {
      const layers = ['observation-points-viirs', 'observation-points-modis'].filter((id) => map.getLayer(id));
      if (!layers.length) return;
      const feature = map.queryRenderedFeatures(event.point, { layers })[0];
      const id = feature?.properties?.id;
      const hit = currentObservations.current.find((item) => item.observation_id === id);
      if (hit) onSelectRef.current(hit);
    });
    map.on('mousemove', (event) => {
      const layers = ['observation-points-viirs', 'observation-points-modis'].filter((id) => map.getLayer(id));
      const hit = layers.length && map.queryRenderedFeatures(event.point, { layers }).length > 0;
      map.getCanvas().style.cursor = hit ? 'pointer' : '';
    });
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapLoaded) return;
    const source = mapRef.current?.getSource('observations') as GeoJSONSource | undefined;
    source?.setData(featureCollection(observations));
  }, [observations, mapLoaded]);

  useEffect(() => {
    mapRef.current?.flyTo({ center: focusTarget.center, zoom: focusTarget.zoom, duration: 900 });
  }, [focusTarget.center, focusTarget.zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && mapStyle.url !== mapStyleUrlRef.current) {
      mapStyleUrlRef.current = mapStyle.url;
      map.setStyle(mapStyle.url);
      // setStyle discards sources and layers: re-add them once the new style is ready.
      map.once('style.load', () => {
        addDataLayers(map, currentObservations.current);
        applyLayerVisibility(map, layerVisibilityRef.current);
        map.resize();
      });
    }
  }, [mapStyle]);

  useEffect(() => {
    if (!mapLoaded) return;
    applyLayerVisibility(mapRef.current, layerVisibilityRef.current);
  }, [showViirs, showModis, showHeatmap, mapLoaded]);

  useEffect(() => {
    if (selected) mapRef.current?.flyTo({ center: [selected.longitude, selected.latitude], zoom: 9 });
  }, [selected]);

  return <div ref={container} className="h-full min-h-[420px] w-full" aria-label="Mapa de observaciones MODIS y VIIRS" />;
}

function addDataLayers(map: MapLibreMap, observations: Observation[]) {
  if (!map.getSource('observations')) {
    map.addSource('observations', { type: 'geojson', data: featureCollection(observations) });
  }
  const source = map.getSource('observations') as GeoJSONSource | undefined;
  source?.setData(featureCollection(observations));
  if (!map.getLayer('observation-heatmap')) {
    map.addLayer({
      id: 'observation-heatmap', type: 'heatmap', source: 'observations',
      filter: ['!=', ['get', 'frp_mw'], null],
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'frp_mw'], 0, 0.1, 100, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 4, 0.6, 9, 1.4],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 4, 14, 9, 28],
        'heatmap-opacity': 0.65,
        'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,0,0,0)', 0.2, '#164e63', 0.45, '#0e7490', 0.7, '#f59e0b', 1, '#ef4444'],
      },
    });
  }
  if (!map.getLayer('observation-points-viirs')) {
    map.addLayer({
      id: 'observation-points-viirs', type: 'circle', source: 'observations',
      filter: ['==', ['get', 'sensor'], 'VIIRS'],
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 3, 10, 7],
        'circle-color': '#ef4444',
        'circle-stroke-color': '#f8fafc', 'circle-stroke-width': 1.25,
      },
    });
  }
  if (!map.getLayer('observation-points-modis')) {
    map.addLayer({
      id: 'observation-points-modis', type: 'circle', source: 'observations',
      filter: ['==', ['get', 'sensor'], 'MODIS'],
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 3, 10, 7],
        'circle-color': '#eab308',
        'circle-stroke-color': '#f8fafc', 'circle-stroke-width': 1.25,
      },
    });
  }
}

function applyLayerVisibility(map: MapLibreMap | null, visibility: LayerVisibility) {
  if (!map) return;
  if (map.getLayer('observation-points-viirs')) map.setLayoutProperty('observation-points-viirs', 'visibility', visibility.showViirs ? 'visible' : 'none');
  if (map.getLayer('observation-points-modis')) map.setLayoutProperty('observation-points-modis', 'visibility', visibility.showModis ? 'visible' : 'none');
  if (map.getLayer('observation-heatmap')) map.setLayoutProperty('observation-heatmap', 'visibility', visibility.showHeatmap ? 'visible' : 'none');
}

function featureCollection(observations: Observation[]) {
  return {
    type: 'FeatureCollection' as const,
    features: observations.map((item) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [item.longitude, item.latitude] },
      properties: { id: item.observation_id, sensor: item.sensor, frp_mw: item.frp_mw },
    })),
  };
}
