# MEMORY.md — PROMETHEUS IGNIS Frontend

## Estado actual
- Rama `feature/day`, último push confirmado en `08a0f2f`; mantener nuevos cambios locales hasta que se solicite push.
- Interfaz de seis pestañas: Mapa, Predictibilidad, Calendario, Aula Pedagógica, Analítica y Laboratorio IA. FastAPI Lab, datos demo y reportes ciudadanos permanecen excluidos.
- Mapa: cámara Antioquia/Colombia/Bajo Cauca/Urabá, filtros por sensor, heatmap FRP WebGL y estilos OpenFreeMap Liberty/Bright/Positron/Dark. FRP nulo se excluye del heatmap.
- Calendario: agrupación UTC diaria/mensual, MODIS/VIIRS separados, FRP nullable y acción para abrir una fecha en el mapa.
- Predictibilidad y Laboratorio IA muestran estados sin modelo/artefactos publicados; no imitar predicciones ni métricas sintéticas de `Ejemplo`.
- Aula incluye lecciones, quiz y Matriz 5×5 ordinal; no presenta detecciones como incendios confirmados ni inventa perfiles de zona.
- Analítica mantiene conteos separados, FRP y recurrencia v1.0.
- Verificación más reciente: lint, typecheck, 28 pruebas y build pasan. Vite advierte bundle JS >500 kB.

## Decisiones y dependencias
- Contrato Backend API v0.1.0 disponible: health y observaciones, limit máximo 1000; no hay paginación ni campos de municipio/departamento, daynight o métricas predictivas.
- No portar `mockHotspots.ts`, métricas de ejemplo ni `administrativeBoundaries.ts`: son sintéticos/simplificados.
- Filtros territoriales siguen deshabilitados. La interfaz no comunica días vacíos como ausencia de incendios y conserva `frp_mw: null` como no disponible.
- Mapas satelitales/topográficos requieren proveedor aprobado, atribución y evaluación de términos. No añadir servicios externos sin aprobación.
- Predicción requiere artefactos del AI-Pipeline con método, procedencia, horizonte y evaluación.
- `VITE_API_BASE_URL` puede venir de `.env`; para probar URL ausente usar `vi.stubEnv('VITE_API_BASE_URL', '')`.

## Pendientes
- Coordinar con Backend-API campos geográficos y temporales adicionales si el producto los necesita.
- Incorporar artefactos del AI-Pipeline cuando estén publicados y revisados.
- Evaluar proveedor cartográfico para imagery/topografía antes de agregar más basemaps.
- Tema claro, selector multilingüe, guía PDF y acciones de emergencia aún no están incluidos; agregar solo con alcance/decisión de producto y soporte real.
