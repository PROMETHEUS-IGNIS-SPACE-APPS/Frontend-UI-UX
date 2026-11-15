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
    expect(screen.queryByRole('checkbox', { name: 'Límite de Colombia' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Subregiones de Antioquia' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Marcadores Térmicos' }));
    expect(onToggleLayer).toHaveBeenCalledWith('points');
    expect(screen.getByText('4')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Mapa Calor Observado' }));
    expect(onToggleLayer).toHaveBeenCalledWith('heatmap');
    await user.click(screen.getByRole('checkbox', { name: 'Capa Predictiva Markov' }));
    expect(onToggleLayer).toHaveBeenCalledWith('markov');
  });

  it('shows the Markov horizon selector and probability legend when the layer is on', async () => {
    const user = userEvent.setup();
    const onMarkovHorizonChange = vi.fn();
    render(<MapOverlays focusId="antioquia" styleId="liberty" onStyleChange={vi.fn()} onFocusChange={vi.fn()} layers={{ ...DEFAULT_MAP_LAYERS, markov: true }} onToggleLayer={vi.fn()} pointCount={5} frpCount={4} markovHorizon={0} onMarkovHorizonChange={onMarkovHorizonChange} />);
    await user.click(screen.getByRole('button', { name: '48h' }));
    expect(onMarkovHorizonChange).toHaveBeenCalledWith(1);
    expect(screen.getByText(/Estimación exploratoria/)).toBeInTheDocument();
  });

  it('gives high-intensity priority over the sensor colour', () => {
    expect(observationCategory({ sensor: 'MODIS', frp_mw: 30 })).toBe('highIntensity');
    expect(observationCategory({ sensor: 'MODIS', frp_mw: null })).toBe('modis');
    expect(observationCategory({ sensor: 'VIIRS', frp_mw: 12 })).toBe('viirs');
  });
});
