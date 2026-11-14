import { useEffect, useRef } from 'react';
import { Map as MapLibre, NavigationControl, type GeoJSONSource, type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Observation } from '@/types/api/observations';

interface ObservationMapProps {
  observations: Observation[];
  selected: Observation | null;
  onSelect: (observation: Observation | null) => void;
}

export default function ObservationMap({ observations, selected, onSelect }: ObservationMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const currentObservations = useRef(observations);
  currentObservations.current = observations;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!container.current) return;
    const map = new MapLibre({
      container: container.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [-75.6, 6.4],
      zoom: 6.8,
    });
    mapRef.current = map;
    map.addControl(new NavigationControl(), 'top-right');
    map.on('load', () => {
      map.addSource('observations', { type: 'geojson', data: featureCollection(currentObservations.current) });
      map.addLayer({
        id: 'observation-points', type: 'circle', source: 'observations',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 3, 10, 7],
          'circle-color': ['match', ['get', 'sensor'], 'VIIRS', '#ef4444', '#eab308'],
          'circle-stroke-color': '#f8fafc', 'circle-stroke-width': 1.25,
        },
      });
      map.on('click', 'observation-points', (event) => {
        const id = event.features?.[0]?.properties?.id;
        const hit = currentObservations.current.find((item) => item.observation_id === id);
        if (hit) onSelectRef.current(hit);
      });
      map.on('mouseenter', 'observation-points', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'observation-points', () => { map.getCanvas().style.cursor = ''; });
    });
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const source = mapRef.current?.getSource('observations') as GeoJSONSource | undefined;
    source?.setData(featureCollection(observations));
  }, [observations]);

  useEffect(() => {
    if (selected) mapRef.current?.flyTo({ center: [selected.longitude, selected.latitude], zoom: 9 });
  }, [selected]);

  return <div ref={container} className="h-full min-h-[420px] w-full rounded-2xl" aria-label="Mapa de observaciones MODIS y VIIRS" />;
}

function featureCollection(observations: Observation[]) {
  return {
    type: 'FeatureCollection' as const,
    features: observations.map((item) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [item.longitude, item.latitude] },
      properties: { id: item.observation_id, sensor: item.sensor },
    })),
  };
}
