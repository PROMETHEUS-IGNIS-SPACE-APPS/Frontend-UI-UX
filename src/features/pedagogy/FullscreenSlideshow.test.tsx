import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FullscreenSlideshow from './FullscreenSlideshow';

const slides = [
  { id: 'a', title: 'Primera diapositiva', imageSrc: '/a.webp' },
  { id: 'b', title: 'Segunda diapositiva', imageSrc: '/b.webp' },
];

describe('FullscreenSlideshow', () => {
  afterEach(() => cleanup());

  it('moves between slides with buttons and keyboard and closes with Esc', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<FullscreenSlideshow slides={slides} title="ABP" onClose={onClose} />);

    expect(screen.getByRole('dialog', { name: 'ABP: presentación a pantalla completa' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Primera diapositiva' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Diapositiva siguiente' }));
    expect(screen.getByRole('heading', { name: 'Segunda diapositiva' })).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('heading', { name: 'Primera diapositiva' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
