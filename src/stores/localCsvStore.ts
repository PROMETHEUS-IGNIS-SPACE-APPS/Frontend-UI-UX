import { create } from 'zustand';
import type { Observation } from '@/types/api/observations';
import type { LocalCsvFormat } from '@/services/csv/localCsvParser';

export interface LocalCsvDataset {
  id: string;
  fileName: string;
  format: LocalCsvFormat;
  observations: Observation[];
  skipped: number;
  loadedAt: string;
}

/**
 * Archivos CSV cargados por la persona usuaria. Viven solo en memoria del
 * navegador: no se envían al backend y se pierden al recargar la página.
 */
interface LocalCsvState {
  datasets: LocalCsvDataset[];
  addDataset: (dataset: LocalCsvDataset) => void;
  removeDataset: (id: string) => void;
  clear: () => void;
  /** Ventana “Cargar / Gestionar .CSV”, abrible desde el encabezado o el panel lateral. */
  managerOpen: boolean;
  setManagerOpen: (open: boolean) => void;
}

export const useLocalCsvStore = create<LocalCsvState>()((set) => ({
  datasets: [],
  addDataset: (dataset) => set((state) => ({ datasets: [...state.datasets.filter((item) => item.fileName !== dataset.fileName), dataset] })),
  removeDataset: (id) => set((state) => ({ datasets: state.datasets.filter((item) => item.id !== id) })),
  clear: () => set({ datasets: [] }),
  managerOpen: false,
  setManagerOpen: (managerOpen) => set({ managerOpen }),
}));

export function selectLocalObservations(datasets: LocalCsvDataset[]): Observation[] {
  const seen = new Set<string>();
  return datasets.flatMap((dataset) => dataset.observations).filter((item) => {
    if (seen.has(item.observation_id)) return false;
    seen.add(item.observation_id);
    return true;
  });
}
