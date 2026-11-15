/**
 * Contenido de KAIRÓS, Aula Pedagógica (portado de la carpeta `ejemplo`).
 * Las infografías viven en `public/assets/kairos` convertidas a WebP.
 *
 * Guía 4 "Interpretación de los datos" (7 infografías + podcast) restaurada por
 * decisión del usuario (2026-11-15), igual que en el ejemplo. Algunas piezas
 * mencionan funciones que esta plataforma no tiene (factor clima, matriz 5 × 5)
 * o afirman que una detección nocturna "confirma" combustión; la nota de lectura
 * se quitó por decisión del usuario y al lado se conservan las reglas de lectura propias.
 */

export interface KairosSlide {
  id: string;
  title: string;
  imageSrc: string;
}

export interface KairosSection {
  id: string;
  title: string;
  description: string;
  /** Podcast of the section (from the `ejemplo` folder; audio-only MP4). */
  audioSrc?: string;
  slides: KairosSlide[];
}

const img = (name: string) => `/assets/kairos/${name}.webp`;
const podcast = (name: string) => `/assets/kairos/podcasts/podcast-${name}.mp4`;

export const KAIROS_HEADER_IMAGE = img('encabezado');
export const KAIROS_FOOTER_IMAGE = img('pie');

export const KAIROS_INTRO_TITLE = 'Te invitamos a leer';

export const KAIROS_INTRO_PARAGRAPHS = [
  'Casi todos conocemos a alguien que ha vivido un incendio de cerca: una vela olvidada en la sala, un cortocircuito silencioso detrás de un mueble, una quema de rastrojo que parecía inofensiva hasta que cambió el viento o una tarde seca en la montaña donde bastaron unos minutos para transformar el paisaje. Detrás de cada emergencia rara vez hay un evento inevitable; casi siempre hubo una señal temprana que no supimos leer a tiempo.',
  'En KAIRÓS, Aula Pedagógica reunimos guías visuales claras y cercanas para comprender cómo prevenir el fuego dentro del hogar, cómo cuidar nuestros bosques, páramos y cultivos, cómo proteger la salud humana y animal frente al humo y cómo interpretar con criterio los datos satelitales de PROMETHEUS IGNIS.',
];

export const KAIROS_SECTIONS: KairosSection[] = [
  {
    id: 'hogar',
    title: '1. Prevención en el hogar',
    description: 'La mayoría de las emergencias residenciales comienzan con gestos cotidianos que podemos corregir hoy: evitar conexiones en cascada y cargar baterías de ion-litio sobre superficies ventiladas, instalar y probar detectores de humo cada mes, limpiar el filtro de pelusa de la secadora, almacenar inflamables lejos de fuentes de calor, alejar velas e inciensos de cortinas y construir en familia un plan de evacuación con dos rutas de salida por habitación.',
    audioSrc: podcast('hogar'),
    slides: [
      { id: 'hogar-1', title: 'Seguridad eléctrica y baterías de ion-litio', imageSrc: img('hogar-seguridad-electrica') },
      { id: 'hogar-2', title: 'Uso de extintores y evacuación en edificios', imageSrc: img('hogar-extintores-evacuacion') },
      { id: 'hogar-3', title: 'Detectores de humo y mantenimiento preventivo', imageSrc: img('hogar-detectores-humo') },
      { id: 'hogar-4', title: 'Cuarto de lavado y productos inflamables', imageSrc: img('hogar-cuarto-lavado') },
      { id: 'hogar-5', title: 'Plan familiar de emergencia y protección infantil', imageSrc: img('hogar-plan-familiar') },
      { id: 'hogar-6', title: 'Seguridad en talleres caseros, garajes y soldadura', imageSrc: img('hogar-talleres-garajes') },
      { id: 'hogar-7', title: 'Velas, inciensos y temporadas festivas', imageSrc: img('hogar-velas-festividades') },
    ],
  },
  {
    id: 'ecosistema',
    title: '2. Prevención por ecosistema',
    description: 'En Colombia, la mayoría de los incendios de cobertura vegetal se relacionan con actividades humanas y se agravan durante sequías y eventos de El Niño. Proteger nuestras veredas y montañas exige sostener un espacio defendible alrededor de las viviendas rurales, sustituir las quemas agrícolas por compostaje o abono verde, cuidar la vegetación de páramos y bosques secos, apagar por completo toda fogata con agua y reportar de inmediato columnas de humo al 123.',
    audioSrc: podcast('ecosistema'),
    slides: [
      { id: 'eco-1', title: 'Incendios de cobertura vegetal y espacio defendible', imageSrc: img('eco-espacio-defendible') },
      { id: 'eco-2', title: 'Protección de páramos y bosques secos tropicales', imageSrc: img('eco-paramos-bosques') },
      { id: 'eco-3', title: 'Fenómeno de El Niño, sequías y estrés hídrico', imageSrc: img('eco-el-nino-sequias') },
      { id: 'eco-4', title: 'Turismo de naturaleza, campamentos y fogatas', imageSrc: img('eco-turismo-fogatas') },
      { id: 'eco-5', title: 'Restauración ecológica post-incendio y erosión', imageSrc: img('eco-restauracion') },
      { id: 'eco-6', title: 'Manejo de residuos rurales y alternativas a quemas', imageSrc: img('eco-residuos-rurales') },
    ],
  },
  {
    id: 'salud',
    title: '3. Prevención médica y primeros auxilios',
    description: 'Frente a una emergencia térmica o a una nube densa de humo, actuar con serenidad protege vidas. El material particulado y el monóxido de carbono exigen sellar ventanas, usar respiradores N95 bien ajustados y desplazarse a ras del suelo si hay humo; el golpe de calor requiere sombra y enfriamiento inmediato; y tanto las mascotas como el bienestar emocional de las personas afectadas necesitan atención oportuna, escucha sin juicios y un retorno seguro autorizado por bomberos.',
    audioSrc: podcast('salud'),
    slides: [
      { id: 'salud-1', title: 'Protección respiratoria ante humo de incendios forestales', imageSrc: img('salud-proteccion-respiratoria') },
      { id: 'salud-2', title: 'Primeros auxilios en mascotas y animales afectados', imageSrc: img('salud-mascotas') },
      { id: 'salud-3', title: 'Primeros auxilios psicológicos en emergencias', imageSrc: img('salud-primeros-auxilios-psicologicos') },
      { id: 'salud-4', title: 'Golpe de calor y agotamiento térmico', imageSrc: img('salud-golpe-de-calor') },
      { id: 'salud-5', title: 'Seguridad médica y estructural al regresar a casa', imageSrc: img('salud-regreso-seguro') },
      { id: 'salud-6', title: 'Supervivencia ante humo, monóxido de carbono y fuego en la ropa', imageSrc: img('salud-supervivencia-humo') },
    ],
  },
];

export const KAIROS_DATA_INFOGRAPHICS: KairosSection = {
  id: 'datos',
  title: '4. Interpretación de los datos de PROMETHEUS IGNIS',
  description: 'Leer un visor satelital con rigor significa distinguir qué mide cada sensor y qué limitaciones tiene. VIIRS (~375 m) y MODIS (~1 km) detectan anomalías térmicas según sus pasos orbitales diurnos y nocturnos y la presencia de nubes; la Potencia Radiativa del Fuego (FRP, en MW) diferencia eventos moderados (S1) de focos intensos (S2 ≥ 30 MW); el motor Markov 3×3 estima probabilidades que se auditan con Brier Skill Score y ROC-AUC; y el reporte ciudadano complementa la vigilancia sin reemplazar jamás la llamada inmediata al 123.',
  audioSrc: podcast('datos'),
  slides: [
    { id: 'datos-1', title: 'Lectura de puntos de calor satelitales', imageSrc: img('datos-puntos-calor') },
    { id: 'datos-2', title: 'Motor predictivo Markov', imageSrc: img('datos-motor-markov') },
    { id: 'datos-3', title: 'Potencia radiativa del fuego', imageSrc: img('datos-potencia-radiativa') },
    { id: 'datos-4', title: 'Horario orbital', imageSrc: img('datos-horario-orbital') },
    { id: 'datos-5', title: 'Ranking territorial y vecindad', imageSrc: img('datos-ranking-territorial') },
    { id: 'datos-6', title: 'Validación científica del modelo', imageSrc: img('datos-validacion-modelo') },
    { id: 'datos-7', title: 'Participación ciudadana', imageSrc: img('datos-participacion-ciudadana') },
  ],
};

/** Reglas de lectura de esta plataforma (texto propio, coherente con PROJECT_CONTEXT). */
export const KAIROS_DATA_SECTION = {
  title: 'Reglas de lectura de esta plataforma',
  rules: [
    'Puntos rojos: observaciones VIIRS (~375 m). Puntos amarillos: MODIS (~1 km). Naranja: FRP informada ≥ 30 MW.',
    'Una observación satelital es una anomalía térmica: por sí sola no confirma un incendio ni un evento independiente.',
    'Los conteos de MODIS y VIIRS se leen por separado; más detecciones no significan necesariamente más incendios.',
    'La FRP (MW) mide la energía radiativa en el momento del paso. Si falta, se muestra “No disponible”, nunca 0.',
    'Las nubes, el humo y el horario orbital pueden ocultar actividad: la ausencia de puntos no prueba ausencia de fuego.',
    'Las probabilidades Markov son una estimación exploratoria de actividad térmica: léalas siempre junto con su validación retrospectiva.',
    'Ante una emergencia real, llama al 123. El mapa es contexto, no un sistema de alerta.',
  ],
};

export const KAIROS_EDUCATION_BLOCK = {
  title: 'La educación como primera forma de prevención',
  paragraphs: [
    'Ningún satélite en órbita ni modelo matemático reemplaza a una comunidad informada. La observación espacial detecta el calor cuando la combustión ya comenzó, pero la educación ambiental y doméstica actúa mucho antes: en la decisión de no quemar rastrojos en temporada seca, en la revisión de un cable deteriorado o en la enseñanza tranquila a niños y jóvenes sobre cómo evacuar sin pánico.',
    'Cuando las familias, escuelas, brigadas locales y autoridades comparten un mismo lenguaje sobre el fuego, los datos técnicos dejan de ser cifras lejanas y se convierten en cuidado cotidiano del territorio. Comprender cómo interactúan el clima, la vegetación, la topografía y nuestras acciones diarias nos devuelve la capacidad de anticiparnos.',
    'Prevenir es cuidar la vida humana, la fauna silvestre, las fuentes de agua y el equilibrio de los ecosistemas que sostienen nuestras veredas y ciudades. Cada persona que lee, comparte y practica estas medidas multiplica la resiliencia colectiva frente al fuego.',
  ],
};

/**
 * Presentación «Aprendizaje Basado en Problemas» (36 diapositivas 1920 × 1080 en
 * `public/assets/kairos/abp/`), en el orden de la presentación del equipo.
 */
const ABP_TITLES = [
  'Aprendizaje Basado en Problemas',
  'Aprendizaje Basado en Problemas (ABP)',
  '¿Con quién realizarla?',
  '¿Cómo se desarrolla?',
  '¿Para qué sirve?',
  'Caso 1',
  'Caso 1 · Una chispa en casa: ¿estamos preparados?',
  'Caso 1 · Desafíos y producto final',
  'Caso 1 · Cuatro situaciones de riesgo en casa',
  'Caso 1 · Cómo prevenirlo y plan familiar',
  'Caso 1 · Cinco cosas para recordar',
  'Caso 2',
  'Caso 2 · Cuando el humo llega a la comunidad',
  'Caso 2 · Desafíos y producto final',
  'Caso 2 · Cuatro riesgos del humo',
  'Caso 2 · Cómo protegerse y plan familiar',
  'Caso 2 · Cinco cosas para recordar',
  'Caso 3',
  'Caso 3 · Los datos también pueden salvar bosques',
  'Caso 3 · Desafíos y producto final',
  'Caso 3 · Cuatro errores frente a las alertas',
  'Caso 3 · Cómo consultar las alertas',
  'Caso 3 · Para recordar',
  'Caso 4',
  'Caso 4 · Situación problema',
  'Caso 4 · Desafíos y producto final',
  'Caso 4 · Cinco errores frente a un incendio',
  'Caso 4 · Qué hacer y plan comunitario',
  'Caso 5',
  'Caso 5 · Animales en peligro: ¿quién los protege?',
  'Caso 5 · Desafíos y producto final',
  'Caso 5 · Cinco errores al encontrar un animal afectado',
  'Caso 5 · Qué hacer y plan comunitario',
  'Conclusión',
  'Conclusión · La solución es común a todos',
  'Gracias',
];

export const KAIROS_WIDE_SLIDES: KairosSlide[] = ABP_TITLES.map((title, index) => {
  const num = String(index + 1).padStart(2, '0');
  return { id: `abp-${num}`, title, imageSrc: img(`abp/abp-${num}`) };
});

export const KAIROS_CLOSING = 'Los griegos distinguían dos tiempos: kronos, el que pasa y se cuenta en horas, y kairós, el momento justo en que actuar cambia el destino. Por eso esta página se llama Kairós, porque frente al fuego el momento oportuno no llega por azar: lo construye la prevención.';

/** Mensaje que aparece al pasar el cursor (o tocar) el sol del paisaje final. */
export const KAIROS_SUN_MESSAGE = [
  'El apartado Kairós: Aula pedagógica parte de una idea: la mejor forma de enfrentar un incendio es estar preparados. Las infografías y los podcasts enseñan qué hacer, el Aprendizaje Basado en Problemas lleva ese conocimiento a situaciones reales y el juego de simulación acerca la prevención a los niños de forma divertida. Así, cada persona puede aprender a su manera y cuidar de sí misma, de los demás y de su territorio.',
  'Como afirma Paulo Freire: «Nadie educa a nadie —nadie se educa a sí mismo—, los hombres se educan entre sí con la mediación del mundo». Esa es la apuesta de este espacio: que la prevención de incendios se construya en comunidad.',
];
