import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import type { KairosSlide } from './kairosContent';

interface FullscreenSlideshowProps {
  slides: KairosSlide[];
  startIndex?: number;
  /** Nombre del conjunto (p. ej. «Aprendizaje Basado en Problemas»). */
  title: string;
  onClose: () => void;
}

const AUTO_ADVANCE_MS = 8000;
const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function';

/**
 * Presentación a pantalla completa para leer las diapositivas en grande:
 * flechas grandes, teclado (← → espacio, Esc), deslizar en pantallas táctiles,
 * avance automático opcional y lectura en voz alta con la voz del navegador.
 */
export default function FullscreenSlideshow({ slides, startIndex = 0, title, onClose }: FullscreenSlideshowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const [index, setIndex] = useState(startIndex);
  const [autoplay, setAutoplay] = useState(false);
  const [speak, setSpeak] = useState(false);
  const slide = slides[index];
  const go = useCallback((delta: number) => setIndex((value) => (value + delta + slides.length) % slides.length), [slides.length]);

  // Pantalla completa real del navegador (si lo permite); al salir con Esc del navegador se cierra el visor.
  useEffect(() => {
    const node = rootRef.current;
    node?.requestFullscreen?.().catch(() => { /* el visor fijo sigue ocupando toda la ventana */ });
    const onChange = () => { if (!document.fullscreenElement) onClose(); };
    document.addEventListener('fullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => undefined);
      if (canSpeak()) window.speechSynthesis.cancel();
    };
  }, [onClose]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'PageDown') { event.preventDefault(); go(1); }
      else if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); go(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  useEffect(() => {
    if (!autoplay) return undefined;
    const timer = window.setTimeout(() => go(1), AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [autoplay, index, go]);

  useEffect(() => {
    if (!speak || !canSpeak() || !slide) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`Diapositiva ${index + 1} de ${slides.length}. ${slide.title}.`);
    utterance.lang = 'es-CO';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, [speak, index, slide, slides.length]);

  if (!slide) return null;
  const BTN = 'flex items-center gap-1.5 rounded-xl px-3 py-2 font-sans text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#facc15] sm:text-sm';

  return <div
    ref={rootRef}
    role="dialog"
    aria-modal="true"
    aria-label={`${title}: presentación a pantalla completa`}
    className="fixed inset-0 z-[80] flex flex-col bg-black text-white"
    onTouchStart={(event) => { touchX.current = event.touches[0]?.clientX ?? null; }}
    onTouchEnd={(event) => {
      const start = touchX.current; touchX.current = null;
      const end = event.changedTouches[0]?.clientX;
      if (start !== null && end !== undefined && Math.abs(end - start) > 50) go(end < start ? 1 : -1);
    }}
  >
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 bg-black/80 px-3 py-2 sm:px-5">
      <div className="min-w-0">
        <p className="truncate font-sans text-[11px] font-bold uppercase tracking-wider text-[#F6C88A]">{title}</p>
        <h2 className="truncate font-sans text-base font-bold sm:text-xl">{slide.title}</h2>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {canSpeak() && <button type="button" onClick={() => { if (speak) window.speechSynthesis.cancel(); setSpeak((value) => !value); }} aria-pressed={speak} className={`${BTN} ${speak ? 'bg-[#facc15] text-black' : 'bg-white/10 hover:bg-white/20'}`}>{speak ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}Leer en voz alta</button>}
        <button type="button" onClick={() => setAutoplay((value) => !value)} aria-pressed={autoplay} className={`${BTN} ${autoplay ? 'bg-[#facc15] text-black' : 'bg-white/10 hover:bg-white/20'}`}>{autoplay ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}{autoplay ? 'Pausar' : 'Automático'}</button>
        <button type="button" onClick={onClose} aria-label="Salir de pantalla completa" className={`${BTN} bg-[#D9692B] hover:bg-[#B8531E]`}><X className="h-4 w-4" aria-hidden />Salir</button>
      </div>
    </div>

    <div className="relative flex min-h-0 flex-1 items-center justify-center">
      <img src={slide.imageSrc} alt={slide.title} className="block max-h-full max-w-full object-contain" />
      <button type="button" onClick={() => go(-1)} aria-label="Diapositiva anterior" className="absolute left-2 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white ring-2 ring-white/40 transition-colors hover:bg-[#D9692B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#facc15] sm:left-5 sm:h-16 sm:w-16"><ChevronLeft className="h-8 w-8" aria-hidden /></button>
      <button type="button" onClick={() => go(1)} aria-label="Diapositiva siguiente" className="absolute right-2 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white ring-2 ring-white/40 transition-colors hover:bg-[#D9692B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#facc15] sm:right-5 sm:h-16 sm:w-16"><ChevronRight className="h-8 w-8" aria-hidden /></button>
    </div>

    <div className="flex shrink-0 items-center justify-center gap-3 bg-black/80 px-3 py-2">
      <p aria-live="polite" className="font-source text-sm font-bold tabular-nums sm:text-base">{index + 1} / {slides.length}</p>
      <p className="hidden text-xs text-white/60 sm:block">← → o barra espaciadora para avanzar · Esc para salir</p>
    </div>
  </div>;
}
