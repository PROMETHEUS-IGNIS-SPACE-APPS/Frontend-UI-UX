import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import RiskMatrixPanel from './RiskMatrixPanel';

describe('RiskMatrixPanel', () => {
  afterEach(() => cleanup());

  it('updates the ordinal product from the matrix selection', async () => {
    const user = userEvent.setup();
    render(<RiskMatrixPanel />);

    await user.click(screen.getByRole('button', { name: 'Amenaza 5, consecuencia 2, producto 10' }));

    expect(screen.getByText('5 × 2 = 10')).toBeInTheDocument();
    expect(screen.getByText('Moderado')).toBeInTheDocument();
  });
});
