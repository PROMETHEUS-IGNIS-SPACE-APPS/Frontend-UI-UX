# MEMORY.md — PROMETHEUS IGNIS Frontend
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- Mapa Territorial adaptado a la composición de `Ejemplo` (2026-11-14): filtros
  laterales, mapa central MapLibre, timeline funcional por fechas `acquired_at`,
  detalle, procedencia/truncamiento y export CSV. Consulta `/observations` con
  `limit=1000`; API validada en `types/api/observations.ts`.
- Analítica deriva conteos MODIS/VIIRS, FRP y recurrencia v1.0 de la colección API;
  matriz ordinal interactiva P=A×C sin perfiles geográficos inventados. Laboratorio
  señala ausencia de artefactos IA publicados. Pruebas: 20 verdes; typecheck/lint/build.
- Cabecera ahora sigue la estética de `Ejemplo`: dos filas, navegación horizontal,
  azul petróleo, naranja/cian y controles compactos. Se mantiene el conjunto actual
  de cuatro módulos; no se agregan los tabs fuera de alcance.
- Inspección `Ejemplo/src/data`: `mockHotspots.ts` genera ubicaciones/detecciones y
  specs de modelos sintéticas; `administrativeBoundaries.ts` define polígonos
  simplificados hardcoded. No importar estos datos como observaciones/zonas reales.
- Importación de MapLibre debe usar exports nombrados (`Map`, `NavigationControl`);
  el navegador no encuentra export default en la versión instalada. Tras corregir,
  typecheck, lint, 16 pruebas y build pasaron el 2026-11-14.
- `Ejemplo` se usa como referencia visual; no portar sus mocks, endpoints de
  terceros, valores por defecto ni métricas de modelos sin artefactos válidos.
- Build produce bundle JS >500 kB (advertencia Vite; compilación completada).
- Fase 1 COMPLETADA (2026-11-02): Header inicial funcional (logo PNG del usuario
  `src/assets/PROMETHEUS_IGNIS.png`, pestañas escritorio+móvil, indicador pasivo de
  conexión vía `/api/v1/health`, glosario con 7 términos canónicos, CSV deshabilitado
  con 0 registros). 16 tests verdes iniciales.
- Fase 0 COMPLETADA (2026-11-01): base React+TS+Vite verificada (commit `da05d57`).
- Docs alineados a la interfaz congelada (`../prometheus-ignis`): PROJECT_CONTEXT,
  ROADMAP, AGENTS (commit `79a65ab`, rama `feature/steve`).
- Stack instalado: React 19.3, Vite 8.3, TS 6.0, Tailwind 4.3 (@tailwindcss/vite),
  MapLibre 6, ECharts 6, TanStack Query 5, Zustand 5, ESLint 10 flat, Vitest 5 + RTL.
- Shell de pestañas sin router: `src/App.tsx` + `src/stores/uiStore.ts`; módulos
  Mapa, Analítica y Matriz activos; Laboratorio informa que espera artefactos IA.
## Decisiones (y por qué)
- Usuario seleccionó la estética reciente de `Ejemplo`; conservar módulos aprobados y
  adaptar UI sin importar sus datos de demo ni funciones sin contrato.
- Eliminado por decisión del equipo: pestaña+modal «FastAPI Lab», capas de límites
  administrativos y modo «Demostración/Lab Real». Única fuente de datos: Backend-API vía
  `VITE_API_BASE_URL`, sin dataset sintético de producto (fixtures solo en tests).
- Fórmulas científicas oficiales v1.0 (PROJECT_CONTEXT §3): recurrencia 0–100
  (días 50 pts, intensidad 30, FRP 20; niveles ≤20/40/60/80), Matriz P=A×C
  (bandas ≤4/≤9/≤15), confianza armonizada (l→20, n→60, h→90; num <30 low, ≥80 high),
  concordancia solo `single_sensor` hasta regla aprobada.
- Instalado `lucide-react` (solicitud 2026-11-02, mismos íconos de la plantilla):
  Header/Glosario sin SVGs artesanales.
- `lucide-react` añadido con autorización explícita del usuario (2026-11-02).
- Capa de red inicial: `services/api/httpClient.ts` (URL solo de env, timeout,
  ApiError tipado) + `healthService` para el indicador; Fase 2 lo amplía a
  observaciones según OpenAPI. Estado remoto solo en TanStack Query (Zustand no
  duplica health ni datos).
- TS 6: `baseUrl` deprecado → en `tsconfig.app.json` usar `paths: {"@/*": ["./src/*"]}`.
- Alias de imports `@` → src, definido en tsconfig + vite.config.ts (única fuente de
  verdad de paths).
## Aprendizajes y errores a evitar
- Cliente de la plantilla asumía `metadata`/`results`; el contrato real es
  `data`/`count`/`total_matching`/`data_provenance` → adaptador según OpenAPI vigente.
- Plantilla fabricaba datos (`frp_mw || 10.0`, ids aleatorios, depto implícito):
  correcciones obligadas al portar (PROJECT_CONTEXT §6). `frp_mw: null` = «No disponible».
- Vitest con `globals: false`: RTL no auto-limpia → usar `cleanup()` y resetear el
  store de Zustand entre tests. Con pestañas duplicadas escritorio/móvil,
  desambiguar por `within(tablist 'Módulos')`; el nombre accesible del CSV
  deshabilitado es su aria-label de aviso.
- A11y tests con roles: nav escritorio = `tablist` name 'Módulos'; nav móvil sin
  tablist (botones/`tab` con labels cortos) — mantener esa asimetría al portar.
- npm audit: 12 moderados dev-only via `minimatch <11.0.1` en ESLint (sin fix aún); no
  llegan al bundle.
## Próximos pasos
- Commit de Fase 1 cuando se autorice; luego Fase 2 (HU-02.1: cliente
  observaciones según OpenAPI real, adaptador con reglas v1.0, estados de datos).
- Coordinar con Backend-API: campos FIRMS extendidos, forma de respuesta y
  shape exacto de `/health` (el indicador solo usa el estado HTTP).
