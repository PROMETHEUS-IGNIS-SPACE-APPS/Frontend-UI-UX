import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MapOverlays from './MapOverlays';
import { MAP_FOCUS_PRESETS, MAP_STYLE_PRESETS } from './mapPresets';

describe('MapOverlays', () => {
  afterEach(() => cleanup());

  it('selects documented camera presets and toggles sensor layers', async () => {
    const user = userEvent.setup();
    const onFocusChange = vi.fn();
    const onStyleChange = vi.fn();
    const onToggleViirs = vi.fn();
    const onToggleModis = vi.fn();
    const onToggleHeatmap = vi.fn();
    render(<MapOverlays focusId="antioquia" styleId="liberty" onStyleChange={onStyleChange} onFocusChange={onFocusChange} observationCounts={{ VIIRS: 3, MODIS: 2 }} frpCount={4} showViirs onToggleViirs={onToggleViirs} showModis onToggleModis={onToggleModis} showHeatmap={false} onToggleHeatmap={onToggleHeatmap} />);

    await user.click(screen.getByRole('button', { name: 'Colombia' }));
    expect(onFocusChange).toHaveBeenCalledWith(MAP_FOCUS_PRESETS[1]);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Estilo del mapa base' }), 'dark');
    expect(onStyleChange).toHaveBeenCalledWith(MAP_STYLE_PRESETS.find((style) => style.id === 'dark'));
    await user.click(screen.getByRole('checkbox', { name: 'Puntos rojos' }));
    expect(onToggleViirs).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('checkbox', { name: 'Puntos amarillos' }));
    expect(onToggleModis).toHaveBeenCalledOnce();
    expect(screen.getByText('4')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Densidad térmica' }));
    expect(onToggleHeatmap).toHaveBeenCalledOnce();
  });
});
