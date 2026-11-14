# MEMORY.md — PROMETHEUS IGNIS Frontend

## Estado actual
- Rama `feature/day`; último commit con cambios de integración en `d348e49`, sin push posterior.
- Interfaz con seis módulos: Mapa, Predictibilidad, Calendario, Aula Pedagógica, Analítica y Laboratorio IA.
- Mapa conectado a IDEAM, NASA FIRMS, fusión e histórico muestreado del backend v0.2.
- El histórico ofrece desde 2024-01-01 hasta hoy (COT), máximo 9.000 observaciones. La UI presenta el muestreo y advierte que los días sin puntos cargados no indican ausencia de focos.
- Filtros disponibles: fuente, cobertura, fechas UTC cuando aplican, sensor, departamento, municipio, día/noche, FRP y confianza original.
- Se conserva procedencia y confidence_raw; no se usa confidence_score provisional. FRP null continúa como no disponible.
- La respuesta histórica verificada localmente fue 9.000 observaciones deduplicadas de 11.539 registros fuente.

## Decisiones y dependencias
- Histórico usa `GET /api/fusion/historical-all?region=...`; las fechas no se envían porque el backend fija la cobertura hasta hoy y selecciona cortes semimensuales más datos recientes.
- FIRMS ofrece NRT 7 días; IDEAM/fusión permiten rangos inclusivos de máximo 90 días.
- El cliente valida contrato y coordenadas; conservar distinción entre respuestas vacías, errores y respuestas degradadas.
- MODIS/VIIRS no son equivalentes; no usar heurísticas de confianza para análisis científicos.
- Predicción y Laboratorio IA esperan artefactos aprobados del AI-Pipeline.

## Pendientes
- Verificar visualmente histórico con backend activo y confirmar que los filtros/marcadores se mantienen fluidos con 9.000 observaciones.
- Evaluar división del bundle de producción (el build previo advertía un chunk JS >500 kB).
- Integrar artefactos AI-Pipeline revisados cuando estén publicados.
- Evaluar otros basemaps solo con proveedor, atribución y condiciones aprobadas.
