import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import App from './App';
import { useUiStore } from '@/stores/uiStore';

describe('App shell de pestañas', () => {
  // El shell tiene navegación sin router y estado global (Zustand singleton):
  // cada prueba parte de un DOM limpio y del módulo inicial.
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    useUiStore.setState({ activeModule: 'explorer' });
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
