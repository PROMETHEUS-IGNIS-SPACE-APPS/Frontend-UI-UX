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
        ['Conocer la probabilidad de actividad térmica', 'Pestañas Predictibilidad y Mapa de Calor (apartados 4.2 y 4.4)'],
        ['Revisar estadísticas, meses y épocas del año', 'Pestañas Analítica y Calendario (apartados 4.3 y 4.5)'],
        ['Entender una palabra técnica', 'Glosario Científico (apartado 5.1)'],
        ['Descargar información', 'Descargar Reportes (.CSV) y Descargar observaciones (.CSV) (3.3), y Exportar consulta CSV (4.3)'],
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
        'Estimar probabilidades de actividad térmica a 24, 48 y 72 horas con un motor de Cadenas de Markov 3×3 exploratorio, validado con los propios datos cargados.',
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
        ['2. Predictibilidad', 'Motor de Cadenas de Markov 3×3 (S0 · S1 · S2) exploratorio, con validación retrospectiva.', '4.2'],
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
      { kind: 'p', text: 'La barra superior está disponible en todas las pestañas. Se compone de la identidad, los controles superiores derechos y una fila inferior con dos grupos: a la izquierda los datos satelitales (estado del Backend, archivos .CSV y descarga de observaciones) y a la derecha la ciudadanía (123 SOS, Reportar Novedad y Descargar Reportes).' },
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
      { kind: 'h', text: 'Selector de fuente de datos (Demostración / Lab Real)' },
      { kind: 'list', items: ['Demostración: conjunto de calibración sintético (2024–2025), útil para practicar y explorar la interfaz. Aparece una franja de aviso y la procedencia dice «Datos sintéticos de demostración».', 'Lab Real: datos satelitales reales del Backend-API (IDEAM SMByC + NASA FIRMS). Es el modo con el que siempre arranca la página.'] },
      { kind: 'tip', text: 'Consejo práctico: use Demostración para capacitación y Lab Real para análisis. Verifique siempre qué modo está activo antes de citar cifras.' },
      { kind: 'h', text: 'Estado del Backend' },
      { kind: 'list', items: ['Indica si el Backend-API responde (Backend Conectado) o no (Backend No disponible). Al hacer clic se vuelve a comprobar.'] },
      { kind: 'h', text: 'Cargar / Gestionar .CSV' },
      { kind: 'list', items: [
        'Abre el gestor para arrastrar o seleccionar archivos .CSV locales en formato IDEAM (separador ;) o NASA FIRMS (separador ,), de hasta 25 MB cada uno.',
        'Las observaciones válidas se suman al mapa y a los módulos con la procedencia “CSV local”, sin duplicar identificadores. El indicador +registros (archivos) muestra el volumen incorporado.',
      ] },
      { kind: 'warn', text: 'Importante: los archivos se leen solo en su navegador. No se envían al servidor y se pierden al recargar la página. Como no traen municipio ni departamento, no aparecen en los filtros por ubicación ni en el agrupamiento por subregión.' },
      { kind: 'h', text: 'Limpiar .CSV' },
      { kind: 'list', items: ['Abre la confirmación Limpiar Reportes Ciudadanos (.CSV): borra de este dispositivo los reportes ciudadanos guardados y los archivos .CSV cargados. Los datos del Backend-API no cambian.'] },
      { kind: 'warn', text: 'Importante: la acción no se puede deshacer. Si necesita conservar los reportes, use primero Descargar Reportes (.CSV).' },
      { kind: 'h', text: 'Botón 123 SOS' },
      { kind: 'list', items: ['Abre las líneas de emergencia con marcación directa (apartado 5.2).'] },
      { kind: 'h', text: 'Botón Reportar Novedad' },
      { kind: 'list', items: ['Abre el formulario de 5 secciones para preparar un reporte de lo que usted ve en el territorio y compartirlo (apartado 5.3).'] },
      { kind: 'h', text: 'Descargar Reportes (.CSV)' },
      { kind: 'list', items: ['El contador azul indica cuántos reportes ciudadanos se han preparado en este dispositivo.', 'Descarga un archivo .CSV con todos sus campos: fecha, coordenadas, sector, intensidad observada, observaciones, quién reporta y contacto.'] },
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
        'Categorías Visuales: casillas para VIIRS (rojo), MODIS (amarillo), Alta (≥ 30 MW, naranja) y Reporte ciudadano (azul: reportes guardados en este dispositivo), con su conteo.',
        'Fuentes reales (IDEAM / FIRMS): accesos rápidos IDEAM últimos 2 días (Antioquia), IDEAM 45 días Antioquia, Fusión IDEAM (30 d) + NASA FIRMS (7 d) en toda Colombia, Subir CSV y NASA FIRMS 7 d.',
        'Fuente de observaciones: Combinado IDEAM + NASA FIRMS, IDEAM · SMByC, NASA FIRMS · NRT 7 días o Histórico muestreado 2024–hoy; cobertura Antioquia o Colombia; fechas Desde / Hasta en UTC (máximo 90 días).',
        'Sensor (Todos, VIIRS, MODIS), buscador por municipio, fuente o ID, Departamento y Municipio.',
        'Observaciones encontradas, procedencia y botón Restablecer filtros.',
      ] },
      { kind: 'h', text: '4.1.2 Lienzo cartográfico (MapLibre GL)' },
      { kind: 'list', items: [
        'Barra superior: zonas Antioquia, Colombia, Valle de Aburrá, Bajo Cauca y Urabá; indicador de datos activos y botón Guía, que abre la Convención Cartográfica (apartado 5.5).',
        'Mapa base: Liberty, Satélite, Topográfico, Oscuro y Claro; casillas Límite de Colombia y Subregiones de Antioquia (contornos esquemáticos, no oficiales).',
        'Capas Cartográficas (panel inferior izquierdo, plegable): Marcadores Térmicos, Mapa Calor Observado (ponderado por FRP) y Capa Predictiva Markov con selector 24h / 48h / 72h; muestra zonas de color según la probabilidad estimada de cada celda y un aviso si el historial es insuficiente.',
        'Controles de zoom y brújula, y leyenda inferior (VIIRS, MODIS, Alta ≥ 30 MW).',
      ] },
      { kind: 'p', text: 'Al hacer clic sobre un reporte ciudadano (punto azul) se ven su intensidad observada, quién reporta, coordenadas y observaciones, con el botón Cambiar estado (Verificado / Pendiente). Es una marca local de quien usa el dispositivo, no una verificación oficial.' },
      { kind: 'p', text: 'Al hacer clic sobre un foco se abre su ficha: identificador, sensor, satélite, hora Colombia (UTC-5) y UTC, temperatura de brillo en K/°C (si existe), FRP en MW (o “No disponible”), confianza original, día/noche, concordancia, coordenadas, origen y enlace a la fuente original.' },
      { kind: 'h', text: '4.1.3 Línea de tiempo inferior' },
      { kind: 'list', items: ['Día anterior, Reproducir/Pausar y Día siguiente.', 'Velocidad 1x, 2x o 5x.', 'Fecha activa y número de fechas disponibles.', 'Histograma diario de observaciones y barra deslizante.'] },
      { kind: 'warn', text: 'Importante / Rigor científico: los satélites de órbita polar pasan por una zona solo algunas veces al día; la ausencia de focos en un instante no implica ausencia de fuego.' },
    ],
  },
  {
    id: 'predictibilidad', level: 2, title: '4.2 Pestaña Predictibilidad', blocks: [
      { kind: 'p', text: 'Motor de Cadenas de Markov 3×3 (S0 · S1 · S2) sobre celdas de unos 11 a 15 km. Es una estimación exploratoria que la página calcula con las observaciones reales que usted tenga cargadas; no es un modelo publicado por el AI-Pipeline.' },
      { kind: 'h', text: 'Regla de suficiencia de datos' },
      { kind: 'list', items: ['Con menos de 3 días con observaciones (o sin días consecutivos) aparece un aviso y no se muestran probabilidades.', 'Con menos de 5 días se estima, pero sin validación. Cargue una ventana más larga, por ejemplo IDEAM 45 días Antioquia.'] },
      { kind: 'h', text: 'Pronóstico por horizonte' },
      { kind: 'list', items: ['Elija 24, 48 o 72 horas. Cuatro tarjetas muestran S0 · Sin detección, S1 · Actividad térmica baja, S2 · Intensidad térmica alta y Markov P(S1 ∪ S2).'] },
      { kind: 'h', text: 'Matriz empírica 3×3 P(i → j)' },
      { kind: 'list', items: ['Probabilidades de transición diaria entre estados, con suavizado de Laplace (α = 0,5), y los conteos reales N(i,j).'] },
      { kind: 'h', text: 'Validación retrospectiva (out-of-sample)' },
      { kind: 'list', items: ['Se estima con el 70 % inicial de los días y se evalúa con el 30 % final, sin mirar el futuro.', 'Métricas: Brier Markov, Brier Skill Score frente a climatología, ROC-AUC, Brier de persistencia y climatología, precisión / recall y log-loss.'] },
      { kind: 'h', text: 'Informe PDF con Mapa' },
      { kind: 'list', items: ['Botón del encabezado que abre un informe imprimible: pronóstico regional, mapa de celdas P(+24 h) sobre Antioquia, validación retrospectiva y ranking. Use Guardar como PDF.'] },
      { kind: 'h', text: 'Ranking territorial' },
      { kind: 'list', items: ['Las 10 celdas con mayor P(S1 ∪ S2): municipio, estado actual, vecinos activos /8, P(24h), P(48h), P(72h) y detecciones. El botón Ver en mapa lleva a la pestaña Mapa centrada en la celda.'] },
      { kind: 'warn', text: 'Importante / Rigor científico: P(S1 ∪ S2) es una probabilidad de actividad térmica satelital, no de ocurrencia confirmada de incendios. Interprétela siempre junto con la validación retrospectiva; si el Brier Skill Score es negativo, la estimación no supera a la climatología.' },
    ],
  },
  {
    id: 'analitica', level: 2, title: '4.3 Pestaña Analítica', blocks: [
      { kind: 'p', text: 'Panel de Análisis Histórico & Estadísticas sobre las observaciones visibles de la zona filtrada.' },
      { kind: 'h', text: 'Encabezado' },
      { kind: 'list', items: ['Muestra la zona analizada, los registros cargados y la procedencia.', 'Botón Exportar Consulta CSV: descarga los registros visibles según los filtros aplicados.'] },
      { kind: 'h', text: 'Los 4 indicadores clave' },
      { kind: 'list', items: ['Sensor VIIRS (~375 m) y Sensor MODIS (~1 km), con los satélites presentes en los datos (por ejemplo NOAA-20 · NOAA-21, Aqua · Terra).', 'Índice Recurrencia (0–100): qué tan persistente es la actividad, con los días distintos de actividad.', 'Potencia Radiativa (FRP): promedio y máximo en MW.'] },
      { kind: 'h', text: 'Evolución Mensual & Estacionalidad Histórica' },
      { kind: 'list', items: ['Barras por mes que diferencian VIIRS de MODIS. Pase el cursor sobre un mes para ver detecciones y FRP promedio.'] },
      { kind: 'h', text: 'Distribución por Horario Orbital (Día / Noche)' },
      { kind: 'list', items: ['Pases Diurnos y Nocturnos con su porcentaje y FRP promedio.', 'Hora de adquisición (hora Colombia, UTC-5): histograma de 24 horas que muestra en qué horas pasan los satélites.'] },
      { kind: 'h', text: 'Ficha Técnica Comparativa de Sensores' },
      { kind: 'list', items: ['Resolución, plataformas e implicación territorial de VIIRS y MODIS.', 'En el conjunto cargado: observaciones, satélites, FRP promedio y diurno / nocturno por sensor.'] },
      { kind: 'warn', text: 'Importante / Rigor científico: un píxel MODIS (~1 km) cubre un área mucho mayor que uno VIIRS (~375 m). Sumar o comparar conteos directos sin contexto produce lecturas sesgadas.' },
      { kind: 'tip', text: 'Consejo práctico: aplique primero los filtros en la pestaña Mapa y luego use Exportar Consulta CSV para llevar exactamente lo que está viendo.' },
    ],
  },
  {
    id: 'mapa-calor', level: 2, title: '4.4 Pestaña Mapa de Calor', blocks: [
      { kind: 'p', text: 'Mapa independiente de las subregiones de Antioquia. No modifica las capas del Mapa principal.' },
      { kind: 'list', items: [
        'Horizonte +24h, +48h o +72h. El botón + Clima está desactivado: no hay un factor climático validado.',
        'Barra de subregión: Todas (Antioquia), Bajo Cauca, Urabá, Nordeste, Magdalena Medio, Valle de Aburrá y Norte & Occidente.',
        'Mapa de calor con una zona de color por celda según su P(S1 ∪ S2), en una escala de 5 rangos (<15 % a >70 %). Al tocar una zona se abre la ficha de la celda: P del horizonte, 24/48/72 h, estado, vecinos activos y detecciones.',
        'Columna lateral: probabilidad máxima y promedio, celdas, observaciones y FRP por subregión, y Celdas Prioritarias (al seleccionar una, el mapa se centra en ella).',
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
        'Botones Copiar enlace (copia el enlace de la aplicación), Probar todas las APIs (diagnóstico en tiempo real con OK/FALLO, código HTTP y latencia en ms) y Comprobar conexión.',
        'Estado del Backend-API y su dirección base.',
        'Consulta actual: fuente, procedencia y registros cargados.',
        'Archivos CSV locales cargados.',
        'Endpoints consultados y límites de cada fuente (IDEAM y fusión: máximo 90 días; NASA FIRMS: últimos 7 días; histórico muestreado: tope de 9.000 registros).',
      ] },
      { kind: 'tip', text: 'Consejo práctico: ejecute Probar todas las APIs antes de una sesión de análisis o presentación para confirmar que las fuentes responden.' },
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
      { kind: 'list', items: ['Protocolo de Respuesta Inmediata con marcación directa a 123 (Línea Única de Emergencias), 119 (Bomberos), 144 (Defensa Civil) y 132 (Cruz Roja). La plataforma no llama por sí sola: usted decide.', 'Botón Ir a Reportar Novedad, para preparar el reporte después de dar aviso a las autoridades.'] },
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
      { kind: 'warn', text: 'Importante / Rigor científico: un reporte ciudadano es información declarada, no un hecho confirmado. La plataforma todavía no recibe reportes: cada reporte se guarda solo en el dispositivo donde se preparó (para Descargar Reportes) y llega únicamente a quien usted lo envíe.' },
    ],
  },
  {
    id: 'csv', level: 2, title: '5.4 Gestor de archivos .CSV', blocks: [
      { kind: 'list', items: [
        'Gestor: arrastre o seleccione archivos, vea la lista cargada (formato, observaciones y hora) y quite archivos uno por uno.',
        'Limpiar todos (.CSV): pide confirmación en pantalla antes de borrar los archivos locales y los reportes ciudadanos guardados en el dispositivo.',
      ] },
    ],
  },
  {
    id: 'guia-mapa', level: 2, title: '5.5 Convención Cartográfica (botón Guía del mapa)', blocks: [
      { kind: 'p', text: 'Ventana que explica los símbolos, colores y capas del lienzo cartográfico: VIIRS, MODIS, alta intensidad, reportes ciudadanos, Mapa Calor Observado, Capa Predictiva Markov, límite de Colombia y subregiones de Antioquia. Desde ella se puede abrir el Glosario completo.' },
    ],
  },
  {
    id: 'notas', level: 1, title: 'Notas finales', blocks: [
      { kind: 'list', items: [
        'Un foco de calor satelital es una anomalía térmica, no un incendio confirmado.',
        'El análisis preventivo no reemplaza la respuesta operativa; ante una emergencia, use 123 SOS.',
        'Los conteos MODIS y VIIRS se leen por separado, y la FRP ausente se muestra como “No disponible”, nunca como 0.',
        'Interprete las probabilidades Markov junto con la validación retrospectiva: son una estimación exploratoria, no un modelo publicado.',
      ] },
    ],
  },
];
