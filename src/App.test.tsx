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
    expect(screen.getByText('Descargar Reportes (.CSV)')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reportar una novedad territorial' }));
    expect(screen.getByRole('dialog', { name: 'Reporte de novedad' })).toBeInTheDocument();
  });

  it('cambia de módulo al activar otra pestaña de escritorio', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('tab', { name: 'Laboratorio IA' }));

    expect(screen.getByRole('tab', { name: 'Laboratorio IA' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Laboratorio IA');
  });

  it('abre Predictibilidad con una explicación clara de su estado pendiente', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('tab', { name: 'Predictibilidad' }));

    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Predictibilidad');
    expect(screen.getByRole('heading', { name: 'Predictibilidad' })).toBeInTheDocument();
    expect(screen.getByText('Sin modelo publicado')).toBeInTheDocument();
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

    await user.click(screen.getByRole('tab', { name: 'Modelos IA' }));

    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Laboratorio IA');
  });

  it('muestra el Aula Pedagógica con lecciones y matriz interactiva', async () => {
    const user = userEvent.setup();
    renderApp();

    const desktopTablist = screen.getByRole('tablist', { name: 'Módulos' });
    await user.click(within(desktopTablist).getByRole('tab', { name: 'Aula Pedagógica' }));

    expect(screen.getByRole('heading', { name: 'Aprende a leer las observaciones' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Matriz de Gestión del Riesgo 5×5' })).toBeInTheDocument();
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
