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

    expect(screen.getByRole('dialog', { name: 'Líneas de emergencia · Colombia' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /línea nacional 123/i })).toHaveAttribute('href', 'tel:123');
    expect(screen.getByRole('link', { name: /bomberos 119/i })).toHaveAttribute('href', 'tel:119');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
