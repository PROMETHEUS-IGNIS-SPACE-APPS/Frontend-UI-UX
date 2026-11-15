import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MapOverlays from './MapOverlays';
import { DEFAULT_MAP_LAYERS, MAP_FOCUS_PRESETS, MAP_STYLE_PRESETS, observationCategory } from './mapPresets';

describe('MapOverlays', () => {
  afterEach(() => cleanup());

  it('selects camera presets, basemaps and cartographic layers', async () => {
    const user = userEvent.setup();
    const onFocusChange = vi.fn();
    const onStyleChange = vi.fn();
    const onToggleLayer = vi.fn();
    render(<MapOverlays focusId="antioquia" styleId="liberty" onStyleChange={onStyleChange} onFocusChange={onFocusChange} layers={DEFAULT_MAP_LAYERS} onToggleLayer={onToggleLayer} pointCount={5} frpCount={4} />);

    await user.click(screen.getByRole('button', { name: 'Colombia' }));
    expect(onFocusChange).toHaveBeenCalledWith(MAP_FOCUS_PRESETS[1]);

    await user.click(screen.getByRole('button', { name: /Base: Liberty/ }));
    await user.click(screen.getByRole('button', { name: 'Satélite' }));
    expect(onStyleChange).toHaveBeenCalledWith(MAP_STYLE_PRESETS[1]);
    await user.click(screen.getByRole('checkbox', { name: 'Subregiones de Antioquia' }));
    expect(onToggleLayer).toHaveBeenCalledWith('antioquiaSubregions');

    await user.click(screen.getByRole('checkbox', { name: 'Marcadores Térmicos' }));
    expect(onToggleLayer).toHaveBeenCalledWith('points');
    expect(screen.getByText('4')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Mapa Calor Observado' }));
    expect(onToggleLayer).toHaveBeenCalledWith('heatmap');
    expect(screen.getByRole('checkbox', { name: 'Capa Predictiva Markov' })).toBeDisabled();
  });

  it('gives high-intensity priority over the sensor colour', () => {
    expect(observationCategory({ sensor: 'MODIS', frp_mw: 30 })).toBe('highIntensity');
    expect(observationCategory({ sensor: 'MODIS', frp_mw: null })).toBe('modis');
    expect(observationCategory({ sensor: 'VIIRS', frp_mw: 12 })).toBe('viirs');
  });
});
