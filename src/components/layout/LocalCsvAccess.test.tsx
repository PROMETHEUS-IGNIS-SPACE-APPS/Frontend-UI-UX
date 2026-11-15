import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import LocalCsvAccess from './LocalCsvAccess';
import { useLocalCsvStore } from '@/stores/localCsvStore';

const FIRMS_CSV = 'latitude,longitude,acq_date,acq_time,satellite,instrument,confidence,frp,daynight\n6.2,-75.5,2026-11-12,0545,N20,VIIRS,n,3.1,N\n6.3,-75.6,2026-11-12,1720,A,MODIS,80,,D';

describe('LocalCsvAccess', () => {
  afterEach(() => { cleanup(); useLocalCsvStore.getState().clear(); });

  it('loads a FIRMS CSV in the browser and clears it after confirmation', async () => {
    const user = userEvent.setup();
    render(<LocalCsvAccess />);

    expect(screen.getByRole('button', { name: /Limpiar \.CSV/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Cargar \/ Gestionar \.CSV/ }));
    expect(screen.getByText(/no se envían al Backend-API/)).toBeInTheDocument();

    await user.upload(screen.getByLabelText('Seleccionar archivos CSV'), new File([FIRMS_CSV], 'firms.csv', { type: 'text/csv' }));
    await waitFor(() => expect(useLocalCsvStore.getState().datasets).toHaveLength(1));
    expect(screen.getByRole('status')).toHaveTextContent('firms.csv: 2 observaciones NASA FIRMS');

    await user.click(screen.getByRole('button', { name: 'Cerrar gestor de archivos CSV' }));
    await user.click(screen.getByRole('button', { name: /Limpiar \.CSV/ }));
    await user.click(screen.getByRole('button', { name: 'Confirmar Limpieza' }));
    expect(useLocalCsvStore.getState().datasets).toHaveLength(0);
  });

  it('reports unrecognised files without storing them', async () => {
    const user = userEvent.setup();
    render(<LocalCsvAccess />);
    await user.click(screen.getByRole('button', { name: /Cargar \/ Gestionar \.CSV/ }));
    await user.upload(screen.getByLabelText('Seleccionar archivos CSV'), new File(['a,b\n1,2'], 'otro.csv', { type: 'text/csv' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('otro.csv: Formato no reconocido'));
    expect(useLocalCsvStore.getState().datasets).toHaveLength(0);
  });
});
