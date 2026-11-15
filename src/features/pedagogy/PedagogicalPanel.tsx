import { useState } from 'react';
import { BellRing, BookOpenText, CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, Flame, Phone, Satellite, ShieldAlert, Thermometer } from 'lucide-react';
import RiskMatrixPanel from '@/features/comparison/RiskMatrixPanel';

const LESSONS = [
  {
    title: 'Un foco de calor es una observación',
    subtitle: 'Qué registra un sensor satelital',
    description: 'Un foco de calor representa una anomalía térmica detectada por un sensor. Por sí solo no confirma un incendio forestal ni identifica un evento independiente.',
    takeaway: 'Interpreta cada punto como una observación que requiere contexto; no como un incendio confirmado.',
    icon: Flame,
    tone: 'text-warning border-warning/40 bg-warning-soft',
  },
  {
    title: 'MODIS y VIIRS observan de manera diferente',
    subtitle: 'Dos instrumentos, dos conjuntos de detecciones',
    description: 'Los instrumentos tienen resoluciones nominales y horarios orbitales distintos. VIIRS trabaja aproximadamente a 375 m en su banda I y MODIS aproximadamente a 1 km en el nadir.',
    takeaway: 'Compara los conteos por separado. Una diferencia de cantidad no demuestra por sí sola más incendios reales.',
    icon: Satellite,
    tone: 'text-info border-info/40 bg-info-soft',
  },
  {
    title: 'La confianza conserva su valor original',
    subtitle: 'Categorías y números no son intercambiables',
    description: 'El campo confidence_raw se muestra tal como llega. La etiqueta armonizada de la versión 1.0 se deriva solo mediante las reglas documentadas del proyecto.',
    takeaway: 'No reemplaces el dato original ni inventes una escala de confianza para comparar sensores.',
    icon: ShieldAlert,
    tone: 'text-warning border-warning/40 bg-warning-soft',
  },
  {
    title: 'FRP mide potencia radiativa',
    subtitle: 'Un valor ausente no equivale a cero',
    description: 'La potencia radiativa del fuego (FRP) se expresa en megavatios cuando está disponible. Describe energía radiativa en el momento de la observación, no el área quemada.',
    takeaway: 'Si FRP es null, comunícalo como “No disponible”; no lo sustituyas por cero.',
    icon: Thermometer,
    tone: 'text-danger border-danger/40 bg-danger-soft',
  },
] as const;

/** Líneas nacionales de Colombia (las mismas del ejemplo, sin números locales no verificados). */
const EMERGENCY_LINES = [
  { name: 'Cuerpo de Bomberos', number: '119', desc: 'Atención de incendios forestales y rescate.', color: 'text-danger' },
  { name: 'Línea de Emergencias Nacional', number: '123', desc: 'Policía Nacional y articulación de la respuesta inmediata.', color: 'text-info' },
  { name: 'Defensa Civil Colombiana', number: '144', desc: 'Apoyo logístico, rescate y voluntariado comunitario.', color: 'text-accent' },
  { name: 'Cruz Roja Colombiana', number: '132', desc: 'Primeros auxilios y atención humanitaria.', color: 'text-danger' },
];

const DICTIONARY = [
  { term: '¿Qué es un foco de calor?', tone: 'text-accent', text: 'No siempre es una llama gigante. Es un punto del terreno mucho más caliente que lo que lo rodea: puede ser una quema de rastrojo, carbón encendido o el inicio de un incendio forestal.' },
  { term: '¿Qué son MODIS y VIIRS?', tone: 'text-info', text: 'Son instrumentos científicos a bordo de satélites que dan vueltas a la Tierra. Miden el calor de la superficie de día y de noche y así detectan zonas calientes que desde el suelo aún no se ven.' },
  { term: '¿Por qué importan el DAGRAN y la UNGRD?', tone: 'text-success', text: 'Son las entidades del Gobierno (en Antioquia y en toda Colombia) que coordinan la prevención y la respuesta a emergencias junto con los bomberos y brigadistas.' },
  { term: '¿Qué es una cadena de Markov?', tone: 'text-predictive', text: 'Es un modelo matemático que estima la probabilidad de pasar de un estado a otro (por ejemplo, de “sin detecciones” a “actividad alta”) a partir de lo que ocurrió antes. Aquí se mostrará cuando el equipo publique un modelo evaluado.' },
];

const QUIZ = [
  {
    question: '¿Qué significa un punto de calor en el mapa?',
    options: ['Un incendio confirmado', 'Una anomalía térmica observada por un sensor', 'El área quemada de un evento'],
    answer: 1,
    explanation: 'Es una anomalía térmica observada; no confirma por sí sola un incendio ni un evento independiente.',
  },
  {
    question: '¿Cómo se deben comparar los conteos MODIS y VIIRS?',
    options: ['Sumándolos como incendios', 'Manteniéndolos separados por instrumento', 'Convirtiéndolos a una misma cifra estimada'],
    answer: 1,
    explanation: 'Los instrumentos difieren en resolución y horario orbital; el proyecto presenta sus detecciones por separado.',
  },
  {
    question: '¿Qué se debe mostrar cuando FRP llega como null?',
    options: ['0 MW', 'El promedio del conjunto', 'No disponible'],
    answer: 2,
    explanation: 'Un valor nulo representa dato no disponible y no se debe convertir en cero.',
  },
  {
    question: 'Un vecino quiere quemar pasto seco para “limpiar rápido el lote” en temporada seca. ¿Qué le recomiendas?',
    options: ['Hacerlo al mediodía, cuando el sol calienta más', 'Explicarle que el viento puede llevar chispas al monte y sugerirle alternativas sin fuego', 'No decir nada: cada quien decide en su terreno'],
    answer: 1,
    explanation: 'En época seca una ráfaga de viento puede convertir una quema pequeña en un incendio forestal. Hay alternativas sin fuego, como picar el material y dejarlo como abono.',
  },
  {
    question: 'Ves una columna de humo saliendo de una reserva natural de tu municipio. ¿Cuál es el primer paso?',
    options: ['Llamar al 119 (Bomberos) o al 123 y dar la ubicación lo más exacta posible', 'Esperar a la noche para ver si se apaga solo', 'Subir solo con un balde de agua sin avisar a nadie'],
    answer: 0,
    explanation: 'Avisar pronto a los bomberos permite que la respuesta llegue antes de que el fuego crezca. No te expongas solo al fuego.',
  },
] as const;

export default function PedagogicalPanel() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const lesson = LESSONS[lessonIndex];
  const LessonIcon = lesson.icon;
  const question = QUIZ[quizIndex];
  const isCorrect = selectedAnswer === question.answer;

  const moveQuiz = () => {
    setQuizIndex((index) => (index + 1) % QUIZ.length);
    setSelectedAnswer(null);
    setSubmitted(false);
  };

  return <main className="mx-auto w-full max-w-6xl space-y-8 p-4 text-text-primary sm:p-6 lg:p-8">
    <header className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <span className="rounded-full border border-success/30 bg-success-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-success">Aula científica</span>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Aprende a leer las observaciones</h1>
      <p className="mt-2 max-w-3xl text-xs leading-5 text-text-secondary sm:text-sm">Conceptos básicos para interpretar MODIS, VIIRS, confianza y FRP con cuidado científico.</p>
    </header>

    <section aria-labelledby="lesson-heading" className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div><p className="font-noto text-xs font-bold uppercase tracking-wider text-accent">Lección {lessonIndex + 1} de {LESSONS.length}</p><h2 id="lesson-heading" className="mt-1 font-noto text-xl font-bold sm:text-2xl">Conceptos satelitales</h2></div>
        <div className="flex gap-1.5" aria-label="Seleccionar lección">{LESSONS.map((item, index) => <button key={item.title} type="button" aria-label={`Lección ${index + 1}: ${item.title}`} aria-current={lessonIndex === index ? 'step' : undefined} onClick={() => setLessonIndex(index)} className={`h-2 rounded-full transition-all ${lessonIndex === index ? 'w-7 bg-accent-solid' : 'w-2 bg-surface-hover hover:bg-surface-hover'}`} />)}</div>
      </div>
      <article className={`space-y-4 rounded-2xl border p-6 sm:p-8 ${lesson.tone}`}>
        <div className="flex items-start gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-surface"><LessonIcon className="h-5 w-5" /></span><div><p className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{lesson.subtitle}</p><h3 className="mt-1 text-lg font-extrabold sm:text-xl">{lesson.title}</h3></div></div>
        <p className="mt-4 text-xs leading-6 text-text-primary sm:text-sm">{lesson.description}</p>
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-[11px] leading-5 text-text-primary"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /><span><strong>Para recordar: </strong>{lesson.takeaway}</span></p>
      </article>
      <div className="flex items-center justify-between gap-3"><button type="button" onClick={() => setLessonIndex((index) => (index - 1 + LESSONS.length) % LESSONS.length)} className="ignis-action ignis-action-secondary"><ChevronLeft className="h-3.5 w-3.5" />Anterior</button><span className="text-[10px] text-text-secondary">{lessonIndex + 1} / {LESSONS.length}</span>      <button type="button" onClick={() => setLessonIndex((index) => (index + 1) % LESSONS.length)} className="ignis-action ignis-action-primary">Siguiente<ChevronRight className="h-3.5 w-3.5" /></button></div>
    </section>

    <section aria-labelledby="quiz-heading" className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8">
      <div><h2 id="quiz-heading" className="flex items-center gap-2 font-noto text-xl font-bold sm:text-2xl"><CircleHelp className="h-5 w-5 text-accent" />Simulador de decisiones: ¿qué harías tú?</h2><p className="mt-1 text-[10px] text-text-secondary">Caso {quizIndex + 1} de {QUIZ.length}</p></div>
      <fieldset><legend className="text-sm font-medium text-text-primary">{question.question}</legend><div className="mt-3 space-y-2">{question.options.map((option, index) => { const correctOption = submitted && index === question.answer; const incorrectSelection = submitted && index === selectedAnswer && !isCorrect; return <button key={option} type="button" disabled={submitted} aria-pressed={selectedAnswer === index} onClick={() => setSelectedAnswer(index)} className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left text-xs transition ${correctOption ? 'border-success/40 bg-success-soft text-text-primary' : incorrectSelection ? 'border-danger/40 bg-danger-soft text-danger' : selectedAnswer === index ? 'border-warning/40 bg-warning-soft text-text-primary' : 'border-border bg-surface text-text-primary hover:border-accent'}`}><span>{option}</span>{correctOption && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}</button>; })}</div></fieldset>
      {submitted && <p role="status" className={`rounded-lg border p-3 text-xs leading-5 ${isCorrect ? 'border-success/40 bg-success-soft text-text-primary' : 'border-warning/40 bg-warning-soft text-text-primary'}`}>{isCorrect ? '¡Correcto! ' : 'Repasa esta idea. '}{question.explanation}</p>}
      {!submitted ? <button type="button" disabled={selectedAnswer === null} onClick={() => setSubmitted(true)} className="ignis-action ignis-action-primary">Revisar respuesta</button> : <button type="button" onClick={moveQuiz} className="ignis-action ignis-action-secondary">{quizIndex === QUIZ.length - 1 ? 'Volver al inicio' : 'Siguiente pregunta'}</button>}
    </section>

    <section aria-labelledby="emergency-lines-heading" className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 id="emergency-lines-heading" className="flex items-center gap-2 font-noto text-xl font-bold"><BellRing className="h-5 w-5 text-danger" aria-hidden />Líneas Directas de Emergencia en Colombia</h2>
          <p className="mt-1 text-xs text-text-secondary">Guarda estos números en tu celular. Úsalos solo ante una emergencia real.</p>
        </div>
        <span className="rounded-full border border-danger/40 bg-danger-soft px-3 py-1 font-noto text-[11px] font-semibold text-danger">Líneas nacionales</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {EMERGENCY_LINES.map((line) => <div key={line.number} className="flex flex-col justify-between space-y-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent">
          <div>
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold">{line.name}</span><span className={`font-source text-lg font-black ${line.color}`}>{line.number}</span></div>
            <p className="mt-1.5 text-[11px] leading-snug text-text-secondary">{line.desc}</p>
          </div>
          <a href={`tel:${line.number}`} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border-strong bg-card px-3 py-2 text-xs font-bold transition-colors hover:border-accent hover:bg-accent-solid hover:text-accent-fg"><Phone className="h-3.5 w-3.5" aria-hidden />Marcar {line.number}</a>
        </div>)}
      </div>
      <p className="text-[11px] text-text-secondary">La disponibilidad y el enrutamiento pueden variar según el operador y la ubicación. Las detecciones satelitales no verifican por sí solas un incidente.</p>
    </section>

    <section aria-labelledby="dictionary-heading" className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8">
      <h2 id="dictionary-heading" className="flex items-center gap-2 font-noto text-xl font-bold"><BookOpenText className="h-5 w-5 text-info" aria-hidden />Diccionario Sin Enredos: ¿Qué Significan Estas Palabras?</h2>
      <div className="grid grid-cols-1 gap-4 text-xs sm:text-sm md:grid-cols-2">
        {DICTIONARY.map((entry) => <div key={entry.term} className="space-y-1 rounded-2xl border border-border bg-surface p-4"><h3 className={`font-bold ${entry.tone}`}>{entry.term}</h3><p className="text-text-secondary">{entry.text}</p></div>)}
      </div>
    </section>

    <section aria-label="Matriz educativa de gestión del riesgo"><RiskMatrixPanel /></section>
    <p className="text-[10px] leading-4 text-text-secondary">Contenido educativo. La matriz es un esquema ordinal de planificación y no una probabilidad ni una instrucción de respuesta a emergencias.</p>
  </main>;
}
