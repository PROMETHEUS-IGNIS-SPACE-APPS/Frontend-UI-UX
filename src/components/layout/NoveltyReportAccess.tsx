import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCopy, Crosshair, Flame, Mail, MapPin, MessageCircle, PhoneCall, Send, Share2, UserCheck, Users, X } from 'lucide-react';

/**
 * “Reportar Novedad”: formulario de la carpeta `ejemplo`. El Backend-API no
 * tiene endpoint para recibir reportes, así que nada se envía ni se guarda: al
 * terminar se arma un resumen que la persona copia o comparte con el 123, los
 * bomberos o el Consejo Municipal de Gestión del Riesgo.
 */

interface Sector { id: string; label: string; municipality: string; lat: number; lon: number }

/** Puntos de referencia aproximados (cabeceras municipales) por subregión de Antioquia. */
const SECTORS: Sector[] = [
  { id: 'aburra-medellin', label: 'Valle de Aburrá [Medellín]', municipality: 'Medellín', lat: 6.2442, lon: -75.5812 },
  { id: 'aburra-caldas', label: 'Valle de Aburrá [Caldas]', municipality: 'Caldas', lat: 6.091, lon: -75.6355 },
  { id: 'occidente', label: 'Occidente [San Jerónimo]', municipality: 'San Jerónimo', lat: 6.4436, lon: -75.7278 },
  { id: 'bajo-cauca', label: 'Bajo Cauca [Caucasia]', municipality: 'Caucasia', lat: 7.985, lon: -75.195 },
  { id: 'uraba', label: 'Urabá [Turbo / Apartadó]', municipality: 'Turbo / Apartadó', lat: 7.988, lon: -76.681 },
  { id: 'oriente', label: 'Oriente [Rionegro]', municipality: 'Rionegro', lat: 6.1552, lon: -75.3737 },
  { id: 'nordeste', label: 'Nordeste [Segovia]', municipality: 'Segovia', lat: 7.053, lon: -74.6995 },
  { id: 'magdalena', label: 'Magdalena Medio [Puerto Berrío]', municipality: 'Puerto Berrío', lat: 6.491, lon: -74.404 },
];

type Intensity = 'low' | 'moderate' | 'high' | 'critical' | 'unknown';

/** Estimación visual. No se piden megavatios: la FRP solo la mide un sensor satelital. */
const INTENSITY: { id: Exclude<Intensity, 'unknown'>; title: string; description: string; tone: string }[] = [
  { id: 'low', title: 'Baja', description: 'Fuego superficial o de sotobosque, humo claro.', tone: 'border-success bg-success-soft' },
  { id: 'moderate', title: 'Moderada', description: 'Llamas visibles en pastos o matorrales.', tone: 'border-warning bg-warning-soft' },
  { id: 'high', title: 'Alta', description: 'Avance rápido, calor intenso, alcanza árboles.', tone: 'border-orange-500 bg-orange-500/10' },
  { id: 'critical', title: 'Crítica / extrema', description: 'Fuego de copas descontrolado, pavesas a distancia.', tone: 'border-danger bg-danger-soft' },
];

const INPUT = 'w-full rounded-xl border border-border-strong bg-input-bg px-3 py-2 text-text-primary transition-colors placeholder:text-text-secondary focus:border-accent focus:outline-none';
const CHIP_BASE = 'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors';

function Step({ n, title, aside, children }: { n: number; title: string; aside?: ReactNode; children: ReactNode }) {
  return <section className={`space-y-2.5 ${n > 1 ? 'border-t border-border pt-4' : ''}`}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 font-noto text-xs font-bold"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent">{n}</span>{title}</h3>
      {aside}
    </div>
    {children}
  </section>;
}

export default function NoveltyReportAccess() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasExperience, setHasExperience] = useState(false);
  const [experience, setExperience] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [gps, setGps] = useState<{ busy: boolean; notice?: string }>({ busy: false });
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [intensity, setIntensity] = useState<Intensity>('unknown');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const close = () => { setIsOpen(false); setSummary(null); setError(null); setCopied(false); };

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const chooseSector = (sector: Sector) => { setSectorId(sector.id); setLatitude(sector.lat.toFixed(4)); setLongitude(sector.lon.toFixed(4)); setGps({ busy: false }); };

  const locate = () => {
    setError(null);
    if (!navigator.geolocation) { setError('Este navegador no permite obtener la ubicación. Escribe las coordenadas o elige un sector.'); return; }
    setGps({ busy: true });
    navigator.geolocation.getCurrentPosition(
      (position) => { setLatitude(position.coords.latitude.toFixed(5)); setLongitude(position.coords.longitude.toFixed(5)); setSectorId(''); setGps({ busy: false, notice: `Ubicación obtenida (precisión ±${Math.round(position.coords.accuracy)} m).` }); },
      (failure) => { setGps({ busy: false }); setError(failure.code === 1 ? 'Permiso de ubicación denegado. Escribe las coordenadas o elige un sector.' : 'No fue posible obtener la ubicación. Escribe las coordenadas o elige un sector.'); },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const lat = Number(latitude.replace(',', '.'));
    const lon = Number(longitude.replace(',', '.'));
    if (!latitude.trim() || !longitude.trim() || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) { setError('Indica la ubicación: usa el GPS, elige un sector o escribe coordenadas decimales (ej. 6.2442 y -75.5812).'); return; }
    if (hasExperience && experience.trim().length < 3) { setError('Cuéntanos brevemente tu experiencia (por ejemplo, brigadista o Defensa Civil).'); return; }
    if (note.trim().length < 5) { setError('Describe lo que observas (mínimo 5 caracteres).'); return; }
    const sector = SECTORS.find((item) => item.id === sectorId);
    const level = INTENSITY.find((item) => item.id === intensity);
    const lines = [
      'REPORTE DE NOVEDAD — POSIBLE INCENDIO',
      `Fecha y hora: ${new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}`,
      `Ubicación: ${lat.toFixed(5)}, ${lon.toFixed(5)}${sector ? ` (referencia: ${sector.label})` : ''}`,
      `Mapa: https://www.google.com/maps?q=${lat.toFixed(5)},${lon.toFixed(5)}`,
      `Intensidad observada: ${level ? `${level.title} — ${level.description}` : 'No sabe / no responde'}`,
      `Observaciones: ${note.trim()}`,
      `Quien reporta: ${hasExperience ? `con experiencia (${experience.trim()})` : 'habitante o testigo'}${name.trim() ? ` · ${name.trim()}` : ''}${contact.trim() ? ` · ${contact.trim()}` : ''}`,
    ];
    setSummary(lines.join('\n'));
    setCopied(false);
  };

  const copy = async () => {
    if (!summary) return;
    try { await navigator.clipboard.writeText(summary); setCopied(true); } catch { setError('No se pudo copiar automáticamente: selecciona el texto y cópialo.'); }
  };
  const share = async () => {
    if (!summary) return;
    if (typeof navigator.share === 'function') { try { await navigator.share({ title: 'Reporte de novedad', text: summary }); } catch { /* la persona canceló */ } return; }
    void copy();
  };

  return <>
    <button type="button" onClick={() => setIsOpen(true)} aria-label="Reportar una novedad territorial" className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-accent-solid px-3 py-1.5 font-noto text-[11px] font-bold text-accent-fg shadow-sm transition-all hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="hidden sm:inline">Reportar Novedad</span><span className="sm:hidden">Reportar</span>
    </button>

    {isOpen && <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="novelty-title" className="flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border-strong bg-card text-xs text-text-primary shadow-2xl sm:max-h-[92vh] sm:rounded-2xl">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-surface px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 rounded-xl bg-accent-solid p-2.5 text-accent-fg shadow-md"><Flame className="h-4 w-4" aria-hidden /></span>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-accent">Reportar Novedad · Sistema Comunitario</span>
              <h2 id="novelty-title" className="font-noto text-base font-bold leading-snug">Reportar Novedad de Incendio Forestal</h2>
              <p className="mt-0.5 text-[11px] text-text-secondary">Arma un reporte claro para compartirlo con cuerpos de socorro y autoridades territoriales.</p>
            </div>
          </div>
          <button type="button" onClick={close} aria-label="Cerrar reporte de novedad" className="shrink-0 rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"><X className="h-4 w-4" aria-hidden /></button>
        </header>

        {summary === null ? <form onSubmit={submit} className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5" noValidate>
          <div className="flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger-soft p-3 text-[11px] leading-5">
            <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
            <p><strong>¿Hay fuego activo cerca de personas o viviendas?</strong> Llama primero al <a href="tel:123" className="font-bold text-danger underline">123</a> o a Bomberos <a href="tel:119" className="font-bold text-danger underline">119</a>. Este formulario no envía nada a la plataforma: al final podrás copiar o compartir el reporte.</p>
          </div>

          <Step n={1} title="Experiencia en Gestión del Riesgo">
            <p className="text-[11px] text-text-secondary">¿Tienes experiencia en gestión del riesgo o incendios forestales?</p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button type="button" aria-pressed={hasExperience} onClick={() => setHasExperience(true)} className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-all ${hasExperience ? 'border-accent bg-accent-soft font-bold' : 'border-border-strong bg-surface font-medium text-text-secondary hover:bg-surface-hover'}`}><UserCheck className={`h-4 w-4 shrink-0 ${hasExperience ? 'text-accent' : ''}`} aria-hidden />Sí, cuento con experiencia</button>
              <button type="button" aria-pressed={!hasExperience} onClick={() => setHasExperience(false)} className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-all ${!hasExperience ? 'border-info bg-info-soft font-bold' : 'border-border-strong bg-surface font-medium text-text-secondary hover:bg-surface-hover'}`}><Users className={`h-4 w-4 shrink-0 ${!hasExperience ? 'text-info' : ''}`} aria-hidden />No, soy habitante o testigo civil</button>
            </div>
            {hasExperience && <label className="block space-y-1 pt-1"><span className="block text-[11px] text-text-secondary">Detalle de tu experiencia (Bomberos, brigada forestal, Defensa Civil, CMGRD…):</span><input value={experience} onChange={(event) => setExperience(event.target.value)} placeholder="Ej: brigadista forestal municipal" className={INPUT} /></label>}
          </Step>

          <Step n={2} title="Ubicación del Incendio" aside={<button type="button" onClick={locate} disabled={gps.busy} className="inline-flex items-center gap-1.5 rounded-lg border border-accent bg-accent-soft px-3 py-1.5 text-[11px] font-semibold text-accent transition-colors hover:opacity-90 disabled:opacity-60"><Crosshair className={`h-3.5 w-3.5 ${gps.busy ? 'animate-spin' : ''}`} aria-hidden />{gps.busy ? 'Obteniendo ubicación…' : 'Obtener mi ubicación GPS'}</button>}>
            {gps.notice && <p className="flex items-center gap-1.5 rounded-lg border border-success/30 bg-success-soft px-3 py-1.5 text-[11px] text-success"><CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />{gps.notice}</p>}
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1"><span className="block text-[11px] font-medium text-text-secondary">Latitud (°N):</span><input inputMode="decimal" value={latitude} onChange={(event) => { setLatitude(event.target.value); setSectorId(''); }} placeholder="6.2442" className={`${INPUT} font-source tabular-nums`} /></label>
              <label className="space-y-1"><span className="block text-[11px] font-medium text-text-secondary">Longitud (°W):</span><input inputMode="decimal" value={longitude} onChange={(event) => { setLongitude(event.target.value); setSectorId(''); }} placeholder="-75.5812" className={`${INPUT} font-source tabular-nums`} /></label>
            </div>
            <p className="text-[11px] text-text-secondary">O selecciona un sector de referencia en Antioquia (ubicación aproximada de la cabecera municipal):</p>
            <div className="flex flex-wrap gap-1.5">
              {SECTORS.map((sector) => <button key={sector.id} type="button" aria-pressed={sectorId === sector.id} onClick={() => chooseSector(sector)} className={`${CHIP_BASE} ${sectorId === sector.id ? 'border-accent bg-accent-soft font-bold text-accent' : 'border-border-strong bg-surface font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}><MapPin className="h-3 w-3 shrink-0" aria-hidden />{sector.label}</button>)}
            </div>
          </Step>

          <Step n={3} title="Datos de Contacto (opcional)">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1"><span className="block text-[11px] font-medium text-text-secondary">Nombre:</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre de quien reporta" autoComplete="name" className={INPUT} /></label>
              <label className="space-y-1"><span className="block text-[11px] font-medium text-text-secondary">Teléfono o correo:</span><input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Para que puedan contactarte" autoComplete="tel" className={INPUT} /></label>
            </div>
            <p className="text-[10px] text-text-secondary">Estos datos solo aparecen en el resumen que tú decides compartir; la plataforma no los guarda.</p>
          </Step>

          <Step n={4} title="Intensidad del Incendio (opcional)" aside={<span className="text-[11px] italic text-text-secondary">Estimación visual del fuego</span>}>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {INTENSITY.map((option) => <button key={option.id} type="button" aria-pressed={intensity === option.id} onClick={() => setIntensity(option.id)} className={`space-y-1 rounded-xl border p-3 text-left transition-all ${intensity === option.id ? option.tone : 'border-border-strong bg-surface hover:bg-surface-hover'}`}><span className="block text-xs font-bold">{option.title}</span><span className="block text-[11px] leading-snug text-text-secondary">{option.description}</span></button>)}
            </div>
            <button type="button" aria-pressed={intensity === 'unknown'} onClick={() => setIntensity('unknown')} className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all ${intensity === 'unknown' ? 'border-border-strong bg-surface-hover ring-1 ring-border-strong' : 'border-border bg-surface hover:bg-surface-hover'}`}><span><span className="block text-xs font-bold">No sabe / No responde</span><span className="block text-[11px] text-text-secondary">Sin estimación visual o visibilidad obstruida</span></span><span className="shrink-0 rounded border border-border-strong bg-card px-2 py-0.5 text-[10px] font-bold text-text-secondary">N/A</span></button>
          </Step>

          <Step n={5} title="Observaciones y Daños Conocidos">
            <label className="block space-y-1"><span className="block text-[11px] font-medium text-text-secondary">¿Qué estás viendo?</span><textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Personas o viviendas cercanas, cultivos, fuentes de agua, tipo de vegetación y hacia dónde va el humo o el viento…" className={INPUT} /></label>
          </Step>

          {error && <p role="alert" className="flex items-center gap-2 rounded-xl border border-danger/40 bg-danger-soft px-3 py-2 text-[11px] text-danger"><AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />{error}</p>}

          <div className="flex items-center justify-end gap-2.5 border-t border-border pt-3">
            <button type="button" onClick={close} className="rounded-xl border border-border-strong bg-surface px-4 py-2 font-medium hover:bg-surface-hover">Cancelar</button>
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-xl bg-accent-solid px-4 py-2 font-noto font-bold text-accent-fg shadow-md hover:opacity-90"><Send className="h-3.5 w-3.5" aria-hidden />Preparar reporte</button>
          </div>
        </form>

        : <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          <p className="flex items-start gap-2 rounded-xl border border-success/40 bg-success-soft p-3 text-[11px] leading-5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /><span>Tu reporte está listo. <strong>Todavía no se ha enviado a nadie:</strong> cópialo o compártelo con el 123, los bomberos o el Consejo Municipal de Gestión del Riesgo de tu municipio.</span></p>
          <pre aria-label="Resumen del reporte" className="whitespace-pre-wrap break-words rounded-xl border border-border bg-surface p-3 font-source text-[11px] leading-5 text-text-primary">{summary}</pre>
          {error && <p role="alert" className="rounded-xl border border-danger/40 bg-danger-soft px-3 py-2 text-[11px] text-danger">{error}</p>}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button type="button" onClick={() => void copy()} className="flex items-center justify-center gap-1.5 rounded-xl bg-accent-solid px-3 py-2.5 font-bold text-accent-fg hover:opacity-90"><ClipboardCopy className="h-3.5 w-3.5" aria-hidden />{copied ? '¡Copiado!' : 'Copiar'}</button>
            <a href={`https://wa.me/?text=${encodeURIComponent(summary)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 rounded-xl border border-success/50 bg-success-soft px-3 py-2.5 font-bold text-success hover:opacity-90"><MessageCircle className="h-3.5 w-3.5" aria-hidden />WhatsApp</a>
            <a href={`mailto:?subject=${encodeURIComponent('Reporte de novedad — posible incendio')}&body=${encodeURIComponent(summary)}`} className="flex items-center justify-center gap-1.5 rounded-xl border border-info/50 bg-info-soft px-3 py-2.5 font-bold text-info hover:opacity-90"><Mail className="h-3.5 w-3.5" aria-hidden />Correo</a>
            <button type="button" onClick={() => void share()} className="flex items-center justify-center gap-1.5 rounded-xl border border-border-strong bg-surface px-3 py-2.5 font-bold hover:bg-surface-hover"><Share2 className="h-3.5 w-3.5" aria-hidden />Compartir</button>
          </div>
          <a href="tel:123" className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-red-500"><PhoneCall className="h-3.5 w-3.5" aria-hidden />Llamar al 123</a>
          <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
            <button type="button" onClick={() => setSummary(null)} className="rounded-xl border border-border-strong bg-surface px-4 py-2 font-medium hover:bg-surface-hover">Editar reporte</button>
            <button type="button" onClick={close} className="rounded-xl bg-accent-solid px-4 py-2 font-bold text-accent-fg hover:opacity-90">Listo</button>
          </div>
        </div>}
      </section>
    </div>}
  </>;
}
