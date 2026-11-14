import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import PedagogicalPanel from './PedagogicalPanel';

describe('PedagogicalPanel', () => {
  afterEach(() => cleanup());

  it('navigates educational lessons', async () => {
    const user = userEvent.setup();
    render(<PedagogicalPanel />);

    await user.click(screen.getByRole('button', { name: /Lección 2:/ }));
    expect(screen.getByRole('heading', { name: 'MODIS y VIIRS observan de manera diferente' })).toBeInTheDocument();
    expect(screen.getByText(/Compara los conteos por separado/)).toBeInTheDocument();
  });

  it('checks quiz answers and explains incorrect choices', async () => {
    const user = userEvent.setup();
    render(<PedagogicalPanel />);

    await user.click(screen.getByRole('button', { name: 'Un incendio confirmado' }));
    await user.click(screen.getByRole('button', { name: 'Revisar respuesta' }));

    expect(screen.getByText(/Repasa esta idea\./)).toHaveTextContent('Repasa esta idea.');
    expect(screen.getByText(/Repasa esta idea\./)).toHaveTextContent('no confirma por sí sola un incendio');
  });
});
