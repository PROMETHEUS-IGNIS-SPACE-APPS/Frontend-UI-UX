export interface MapFocusPreset {
  id: string;
  label: string;
  center: [number, number];
  zoom: number;
}

export const MAP_FOCUS_PRESETS: MapFocusPreset[] = [
  { id: 'antioquia', label: 'Antioquia', center: [-75.6, 6.4], zoom: 7.2 },
  { id: 'colombia', label: 'Colombia', center: [-73.5, 4.5], zoom: 5.2 },
  { id: 'bajo-cauca', label: 'Bajo Cauca', center: [-75.1, 7.75], zoom: 8.6 },
  { id: 'uraba', label: 'Urabá', center: [-76.7, 8.1], zoom: 8.8 },
];
