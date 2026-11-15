import { useBackendHealth, type ConnectionOutcome } from '@/hooks/useBackendHealth';

const STATE_LABELS: Record<ConnectionOutcome, string> = {
  checking: 'Comprobando backend…',
  connected: 'Backend Conectado',
  unavailable: 'Backend No disponible',
};

const DOT_CLASSES: Record<ConnectionOutcome, string> = {
  checking: 'bg-amber-400 animate-pulse',
  connected: 'bg-emerald-400 animate-ping',
  unavailable: 'bg-slate-500',
};

const BUTTON_CLASSES: Record<ConnectionOutcome, string> = {
  checking: 'bg-card border-border text-text-secondary hover:bg-surface-hover',
  connected:
    'bg-success-soft border-success/40 text-success hover:bg-surface-hover',
  unavailable: 'bg-card border-border text-text-secondary hover:bg-surface-hover',
};

/**
 * Píldora pasiva de conexión del Header congelado (sin panel de
 * configuración de URL). El clic fuerza una comprobación manual del estado.
 */
export default function ConnectionIndicator() {
  const { outcome, checkNow } = useBackendHealth();

  return (
    <button
      type="button"
      onClick={checkNow}
      title={STATE_LABELS[outcome]}
      aria-label={`Estado de conexión con el backend: ${STATE_LABELS[outcome]}. Pulsa para comprobar de nuevo.`}
      className={`hidden sm:inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border font-noto transition-colors ${BUTTON_CLASSES[outcome]}`}
    >
      <span className={`w-2 h-2 rounded-full ${DOT_CLASSES[outcome]}`} aria-hidden />
      <span>{outcome === 'checking' ? 'Conectando…' : STATE_LABELS[outcome]}</span>
    </button>
  );
}
