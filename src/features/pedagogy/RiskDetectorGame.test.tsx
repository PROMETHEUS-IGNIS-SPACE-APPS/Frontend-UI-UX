import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import RiskDetectorGame from './RiskDetectorGame';

describe('RiskDetectorGame', () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => cleanup());

  it('suma puntos al detectar un peligro y muestra su ficha normativa', async () => {
    const user = userEvent.setup();
    render(<RiskDetectorGame />);

    expect(screen.getByRole('heading', { name: 'Detector de Riesgos Cotidianos' })).toBeInTheDocument();
    expect(screen.getByText('0 pts')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Químicos de limpieza junto a alimentos/ }));
    const dialog = screen.getByRole('dialog', { name: 'Químicos de limpieza junto a alimentos' });
    expect(within(dialog).getByText(/Peligro detectado/)).toBeInTheDocument();
    expect(within(dialog).getByText(/Rombo NFPA 704/)).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('100 pts')).toBeInTheDocument();
    expect(screen.getByText('1 de 5')).toBeInTheDocument();
  });

  it('abre el resumen al encontrar los cinco peligros de un escenario', async () => {
    const user = userEvent.setup();
    render(<RiskDetectorGame />);

    const hazards = ['Químicos de limpieza', 'Campana extractora', 'Sartén desatendida', 'Tostadora enchufada', 'Cuchillos sueltos'];
    for (const name of hazards) {
      await user.click(screen.getByRole('button', { name: new RegExp(`^ELEMENTO.*${name}`) }));
      await user.click(screen.getByRole('button', { name: /Seguir inspeccionando|Ver resumen del escenario/ }));
    }

    expect(screen.getByRole('dialog', { name: 'Resumen: Cocina del Hogar' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Ir a Espacio de Trabajo/ }));
    expect(screen.getByRole('tab', { name: /Espacio de Trabajo/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('pide confirmación antes de reiniciar el progreso', async () => {
    const user = userEvent.setup();
    render(<RiskDetectorGame />);

    await user.click(screen.getByRole('button', { name: /^ELEMENTO.*Extintor recargado/ }));
    await user.click(screen.getByRole('button', { name: 'Seguir inspeccionando' }));
    expect(screen.getByText('25 pts')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Reiniciar progreso/ }));
    expect(screen.getByText('25 pts')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Confirmar reinicio/ }));
    expect(screen.getByText('0 pts')).toBeInTheDocument();
  });
});
