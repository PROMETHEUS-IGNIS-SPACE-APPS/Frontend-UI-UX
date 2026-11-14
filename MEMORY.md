# MEMORY.md — PROMETHEUS IGNIS Frontend

## Estado actual
- Rama `feature/day`; el trabajo nuevo queda local, sin push.
- Interfaz con seis módulos: Mapa, Predictibilidad, Calendario, Aula Pedagógica, Analítica y Laboratorio IA.
- Mapa: basemaps OpenFreeMap, capas WebGL y filtros por instrumento; `frp_mw: null` no se dibuja como cero.
- API v0.2 conectada en `/api`: IDEAM, NASA FIRMS NRT y fusión. La app usa fusión por defecto; `/api/v1` queda como demo heredada.
- Filtros conectados a datos recibidos: fuente, cobertura, fechas UTC, sensor, departamento, municipio, día/noche, FRP mínimo y confianza original exacta.
- UI conserva procedencia, avisos de fuente/degradación, valores raw y enlaces de referencia. No usa `confidence_score` provisional.
- Verificación actual: lint, typecheck, 32 pruebas y build pasan. Build avisa que el chunk JS supera 500 kB.

## Decisiones y dependencias
- Contrato API v0.2 ofrece IDEAM, FIRMS, fusión, histórico limitado y `/api/health`; las fechas IDEAM/fusión tienen límite de 90 días. FIRMS entrega NRT de 7 días.
- Validar y adaptar el contrato en `services/api/ingestionService.ts`; mantener el cliente v0.1 separado para compatibilidad.
- MODIS y VIIRS no son equivalentes; no combinar confianza ni interpretar observación como incendio independiente.
- El backend reporta procedencia y algunos datos pueden estar en caché. No presentar los datos sintéticos de `/api/v1` como datos reales.
- Predicción y modelos IA siguen en estado sin artefactos científicos publicados.

## Pendientes
- La pantalla aún no integra `/api/fusion/historical-all`; requiere diseño claro para el muestreo máximo de 9000 observaciones.
- Evaluar división del bundle de producción (actualmente >500 kB).
- Incorporar artefactos AI-Pipeline revisados cuando estén publicados.
- Evaluar otros basemaps solo con proveedor, atribución y condiciones aprobadas.
