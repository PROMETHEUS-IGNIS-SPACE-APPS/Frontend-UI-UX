import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import EmergencyAccess from './EmergencyAccess';

describe('EmergencyAccess', () => {
  afterEach(() => cleanup());

  it('shows the Colombian emergency lines and opens dialing only through explicit links', async () => {
    const user = userEvent.setup();
    render(<EmergencyAccess />);

    await user.click(screen.getByRole('button', { name: 'Abrir líneas de emergencia de Colombia' }));

    expect(screen.getByRole('dialog', { name: 'Líneas de Emergencia · 123 SOS' })).toBeInTheDocument();
    for (const number of ['123', '119', '144', '132']) expect(screen.getByRole('link', { name: `Llamar al ${number}` })).toHaveAttribute('href', `tel:${number}`);
    expect(screen.getByRole('button', { name: 'Ir a Reportar Novedad' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
