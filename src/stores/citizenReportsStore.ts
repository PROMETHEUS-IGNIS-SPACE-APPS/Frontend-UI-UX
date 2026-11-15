import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Reportes ciudadanos preparados con “Reportar Novedad”. El Backend-API no
 * tiene endpoint para recibirlos, así que se guardan solo en este navegador
 * (localStorage) para que la persona pueda descargarlos en .CSV o borrarlos.
 * Nunca se envían a la plataforma ni se muestran en el mapa como hechos.
 */
export interface CitizenReport {
  id: string;
  createdAt: string;
  latitude: number;
  longitude: number;
  sector: string | null;
  intensity: string;
  note: string;
  role: 'con experiencia' | 'habitante o testigo';
  experience: string | null;
  name: string | null;
  contact: string | null;
  /** Revisión hecha por la persona en este dispositivo; no es una verificación oficial. */
  status?: 'pendiente' | 'verificado';
}

interface CitizenReportsState {
  reports: CitizenReport[];
  addReport: (report: CitizenReport) => void;
  clearReports: () => void;
  toggleStatus: (id: string) => void;
}

export const CITIZEN_REPORTS_STORAGE_KEY = 'prometheus-ignis-reportes-ciudadanos';

export const useCitizenReportsStore = create<CitizenReportsState>()(persist(
  (set) => ({
    reports: [],
    addReport: (report) => set((state) => ({ reports: [...state.reports, report] })),
    clearReports: () => set({ reports: [] }),
    toggleStatus: (id) => set((state) => ({ reports: state.reports.map((report) => report.id === id ? { ...report, status: report.status === 'verificado' ? 'pendiente' : 'verificado' } : report) })),
  }),
  { name: CITIZEN_REPORTS_STORAGE_KEY, storage: createJSONStorage(() => localStorage) },
));

const COLUMNS: { key: keyof CitizenReport; label: string }[] = [
  { key: 'id', label: 'id' },
  { key: 'createdAt', label: 'fecha_hora_local' },
  { key: 'latitude', label: 'latitud' },
  { key: 'longitude', label: 'longitud' },
  { key: 'sector', label: 'sector_referencia' },
  { key: 'intensity', label: 'intensidad_observada' },
  { key: 'note', label: 'observaciones' },
  { key: 'role', label: 'quien_reporta' },
  { key: 'experience', label: 'experiencia' },
  { key: 'name', label: 'nombre' },
  { key: 'contact', label: 'contacto' },
  { key: 'status', label: 'estado' },
];

const cell = (value: unknown) => value === undefined ? '"pendiente"' : cellRaw(value);
const cellRaw = (value: unknown) => value === null || value === undefined ? '' : `"${String(value).replaceAll('"', '""')}"`;

export function citizenReportsToCsv(reports: CitizenReport[]): string {
  return [COLUMNS.map((column) => column.label).join(','), ...reports.map((report) => COLUMNS.map((column) => cell(report[column.key])).join(','))].join('\n');
}

export function downloadCitizenReportsCsv(reports: CitizenReport[]) {
  if (!reports.length) return;
  // BOM para que Excel abra bien las tildes.
  const url = URL.createObjectURL(new Blob([String.fromCharCode(0xfeff) + citizenReportsToCsv(reports)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `prometheus-ignis-reportes-ciudadanos-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
