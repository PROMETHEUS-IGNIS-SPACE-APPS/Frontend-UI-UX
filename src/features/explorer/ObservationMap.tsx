import { useEffect, useRef } from 'react';
import { Map as MapLibre, NavigationControl, type GeoJSONSource, type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Observation } from '@/types/api/observations';
import type { MapFocusPreset } from './mapPresets';

interface ObservationMapProps {
  observations: Observation[];
  selected: Observation | null;
  onSelect: (observation: Observation | null) => void;
  focusTarget: MapFocusPreset;
  showViirs: boolean;
  showModis: boolean;
  showHeatmap: boolean;
}

export default function ObservationMap({ observations, selected, onSelect, focusTarget, showViirs, showModis, showHeatmap }: ObservationMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const currentObservations = useRef(observations);
  currentObservations.current = observations;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const focusTargetRef = useRef(focusTarget);
  focusTargetRef.current = focusTarget;
  const layerVisibilityRef = useRef({ showViirs, showModis, showHeatmap });
  layerVisibilityRef.current = { showViirs, showModis, showHeatmap };

  useEffect(() => {
    if (!container.current) return;
    const map = new MapLibre({
      container: container.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: focusTargetRef.current.center,
      zoom: focusTargetRef.current.zoom,
    });
    mapRef.current = map;
    map.addControl(new NavigationControl(), 'top-right');
    map.on('load', () => {
      map.addSource('observations', { type: 'geojson', data: featureCollection(currentObservations.current) });
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
      map.addLayer({
        id: 'observation-points-viirs', type: 'circle', source: 'observations',
        filter: ['==', ['get', 'sensor'], 'VIIRS'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 3, 10, 7],
          'circle-color': '#ef4444',
          'circle-stroke-color': '#f8fafc', 'circle-stroke-width': 1.25,
        },
      });
      map.addLayer({
        id: 'observation-points-modis', type: 'circle', source: 'observations',
        filter: ['==', ['get', 'sensor'], 'MODIS'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 3, 10, 7],
          'circle-color': '#eab308',
          'circle-stroke-color': '#f8fafc', 'circle-stroke-width': 1.25,
        },
      });
      for (const layerId of ['observation-points-viirs', 'observation-points-modis']) {
        map.on('click', layerId, (event) => {
          const id = event.features?.[0]?.properties?.id;
          const hit = currentObservations.current.find((item) => item.observation_id === id);
          if (hit) onSelectRef.current(hit);
        });
        map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
      }
      map.setLayoutProperty('observation-points-viirs', 'visibility', layerVisibilityRef.current.showViirs ? 'visible' : 'none');
      map.setLayoutProperty('observation-points-modis', 'visibility', layerVisibilityRef.current.showModis ? 'visible' : 'none');
      map.setLayoutProperty('observation-heatmap', 'visibility', layerVisibilityRef.current.showHeatmap ? 'visible' : 'none');
    });
    return () => { map.remove(); mapRef.current = null; };
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
    if (map?.getLayer('observation-points-viirs')) map.setLayoutProperty('observation-points-viirs', 'visibility', showViirs ? 'visible' : 'none');
    if (map?.getLayer('observation-points-modis')) map.setLayoutProperty('observation-points-modis', 'visibility', showModis ? 'visible' : 'none');
  }, [showViirs, showModis]);

  useEffect(() => {
    if (mapRef.current?.getLayer('observation-heatmap')) mapRef.current.setLayoutProperty('observation-heatmap', 'visibility', showHeatmap ? 'visible' : 'none');
  }, [showHeatmap]);

  useEffect(() => {
    if (selected) mapRef.current?.flyTo({ center: [selected.longitude, selected.latitude], zoom: 9 });
  }, [selected]);

  return <div ref={container} className="h-full min-h-[420px] w-full" aria-label="Mapa de observaciones MODIS y VIIRS" />;
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
