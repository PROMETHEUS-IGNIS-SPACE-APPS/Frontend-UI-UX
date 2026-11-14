import { useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, Flame, Satellite, ShieldAlert, Thermometer } from 'lucide-react';
import RiskMatrixPanel from '@/features/comparison/RiskMatrixPanel';

const LESSONS = [
  {
    title: 'Un foco de calor es una observación',
    subtitle: 'Qué registra un sensor satelital',
    description: 'Un foco de calor representa una anomalía térmica detectada por un sensor. Por sí solo no confirma un incendio forestal ni identifica un evento independiente.',
    takeaway: 'Interpreta cada punto como una observación que requiere contexto; no como un incendio confirmado.',
    icon: Flame,
    tone: 'text-orange-300 border-orange-900/60 bg-orange-950/20',
  },
  {
    title: 'MODIS y VIIRS observan de manera diferente',
    subtitle: 'Dos instrumentos, dos conjuntos de detecciones',
    description: 'Los instrumentos tienen resoluciones nominales y horarios orbitales distintos. VIIRS trabaja aproximadamente a 375 m en su banda I y MODIS aproximadamente a 1 km en el nadir.',
    takeaway: 'Compara los conteos por separado. Una diferencia de cantidad no demuestra por sí sola más incendios reales.',
    icon: Satellite,
    tone: 'text-cyan-300 border-cyan-900/60 bg-cyan-950/20',
  },
  {
    title: 'La confianza conserva su valor original',
    subtitle: 'Categorías y números no son intercambiables',
    description: 'El campo confidence_raw se muestra tal como llega. La etiqueta armonizada de la versión 1.0 se deriva solo mediante las reglas documentadas del proyecto.',
    takeaway: 'No reemplaces el dato original ni inventes una escala de confianza para comparar sensores.',
    icon: ShieldAlert,
    tone: 'text-amber-300 border-amber-900/60 bg-amber-950/20',
  },
  {
    title: 'FRP mide potencia radiativa',
    subtitle: 'Un valor ausente no equivale a cero',
    description: 'La potencia radiativa del fuego (FRP) se expresa en megavatios cuando está disponible. Describe energía radiativa en el momento de la observación, no el área quemada.',
    takeaway: 'Si FRP es null, comunícalo como “No disponible”; no lo sustituyas por cero.',
    icon: Thermometer,
    tone: 'text-red-300 border-red-900/60 bg-red-950/20',
  },
] as const;

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

  return <main className="mx-auto w-full max-w-[1200px] space-y-5 p-4 text-slate-100 sm:p-6">
    <header className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5 sm:p-7">
      <span className="rounded-full border border-emerald-800/60 bg-emerald-950/30 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide text-emerald-300">Aula científica</span>
      <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Aprende a leer las observaciones</h1>
      <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-400 sm:text-sm">Conceptos básicos para interpretar MODIS, VIIRS, confianza y FRP con cuidado científico.</p>
    </header>

    <section aria-labelledby="lesson-heading" className="space-y-4 rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-800 pb-4">
        <div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-300">Lección {lessonIndex + 1} de {LESSONS.length}</p><h2 id="lesson-heading" className="mt-1 text-lg font-semibold">Conceptos satelitales</h2></div>
        <div className="flex gap-1.5" aria-label="Seleccionar lección">{LESSONS.map((item, index) => <button key={item.title} type="button" aria-label={`Lección ${index + 1}: ${item.title}`} aria-current={lessonIndex === index ? 'step' : undefined} onClick={() => setLessonIndex(index)} className={`h-2 rounded-full transition-all ${lessonIndex === index ? 'w-7 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-500'}`} />)}</div>
      </div>
      <article className={`rounded-xl border p-4 sm:p-6 ${lesson.tone}`}>
        <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/20"><LessonIcon className="h-5 w-5" /></span><div><p className="text-[9px] font-semibold uppercase tracking-wider opacity-75">{lesson.subtitle}</p><h3 className="mt-1 text-base font-bold sm:text-lg">{lesson.title}</h3></div></div>
        <p className="mt-4 text-xs leading-6 text-slate-200 sm:text-sm">{lesson.description}</p>
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-white/10 bg-black/20 p-3 text-[11px] leading-5 text-slate-100"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /><span><strong>Para recordar: </strong>{lesson.takeaway}</span></p>
      </article>
      <div className="flex items-center justify-between gap-3"><button type="button" onClick={() => setLessonIndex((index) => (index - 1 + LESSONS.length) % LESSONS.length)} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-[10px] font-semibold text-slate-300 hover:bg-slate-800"><ChevronLeft className="h-3.5 w-3.5" />Anterior</button><span className="text-[9px] text-slate-500">{lessonIndex + 1} / {LESSONS.length}</span><button type="button" onClick={() => setLessonIndex((index) => (index + 1) % LESSONS.length)} className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-[10px] font-semibold text-slate-950 hover:bg-amber-400">Siguiente<ChevronRight className="h-3.5 w-3.5" /></button></div>
    </section>

    <section aria-labelledby="quiz-heading" className="space-y-4 rounded-2xl border border-slate-800 bg-[#0b1220] p-4 sm:p-6">
      <div><h2 id="quiz-heading" className="flex items-center gap-2 text-lg font-semibold"><CircleHelp className="h-5 w-5 text-amber-400" />Comprueba lo aprendido</h2><p className="mt-1 text-[10px] text-slate-500">Caso {quizIndex + 1} de {QUIZ.length}</p></div>
      <fieldset><legend className="text-sm font-medium text-slate-200">{question.question}</legend><div className="mt-3 space-y-2">{question.options.map((option, index) => { const correctOption = submitted && index === question.answer; const incorrectSelection = submitted && index === selectedAnswer && !isCorrect; return <button key={option} type="button" disabled={submitted} aria-pressed={selectedAnswer === index} onClick={() => setSelectedAnswer(index)} className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left text-xs transition ${correctOption ? 'border-emerald-700 bg-emerald-950/30 text-emerald-100' : incorrectSelection ? 'border-red-800 bg-red-950/25 text-red-100' : selectedAnswer === index ? 'border-amber-600 bg-amber-950/20 text-amber-100' : 'border-slate-800 bg-[#080d17] text-slate-300 hover:border-slate-600'}`}><span>{option}</span>{correctOption && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />}</button>; })}</div></fieldset>
      {submitted && <p role="status" className={`rounded-lg border p-3 text-xs leading-5 ${isCorrect ? 'border-emerald-900 bg-emerald-950/20 text-emerald-100' : 'border-amber-900 bg-amber-950/20 text-amber-100'}`}>{isCorrect ? '¡Correcto! ' : 'Repasa esta idea. '}{question.explanation}</p>}
      {!submitted ? <button type="button" disabled={selectedAnswer === null} onClick={() => setSubmitted(true)} className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40">Revisar respuesta</button> : <button type="button" onClick={moveQuiz} className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800">{quizIndex === QUIZ.length - 1 ? 'Volver al inicio' : 'Siguiente pregunta'}</button>}
    </section>

    <section aria-label="Matriz educativa de gestión del riesgo"><RiskMatrixPanel /></section>
    <p className="text-[10px] leading-4 text-slate-500">Contenido educativo. La matriz es un esquema ordinal de planificación y no una probabilidad ni una instrucción de respuesta a emergencias.</p>
  </main>;
}
