import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, ImageIcon, Maximize2, Satellite, X } from 'lucide-react';
import {
  KAIROS_CLOSING,
  KAIROS_DATA_INFOGRAPHICS,
  KAIROS_DATA_SECTION,
  KAIROS_EDUCATION_BLOCK,
  KAIROS_FOOTER_IMAGE,
  KAIROS_HEADER_IMAGE,
  KAIROS_INTRO_PARAGRAPHS,
  KAIROS_INTRO_TITLE,
  KAIROS_SECTIONS,
  KAIROS_SUN_MESSAGE,
  KAIROS_WIDE_SLIDES,
  type KairosSection,
  type KairosSlide,
} from './kairosContent';
import FullscreenSlideshow from './FullscreenSlideshow';
import ExploreHint from './ExploreHint';
import PodcastPlayer from './PodcastPlayer';
import RiskDetectorGame from './RiskDetectorGame';
import RiskMatrix5x5 from './RiskMatrix5x5';

interface LightboxState { section: KairosSection; index: number }

const ROUND_BUTTON = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D9692B] text-[#FDECCD] transition-colors hover:bg-[#B8531E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B3314]';

const wrap = (index: number, length: number) => (index + length) % length;

interface InfographicCardProps {
  section: KairosSection;
  onExpand: (index: number) => void;
  audioActive: boolean;
  onToggleAudio: () => void;
  onAudioEnded: () => void;
}

function InfographicCard({ section, onExpand, audioActive, onToggleAudio, onAudioEnded }: InfographicCardProps) {
  const [index, setIndex] = useState(0);
  const slide = section.slides[index];
  return <article className="flex h-full flex-col rounded-2xl bg-[#EEDFC5] p-4 sm:p-6">
    <h2 className="mb-4 flex min-h-[3rem] items-center font-sans text-lg font-bold leading-snug text-[#5C260E] sm:text-xl">{section.title}</h2>
    <div className="mb-4 flex flex-col gap-3">
      <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl bg-[#E4D1B1]/60">
        <button type="button" onClick={() => onExpand(index)} className="block h-full w-full cursor-zoom-in" aria-label={`Ampliar infografía: ${slide.title}`}>
          <img src={slide.imageSrc} alt={slide.title} loading="lazy" decoding="async" className="block h-full w-full object-contain" />
        </button>
        <span aria-hidden className="pointer-events-none absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#5C260E]/75 text-[#FDECCD]"><Maximize2 className="h-3.5 w-3.5" /></span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => setIndex((value) => wrap(value - 1, section.slides.length))} aria-label={`Infografía anterior de ${section.title}`} className={ROUND_BUTTON}><ChevronLeft className="h-4 w-4" aria-hidden /></button>
        <div className="min-w-0 flex-1 px-1 text-center">
          <p className="truncate font-sans text-xs font-bold text-[#5C260E]" title={slide.title}>{slide.title}</p>
          <span className="font-source text-xs font-semibold text-[#8E431E]">{index + 1} / {section.slides.length}</span>
        </div>
        <button type="button" onClick={() => setIndex((value) => wrap(value + 1, section.slides.length))} aria-label={`Infografía siguiente de ${section.title}`} className={ROUND_BUTTON}><ChevronRight className="h-4 w-4" aria-hidden /></button>
      </div>
    </div>
    <p className="mt-1 flex-1 font-noto text-sm leading-relaxed text-[#4A2E1B] sm:text-justify">{section.description}</p>
    {section.audioSrc && <PodcastPlayer src={section.audioSrc} knownDuration={section.audioDurationSec} title={section.title} active={audioActive} onToggle={onToggleAudio} onEnded={onAudioEnded} />}
  </article>;
}

/**
 * Sun of the footer landscape (pie.webp, 1672 × 941): circle at x 776–990, top y 393.
 * Percent positioning keeps the overlay on the drawn sun at every width; the bottom
 * is clipped where the hills cover it. Hover, focus or tap reveals the closing message.
 */
function KairosSun() {
  return <div className="group absolute inset-0">
    <button
      type="button"
      aria-label="Mensaje final de KAIRÓS"
      aria-describedby="kairos-sun-message"
      className="kairos-sun absolute left-[46.4%] top-[41.8%] aspect-square w-[12.8%] cursor-help rounded-full focus-visible:outline-none"
    />
    <div
      id="kairos-sun-message"
      role="tooltip"
      className="pointer-events-none absolute bottom-[60%] left-1/2 z-10 w-[min(34rem,92vw)] -translate-x-1/2 translate-y-2 rounded-2xl border border-[#D9692B]/40 bg-[#FDECCD]/95 p-4 text-left opacity-0 shadow-xl transition duration-300 group-has-[button:hover]:translate-y-0 group-has-[button:hover]:opacity-100 group-has-[button:focus]:translate-y-0 group-has-[button:focus]:opacity-100 sm:p-5"
    >
      {KAIROS_SUN_MESSAGE.map((paragraph) => <p key={paragraph.slice(0, 24)} className="mb-2 font-noto text-xs leading-relaxed text-[#4A2E1B] last:mb-0 sm:text-sm">{paragraph}</p>)}
    </div>
  </div>;
}

/** KAIRÓS, Aula Pedagógica: infografías de prevención. */
export default function KairosClassroom() {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [headerFailed, setHeaderFailed] = useState(false);
  const [footerFailed, setFooterFailed] = useState(false);
  const [wideIndex, setWideIndex] = useState(0);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState<{ slides: KairosSlide[]; index: number; title: string } | null>(null);
  const closeFullscreen = useCallback(() => setFullscreen(null), []);
  const releaseAudio = useCallback(() => setActiveAudioId(null), []);
  const wide = KAIROS_WIDE_SLIDES[wideIndex] ?? null;
  const hasWide = KAIROS_WIDE_SLIDES.length > 0;

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null);
      if (event.key === 'ArrowLeft') setLightbox((state) => state && { ...state, index: wrap(state.index - 1, state.section.slides.length) });
      if (event.key === 'ArrowRight') setLightbox((state) => state && { ...state, index: wrap(state.index + 1, state.section.slides.length) });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const step = (delta: number) => setLightbox((state) => state && { ...state, index: wrap(state.index + delta, state.section.slides.length) });
  const current = lightbox ? lightbox.section.slides[lightbox.index] : null;

  return <section aria-label="KAIRÓS, Aula Pedagógica" className="flex w-full flex-col overflow-x-hidden bg-[#FDECCD] text-[#4A2E1B]">
    <ExploreHint />
    <header className="relative w-full select-none leading-none">
      {headerFailed
        ? <div aria-hidden className="aspect-[16/6] w-full bg-[#F6C88A]/40" />
        : <img src={KAIROS_HEADER_IMAGE} alt="" onError={() => setHeaderFailed(true)} className="block h-auto w-full" />}
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <h1 className="max-w-[78%] text-balance font-kairos text-3xl font-extrabold leading-[1.08] tracking-tight text-[#7B3314] sm:max-w-3xl sm:text-5xl md:text-6xl lg:text-7xl">KAIRÓS, Aula Pedagógica</h1>
      </div>
    </header>

    <div className="mx-auto mt-2 w-full max-w-3xl px-5 sm:mt-8 sm:px-8">
      <h2 className="mb-4 text-center font-sans text-lg font-bold text-[#7B3314] sm:text-xl">{KAIROS_INTRO_TITLE}</h2>
      <div className="space-y-4 font-noto text-sm leading-relaxed sm:text-justify sm:text-base">
        {KAIROS_INTRO_PARAGRAPHS.map((paragraph) => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
      </div>
    </div>

    <div className="mx-auto mt-10 w-full max-w-7xl space-y-10 px-4 sm:mt-16 sm:space-y-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {KAIROS_SECTIONS.map((section) => <InfographicCard
          key={section.id}
          section={section}
          onExpand={(index) => setLightbox({ section, index })}
          audioActive={activeAudioId === section.id}
          onToggleAudio={() => setActiveAudioId((current) => (current === section.id ? null : section.id))}
          onAudioEnded={releaseAudio}
        />)}
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        <div>
          <InfographicCard
            section={KAIROS_DATA_INFOGRAPHICS}
            onExpand={(index) => setLightbox({ section: KAIROS_DATA_INFOGRAPHICS, index })}
            audioActive={activeAudioId === KAIROS_DATA_INFOGRAPHICS.id}
            onToggleAudio={() => setActiveAudioId((current) => (current === KAIROS_DATA_INFOGRAPHICS.id ? null : KAIROS_DATA_INFOGRAPHICS.id))}
            onAudioEnded={releaseAudio}
          />
        </div>
        <div className="flex flex-col justify-center gap-8 px-1 py-2 sm:px-4 lg:col-span-2 lg:px-6">
          <div>
            <h2 className="mb-5 font-sans text-2xl font-bold leading-tight text-[#7B3314] sm:text-3xl">{KAIROS_EDUCATION_BLOCK.title}</h2>
            <div className="max-w-2xl space-y-4 font-noto text-sm leading-relaxed sm:text-justify sm:text-base">
              {KAIROS_EDUCATION_BLOCK.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
            </div>
          </div>
          <article className="rounded-2xl bg-[#EEDFC5] p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-sans text-lg font-bold leading-snug text-[#5C260E]"><Satellite className="h-5 w-5 shrink-0 text-[#D9692B]" aria-hidden />{KAIROS_DATA_SECTION.title}</h2>
            <ul className="space-y-2.5 font-noto text-sm leading-relaxed">
              {KAIROS_DATA_SECTION.rules.map((rule, index) => <li key={rule} className="flex gap-2.5"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D9692B] font-source text-[11px] font-bold text-[#FDECCD]">{index + 1}</span><span>{rule}</span></li>)}
            </ul>
          </article>
        </div>
      </div>

      <section aria-label="Aprendizaje Basado en Problemas" className="w-full rounded-2xl bg-[#EEDFC5] p-4 sm:p-8">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="font-sans text-xl font-bold text-[#5C260E] sm:text-2xl">Aprendizaje Basado en Problemas (ABP)</h2>
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button type="button" onClick={() => setFullscreen({ slides: KAIROS_WIDE_SLIDES, index: wideIndex, title: 'Aprendizaje Basado en Problemas (ABP)' })} disabled={!hasWide} className="inline-flex items-center gap-1.5 rounded-full bg-[#5C260E] px-3.5 py-2 font-sans text-xs font-bold text-[#FDECCD] transition-colors hover:bg-[#7B3314] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B3314]"><Expand className="h-4 w-4" aria-hidden />Pantalla completa</button>
            <button type="button" onClick={() => setWideIndex((value) => wrap(value - 1, KAIROS_WIDE_SLIDES.length))} disabled={!hasWide} aria-label="Infografía panorámica anterior" className={`${ROUND_BUTTON} disabled:cursor-not-allowed disabled:opacity-45`}><ChevronLeft className="h-4 w-4" aria-hidden /></button>
            <span className="min-w-[3rem] text-center font-source text-xs font-semibold text-[#8E431E]">{hasWide ? `${wideIndex + 1} / ${KAIROS_WIDE_SLIDES.length}` : '0 / 0'}</span>
            <button type="button" onClick={() => setWideIndex((value) => wrap(value + 1, KAIROS_WIDE_SLIDES.length))} disabled={!hasWide} aria-label="Infografía panorámica siguiente" className={`${ROUND_BUTTON} disabled:cursor-not-allowed disabled:opacity-45`}><ChevronRight className="h-4 w-4" aria-hidden /></button>
          </div>
        </div>
        <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-[#E4D1B1]/55">
          {wide
            ? <img src={wide.imageSrc} alt={wide.title} loading="lazy" className="block h-full w-full object-contain" />
            : <div className="space-y-2 px-6 text-center">
              <ImageIcon className="mx-auto h-8 w-8 text-[#B8531E]/70" aria-hidden />
              <p className="font-source text-sm font-bold tracking-wide text-[#7B3314] sm:text-base">Próximamente</p>
              <p className="font-noto text-xs text-[#6E3B21] sm:text-sm">Aquí aparecerán las infografías panorámicas de prevención (formato 1920 × 1080 px).</p>
            </div>}
        </div>
        {wide && <p className="mt-3 text-center font-sans text-sm font-bold text-[#5C260E]">{wide.title}</p>}
      </section>

      <RiskMatrix5x5 />
      <RiskDetectorGame />
    </div>

    <p className="mx-auto mb-8 mt-10 w-full max-w-3xl px-6 text-center font-noto text-xs font-medium leading-relaxed text-[#B8531E] sm:mb-12 sm:mt-16 sm:text-sm">{KAIROS_CLOSING}</p>

    <div className="relative w-full select-none leading-none">
      {footerFailed
        ? <div aria-hidden className="aspect-[16/5] w-full bg-[#EBC374]/30" />
        : <>
          <img src={KAIROS_FOOTER_IMAGE} alt="" loading="lazy" onError={() => setFooterFailed(true)} className="block h-auto w-full" />
          <KairosSun />
        </>}
    </div>

    {lightbox && current && <div role="dialog" aria-modal="true" aria-label={current.title} className="fixed inset-0 z-[60] flex items-center justify-center bg-[#3B1E0D]/80 p-3 sm:p-6" onClick={() => setLightbox(null)}>
      <div className="flex max-h-[94dvh] w-full max-w-2xl flex-col gap-3 rounded-2xl bg-[#FDECCD] p-3 text-[#4A2E1B] sm:p-5" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#B8531E]">{lightbox.section.title}</p>
            <h3 className="truncate font-sans text-sm font-bold text-[#5C260E] sm:text-base">{current.title}</h3>
          </div>
          <button type="button" onClick={() => { setFullscreen({ slides: lightbox.section.slides, index: lightbox.index, title: lightbox.section.title }); setLightbox(null); }} className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#5C260E] px-3 py-1.5 font-sans text-xs font-bold text-[#FDECCD] hover:bg-[#7B3314]"><Expand className="h-3.5 w-3.5" aria-hidden />Pantalla completa</button>
          <button type="button" onClick={() => setLightbox(null)} aria-label="Cerrar vista ampliada" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEDFC5] text-[#5C260E] hover:bg-[#E4D1B1]"><X className="h-4 w-4" aria-hidden /></button>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-xl bg-[#EEDFC5] p-2">
          <img src={current.imageSrc} alt={current.title} className="block max-h-[72dvh] w-auto object-contain" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => step(-1)} className="flex items-center gap-1.5 rounded-xl bg-[#D9692B] px-3.5 py-2 font-sans text-xs font-bold text-[#FDECCD] hover:bg-[#B8531E]"><ChevronLeft className="h-4 w-4" aria-hidden />Anterior</button>
          <span className="font-source text-xs font-bold text-[#5C260E]">{lightbox.index + 1} / {lightbox.section.slides.length}</span>
          <button type="button" onClick={() => step(1)} className="flex items-center gap-1.5 rounded-xl bg-[#D9692B] px-3.5 py-2 font-sans text-xs font-bold text-[#FDECCD] hover:bg-[#B8531E]">Siguiente<ChevronRight className="h-4 w-4" aria-hidden /></button>
        </div>
      </div>
    </div>}

    {fullscreen && <FullscreenSlideshow slides={fullscreen.slides} startIndex={fullscreen.index} title={fullscreen.title} onClose={closeFullscreen} />}
  </section>;
}
