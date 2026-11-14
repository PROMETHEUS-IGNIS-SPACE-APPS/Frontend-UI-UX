# MEMORY.md — PROMETHEUS IGNIS Frontend

## Estado actual
- Rama `feature/day`; commits locales sin push posterior al remoto.
- Interfaz con seis módulos: Mapa, Predictibilidad, Calendario, Aula Pedagógica, Analítica y Laboratorio IA.
- Mapa conectado a IDEAM, NASA FIRMS, fusión e histórico muestreado v0.2 (máximo 9.000 registros, con aviso de muestreo).
- Header incluye acceso SOS con confirmación visual y enlaces voluntarios `tel:123` (línea nacional) y `tel:119` (Bomberos); nunca inicia una llamada automáticamente.
- Filtros disponibles: fuente, cobertura, fechas UTC cuando aplican, sensor, departamento, municipio, día/noche, FRP y confianza original.
- Se conserva procedencia y `confidence_raw`; no se usa `confidence_score` provisional. FRP null continúa como no disponible.
- Predicción y Laboratorio IA esperan artefactos aprobados del AI-Pipeline.

## Decisiones y dependencias
- Histórico usa `GET /api/fusion/historical-all?region=...`; fechas fijas desde 2024-01-01 hasta hoy, cortes semimensuales más datos recientes.
- FIRMS ofrece NRT 7 días; IDEAM/fusión permiten rangos inclusivos de máximo 90 días.
- Las observaciones satelitales son contexto y no confirman por sí solas un incendio activo.
- MODIS/VIIRS no son equivalentes; no usar heurísticas de confianza para análisis científicos.

## Pendientes
- Verificar visualmente el mapa con backend activo y 9.000 observaciones; confirmar rendimiento.
- Evaluar división del bundle de producción (advertencia de chunk JS >500 kB).
- Integrar artefactos AI-Pipeline revisados cuando estén publicados.
- Evaluar otros basemaps solo con proveedor, atribución y condiciones aprobadas.
