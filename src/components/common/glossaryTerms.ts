/**
 * Glosario científico por secciones, basado en el de la carpeta Ejemplo.
 * Se ajustaron las definiciones que describían funciones no disponibles aquí
 * (Open-Meteo acoplado, verificación de reportes ciudadanos, parámetros del modelo).
 */
export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface GlossarySection {
  id: string;
  title: string;
  terms: GlossaryTerm[];
}

export const GLOSSARY_SECTIONS: GlossarySection[] = [
  {
    id: '1',
    title: '1. DETECCIÓN SATELITAL Y TELEDETECCIÓN',
    terms: [
      {
        term: 'Foco de Calor (Anomalía Térmica)',
        definition:
          'Señal registrada por el sensor satelital donde la radiación infrarroja media emitida por un píxel supera el fondo circundante. No equivale necesariamente a un incendio forestal único o fuera de control: un píxel puede contener una quema agrícola controlada, actividad minera o fuego de menor fracción de área.',
      },
      {
        term: 'MODIS',
        definition:
          'Moderate Resolution Imaging Spectroradiometer. Sensor óptico y térmico a bordo de los satélites Terra y Aqua de la NASA. Genera los productos de incendios activos MCD14 / MOD14 / MYD14 con una resolución espacial nominal de ~1 km en el nadir y mantiene una serie histórica global continua desde el año 2000.',
      },
      {
        term: 'VIIRS',
        definition:
          'Visible Infrared Imaging Radiometer Suite. Sensor multiespectral a bordo de los satélites Suomi-NPP, NOAA-20 (JPSS-1) y NOAA-21. Sus bandas de imagen I (productos VNP14IMG y VJ114IMG) operan a ~375 m en el nadir, ofreciendo mayor sensibilidad espacial para detectar focos pequeños, bordes de fuego y actividad nocturna.',
      },
      {
        term: 'MODIS vs VIIRS (Resolución Espacial)',
        definition:
          'MODIS opera con una resolución nominal de ~1 km en el nadir (sensores Terra y Aqua). VIIRS opera a ~375 m en bandas infrarrojas de imagen I (Suomi-NPP, NOAA-20 y NOAA-21). Debido a su mayor resolución, VIIRS detecta fuegos de menor intensidad y superficie, produciendo mayor volumen de registros.',
      },
      {
        term: 'FIRMS',
        definition:
          'Fire Information for Resource Management System. Sistema operativo de la NASA (LANCE / Earthdata) que procesa y distribuye detecciones de anomalías térmicas de MODIS y VIIRS en formato tabular (CSV) y geoespacial, tanto en tiempo casi real (NRT) como en archivo histórico de procesamiento estándar (SP).',
      },
      {
        term: 'Píxel Térmico',
        definition:
          'Unidad mínima de muestreo espacial registrada por el sensor satelital (~1 km en MODIS y ~375 m en VIIRS en el nadir). Una detección indica que dentro de esa celda existe suficiente emisión infrarroja para activar el algoritmo; no significa que toda la superficie del píxel esté incendiada, y su tamaño real crece hacia los bordes del barrido.',
      },
      {
        term: 'Resolución Espacial',
        definition:
          'Dimensión lineal mínima sobre el terreno representada por un píxel del sensor en el nadir. Determina la capacidad del instrumento para resolver fuentes de calor pequeñas y localizar con mayor precisión el evento; no debe interpretarse como el área exacta quemada ni compararse linealmente entre sensores sin armonización.',
      },
      {
        term: 'Paso Orbital',
        definition:
          'Tránsito periódico de un satélite heliosincrónico sobre una región geográfica determinada, con horarios diurnos y nocturnos característicos en tiempo UTC. La cobertura efectiva varía con la latitud, el ángulo de barrido y la nubosidad; la ausencia de detecciones en un paso orbital no demuestra ausencia de fuego.',
      },
      {
        term: 'Detección en Tiempo Casi Real',
        definition:
          'Productos satelitales procesados y puestos a disposición pública pocas horas después de la captura orbital (Near Real-Time, NRT) para monitoreo oportuno. Conservan trazabilidad temporal en UTC (presentada en UTC-5 en IDEAM) y posteriormente son consolidados por el procesamiento científico estándar (SP).',
      },
      {
        term: 'Falso Positivo',
        definition:
          'Anomalía térmica clasificada erróneamente como fuego activo por el algoritmo satelital debido a reflexión solar especular, suelos desnudos muy calientes, techos metálicos, actividad industrial o contrastes térmicos superficiales. Se mitiga evaluando la confianza de detección, la recurrencia nocturna y la verificación en terreno.',
      },
      {
        term: 'Falso Negativo',
        definition:
          'Evento de fuego real en superficie que no es registrado por el sensor satelital debido a cobertura densa de nubes o humo espeso, dosel arbóreo cerrado, fuegos de baja intensidad por debajo del umbral de detección del píxel, o eventos de corta duración ocurridos entre pasos orbitales.',
      },
      {
        term: 'Confianza de Detección FIRMS',
        definition:
          'Expresa la certeza algorítmica de que la anomalía térmica sea un fuego real y no un falso positivo por reflexión solar o contraste superficial. VIIRS reporta clases categóricas (Low, Nominal, High), mientras MODIS reporta un valor de 0 a 100.',
      },
      {
        term: 'Coordenadas Geográficas',
        definition:
          'Par numérico de latitud y longitud en grados decimales bajo el sistema de referencia geodésico WGS 84 que ubica el centroide del píxel térmico detectado. El Backend-API descarta registros fuera de la caja geográfica de la consulta (Antioquia o Colombia).',
      },
    ],
  },
  {
    id: '2',
    title: '2. VARIABLES TÉRMICAS Y COMPORTAMIENTO DEL FUEGO',
    terms: [
      {
        term: 'Potencia Radiativa del Fuego (FRP - Fire Radiative Power)',
        definition:
          'Medida en Megavatios (MW) que cuantifica la tasa de liberación de energía térmica radiante liberada por la combustión en el momento del pase orbital. Está directamente relacionada con la tasa de consumo de biomasa.',
      },
      {
        term: 'Megavatio (MW)',
        definition:
          'Unidad del Sistema Internacional equivalente a un millón de vatios (10⁶ J/s) empleada para expresar la Potencia Radiativa del Fuego (FRP). En PROMETHEUS IGNIS, registros con FRP ≥ 30 MW se clasifican cartográficamente como focos de alta intensidad térmica, sin importar si provienen de MODIS o VIIRS.',
      },
      {
        term: 'Energía Radiativa del Fuego (FRE)',
        definition:
          'Integral temporal de la Potencia Radiativa del Fuego (FRP) acumulada durante la vida activa de un incendio, expresada en Megajulios (MJ) o Terajulios (TJ). Permite estimar la masa total de biomasa consumida cuando existen observaciones repetidas a lo largo del evento.',
      },
      {
        term: 'Intensidad del Fuego',
        definition:
          'Magnitud energética de la combustión en el frente activo o dentro del píxel observado. Desde teledetección se aproxima mediante la FRP (MW) y la temperatura de brillo en el infrarrojo medio (Kelvin), sin equivaler directamente a la longitud de llama ni a la severidad ecológica posterior.',
      },
      {
        term: 'Carga de Combustible Vegetal',
        definition:
          'Cantidad de biomasa seca disponible susceptible de entrar en combustión por unidad de superficie (hojarasca, pastizales, rastrojos agrícolas y material leñoso). Su distribución varía según la cobertura terrestre y condiciona el potencial energético de un incendio.',
      },
      {
        term: 'Humedad del Combustible',
        definition:
          'Contenido de agua presente en la vegetación viva o muerta respecto a su peso seco. Regula la facilidad de ignición y la tasa de combustión: periodos prolongados sin precipitación y baja humedad relativa disminuyen la humedad del combustible fino muerto e incrementan la susceptibilidad térmica.',
      },
      {
        term: 'Velocidad de Propagación',
        definition:
          'Tasa de avance lineal del frente de llama en el terreno, usualmente expresada en metros por minuto o kilómetros por hora. Depende de la pendiente topográfica, la velocidad y dirección del viento, la continuidad del combustible y su humedad; los puntos de calor satelitales por sí solos no miden esta variable.',
      },
      {
        term: 'Frente de Fuego',
        definition:
          'Borde activo de un incendio donde ocurre la combustión con llama y la mayor liberación de energía radiante hacia la atmósfera. En sensores de mayor resolución espacial como VIIRS (~375 m) es posible delinear con mayor detalle la geometría de frentes activos respecto a sensores de ~1 km.',
      },
      {
        term: 'Perímetro del Incendio',
        definition:
          'Contorno geográfico cerrado que delimita la extensión espacial afectada por un evento de fuego. No debe equipararse automáticamente con la envolvente de focos de calor puntuales sin verificación de área quemada o levantamiento en campo.',
      },
      {
        term: 'Área Quemada',
        definition:
          'Superficie total del territorio efectivamente afectada por el fuego tras un evento, medida habitualmente en hectáreas (ha) o km² mediante productos retrospectivos como MODIS MCD64A1 (Colección 6.1, ~500 m) o índices espectrales multitemporales. Se trata como una fuente independiente de los puntos de calor activos.',
      },
      {
        term: 'Severidad del Incendio',
        definition:
          'Grado de alteración ecológica, pérdida de cobertura vegetal y cambio en las propiedades del suelo provocado por el paso del fuego. Se evalúa posteriormente al evento mediante sensores ópticos y trabajo de campo, diferenciándose de la intensidad térmica instantánea.',
      },
      {
        term: 'Índice NBR',
        definition:
          'Normalized Burn Ratio. Índice espectral normalizado que relaciona la reflectancia del infrarrojo cercano (NIR) y del infrarrojo de onda corta (SWIR): NBR = (NIR − SWIR) / (NIR + SWIR). La vegetación sana presenta valores altos de NBR, mientras que las superficies quemadas muestran valores bajos o negativos.',
      },
      {
        term: 'dNBR',
        definition:
          'Differenced Normalized Burn Ratio. Diferencia multitemporal entre el índice NBR previo al incendio y el posterior al evento (dNBR = NBR_pre − NBR_post). Permite cartografiar la distribución espacial y categorizar niveles relativos de severidad de quemado cuando existen imágenes ópticas libres de nubes.',
      },
    ],
  },
  {
    id: '3',
    title: '3. ANÁLISIS HISTÓRICO Y ESTADÍSTICO',
    terms: [
      {
        term: 'Recurrencia Histórica (0–100)',
        definition:
          'Métrica sintética que resume la persistencia y repetición espacial y temporal de observaciones a lo largo de los años. No constituye un pronóstico ni una probabilidad de incendio futuro, sino una medida del registro acumulado en el territorio.',
      },
      {
        term: 'Armonización MODIS + VIIRS',
        definition:
          'Proceso metodológico de unificar esquemas de datos, marcas temporales UTC, coordenadas WGS 84 y niveles de confianza entre sensores de distinta resolución (~1 km vs ~375 m) y horario orbital, conservando siempre el instrumento de origen para evitar sesgos al sumar conteos brutos.',
      },
      {
        term: 'Concordancia Satelital (Coincidencia Intersensor)',
        definition:
          'Emparejamiento espacio-temporal entre detecciones de MODIS y VIIRS dentro de vecindades espacio-temporales definidas por el Backend-API para expresar el grado de respaldo multi-instrumento de una anomalía térmica. Una detección de un solo sensor no se descarta, sino que se documenta con menor concordancia.',
      },
      {
        term: 'Cadenas de Markov (3×3)',
        definition:
          'Modelo estocástico discreto que evalúa transiciones diarias por celda territorial (~5 km) entre tres estados: S0 (sin detección en cobertura evaluable), S1 (actividad térmica baja) y S2 (actividad térmica alta). Estima la probabilidad P(S1 ∪ S2) de futuras detecciones térmicas satelitales a horizontes de 24 h, 48 h y 72 h, sin modelar ignición ni propagación física. En esta plataforma se mostrará cuando el AI-Pipeline publique un modelo evaluado.',
      },
      {
        term: 'Matriz de Transición P(i, j) y Suavizado Laplace/Dirichlet',
        definition:
          'Tabla estocástica de 3×3 donde cada entrada representa la probabilidad condicional empírica P(S(t+1)=j | S(t)=i), con suma por fila igual a 1. El suavizado Laplace/Dirichlet suma un pseudoconteo α a cada transición para evitar probabilidades de 0 o 1 en celdas con pocas observaciones; con muy pocos días evaluados el modelo debe declararse insuficiente.',
      },
      {
        term: 'Validación Retrospectiva (Brier Score y Log-Loss)',
        definition:
          'Evaluación temporal fuera de muestra (sin fuga de información futura) que mide la calibración probabilística del modelo predictivo frente a líneas base de persistencia y climatología. El Brier Score cuantifica el error cuadrático medio de probabilidad y el Log-Loss penaliza predicciones sobreconfiadas.',
      },
      {
        term: 'Estacionalidad y Anomalías Históricas',
        definition:
          'Patrón periódico de aumento o disminución de focos de calor asociado a ciclos climáticos regionales y desviaciones estadísticas respecto a la referencia histórica del área consultada. Describe comportamiento pasado observado y no implica causalidad directa.',
      },
    ],
  },
  {
    id: '4',
    title: '4. VARIABLES METEOROLÓGICAS Y CONDICIONES AMBIENTALES',
    terms: [
      {
        term: 'Temperatura Ambiental',
        definition:
          'Temperatura del aire superficial (°C) obtenida de servicios meteorológicos independientes de los datos satelitales. Condiciona el secamiento del material vegetal fino y la predisposición del entorno, sin confundirse con la temperatura de brillo radiométrica medida por los satélites.',
      },
      {
        term: 'Humedad Relativa (HR)',
        definition:
          'Porcentaje (%) de vapor de agua presente en el aire respecto al punto de saturación a una temperatura dada. Valores bajos de humedad relativa aceleran la pérdida de humedad en pastos y hojarasca, elevando la susceptibilidad de ignición superficial.',
      },
      {
        term: 'Precipitación Reciente',
        definition:
          'Lámina de lluvia acumulada (mm) en ventanas previas de 24 a 72 horas. Actúa como factor modulador natural que humedece el combustible vegetal y reduce temporalmente la probabilidad de nuevas detecciones térmicas activas.',
      },
      {
        term: 'Velocidad y Dirección del Viento',
        definition:
          'Movimiento horizontal del aire superficial a 10 m de altura (km/h o m/s y azimut). Favorece el aporte de oxígeno, inclina las llamas hacia combustible sin quemar y transporta pavesas a distancia; es una variable ambiental complementaria, externa a los archivos FIRMS e IDEAM.',
      },
      {
        term: 'Cobertura Terrestre y Tipo de Vegetación',
        definition:
          'Clasificación biofísica de la superficie del suelo (bosque denso, herbazal, cultivo, rastrojo, suelo desnudo o zona urbana) procedente de capas externas como ESA WorldCover. Permite contextualizar si una anomalía térmica ocurre en cobertura forestal o agrícola sin inferir causa automáticamente.',
      },
      {
        term: 'Topografía y Pendiente',
        definition:
          'Configuración altitudinal y grado de inclinación del terreno montañoso. Las pendientes pronunciadas precalientan los combustibles situados cuesta arriba y condicionan la accesibilidad de las brigadas de respuesta.',
      },
    ],
  },
  {
    id: '5',
    title: '5. GESTIÓN DEL RIESGO DE INCENDIOS FORESTALES',
    terms: [
      {
        term: 'Amenaza vs Exposición vs Vulnerabilidad',
        definition:
          'Marco de gestión del riesgo de la UNDRR (2015). La Amenaza corresponde a la actividad histórica observada; la Exposición identifica los elementos humanos y naturales presentes (hospitales, poblados, reservas); y la Vulnerabilidad describe su susceptibilidad intrínseca ante el daño.',
      },
      {
        term: 'Riesgo Territorial y Consecuencia Potencial',
        definition:
          'Combinación conceptual de la Amenaza histórica, la Exposición de elementos en el territorio y su Vulnerabilidad intrínseca. La Consecuencia representa la magnitud del daño esperable sobre población, infraestructura crítica y ecosistemas en caso de manifestarse el evento.',
      },
      {
        term: 'Elementos Expuestos',
        definition:
          'Población, centros poblados, hospitales, red vial, infraestructura estratégica, áreas protegidas, nacimientos de agua y corredores ecológicos ubicados dentro o en proximidad de zonas con actividad térmica recurrente.',
      },
      {
        term: 'Atención Temprana vs Respuesta a Emergencias',
        definition:
          'Distinción operativa fundamental: PROMETHEUS IGNIS es una herramienta científica de apoyo analítico y planificación preventiva temprana. No sustituye los sistemas oficiales de alerta ni reemplaza la coordinación operativa de emergencia de bomberos, DAGRAN o UNGRD.',
      },
      {
        term: 'Reporte Ciudadano y Verificación Terrestre',
        definition:
          'Observación enviada desde el territorio por habitantes o brigadistas que complementa la vigilancia orbital, especialmente bajo nubosidad o en eventos incipientes. Esta versión de la plataforma todavía no recibe reportes ciudadanos: el botón Reportar Novedad solo informa cómo comunicarse con las autoridades.',
      },
    ],
  },
  {
    id: '6',
    title: '6. ANÁLISIS ESPACIAL E INDICADORES TERRITORIALES',
    terms: [
      {
        term: 'Celda Geoespacial (Grilla de ~5 km)',
        definition:
          'Unidad espacial regular para discretizar el territorio en modelos de transición (como Markov) y en mapas de densidad estadística. Permite agregar detecciones de distinta resolución (MODIS y VIIRS) en vecindades consistentes, evitando interpretar puntos aislados fuera de contexto.',
      },
      {
        term: 'Persistencia Espacial',
        definition:
          'Frecuencia de períodos temporales distintos (meses, temporadas o años) en los que una misma celda o polígono administrativo registra actividad térmica. Permite diferenciar focos esporádicos de sectores territorialmente persistentes.',
      },
      {
        term: 'Densidad de Detecciones',
        definition:
          'Concentración relativa de anomalías térmicas por unidad de área y período evaluado. Debe interpretarse siempre diferenciando el sensor de origen y la cobertura observacional efectiva para no atribuir mayor riesgo únicamente por mayor sensibilidad espacial de VIIRS.',
      },
      {
        term: 'Intersección y Proximidad Territorial (SIG)',
        definition:
          'Operaciones espaciales reproducibles entre detecciones térmicas o celdas de riesgo y capas administrativas (departamentos, municipios, veredas) o de infraestructura y áreas ambientales, conservando fecha, escala y limitaciones de cada capa externa.',
      },
      {
        term: 'Hotspot Persistente',
        definition:
          'Zona geográfica delimitada que exhibe repetición anómala y sostenida de registros térmicos en múltiples ventanas temporales. Requiere cruce con cobertura del suelo y verificación local para distinguir quemas agrícolas recurrentes, fuentes fijas o zonas críticas forestales.',
      },
    ],
  },
  {
    id: '7',
    title: '7. MATRICES DE EVALUACIÓN Y PRIORIZACIÓN',
    terms: [
      {
        term: 'Matriz de Riesgo Territorial 5×5',
        definition:
          'Esquema ordinal conceptual (P = Amenaza × Consecuencia) con puntajes de 1 a 25 para priorizar sectores de intervención territorial y medidas preventivas de planificación, sin constituir un modelo predictivo.',
      },
      {
        term: 'Eje de Amenaza (Niveles 1–5)',
        definition:
          'Escala ordinal cualitativa (1 Muy bajo a 5 Muy alto) asociada a la frecuencia, recurrencia, persistencia y tendencia histórica de detecciones satelitales válidas dentro de un área con cobertura observacional suficiente. La falta de datos no se clasifica como nivel 1, sino como información insuficiente.',
      },
      {
        term: 'Eje de Consecuencia (Niveles 1–5)',
        definition:
          'Escala ordinal cualitativa (1 Muy bajo a 5 Muy alto) que sintetiza la presencia de población, infraestructura crítica, ecosistemas estratégicos, vulnerabilidad intrínseca y accesibilidad de respuesta en la zona evaluada.',
      },
      {
        term: 'Producto Ordinal P = A × C',
        definition:
          'Indicador multiplicativo de 1 a 25 usado como criterio ilustrativo de priorización territorial preventiva. No equivale a una probabilidad numérica de incendio, no asume distancias lineales entre niveles y siempre se comunica acompañado de su etiqueta ordinal y justificación textual.',
      },
    ],
  },
  {
    id: '8',
    title: '8. ENTIDADES, SISTEMAS Y FUENTES DE INFORMACIÓN',
    terms: [
      {
        term: 'NASA LANCE / Earthdata FIRMS',
        definition:
          'Infraestructura de la NASA para la observación terrestre y distribución abierta de datos de anomalías térmicas MODIS (Colección 6.1) y VIIRS (NRT/SP) a escala global mediante feeds públicos y Area API.',
      },
      {
        term: 'IDEAM — SMByC Colombia',
        definition:
          'Instituto de Hidrología, Meteorología y Estudios Ambientales — Sistema de Monitoreo de Bosques y Carbono. Publica archivos CSV diarios de puntos de calor para Colombia en hora local UTC-5, separados por punto y coma y con coma decimal.',
      },
      {
        term: 'DAGRAN y UNGRD',
        definition:
          'Departamento Administrativo de Gestión del Riesgo de Desastres de Antioquia (DAGRAN) y Unidad Nacional para la Gestión del Riesgo de Desastres (UNGRD). Entidades oficiales encargadas de coordinar prevención, atención de emergencias y respuesta territorial junto a los cuerpos de bomberos (líneas 119 y 123).',
      },
      {
        term: 'Open-Meteo Weather API',
        definition:
          'Servicio meteorológico abierto de pronóstico y variables atmosféricas en tiempo real (temperatura, humedad relativa, viento a 10 m y precipitación) que puede servir como fuente ambiental complementaria. No está integrado en la versión actual de la plataforma.',
      },
      {
        term: 'Semillero de Astronomía del ITM (PROMETHEUS IGNIS)',
        definition:
          'Equipo académico e investigativo del Instituto Tecnológico Metropolitano (Medellín, Colombia) creador de la plataforma PROMETHEUS IGNIS en el marco del NASA Space Apps Challenge 2026 para la armonización de focos MODIS y VIIRS y la inteligencia territorial abierta.',
      },
    ],
  },
  {
    id: '9',
    title: '9. UNIDADES DE MEDIDA Y ABREVIATURAS',
    terms: [
      {
        term: 'MODIS / VIIRS / FIRMS',
        definition:
          'MODIS: Moderate Resolution Imaging Spectroradiometer (~1 km). VIIRS: Visible Infrared Imaging Radiometer Suite (~375 m). FIRMS: Fire Information for Resource Management System (NASA).',
      },
      {
        term: 'FRP / FRE / MW',
        definition:
          'FRP: Fire Radiative Power (Potencia Radiativa del Fuego), medida en Megavatios (MW). FRE: Fire Radiative Energy (Energía Radiativa del Fuego), medida en Megajulios (MJ).',
      },
      {
        term: 'NRT / SP',
        definition:
          'NRT: Near Real-Time (procesamiento satelital en tiempo casi real para vigilancia oportuna). SP: Standard Processing (procesamiento científico estándar consolidado para series históricas).',
      },
      {
        term: 'UTC / UTC-5',
        definition:
          'UTC: Tiempo Universal Coordinado, estándar horario usado por NASA FIRMS. UTC-5: Hora Legal de Colombia, empleada en los archivos diarios publicados por el IDEAM SMByC.',
      },
      {
        term: 'K / °C / mm / ha',
        definition:
          'K: Kelvin (temperatura de brillo radiométrica medida en banda térmica satelital). °C: Grados Celsius (temperatura ambiental superficial). mm: Milímetros de precipitación acumulada. ha: Hectárea (10.000 m² = 0,01 km²).',
      },
      {
        term: 'API / CSV / SIG / WGS 84',
        definition:
          'API: Interfaz de Programación de Aplicaciones. CSV: Valores Separados por Comas (o punto y coma en estándar regional IDEAM). SIG: Sistemas de Información Geográfica. WGS 84: World Geodetic System 1984, datum estándar de coordenadas geográficas.',
      },
    ],
  },
];
