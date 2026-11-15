# MEMORY.md — PROMETHEUS IGNIS Frontend

## Estado actual
- Rama `feature/day`, publicada en origin; PR hacia `develop` pendiente.
- Interfaz con ocho módulos: Mapa, Predictibilidad, Mapa de Calor Markov, Calendario, Aula Pedagógica, Analítica, Laboratorio IA y Fuentes/API.
- Mapa conectado a IDEAM, NASA FIRMS, fusión e histórico muestreado v0.2 (máximo 9.000 registros, con aviso de muestreo).
- Header muestra botones 123 SOS, Reportar Novedad y Descargar Reportes (.CSV); CSV exporta la selección visible. El aviso de novedades explica que no hay endpoint de recepción y no guarda nada.
- SOS abre opciones voluntarias `tel:123` y `tel:119`; no inicia llamadas por sí solo.
- Filtros incluyen fuente, cobertura, fechas UTC cuando aplican, sensor, departamento, municipio, día/noche, FRP y confianza original.
- El explorador replica del ejemplo el panel de filtros colapsable en móvil y ofrece presets de cámara para Antioquia, Colombia, Valle de Aburrá, Bajo Cauca y Urabá.
- Estilo visual alineado con la carpeta `Ejemplo`: fuentes Inclusive Sans / Noto Sans / Source Sans 3, radios casi rectos (rounded-xl ≈ 3px), botones de cabecera 11px `px-2.5 py-1.5`, panel lateral plegable `w-80`, línea de tiempo con histograma y velocidades 1x/2x/5x, capas y leyenda sobre el mapa, ficha flotante de observación. En pantallas grandes la app ocupa exactamente la ventana (`lg:h-dvh`): el panel lateral se desplaza por dentro y el mapa siempre llena su columna; los avisos de carga y error se muestran sobre el mapa. Las pestañas pasan a una segunda fila del encabezado por debajo de 2xl (1536 px), para que el botón Instructivo no quede cortado.
- Paleta actual (Ejemplo 2026-11-14): superficies sólidas `#0E1A21`, bordes `#202F38`, acento `#CE8C67`, predictivo `#DBBF60`; sin degradados ni transparencias.
- Módulo nuevo `markov-heatmap` (Mapa de Calor Markov): muestra observaciones reales por subregión de Antioquia; horizonte, clima y escala de probabilidad quedan desactivados/pendientes hasta que exista modelo publicado.
- Calendario estacional: filtro de 6 subregiones y gráficas Ene–Dic (frecuencia y FRP promedio). Subregión = municipio de referencia del Backend-API (`utils/subregions.ts`, misma tabla que `Backend-API/app/utils/geo.py`); Oriente queda como no clasificado.
- Tema claro opcional (botón sol/luna, guardado en localStorage, clase `.light` en `<html>`); oscuro predeterminado. Colores vía tokens, incluidos `sensor-viirs`/`sensor-modis`.
- CSV locales (IDEAM `;`/UTC-5 o NASA FIRMS UTC) se leen en el navegador (`services/csv/localCsvParser.ts`, `stores/localCsvStore.ts`), se suman al mapa y módulos con procedencia “CSV local”, no se envían al backend y no traen municipio/departamento. Limpiar pide confirmación en pantalla (sin contraseña).
- Instructivo (.PDF): manual en ventana imprimible; “Guardar como PDF” usa el diálogo de impresión del navegador (sin jspdf).
- Mapa: botones “Reportar en Terreno” (mismo aviso sin endpoint) y “Guía” (glosario).
- Capas del mapa (`features/explorer/mapPresets.ts`): bases Liberty, Satélite y Topográfico (Esri), Oscuro y Claro (OpenFreeMap); categorías VIIRS (rojo), MODIS (amarillo) y Alta FRP ≥ 30 MW (naranja, prioridad sobre sensor); marcadores con halo, mapa de calor FRP, límites de Colombia y subregiones de Antioquia (`data/schematicBoundaries.ts`, contornos ESQUEMÁTICOS del ejemplo, no oficiales). Capa Predictiva Markov visible pero desactivada.
- Panel lateral: “Categorías Visuales” con conteos y “Fuentes reales” con accesos rápidos de fechas relativas a hoy (IDEAM 2 d, IDEAM 45 d, Fusión 30 d Colombia, FIRMS 7 d, Subir CSV).
- Glosario: 65 términos en 9 secciones con buscador (`components/common/glossaryTerms.ts`); los 7 canónicos de PROJECT_CONTEXT §3.5 conservan texto exacto. Se corrigieron definiciones del ejemplo que describían funciones inexistentes aquí.
- Aula: simulador con 2 escenarios comunitarios, directorio de líneas nacionales (119, 123, 144, 132; sin número de DAGRAN no verificado) y “Diccionario sin enredos”.
- No se replican Gemini, Demostración/Lab Real ni los perfiles por zona de la Matriz 5×5 del ejemplo (asignan valores A×C sin fuente).
- Módulos usan `components/common/ModuleLayout.tsx` (ModulePage, ModuleHeader, ProvenanceNote) con la estructura del ejemplo. Predictibilidad y Laboratorio IA replican el esqueleto visual del ejemplo con “—”/“Pendiente”, sin cifras, hasta que el AI-Pipeline publique artefactos.
- Se conserva procedencia y `confidence_raw`; no se usa `confidence_score` provisional. FRP null continúa como no disponible.

- Móvil (< md): barra inferior fija `MobileBottomNav` (Mapa, Calendario, Analítica, Aula + “Más” con los otros 4); encabezado compacto en una fila con acciones desplazables; mapa con alto fijo `max(440px,64dvh)`, panel de capas plegado al inicio y ficha de observación como hoja inferior. Tablet (md–lg) usa pestañas en el encabezado.

- Aula = KAIRÓS (`features/pedagogy/KairosClassroom.tsx`, `kairosContent.ts`), portado del ejemplo: 19 infografías de prevención (hogar, ecosistema, salud) en `public/assets/kairos/*.webp` (11,6 MB → 1,9 MB), visor ampliado, bloque de reglas de lectura propio y debajo “Actividades interactivas” (PedagogicalPanel). No se portan las 7 infografías de datos del ejemplo (Markov en vivo, reportes ciudadanos, “detección nocturna confirma combustión”) ni el “95 %” ni el espacio vacío 1920×1080.

- Predictibilidad (2026-11-14, decisión del usuario): estimación EXPLORATORIA Markov 3×3 en el navegador (`utils/markovEngine.ts`): celdas 0,10°/0,14°, Laplace α=0,5, P(24h) condicionada a vecinos activos con contracción (peso 10), 48/72 h por propagación, validación cronológica 70/30 (Brier, BSS vs climatología, ROC-AUC, log-loss, umbral calibrado en train). Sin clima, sin sintéticos, sin Gemini. Mapa de Calor sigue sin probabilidades (podría reutilizar el motor si el equipo lo pide). Requiere aprobación formal del equipo científico.
- Reportes ciudadanos: se guardan solo en el navegador (`stores/citizenReportsStore.ts`, localStorage) para “Descargar Reportes (.CSV)”; Limpiar .CSV borra reportes + CSV con confirmación (sin contraseña). Header: grupo datos (CSV, Descargar observaciones) y grupo emergencias (123 SOS, Reportar Novedad, Descargar Reportes), sin etiqueta de grupo.
- Información del Proyecto = Laboratorio IA + Fuentes/API (pestañas 'laboratory' y 'sources' fusionadas en 'project-info'). Aula KAIRÓS sin “Actividades interactivas” (PedagogicalPanel y RiskMatrixPanel eliminados).
- Instructivo (.PDF): `components/layout/manualContent.ts`, estructura del “Instructivo Oficial v2” del equipo adaptada a funciones reales.

- 2026-11-15: capa Markov en el Mapa (manchas difuminadas por celda con color de SU probabilidad; no heatmap de densidad, que exageraba) y Mapa de Calor con probabilidades del mismo motor; reportes ciudadanos en el mapa (azul, estado Verificado/Pendiente local); 123 SOS con 123/119/144/132 + “Ir a Reportar Novedad” (uiStore.noveltyOpen); Convención Cartográfica (botón Guía); ficha con hora Colombia y temperatura de brillo; buscador por municipio/fuente/ID; “Probar todas las APIs” con latencia y “Copiar enlace”; “Informe PDF con Mapa” imprimible con mapa SVG propio. Calendario: interpretación al final con procedencia en la etiqueta.

- 2026-11-15: selector Demostración / Lab Real (uiStore.dataMode, por defecto real, no persistido) con conjunto sintético del ejemplo (`data/syntheticDemo.ts`); franja de aviso y procedencia “DATOS SINTÉTICOS DE DEMOSTRACIÓN”. Revierte exclusión documentada; pendiente de aprobación del equipo. Siguen fuera: Gemini, factor de clima, contraseña, DAGRAN y “95 %”.

## Decisiones y dependencias
- Histórico usa `GET /api/fusion/historical-all?region=...`; fechas desde 2024-01-01 hasta hoy, cortes semimensuales más datos recientes.
- El OpenAPI v0.2 no incluye endpoint de reportes ciudadanos. El botón Reportar Novedad no simula ni envía reportes.
- IDEAM/fusión permiten rango inclusivo de máximo 90 días; FIRMS entrega NRT de 7 días.
- Las observaciones satelitales no confirman por sí solas un incendio activo.
- Predictibilidad y Laboratorio IA esperan artefactos aprobados del AI-Pipeline.

## Pendientes
- Verificar visualmente histórico con backend activo y 9.000 observaciones; confirmar rendimiento.
- Evaluar división del bundle de producción (advertencia de chunk JS >500 kB).
- Integrar artefactos AI-Pipeline revisados cuando estén publicados.
- La carpeta `Ejemplo` sirve como referencia visual, pero no se portan sus datos sintéticos, FastAPI Lab ni el selector Demo/Lab Real porque están excluidos por el contrato del frontend.
