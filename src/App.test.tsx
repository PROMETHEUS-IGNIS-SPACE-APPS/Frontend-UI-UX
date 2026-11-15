import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/api/ingestionService', () => ({
  fetchIngestedObservations: vi.fn().mockResolvedValue({
    data: [], count: 0, total_matching: 0, data_provenance: 'test_fixture',
  }),
}));

vi.mock('@/features/explorer/ObservationMap', () => ({
  default: function MockObservationMap() { return <div aria-label="Mapa de prueba" />; },
}));

vi.mock('@/components/layout/ConnectionIndicator', () => ({
  default: function MockConnectionIndicator() { return <span>Backend de prueba</span>; },
}));

import App from './App';
import { useUiStore } from '@/stores/uiStore';
import { fetchIngestedObservations } from '@/services/api/ingestionService';

const observationDate = new Date().toISOString().slice(0, 10);
const appObservations = [
  { observation_id: 'viirs-antioquia', sensor: 'VIIRS' as const, latitude: 6.2, longitude: -75.5, acquired_at: `${observationDate}T18:00:00Z`, frp_mw: 15, confidence_raw: 'Nominal', source: 'IDEAM', department: 'Antioquia', municipality: 'Medellín', daynight: 'D', source_origin: 'IDEAM', is_synthetic: false },
  { observation_id: 'modis-cordoba', sensor: 'MODIS' as const, latitude: 8.3, longitude: -75.9, acquired_at: `${observationDate}T19:00:00Z`, frp_mw: 45, confidence_raw: 70, source: 'NASA FIRMS', department: 'Córdoba', municipality: 'Montelíbano', daynight: 'N', source_origin: 'NASA_FIRMS', is_synthetic: false },
];

describe('App shell de pestañas', () => {
  // El shell tiene navegación sin router y estado global (Zustand singleton):
  // cada prueba parte de un DOM limpio y del módulo inicial.
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useUiStore.setState({ activeModule: 'explorer' });
    vi.mocked(fetchIngestedObservations).mockResolvedValue({
      data: appObservations, count: 2, total_matching: 2, data_provenance: 'IDEAM + NASA FIRMS',
    });
  });

  function renderApp() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );
  }

  it('muestra el módulo Mapa Territorial por defecto', () => {
    renderApp();

    const defaultPanel = screen.getByRole('tabpanel');
    expect(defaultPanel).toHaveAccessibleName('Mapa Territorial');
    const activeTab = screen.getByRole('tab', { name: 'Mapa Territorial' });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('presenta acciones de emergencia, novedad y exportación en la barra superior', async () => {
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByRole('button', { name: 'Abrir líneas de emergencia de Colombia' })).toBeInTheDocument();
    expect(screen.getByText('Descargar observaciones (.CSV)')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reportar una novedad territorial' }));
    expect(screen.getByRole('dialog', { name: 'Reportar Novedad de Incendio Forestal' })).toBeInTheDocument();
  });

  it('cambia de módulo al activar otra pestaña de escritorio', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('tab', { name: 'Información del Proyecto' }));

    expect(screen.getByRole('tab', { name: 'Información del Proyecto' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Información del Proyecto');
  });

  it('abre Predictibilidad como estimación exploratoria claramente rotulada', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('tab', { name: 'Predictibilidad' }));

    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Predictibilidad');
    expect(await screen.findByRole('heading', { name: /Motor Predictivo de Cadenas de Markov/ })).toBeInTheDocument();
    expect(screen.getByText('Estimación exploratoria')).toBeInTheDocument();
    expect(screen.getByText('No es un modelo publicado')).toBeInTheDocument();
  });

  it('abre el Mapa de Calor Markov sin probabilidades inventadas', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('tab', { name: 'Mapa de Calor Markov' }));

    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Mapa de Calor Markov');
    expect(await screen.findByText('Estimación exploratoria')).toBeInTheDocument();
  });

  it('cambia entre tema oscuro y claro desde el encabezado', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Cambiar a modo claro' }));
    expect(document.documentElement).toHaveClass('light');
    await user.click(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }));
    expect(document.documentElement).not.toHaveClass('light');
  });

  it('abre el Instructivo con opción de guardarlo como PDF', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Abrir Instructivo metodológico' }));
    expect(screen.getByRole('dialog', { name: 'Instructivo oficial de uso' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar como PDF' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar instructivo' }));
  });

  it('reúne modelos IA y fuentes en Información del Proyecto', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('tab', { name: 'Información del Proyecto' }));
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Información del Proyecto');
    expect(screen.getByRole('heading', { name: 'Laboratorio IA' })).toBeInTheDocument();
    expect(screen.getByText('/api/fusion/historical-all?region')).toBeInTheDocument();
  });

  it('ya no muestra Reportar en Terreno sobre el mapa', () => {
    renderApp();
    expect(screen.queryByRole('button', { name: 'Reportar en terreno' })).not.toBeInTheDocument();
  });

  it('abre el módulo Calendario desde la navegación', async () => {
    const user = userEvent.setup();
    renderApp();
    const desktopTablist = screen.getByRole('tablist', { name: 'Módulos' });

    await user.click(within(desktopTablist).getByRole('tab', { name: 'Calendario' }));

    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Calendario');
  });

  it('filtra observaciones por departamento con campos de la API v0.2', async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Departamento' }).querySelector('option[value="Antioquia"]')).not.toBeNull());

    await user.selectOptions(screen.getByRole('combobox', { name: 'Departamento' }), 'Antioquia');

    expect(screen.getByText((_, element) => element?.tagName === 'P' && element.textContent?.replace(/\s+/g, ' ').trim() === '1 / 2')).toBeInTheDocument();
  });

  it('cambia de módulo con la barra de navegación móvil', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('tab', { name: 'Proyecto' }));

    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Información del Proyecto');
  });

  it('muestra KAIRÓS, Aula Pedagógica con sus guías de prevención', async () => {
    const user = userEvent.setup();
    renderApp();

    const desktopTablist = screen.getByRole('tablist', { name: 'Módulos' });
    await user.click(within(desktopTablist).getByRole('tab', { name: 'Aula Pedagógica' }));

    expect(screen.getByRole('heading', { name: 'KAIRÓS, Aula Pedagógica' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '1. Prevención en el hogar' })).toBeInTheDocument();
    expect(screen.queryByText('Actividades interactivas')).not.toBeInTheDocument();
  });

  it('deshabilita la exportación CSV sin registros visibles', () => {
    renderApp();

    const exportButton = screen.getByRole('button', {
      name: /Sin registros visibles para exportar/,
    });
    expect(exportButton).toBeDisabled();
    expect(exportButton).toHaveAttribute('title', expect.stringMatching(/Sin registros visibles/));
  });

  it('abre y cierra el glosario científico desde el header', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Abrir glosario científico' }));

    const dialog = screen.getByRole('dialog', {
      name: 'Glosario Científico & Marco Epistémico',
    });
    expect(dialog).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Entendido' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
