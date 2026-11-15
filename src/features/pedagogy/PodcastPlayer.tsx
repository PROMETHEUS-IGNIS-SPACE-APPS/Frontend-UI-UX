import { useEffect, useRef, useState } from 'react';
import { Headphones, Pause, Play } from 'lucide-react';

interface PodcastPlayerProps {
  src: string;
  title: string;
  /** Only one podcast plays at a time; the parent decides which one is active. */
  active: boolean;
  onToggle: () => void;
  onEnded: () => void;
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

export default function PodcastPlayer({ src, title, active, onToggle, onEnded }: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (active) {
      // play() rejects when the browser blocks playback or the file fails; release the active slot.
      audio.play()?.catch(() => onEnded());
    } else if (!audio.paused) {
      audio.pause();
    }
  }, [active, onEnded]);

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return <div className="mt-4 border-t border-[#5C260E]/10 pt-3">
    <p className="mb-2 flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-[#8E431E]"><Headphones className="h-3.5 w-3.5" aria-hidden />Podcast</p>
    <audio
      ref={audioRef}
      src={src}
      preload="metadata"
      onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
      onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
      onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
      onEnded={() => { setCurrentTime(0); onEnded(); }}
    />
    <div className="flex items-center gap-3 rounded-xl bg-[#E4D1B1]/60 px-3 py-2">
      <button type="button" onClick={onToggle} aria-label={active ? `Pausar podcast de ${title}` : `Reproducir podcast de ${title}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D9692B] text-[#FDECCD] transition-colors hover:bg-[#B8531E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B3314]">
        {active ? <Pause className="h-3.5 w-3.5" aria-hidden /> : <Play className="ml-0.5 h-3.5 w-3.5" aria-hidden />}
      </button>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(currentTime, duration || 0)}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (audioRef.current && Number.isFinite(next)) {
            audioRef.current.currentTime = next;
            setCurrentTime(next);
          }
        }}
        aria-label={`Posición del podcast de ${title}`}
        className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full accent-[#D9692B]"
        style={{ background: `linear-gradient(to right, #D9692B ${progress}%, #CDB48C ${progress}%)` }}
      />
      <span className="shrink-0 font-source text-[11px] font-semibold tabular-nums text-[#8E431E]">{formatTime(currentTime)} / {formatTime(duration)}</span>
    </div>
  </div>;
}
