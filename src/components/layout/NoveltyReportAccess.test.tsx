import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import NoveltyReportAccess from './NoveltyReportAccess';
import { citizenReportsToCsv, useCitizenReportsStore } from '@/stores/citizenReportsStore';

describe('NoveltyReportAccess', () => {
  afterEach(() => { cleanup(); useCitizenReportsStore.getState().clearReports(); });

  it('validates the form and builds a shareable summary without sending anything', async () => {
    const user = userEvent.setup();
    render(<NoveltyReportAccess />);

    await user.click(screen.getByRole('button', { name: 'Reportar una novedad territorial' }));
    expect(screen.getByRole('dialog', { name: 'Reportar Novedad de Incendio Forestal' })).toBeInTheDocument();
    expect(screen.getByText(/no envía nada a la plataforma/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Preparar reporte' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Indica la ubicación');

    await user.click(screen.getByRole('button', { name: /Bajo Cauca \[Caucasia\]/ }));
    await user.click(screen.getByRole('button', { name: /^Alta/ }));
    await user.type(screen.getByRole('textbox', { name: '¿Qué estás viendo?' }), 'Columna de humo hacia el norte');
    await user.click(screen.getByRole('button', { name: 'Preparar reporte' }));

    const summary = screen.getByLabelText('Resumen del reporte');
    expect(summary).toHaveTextContent('7.98500, -75.19500 (referencia: Bajo Cauca [Caucasia])');
    expect(summary).toHaveTextContent('Intensidad observada: Alta');
    expect(summary).toHaveTextContent('Columna de humo hacia el norte');
    expect(screen.getByText(/Todavía no se ha enviado a nadie/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Llamar al 123' })).toHaveAttribute('href', 'tel:123');

    const reports = useCitizenReportsStore.getState().reports;
    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({ latitude: 7.985, longitude: -75.195, intensity: 'Alta', role: 'habitante o testigo' });
    expect(citizenReportsToCsv(reports).split('\n')[1]).toContain('"Columna de humo hacia el norte"');
  }, 20_000);
});
