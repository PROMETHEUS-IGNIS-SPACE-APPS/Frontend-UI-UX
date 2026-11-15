/**
 * Identificadores de módulos navegables de la interfaz.
 * El orden define la jerarquía visual de pestañas en Header (mismo orden que la carpeta `ejemplo`).
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
    id: 'analytics',
    label: 'Analítica',
    description: 'Indicadores descriptivos del conjunto consultado según definiciones oficiales v1.0.',
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
    description: 'KAIRÓS: infografías de prevención, lecciones interactivas y matriz ordinal de riesgo.',
  },
  {
    id: 'project-info',
    label: 'Información del Proyecto',
    description: 'Modelos del AI-Pipeline, estado del Backend-API, endpoints y límites de cada fuente de datos.',
  },
] as const;

export type AppModule = (typeof APP_MODULES)[number];

export type AppModuleId = AppModule['id'];
