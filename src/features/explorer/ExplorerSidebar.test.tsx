import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ExplorerSidebar from './ExplorerSidebar';

describe('ExplorerSidebar', () => {
  afterEach(() => cleanup());

  it('keeps unsupported administrative filters disabled and exposes sensor filtering', async () => {
    const user = userEvent.setup();
    const onSensorChange = vi.fn();
    render(<ExplorerSidebar sensor="ALL" onSensorChange={onSensorChange} visibleCount={4} recordCount={4} totalMatching={5} provenance="backend" isTruncated onReset={vi.fn()} />);

    expect(screen.getByRole('combobox', { name: 'Departamento' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Municipio' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'VIIRS' }));
    expect(onSensorChange).toHaveBeenCalledWith('VIIRS');
    expect(screen.getByText('Consulta truncada al límite de 1.000.')).toBeInTheDocument();
  });
});
