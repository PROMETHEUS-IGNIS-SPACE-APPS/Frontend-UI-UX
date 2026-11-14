# MEMORY.md — PROMETHEUS IGNIS Frontend

## Estado actual
- Rama `feature/day`; commits locales sin push posterior al remoto.
- Interfaz con siete módulos: Mapa, Predictibilidad, Mapa de Calor Markov, Calendario, Aula Pedagógica, Analítica y Laboratorio IA.
- Mapa conectado a IDEAM, NASA FIRMS, fusión e histórico muestreado v0.2 (máximo 9.000 registros, con aviso de muestreo).
- Header muestra botones 123 SOS, Reportar Novedad y Descargar Reportes (.CSV); CSV exporta la selección visible. El aviso de novedades explica que no hay endpoint de recepción y no guarda nada.
- SOS abre opciones voluntarias `tel:123` y `tel:119`; no inicia llamadas por sí solo.
- Filtros incluyen fuente, cobertura, fechas UTC cuando aplican, sensor, departamento, municipio, día/noche, FRP y confianza original.
- El explorador replica del ejemplo el panel de filtros colapsable en móvil y ofrece presets de cámara para Antioquia, Colombia, Valle de Aburrá, Bajo Cauca y Urabá.
- Estilo visual alineado con la carpeta `Ejemplo`: fuentes Inclusive Sans / Noto Sans / Source Sans 3, radios casi rectos (rounded-xl ≈ 3px), botones de cabecera 11px `px-2.5 py-1.5`, panel lateral plegable `w-80`, línea de tiempo con histograma y velocidades 1x/2x/5x, capas y leyenda sobre el mapa, ficha flotante de observación.
- Paleta actual (Ejemplo 2026-11-14): superficies sólidas `#0E1A21`, bordes `#202F38`, acento `#CE8C67`, predictivo `#DBBF60`; sin degradados ni transparencias.
- Módulo nuevo `markov-heatmap` (Mapa de Calor Markov): muestra observaciones reales por subregión de Antioquia; horizonte, clima y escala de probabilidad quedan desactivados/pendientes hasta que exista modelo publicado.
- Calendario estacional: filtro de 6 subregiones y gráficas Ene–Dic (frecuencia y FRP promedio). Subregión = municipio de referencia del Backend-API (`utils/subregions.ts`, misma tabla que `Backend-API/app/utils/geo.py`); Oriente queda como no clasificado.
- No se replican botones Gemini, tema claro, Instructivo PDF, CSV manager ni FastAPI del ejemplo: no hay endpoints.
- Módulos usan `components/common/ModuleLayout.tsx` (ModulePage, ModuleHeader, ProvenanceNote) con la estructura del ejemplo. Predictibilidad y Laboratorio IA replican el esqueleto visual del ejemplo con “—”/“Pendiente”, sin cifras, hasta que el AI-Pipeline publique artefactos.
- Se conserva procedencia y `confidence_raw`; no se usa `confidence_score` provisional. FRP null continúa como no disponible.

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
