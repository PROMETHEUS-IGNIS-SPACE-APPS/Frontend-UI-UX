import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import NoveltyReportAccess from './NoveltyReportAccess';

describe('NoveltyReportAccess', () => {
  afterEach(() => cleanup());

  it('makes unavailable citizen reporting explicit and offers emergency contacts', async () => {
    const user = userEvent.setup();
    render(<NoveltyReportAccess />);

    await user.click(screen.getByRole('button', { name: 'Reportar una novedad territorial' }));

    expect(screen.getByRole('dialog', { name: 'Reporte de novedad' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('todavía no recibe ni guarda reportes ciudadanos');
    expect(screen.getByRole('link', { name: 'Emergencias 123' })).toHaveAttribute('href', 'tel:123');
    expect(screen.getByRole('link', { name: 'Bomberos 119' })).toHaveAttribute('href', 'tel:119');
  });
});
