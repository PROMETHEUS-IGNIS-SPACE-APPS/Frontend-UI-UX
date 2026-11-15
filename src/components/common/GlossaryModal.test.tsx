import userEvent from '@testing-library/user-event';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import GlossaryModal from './GlossaryModal';

afterEach(() => cleanup());

describe('GlossaryModal (contenido canónico de la plantilla)', () => {
  it('se oculta por completo cuando está cerrado', () => {
    const { container } = render(<GlossaryModal isOpen={false} onClose={() => undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra los 7 términos canónicos y sus fuentes cuando está abierto', async () => {
    const user = userEvent.setup();
    render(<GlossaryModal isOpen onClose={() => undefined} />);
    // Las secciones se despliegan; se abren todas para comprobar los términos canónicos.
    for (const title of ['2. VARIABLES TÉRMICAS Y COMPORTAMIENTO DEL FUEGO', '3. ANÁLISIS HISTÓRICO Y ESTADÍSTICO', '5. GESTIÓN DEL RIESGO DE INCENDIOS FORESTALES', '7. MATRICES DE EVALUACIÓN Y PRIORIZACIÓN']) {
      await user.click(screen.getByRole('button', { name: (name) => name.startsWith(title) }));
    }

    const dialog = screen.getByRole('dialog', {
      name: 'Glosario Científico & Marco Epistémico',
    });
    expect(dialog).toBeInTheDocument();
    ['Foco de Calor', 'MODIS vs VIIRS', 'FRP', 'Confianza de Detección FIRMS', 'Recurrencia Histórica (0–100)', 'Amenaza vs Exposición vs Vulnerabilidad', 'Matriz de Riesgo Territorial 5×5'].forEach(
      (fragment) => {
        expect(screen.getAllByRole('heading', { level: 3 }).some((heading) => heading.textContent?.includes(fragment))).toBe(true);
      },
    );
    expect(screen.getByText(/Fuentes: Giglio/)).toBeInTheDocument();
  });

  it('cierra al pulsar «Entendido»', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<GlossaryModal isOpen onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra al pulsar Escape', () => {
    const onClose = vi.fn();
    render(<GlossaryModal isOpen onClose={onClose} />);

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('filtra términos con el buscador', async () => {
    const user = userEvent.setup();
    render(<GlossaryModal isOpen onClose={() => undefined} />);
    await user.type(screen.getByRole('textbox', { name: 'Buscar en el glosario' }), 'dNBR');
    expect(screen.getByRole('heading', { name: 'dNBR' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'MODIS' })).not.toBeInTheDocument();
  });
});
