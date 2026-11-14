# MEMORY.md — PROMETHEUS IGNIS Frontend

## Estado actual
- Rama `feature/day`; commits locales sin push posterior al remoto.
- Interfaz con seis módulos: Mapa, Predictibilidad, Calendario, Aula Pedagógica, Analítica y Laboratorio IA.
- Mapa conectado a IDEAM, NASA FIRMS, fusión e histórico muestreado v0.2 (máximo 9.000 registros, con aviso de muestreo).
- Header muestra botones 123 SOS, Reportar Novedad y Descargar Reportes (.CSV); CSV exporta la selección visible. El aviso de novedades explica que no hay endpoint de recepción y no guarda nada.
- SOS abre opciones voluntarias `tel:123` y `tel:119`; no inicia llamadas por sí solo.
- Filtros incluyen fuente, cobertura, fechas UTC cuando aplican, sensor, departamento, municipio, día/noche, FRP y confianza original.
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
