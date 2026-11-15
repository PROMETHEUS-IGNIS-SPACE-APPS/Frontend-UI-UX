/**
 * Instructivo oficial de uso. Sigue la estructura del documento
 * "PROMETHEUS_IGNIS_Instructivo_Oficial_v2" (noviembre 2026), adaptado a las
 * funciones que esta interfaz tiene realmente. Omitimos lo que no existe aquí:
 * selector Demostración/Lab Real, Gemini, contraseña de limpieza, probabilidades
 * Markov en vivo, reportes ciudadanos en el mapa, DAGRAN y modal FastAPI.
 * Tampoco usamos la cifra "más del 95 %", que no tiene fuente.
 */

export type ManualBlock =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'steps'; items: string[] }
  | { kind: 'table'; head: [string, string] | [string, string, string]; rows: string[][] }
  | { kind: 'tip'; text: string }
  | { kind: 'warn'; text: string };

export interface ManualSection {
  id: string;
  title: string;
  /** Sub-apartados (x.y). */
  level: 1 | 2;
  blocks: ManualBlock[];
}

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'como-usar', level: 1, title: 'Cómo usar este instructivo', blocks: [
      { kind: 'p', text: 'Este instructivo explica, paso a paso, cómo recorrer la plataforma PROMETHEUS IGNIS. Puede leerlo completo o ir directamente al apartado que necesite.' },
      { kind: 'table', head: ['Si usted quiere…', 'Vaya a…'], rows: [
        ['Pedir ayuda o avisar de un incendio', 'Botón 123 SOS (apartados 3.3 y 5.2)'],
        ['Preparar un reporte desde el territorio', 'Botón Reportar Novedad (apartados 3.3 y 5.3)'],
        ['Aprender a prevenir incendios en casa, en el campo y frente al humo', 'Pestaña Aula (apartado 4.6)'],
        ['Ver dónde hay focos de calor', 'Pestaña Mapa (apartado 4.1)'],
        ['Conocer el estado de los modelos de probabilidad', 'Pestañas Predictibilidad y Mapa de Calor (apartados 4.2 y 4.4)'],
        ['Revisar estadísticas, meses y épocas del año', 'Pestañas Analítica y Calendario (apartados 4.3 y 4.5)'],
        ['Entender una palabra técnica', 'Glosario Científico (apartado 5.1)'],
        ['Descargar información', 'Descargar observaciones (.CSV) (3.3) y Exportar consulta CSV (4.3)'],
        ['Conocer los modelos, las fuentes y las conexiones', 'Pestaña Información del Proyecto (apartado 4.7)'],
      ] },
      { kind: 'p', text: 'A lo largo del documento encontrará dos tipos de recuadros:' },
      { kind: 'tip', text: 'Consejo práctico: una sugerencia para aprovechar mejor la herramienta.' },
      { kind: 'warn', text: 'Importante / Rigor científico: una advertencia sobre cómo interpretar bien la información.' },
    ],
  },
  {
    id: 'intro', level: 1, title: '1. Introducción y propósito de la plataforma', blocks: [
      { kind: 'p', text: 'PROMETHEUS IGNIS es una plataforma web de inteligencia territorial que integra detecciones térmicas satelitales (sensores MODIS y VIIRS) entregadas por el IDEAM (SMByC) y NASA FIRMS a través del Backend-API del proyecto, para apoyar el análisis preventivo de incendios de la cobertura vegetal en Antioquia y Colombia.' },
    ],
  },
  {
    id: 'proposito', level: 2, title: '1.1 Propósito científico y preventivo', blocks: [
      { kind: 'list', items: [
        'Observar la distribución espacial y temporal de focos de calor satelitales.',
        'Analizar su recurrencia, estacionalidad e intensidad (potencia radiativa, FRP).',
        'Mostrar probabilidades de actividad térmica a 24, 48 y 72 horas cuando el AI-Pipeline publique un modelo evaluado (hoy aparecen como “Pendiente”).',
        'Educar a la comunidad mediante KAIRÓS, Aula Pedagógica.',
        'Documentar de forma transparente los modelos, las fuentes y sus límites.',
      ] },
    ],
  },
  {
    id: 'primeros-pasos', level: 1, title: '2. Primeros pasos: cómo está organizada la página', blocks: [
      { kind: 'p', text: 'La aplicación se organiza en siete pestañas: Mapa, Predictibilidad, Analítica, Mapa de Calor, Calendario, Aula e Información del Proyecto. Encima de ellas hay una barra con herramientas disponibles en todas las pestañas (apartado 3). En el celular, las pestañas están en la barra inferior; las menos usadas se abren con el botón “Más”.' },
      { kind: 'table', head: ['Pestaña', 'Qué encontrará', 'Apartado'], rows: [
        ['1. Mapa', 'Panel lateral de filtros y fuentes, lienzo cartográfico y línea de tiempo.', '4.1'],
        ['2. Predictibilidad', 'Estado del motor de Cadenas de Markov y de su validación.', '4.2'],
        ['3. Analítica', 'Indicadores y estadísticas del conjunto consultado.', '4.3'],
        ['4. Mapa de Calor', 'Observaciones por subregión de Antioquia; capa de probabilidad P(S1 ∪ S2) pendiente.', '4.4'],
        ['5. Calendario', 'Calendario estacional y dinámica térmica subregional.', '4.5'],
        ['6. Aula', 'KAIRÓS: guías visuales de prevención en el hogar, por ecosistema y en salud.', '4.6'],
        ['7. Información del Proyecto', 'Laboratorio IA (modelos) y estado de las fuentes y del Backend-API.', '4.7'],
      ] },
    ],
  },
  {
    id: 'barra', level: 1, title: '3. Barra superior: funciones globales y herramientas rápidas', blocks: [
      { kind: 'p', text: 'La barra superior está disponible en todas las pestañas. Se compone de la identidad, los controles superiores derechos y una fila inferior con dos grupos: a la izquierda los datos (estado del Backend, archivos .CSV y descarga de observaciones) y a la derecha las emergencias (123 SOS y Reportar Novedad).' },
    ],
  },
  {
    id: 'identidad', level: 2, title: '3.1 Identidad y estado', blocks: [
      { kind: 'list', items: [
        'Logo PROMETHEUS IGNIS: identifica la plataforma.',
        'Etiqueta MODIS · VIIRS: los dos sensores satelitales que alimentan los análisis.',
        'Subtítulo Plataforma de Inteligencia Territorial · Semillero ITM: carácter académico e institucional del proyecto.',
      ] },
    ],
  },
  {
    id: 'controles', level: 2, title: '3.2 Controles superiores derechos', blocks: [
      { kind: 'h', text: 'Cambio de tema (Sol / Luna)' },
      { kind: 'list', items: ['Alterna entre modo oscuro (predeterminado) y modo claro.', 'La plataforma recuerda su preferencia en este navegador.'] },
      { kind: 'h', text: 'Guía y Glosario Científico (ícono de libro abierto)' },
      { kind: 'list', items: ['Abre el Glosario Científico & Marco Epistémico, con 9 secciones desplegables y un buscador (apartado 5.1).'] },
      { kind: 'h', text: 'Instructivo (.PDF)' },
      { kind: 'list', items: ['Abre este instructivo. Con “Guardar como PDF” se abre el diálogo de impresión del navegador: elija “Guardar como PDF” como destino.'] },
    ],
  },
  {
    id: 'fila-inferior', level: 2, title: '3.3 Fila inferior de controles de datos y emergencias', blocks: [
      { kind: 'h', text: 'Estado del Backend' },
      { kind: 'list', items: ['Indica si el Backend-API responde (Backend Conectado) o no (Backend No disponible). Al hacer clic se vuelve a comprobar.'] },
      { kind: 'h', text: 'Cargar / Gestionar .CSV' },
      { kind: 'list', items: [
        'Abre el gestor para arrastrar o seleccionar archivos .CSV locales en formato IDEAM (separador ;) o NASA FIRMS (separador ,), de hasta 25 MB cada uno.',
        'Las observaciones válidas se suman al mapa y a los módulos con la procedencia “CSV local”, sin duplicar identificadores. El indicador +registros (archivos) muestra el volumen incorporado.',
      ] },
      { kind: 'warn', text: 'Importante: los archivos se leen solo en su navegador. No se envían al servidor y se pierden al recargar la página. Como no traen municipio ni departamento, no aparecen en los filtros por ubicación ni en el agrupamiento por subregión.' },
      { kind: 'h', text: 'Limpiar .CSV' },
      { kind: 'list', items: ['Abre una confirmación que indica cuántos archivos y observaciones locales se quitarán. Los datos del Backend-API no cambian.'] },
      { kind: 'h', text: 'Botón 123 SOS' },
      { kind: 'list', items: ['Abre las líneas de emergencia con marcación directa (apartado 5.2).'] },
      { kind: 'h', text: 'Botón Reportar Novedad' },
      { kind: 'list', items: ['Abre el formulario de 5 secciones para preparar un reporte de lo que usted ve en el territorio y compartirlo (apartado 5.3). No descarga ni guarda nada.'] },
      { kind: 'h', text: 'Descargar observaciones (.CSV)' },
      { kind: 'list', items: ['El contador indica cuántas observaciones están visibles con los filtros actuales.', 'Descarga esas observaciones en un archivo .CSV, con su procedencia, confianza original y FRP (vacía cuando no está disponible).'] },
    ],
  },
  {
    id: 'banners', level: 2, title: '3.4 Avisos de estado', blocks: [
      { kind: 'list', items: [
        'Consultando observaciones: se están descargando datos; espere antes de interpretar resultados.',
        'No se pudieron cargar las observaciones: el Backend-API no respondió. Use el botón Reintentar.',
        'Avisos de la fuente: el backend puede informar modo degradado (datos de respaldo en caché) o muestreo del histórico. Léalos antes de citar cifras.',
      ] },
      { kind: 'tip', text: 'Consejo práctico: si aparece un error, revise el estado del Backend en la barra superior y en Información del Proyecto antes de reintentar.' },
    ],
  },
  {
    id: 'pestanas', level: 1, title: '4. Guía detallada paso a paso de las 7 pestañas', blocks: [] },
  {
    id: 'mapa', level: 2, title: '4.1 Pestaña Mapa', blocks: [
      { kind: 'p', text: 'Es el espacio principal de exploración: combina un panel lateral de filtros y fuentes, un lienzo cartográfico y una línea de tiempo.' },
      { kind: 'h', text: '4.1.1 Panel lateral de filtros y fuentes' },
      { kind: 'list', items: [
        'Colapso: el botón ◀ / ▶ oculta o muestra el panel. En el celular aparece como “Filtros” desplegable.',
        'Modo Fácil / Filtros Pro: Filtros Pro añade paso orbital (día/noche), FRP mínima (MW) y confianza original.',
        'Categorías Visuales: casillas para VIIRS (rojo), MODIS (amarillo) y Alta (≥ 30 MW, naranja), con su conteo.',
        'Fuentes reales (IDEAM / FIRMS): accesos rápidos IDEAM últimos 2 días (Antioquia), IDEAM 45 días Antioquia, Fusión IDEAM (30 d) + NASA FIRMS (7 d) en toda Colombia, Subir CSV y NASA FIRMS 7 d.',
        'Fuente de observaciones: Combinado IDEAM + NASA FIRMS, IDEAM · SMByC, NASA FIRMS · NRT 7 días o Histórico muestreado 2024–hoy; cobertura Antioquia o Colombia; fechas Desde / Hasta en UTC (máximo 90 días).',
        'Sensor (Todos, VIIRS, MODIS), búsqueda por municipio, Departamento y Municipio.',
        'Observaciones encontradas, procedencia y botón Restablecer filtros.',
      ] },
      { kind: 'h', text: '4.1.2 Lienzo cartográfico (MapLibre GL)' },
      { kind: 'list', items: [
        'Barra superior: zonas Antioquia, Colombia, Valle de Aburrá, Bajo Cauca y Urabá; indicador de datos activos y botón Guía.',
        'Mapa base: Liberty, Satélite, Topográfico, Oscuro y Claro; casillas Límite de Colombia y Subregiones de Antioquia (contornos esquemáticos, no oficiales).',
        'Capas Cartográficas (panel inferior izquierdo, plegable): Marcadores Térmicos y Mapa Calor Observado (ponderado por FRP). La Capa Predictiva Markov está visible pero desactivada hasta que exista un modelo publicado.',
        'Controles de zoom y brújula, y leyenda inferior (VIIRS, MODIS, Alta ≥ 30 MW).',
      ] },
      { kind: 'p', text: 'Al hacer clic sobre un foco se abre su ficha: identificador, sensor, satélite, hora de adquisición (UTC), FRP en MW (o “No disponible”), confianza original, día/noche, concordancia, coordenadas, origen y enlace a la fuente original.' },
      { kind: 'h', text: '4.1.3 Línea de tiempo inferior' },
      { kind: 'list', items: ['Día anterior, Reproducir/Pausar y Día siguiente.', 'Velocidad 1x, 2x o 5x.', 'Fecha activa y número de fechas disponibles.', 'Histograma diario de observaciones y barra deslizante.'] },
      { kind: 'warn', text: 'Importante / Rigor científico: los satélites de órbita polar pasan por una zona solo algunas veces al día; la ausencia de focos en un instante no implica ausencia de fuego.' },
    ],
  },
  {
    id: 'predictibilidad', level: 2, title: '4.2 Pestaña Predictibilidad', blocks: [
      { kind: 'p', text: 'Muestra el esqueleto del motor de Cadenas de Markov 3×3 (S0 · S1 · S2): pronóstico por horizonte (24, 48 y 72 horas), matriz de transición, validación retrospectiva y ranking territorial.' },
      { kind: 'warn', text: 'Importante: los valores aparecen como “—” o “Pendiente”. La plataforma no calcula probabilidades en el navegador; se mostrarán cuando el AI-Pipeline publique un modelo con método, horizonte y validación (por ejemplo Brier Skill Score y ROC-AUC).' },
    ],
  },
  {
    id: 'analitica', level: 2, title: '4.3 Pestaña Analítica', blocks: [
      { kind: 'p', text: 'Indicadores descriptivos de las observaciones visibles, separados por instrumento.' },
      { kind: 'list', items: [
        'Botón Exportar consulta CSV: descarga los registros visibles según los filtros aplicados.',
        'Cuatro indicadores: Sensor VIIRS (~375 m), Sensor MODIS (~1 km), Índice de Recurrencia (ordinal, 0–100) y FRP promedio / máxima en MW.',
        'Distribución temporal mensual: barras por mes separadas por sensor.',
        'Paso orbital día / noche: observaciones diurnas y nocturnas.',
        'Matriz técnica de resolución espacial (VIIRS frente a MODIS) y regla metodológica de armonización.',
        'Índice de Recurrencia Histórica: días activos, observaciones y FRP máxima.',
      ] },
      { kind: 'warn', text: 'Importante / Rigor científico: un píxel MODIS (~1 km) cubre un área mucho mayor que uno VIIRS (~375 m). Sumar o comparar conteos directos sin contexto produce lecturas sesgadas.' },
      { kind: 'tip', text: 'Consejo práctico: aplique primero los filtros en la pestaña Mapa y luego use Exportar consulta CSV para llevar exactamente lo que está viendo.' },
    ],
  },
  {
    id: 'mapa-calor', level: 2, title: '4.4 Pestaña Mapa de Calor', blocks: [
      { kind: 'p', text: 'Mapa independiente de las subregiones de Antioquia. No modifica las capas del Mapa principal.' },
      { kind: 'list', items: [
        'Horizonte (24h, 48h, 72h) y + Clima: visibles pero desactivados hasta que exista un modelo publicado.',
        'Barra de subregión: Todas (Antioquia), Bajo Cauca, Urabá, Nordeste, Magdalena Medio, Valle de Aburrá y Norte & Occidente.',
        'Mapa con las observaciones satelitales de la subregión elegida; al tocar un punto se abre su ficha.',
        'Escala P(S1 ∪ S2) de 5 rangos (<15 % a >70 %), marcada como “Pendiente”.',
        'Columna lateral: observaciones y FRP promedio por subregión, y Municipios con más observaciones (al seleccionar uno, el mapa se centra en él).',
      ] },
      { kind: 'warn', text: 'Importante: la subregión se aproxima a partir del municipio de referencia asignado por el Backend-API. Oriente y otras zonas quedan fuera de estas seis agrupaciones.' },
    ],
  },
  {
    id: 'calendario', level: 2, title: '4.5 Pestaña Calendario', blocks: [
      { kind: 'list', items: [
        'Filtros: un botón por cada una de las 6 subregiones de Antioquia y el botón Todas.',
        'Gráfica Frecuencia de observaciones por zona y mes, y gráfica Intensidad térmica promedio por zona (FRP, MW). Pase el cursor sobre los puntos para ver el detalle.',
        'Interpretación del conjunto cargado: qué subregión y qué mes reúnen más observaciones.',
        'Frecuencia mensual por instrumento y tarjetas por día con conteos VIIRS/MODIS, FRP ≥ 30 MW, FRP promedio y máxima. El botón Ver mapa lleva a ese día en la pestaña Mapa.',
      ] },
      { kind: 'warn', text: 'Importante / Rigor científico: el calendario resume únicamente registros recibidos. Un día sin observaciones no prueba ausencia de incendios.' },
    ],
  },
  {
    id: 'aula', level: 2, title: '4.6 Pestaña Aula', blocks: [
      { kind: 'p', text: 'KAIRÓS, Aula Pedagógica reúne guías visuales para prevenir el fuego en el hogar, cuidar bosques, páramos y cultivos, proteger la salud humana y animal frente al humo e interpretar con criterio los datos de la plataforma.' },
      { kind: 'h', text: 'Qué verá al entrar' },
      { kind: 'steps', items: [
        'La portada KAIRÓS, Aula Pedagógica y el texto Te invitamos a leer.',
        'Tres guías con infografías: Prevención en el hogar (7), Prevención por ecosistema (6) y Prevención médica y primeros auxilios (6).',
        'Interpretación de los datos de PROMETHEUS IGNIS (reglas de lectura) junto al texto La educación como primera forma de prevención.',
        'El visor Infografías panorámicas de prevención (formato 1920 × 1080 px; mostrará “Próximamente” hasta que se publiquen).',
        'El cierre: kronos y kairós, el momento oportuno que construye la prevención.',
      ] },
      { kind: 'h', text: 'Cómo se manejan las guías con infografías' },
      { kind: 'steps', items: [
        'Lea la infografía del marco; debajo verá su título.',
        'Use la flecha naranja › para la siguiente o ‹ para la anterior. El contador (por ejemplo 1 / 7) indica en cuál va.',
        'Toque la infografía o el botón circular café para ampliarla. En computador puede pasar de una a otra con las flechas del teclado.',
        'Bajo el carrusel, un párrafo resume el tema de la guía.',
      ] },
      { kind: 'p', text: 'Cada infografía sigue la misma estructura: Título y Dato clave; Qué sí hacer (círculos verdes); Qué nunca hacer / Advertencias (círculos rojos); y Fuentes al pie junto a Emergencias Colombia: 123.' },
      { kind: 'tip', text: 'Consejo práctico: el Aula es ideal para talleres comunitarios: proyecte las infografías ampliadas y conversen sobre el “Qué sí hacer” y el “Qué nunca hacer”.' },
    ],
  },
  {
    id: 'info-proyecto', level: 2, title: '4.7 Pestaña Información del Proyecto', blocks: [
      { kind: 'h', text: 'Sección 1: Laboratorio IA' },
      { kind: 'list', items: [
        'Ficha del modelo y métricas (CV F1-Score, Recall, Precisión, ROC-AUC). Hoy aparecen como “—” porque el AI-Pipeline aún no publica artefactos.',
        'Reglas éticas y científicas: los modelos no se entrenan ni se ejecutan en el navegador; solo se mostrarán métricas publicadas con procedencia.',
      ] },
      { kind: 'h', text: 'Sección 2: Fuentes de datos y Backend-API' },
      { kind: 'list', items: [
        'Estado del Backend-API y su dirección base.',
        'Consulta actual: fuente, procedencia y registros cargados.',
        'Archivos CSV locales cargados.',
        'Endpoints consultados y límites de cada fuente (IDEAM y fusión: máximo 90 días; NASA FIRMS: últimos 7 días; histórico muestreado: tope de 9.000 registros).',
      ] },
      { kind: 'tip', text: 'Consejo práctico: revise esta pestaña antes de una presentación para confirmar que el Backend-API responde.' },
    ],
  },
  { id: 'ventanas', level: 1, title: '5. Ventanas emergentes y utilidades del sistema', blocks: [] },
  {
    id: 'glosario', level: 2, title: '5.1 Glosario Científico & Marco Epistémico', blocks: [
      { kind: 'p', text: 'Se abre desde el ícono de libro abierto o desde el botón Guía del mapa. Reúne 65 términos en 9 secciones desplegables y tiene un buscador:' },
      { kind: 'steps', items: ['Detección Satelital y Teledetección', 'Variables Térmicas y Comportamiento del Fuego', 'Análisis Histórico y Estadístico', 'Variables Meteorológicas y Condiciones Ambientales', 'Gestión del Riesgo de Incendios Forestales', 'Análisis Espacial e Indicadores Territoriales', 'Matrices de Evaluación y Priorización', 'Entidades, Sistemas y Fuentes de Información', 'Unidades de Medida y Abreviaturas'] },
      { kind: 'tip', text: 'Consejo práctico: consulte el glosario antes de interpretar términos como FRP, confianza original, BSS o ROC-AUC.' },
    ],
  },
  {
    id: 'sos', level: 2, title: '5.2 Líneas de emergencia (123 SOS)', blocks: [
      { kind: 'list', items: ['Marcación directa a 123 (Línea Nacional de Emergencias) y 119 (Bomberos). La plataforma no llama por sí sola: usted decide.'] },
      { kind: 'warn', text: 'Importante: ningún reporte en la plataforma reemplaza la llamada a las líneas de emergencia. Llame primero.' },
    ],
  },
  {
    id: 'reporte', level: 2, title: '5.3 Formulario Reportar Novedad (5 secciones)', blocks: [
      { kind: 'steps', items: [
        'Experiencia en gestión del riesgo: indique si es brigadista, bombero u otro (con detalle) o habitante / testigo civil.',
        'Ubicación del incendio: botón Obtener mi ubicación GPS, Latitud/Longitud escritas a mano o uno de los 8 sectores de referencia de Antioquia.',
        'Datos de contacto (opcionales): nombre y teléfono o correo.',
        'Intensidad observada (opcional): Baja, Moderada, Alta, Crítica / extrema o No sabe / No responde. Es una estimación visual; no se piden megavatios porque la FRP solo la mide un sensor.',
        'Observaciones y daños conocidos: personas o viviendas cercanas, cultivos, agua, vegetación y dirección del humo.',
      ] },
      { kind: 'p', text: 'Al pulsar Preparar reporte se genera un resumen con fecha, coordenadas y enlace al mapa. Puede copiarlo, enviarlo por WhatsApp o correo, compartirlo o llamar al 123.' },
      { kind: 'warn', text: 'Importante: la plataforma todavía no recibe ni guarda reportes ciudadanos. El reporte solo llega a quien usted lo envíe; sus datos no se almacenan.' },
    ],
  },
  {
    id: 'csv', level: 2, title: '5.4 Gestor de archivos .CSV', blocks: [
      { kind: 'list', items: [
        'Gestor: arrastre o seleccione archivos, vea la lista cargada (formato, observaciones y hora) y quite archivos uno por uno.',
        'Limpiar todos (.CSV): pide confirmación en pantalla antes de quitar los archivos locales.',
      ] },
    ],
  },
  {
    id: 'notas', level: 1, title: 'Notas finales', blocks: [
      { kind: 'list', items: [
        'Un foco de calor satelital es una anomalía térmica, no un incendio confirmado.',
        'El análisis preventivo no reemplaza la respuesta operativa; ante una emergencia, use 123 SOS.',
        'Los conteos MODIS y VIIRS se leen por separado, y la FRP ausente se muestra como “No disponible”, nunca como 0.',
        'Las probabilidades Markov solo se mostrarán con un modelo publicado y su validación retrospectiva.',
      ] },
    ],
  },
];
