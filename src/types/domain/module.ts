/**
 * Identificadores de módulos navegables de la interfaz.
 * El orden define la jerarquía visual de pestañas en Header.
 */
export const APP_MODULES = [
  {
    id: 'explorer',
    label: 'Mapa Territorial',
    description:
      'Exploración geoespacial de observaciones MODIS y VIIRS con línea de tiempo.',
  },
  {
    id: 'predictability',
    label: 'Predictibilidad',
    description: 'Estado de publicación de modelos predictivos y sus validaciones.',
  },
  {
    id: 'markov-heatmap',
    label: 'Mapa de Calor Markov',
    description: 'Predictibilidad espacial por subregiones de Antioquia cuando exista un modelo publicado.',
  },
  {
    id: 'calendar',
    label: 'Calendario',
    description: 'Actividad diaria y mensual de observaciones por instrumento.',
  },
  {
    id: 'comparison',
    label: 'Aula Pedagógica',
    description: 'Lecciones interactivas y matriz ordinal para aprender a leer el riesgo territorial.',
  },
  {
    id: 'analytics',
    label: 'Analítica',
    description: 'Indicadores descriptivos del conjunto consultado según definiciones oficiales v1.0.',
  },
  {
    id: 'laboratory',
    label: 'Laboratorio IA',
    description: 'Fichas de los modelos publicados por el AI-Pipeline.',
  },
] as const;

export type AppModule = (typeof APP_MODULES)[number];

export type AppModuleId = AppModule['id'];
