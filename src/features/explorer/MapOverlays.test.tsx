import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MapOverlays from './MapOverlays';
import { MAP_FOCUS_PRESETS } from './mapPresets';

describe('MapOverlays', () => {
  afterEach(() => cleanup());

  it('selects documented camera presets and toggles sensor layers', async () => {
    const user = userEvent.setup();
    const onFocusChange = vi.fn();
    const onToggleViirs = vi.fn();
    const onToggleModis = vi.fn();
    render(<MapOverlays focusId="antioquia" onFocusChange={onFocusChange} observationCounts={{ VIIRS: 3, MODIS: 2 }} showViirs onToggleViirs={onToggleViirs} showModis onToggleModis={onToggleModis} />);

    await user.click(screen.getByRole('button', { name: 'Colombia' }));
    expect(onFocusChange).toHaveBeenCalledWith(MAP_FOCUS_PRESETS[1]);
    await user.click(screen.getByRole('checkbox', { name: 'Puntos rojos' }));
    expect(onToggleViirs).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('checkbox', { name: 'Puntos amarillos' }));
    expect(onToggleModis).toHaveBeenCalledOnce();
  });
});
