# PROMETHEUS IGNIS · Frontend

<p align="center">
  <strong>Inteligencia territorial para observar, analizar y comunicar detecciones térmicas satelitales</strong><br>
  <sub>Semillero de Astronomía ITM · NASA Space Apps Challenge 2026</sub>
</p>

<p align="center">
  <a href="https://github.com/PROMETHEUS-IGNIS/Frontend-UI-UX"><img src="https://img.shields.io/badge/status-active-success?style=flat-square" alt="Status: active"></a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=111827" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/MapLibre-GL-396CB2?style=flat-square" alt="MapLibre GL">
</p>

<p align="center">
  <a href="#spanish">🇪🇸 Español</a> ·
  <a href="#english">🇬🇧 English</a>
</p>

<a id="spanish"></a>

## 1. Qué es

PROMETHEUS IGNIS es una aplicación web para explorar y contextualizar focos de calor detectados por **MODIS** y **VIIRS**. El frontend ofrece una interfaz de una sola página para:

- explorar observaciones sobre un mapa interactivo;
- comparar fuentes IDEAM y NASA FIRMS;
- consultar calendarios, analítica y predictibilidad exploratoria;
- visualizar el mapa de calor Markov y el contexto meteorológico Open-Meteo;
- revisar la matriz ordinal de gestión del riesgo 5×5;
- consultar artefactos publicados del AI-Pipeline;
- generar informes imprimibles y exportaciones CSV;
- registrar novedades ciudadanas localmente en el navegador.

El frontend consume datos de producción exclusivamente a través del **Backend-API**. Las fixtures de pruebas y el modo de demostración están rotulados y no deben confundirse con observaciones reales.

## 2. Módulos principales

| Módulo                             | Propósito                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| **Mapa**                      | Observaciones, filtros, capas cartográficas, detalle y procedencia.                  |
| **Predictibilidad**           | Cadena de Markov 3×3 exploratoria, validación retrospectiva, ranking e informe PDF. |
| **Mapa de calor**             | Probabilidad por celda, horizonte temporal y contexto meteorológico experimental.    |
| **Calendario**                | Recurrencia temporal y distribución por fuente/subregión.                           |
| **Analítica**                | Resúmenes, sensores, intensidad y exportación de la consulta.                       |
| **Aula pedagógica**          | Matriz 5×5, glosario, actividades y explicación de conceptos.                       |
| **Información del Proyecto** | Laboratorio IA, diagnóstico de fuentes y catálogo oficial de enlaces.               |

## 3. Arquitectura

```text
┌──────────────────────┐       HTTPS/HTTP        ┌──────────────────────┐
│ React + Vite +       │  ────────────────────▶  │ FastAPI Backend-API  │
│ TanStack Query       │                         │ IDEAM · FIRMS · IA   │
└──────────┬───────────┘                         └──────────┬───────────┘
           │                                                │
           │ MapLibre GL                                    ├─ IDEAM SMByC
           ├─ Zustand                                        ├─ NASA FIRMS
           ├─ ECharts                                        ├─ Open-Meteo
           └─ LocalStorage                                   └─ Gemini opcional
```

- **Datos remotos:** TanStack Query, con cache y estados explícitos de carga/error.
- **Estado de interfaz:** Zustand.
- **Red:** cliente HTTP centralizado en `src/services/api/httpClient.ts`.
- **Mapas:** MapLibre GL JS; el worker `.mjs` se sirve con MIME JavaScript desde Nginx.
- **Producción:** build estático servido por Nginx.

## 4. Requisitos

- Node.js **22 o superior**.
- npm.
- Backend-API ejecutándose en desarrollo o accesible por HTTP(S).
- Para producción con Docker: Docker Engine/Desktop y Compose v2.

## 5. Instalación y desarrollo local

```bash
npm ci
copy .env.example .env
npm run dev
```

En PowerShell, `copy` puede sustituirse por:

```powershell
Copy-Item .env.example .env
```

La aplicación estará disponible en `http://localhost:5173`.

### Variables de entorno

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

`VITE_API_BASE_URL` debe ser la URL base, sin `/api` ni `/api/v1` al final. En una instalación publicada detrás del mismo dominio, puede usarse el origen público para que Nginx haga proxy de `/api`:

```env
VITE_API_BASE_URL=https://tu-dominio.example
```

> **Seguridad:** toda variable `VITE_*` queda embebida en el bundle público. Nunca pongas claves, tokens o credenciales en este archivo.

## 6. Docker y despliegue

El `Dockerfile` compila el proyecto con Node 22 y sirve `dist/` con Nginx. La configuración de Nginx:

- hace fallback SPA hacia `index.html`;
- sirve workers `.mjs` como `application/javascript`;
- reenvía `/api/` al servicio Docker `backend:8000`.

Desde la carpeta que contiene `docker-compose.yml`:

```bash
docker compose build --no-cache frontend
docker compose up -d
```

Por defecto:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:8000`

Para un dominio público, la variable debe estar disponible **durante el build**, no solo al reiniciar el contenedor:

```env
VITE_API_BASE_URL=https://tu-dominio.example
```

Después:

```bash
docker compose down
docker compose build --no-cache frontend
docker compose up -d --force-recreate
```

## 7. Scripts

| Comando                | Uso                               |
| ---------------------- | --------------------------------- |
| `npm run dev`        | Servidor de desarrollo Vite.      |
| `npm run build`      | Typecheck y build de producción. |
| `npm run typecheck`  | TypeScript estricto.              |
| `npm run lint`       | ESLint.                           |
| `npm test`           | Suite Vitest.                     |
| `npm run test:watch` | Vitest en modo observación.      |

## 8. Contrato de datos y rigor científico

El contrato vigente está en [`Backend-API/docs/api-contracts.md`](../Backend-API/docs/api-contracts.md).

Reglas no negociables:

1. MODIS y VIIRS son sensores distintos; sus conteos no se suman como si fueran equivalentes.
2. `confidence_raw` conserva el valor original de la fuente.
3. `frp_mw: null` significa “no disponible”, no cero.
4. Una ausencia de detecciones no demuestra ausencia de fuego.
5. La cadena de Markov es exploratoria y estima actividad térmica satelital, no ignición ni propagación física.
6. El contexto meteorológico es complementario y experimental; no confirma incendios.
7. La matriz 5×5 es ordinal e ilustrativa, no una probabilidad calibrada.

## 9. Estructura

```text
src/
├── app/                 # Providers y configuración global
├── components/          # Layout, accesos, modales y componentes comunes
├── features/            # Explorer, predictibilidad, calendario, aula, IA
├── hooks/               # Hooks de conexión, IA y estado derivado
├── services/api/        # Cliente HTTP y servicios por contrato
├── stores/              # Zustand y persistencia local
├── types/api/           # Tipos alineados con el Backend-API
└── utils/               # Markov, filtros, CSV y subregiones
```

Documentos de trabajo:

- [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md): producto, decisiones científicas y arquitectura.
- [`ROADMAP.md`](ROADMAP.md): fases y criterios de terminado.
- [`AGENTS.md`](AGENTS.md): convenciones de contribución.

## 10. Solución de problemas

### El navegador llama a `localhost` en producción

`VITE_API_BASE_URL` se incorpora durante `npm run build`. Cambiar el `.env` después no modifica el bundle. Reconstruye:

```bash
docker compose build --no-cache frontend
docker compose up -d --force-recreate frontend
```

### Aparece `ERR_NAME_NOT_RESOLVED` para `backend`

`backend` solo es resolvible dentro de la red Docker. El navegador debe llamar al dominio público o al mismo origen del frontend, nunca a `https://backend:8000`.

### El mapa aparece en blanco

Comprueba que el worker `.mjs` responda como `application/javascript` y que Nginx esté usando el `nginx.conf` actualizado.

## 11. Licencia y atribución

Proyecto del Semillero de Astronomía ITM para NASA Space Apps Challenge 2026. Las fuentes y sus condiciones de uso deben consultarse en el catálogo oficial incluido en la aplicación.

---

<a id="english"></a>

# PROMETHEUS IGNIS · Frontend

<p align="center">
  <strong>Territorial intelligence for observing, analyzing, and communicating satellite thermal detections</strong><br>
  <sub>ITM Astronomy Seedbed · NASA Space Apps Challenge 2026</sub>
</p>

## 1. Overview

PROMETHEUS IGNIS is a web application for exploring and contextualizing thermal hotspots detected by **MODIS** and **VIIRS**. It provides:

- interactive territorial exploration and IDEAM/NASA FIRMS comparison;
- calendar, analytics, and exploratory predictability views;
- a Markov heatmap with Open-Meteo environmental context;
- an ordinal 5×5 risk-management matrix;
- AI-Pipeline artifact inspection;
- printable reports, CSV exports, and local citizen novelty reports.

Production data is consumed through the **Backend-API**. Test fixtures and demo mode are explicitly labeled and must not be interpreted as real observations.

## 2. Main modules

| Module                        | Purpose                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| **Map**                 | Observations, filters, cartographic layers, details, and provenance.    |
| **Predictability**      | Exploratory 3×3 Markov chain, validation, ranking, and PDF report.     |
| **Heatmap**             | Cell probabilities, forecast horizon, and experimental weather context. |
| **Calendar**            | Temporal recurrence and source/subregion distribution.                  |
| **Analytics**           | Summaries, sensors, intensity, and query export.                        |
| **Learning classroom**  | 5×5 matrix, glossary, activities, and concepts.                        |
| **Project information** | AI laboratory, source diagnostics, and official links catalog.          |

## 3. Architecture

```text
┌──────────────────────┐       HTTPS/HTTP        ┌──────────────────────┐
│ React + Vite +       │  ────────────────────▶  │ FastAPI Backend-API  │
│ TanStack Query       │                         │ IDEAM · FIRMS · AI   │
└──────────┬───────────┘                         └──────────┬───────────┘
           │ MapLibre · Zustand · ECharts · LocalStorage     │
           └────────────────────────────────────────────────┘
```

- TanStack Query manages remote data and explicit loading/error states.
- Zustand manages UI state.
- `src/services/api/httpClient.ts` is the centralized network boundary.
- MapLibre GL JS renders the map; Nginx serves `.mjs` workers with the correct MIME type.
- Production uses a static Vite build served by Nginx.

## 4. Requirements and local setup

- Node.js **22 or newer**.
- npm.
- A running or reachable Backend-API.
- Docker Engine/Desktop and Compose v2 for containers.

```bash
npm ci
cp .env.example .env
npm run dev
```

The application runs at `http://localhost:5173`.

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

The value is the API base URL without `/api` or `/api/v1`. Behind an Nginx same-origin proxy:

```env
VITE_API_BASE_URL=https://your-domain.example
```

Every `VITE_*` value is public. Never put keys, tokens, or credentials in it.

## 5. Docker deployment

Nginx provides SPA fallback, serves MapLibre workers, and proxies `/api/` to `backend:8000`.

```bash
docker compose build --no-cache frontend
docker compose up -d
```

Default URLs are `http://localhost:8080` for the frontend and `http://localhost:8000` for the backend. Public-domain values must be present at build time:

```bash
docker compose down
docker compose build --no-cache frontend
docker compose up -d --force-recreate
```

## 6. Scripts

| Command                | Purpose                         |
| ---------------------- | ------------------------------- |
| `npm run dev`        | Vite development server.        |
| `npm run build`      | Typecheck and production build. |
| `npm run typecheck`  | Strict TypeScript check.        |
| `npm run lint`       | ESLint.                         |
| `npm test`           | Vitest suite.                   |
| `npm run test:watch` | Vitest watch mode.              |

## 7. Data contract and scientific rigor

The shared contract is [`Backend-API/docs/api-contracts.md`](../Backend-API/docs/api-contracts.md).

1. MODIS and VIIRS are different sensors; their counts are not equivalent.
2. `confidence_raw` preserves the source value.
3. `frp_mw: null` means “not available”, not zero.
4. No detections do not prove that no fire exists.
5. Markov is exploratory satellite-activity estimation, not ignition or physical spread prediction.
6. Weather context is experimental and does not confirm fires.
7. The 5×5 matrix is ordinal and illustrative, not calibrated probability.

## 8. Structure and documentation

```text
src/
├── app/                 # Providers and global configuration
├── components/          # Layout, access controls, modals, shared UI
├── features/            # Explorer, predictability, calendar, classroom, AI
├── services/api/        # HTTP client and contract-specific services
├── stores/              # Zustand and local persistence
├── types/api/           # Backend-aligned types
└── utils/               # Markov, filters, CSV, and subregions
```

- [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md): product and scientific decisions.
- [`ROADMAP.md`](ROADMAP.md): phases and acceptance criteria.
- [`AGENTS.md`](AGENTS.md): contribution conventions.

## 9. Troubleshooting

### The browser calls `localhost` in production

`VITE_API_BASE_URL` is embedded during the build. Rebuild the image after changing it:

```bash
docker compose build --no-cache frontend
docker compose up -d --force-recreate frontend
```

### `ERR_NAME_NOT_RESOLVED` for `backend`

`backend` is only resolvable inside Docker. The browser must call the public domain or frontend origin.

### The map is blank

Check that the `.mjs` worker is returned as `application/javascript` and that the updated `nginx.conf` is in the image.

## 10. Attribution

ITM Astronomy Seedbed project for NASA Space Apps Challenge 2026. Consult the official catalog inside the application for source attribution and usage terms.
