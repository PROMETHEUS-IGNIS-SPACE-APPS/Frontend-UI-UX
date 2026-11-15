import { useEffect, useState } from 'react';
import { MousePointerClick } from 'lucide-react';

/** Delay before movement can dismiss the hint: the pointer is usually still moving from the tab click. */
const ARM_DELAY_MS = 1200;
const AUTO_HIDE_MS = 9000;
const FADE_MS = 400;

/** Brief invitation to interact, shown when entering the Aula; fades out on the first mouse move, touch, scroll or key. */
export default function ExploreHint() {
  const [phase, setPhase] = useState<'visible' | 'leaving' | 'gone'>('visible');

  useEffect(() => {
    if (phase !== 'visible') return undefined;
    const leave = () => setPhase('leaving');
    const events = ['mousemove', 'touchstart', 'wheel', 'keydown'] as const;
    const arm = window.setTimeout(() => events.forEach((name) => window.addEventListener(name, leave, { once: true, passive: true })), ARM_DELAY_MS);
    const auto = window.setTimeout(leave, AUTO_HIDE_MS);
    return () => {
      window.clearTimeout(arm);
      window.clearTimeout(auto);
      events.forEach((name) => window.removeEventListener(name, leave));
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'leaving') return undefined;
    const timer = window.setTimeout(() => setPhase('gone'), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === 'gone') return null;

  return <div role="status" className={`pointer-events-none fixed inset-x-0 top-24 z-50 flex justify-center px-4 transition-all duration-[400ms] ${phase === 'leaving' ? '-translate-y-2 opacity-0' : 'translate-y-0 opacity-100'}`}>
    <div className="flex max-w-md items-start gap-3 rounded-2xl border border-[#D9692B]/50 bg-[#FDECCD] px-4 py-3 text-[#4A2E1B] shadow-xl">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D9692B] text-[#FDECCD]"><MousePointerClick className="h-5 w-5" aria-hidden /></span>
      <div>
        <p className="font-sans text-sm font-bold text-[#7B3314]">¡Explora el Aula!</p>
        <p className="font-noto text-xs leading-relaxed sm:text-sm">Interactúa con todo: amplía las infografías, escucha los podcasts, juega… y pasa el cursor por el sol del paisaje final.</p>
      </div>
    </div>
  </div>;
}
