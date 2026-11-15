import type { LucideIcon } from 'lucide-react';
import {
  BellRing, Cable, Cross, CupSoda, Flame, FlameKindling, FlaskConical, Footprints, Layers, Lightbulb,
  OctagonAlert, PackageX, PlugZap, Scissors, ShieldCheck, Sun, Thermometer, Wind, Zap,
} from 'lucide-react';

/** Educational content for the "Detector de Riesgos Cotidianos" game (adapted from the team's HTML prototype). */

export type RiskItemType = 'safe' | 'hazard';
export type ScenarioId = 'kitchen' | 'office' | 'living';

export interface Nfpa704Rating { health: string; flam: string; react: string; special: string; label: string }

export interface RiskItem {
  id: string;
  num: string;
  name: string;
  zone: string;
  type: RiskItemType;
  icon: LucideIcon;
  norm: string;
  description: string;
  action: string;
  nfpa704?: Nfpa704Rating;
}

export interface RiskScenario {
  id: ScenarioId;
  num: string;
  title: string;
  subtitle: string;
  summaryIntro: string;
  takeaways: string[];
  items: RiskItem[];
}

export const RISK_POINTS: Record<RiskItemType, number> = { safe: 25, hazard: 100 };

export const RISK_SCENARIOS: RiskScenario[] = [
  {
    id: 'kitchen',
    num: '01',
    title: 'Cocina del Hogar',
    subtitle: 'Inspecciona la zona de cocción, el almacenamiento de productos químicos, los aparatos cercanos al fregadero y las rutas de paso.',
    summaryIntro: 'Identificaste los peligros críticos de incendio, electrocución y toxicidad química en la cocina.',
    takeaways: [
      'Cocinar sin vigilancia es la principal causa de incendios en el hogar según NFPA: nunca dejes sartenes con aceite solas ni arrojes agua sobre fuego de grasa.',
      'Guarda los químicos de limpieza lejos del calor y de los alimentos, y nunca mezcles cloro con amoníaco o ácidos (NFPA 704).',
      'Mantener electrodomésticos lejos del agua, cuchillos guardados y pisos limpios previene electrocuciones, cortes y caídas (NFPA 101 / SST).',
    ],
    items: [
      { id: 'k-ext', num: '01', name: 'Extintor recargado (Clase K / PQS)', zone: 'Pared lateral izquierda', type: 'safe', icon: FlameKindling, norm: 'NFPA · Protección activa contra incendios', description: 'El manómetro está en zona verde, la etiqueta de inspección está vigente y el extintor se ubica en un punto visible y alejado de la estufa, para tomarlo sin exponerse al fuego.', action: 'Verifica cada mes que la aguja del manómetro esté en verde y mantén libre su acceso.' },
      { id: 'k-chem', num: '02', name: 'Químicos de limpieza junto a alimentos', zone: 'Estante inferior abierto', type: 'hazard', icon: FlaskConical, nfpa704: { health: '3', flam: '0', react: '1', special: 'OX', label: 'Cloro / desengrasante' }, norm: 'NFPA 704 · Identificación y almacenamiento de materiales peligrosos', description: 'Guardar cloro, desengrasantes y solventes junto a víveres expone los alimentos a contaminación tóxica. Mezclar cloro con amoníaco o ácidos libera gases muy peligrosos (cuadrante azul de NFPA 704).', action: 'Lleva los químicos a un gabinete cerrado exclusivo, lejos del calor y de los alimentos, con sus etiquetas originales legibles.' },
      { id: 'k-hood', num: '03', name: 'Campana extractora con grasa acumulada', zone: 'Sobre la estufa', type: 'hazard', icon: Wind, norm: 'NFPA · Seguridad en equipos de cocina', description: 'La grasa adherida a filtros y campanas actúa como combustible. Ante una llamarada en la hornilla, propaga el fuego con rapidez hacia los ductos.', action: 'Desmonta y desengrasa los filtros con frecuencia para eliminar el combustible residual.' },
      { id: 'k-stove', num: '04', name: 'Sartén desatendida con aceite humeante', zone: 'Estufa encendida', type: 'hazard', icon: Flame, norm: 'NFPA · Prevención de incendios en cocina', description: 'El aceite sobrecalentado puede encenderse solo en segundos. Echar agua sobre aceite en llamas produce una explosión de vapor que proyecta el fuego.', action: 'No te alejes mientras cocinas. Si el aceite se enciende, apaga el fuego y desliza una tapa metálica para sofocarlo; nunca uses agua.' },
      { id: 'k-lid', num: '05', name: 'Tapa metálica y manopla térmica', zone: 'Encimera junto a la estufa', type: 'safe', icon: ShieldCheck, norm: 'NFPA · Prevención de quemaduras e incendios', description: 'Una tapa metálica del tamaño de la sartén y guantes térmicos a mano permiten cortar el oxígeno a un fuego de aceite y manipular ollas calientes sin quemarse.', action: 'Ten siempre una tapa metálica cerca de la zona de cocción y usa manoplas secas al retirar recipientes calientes.' },
      { id: 'k-sink', num: '06', name: 'Tostadora enchufada al borde del fregadero', zone: 'Área húmeda de lavado', type: 'hazard', icon: Zap, norm: 'Prevención eléctrica doméstica', description: 'Electrodomésticos energizados y sus cables sobre superficies húmedas o junto al fregadero crean riesgo grave de electrocución y cortocircuito por salpicaduras.', action: 'Pasa la tostadora a una encimera seca lejos del agua y desconéctala cuando no la uses.' },
      { id: 'k-knives', num: '07', name: 'Cuchillos sueltos al borde de la mesa', zone: 'Encimera derecha', type: 'hazard', icon: Scissors, norm: 'SST · Prevención de riesgos en cocina', description: 'Utensilios cortantes fuera de su lugar y cerca del borde pueden caer y causar heridas graves.', action: 'Lava y guarda los cuchillos en un taco o barra magnética justo después de usarlos.' },
      { id: 'k-floor', num: '08', name: 'Superficie de paso limpia y despejada', zone: 'Corredor central de la cocina', type: 'safe', icon: Footprints, norm: 'NFPA 101 · Medios de egreso y prevención de caídas', description: 'Un piso seco y sin derrames, cables ni cajas evita resbalones con líquidos calientes y deja libre la salida.', action: 'Limpia de inmediato cualquier salpicadura y mantén libres los accesos a la puerta.' },
    ],
  },
  {
    id: 'office',
    num: '02',
    title: 'Espacio de Trabajo / Oficina',
    subtitle: 'Evalúa las conexiones eléctricas, el escritorio, el almacenamiento de insumos y la ruta de evacuación.',
    summaryIntro: 'Completaste la revisión del espacio de trabajo: evacuación libre e instalación eléctrica segura.',
    takeaways: [
      'NFPA 101 exige salidas de emergencia despejadas, señalizadas y con iluminación de respaldo.',
      'Las regletas conectadas en cascada y los cables dañados se recalientan y producen chispas; mantén los líquidos lejos de equipos energizados.',
      'Aerosoles y solventes inflamables (rojo en NFPA 704) no deben estar junto a fuentes de calor como impresoras o calentadores.',
    ],
    items: [
      { id: 'o-kit', num: '01', name: 'Botiquín de primeros auxilios señalizado', zone: 'Pared izquierda de acceso', type: 'safe', icon: Cross, norm: 'SST · Seguridad y salud en el trabajo', description: 'Botiquín visible, limpio y accesible para atender de inmediato cortadas, raspaduras o quemaduras leves.', action: 'Revisa cada tres meses las fechas de vencimiento de gasas, antisépticos y suministros.' },
      { id: 'o-outlet', num: '02', name: 'Regletas sobrecargadas en cascada', zone: 'Bajo el extremo izquierdo del escritorio', type: 'hazard', icon: PlugZap, norm: 'NFPA / OSHA · Seguridad eléctrica en oficinas', description: 'Conectar una regleta sobre otra para alimentar computador, monitor, impresora y calentador supera la capacidad del circuito: las clavijas se recalientan y pueden iniciar un incendio.', action: 'Elimina la conexión en serie, reparte las cargas en tomas independientes y usa protectores con interruptor térmico certificado.' },
      { id: 'o-cable-worn', num: '03', name: 'Cable pelado bajo la base de la lámpara', zone: 'Costado del escritorio', type: 'hazard', icon: Cable, norm: 'NFPA · Integridad del aislamiento eléctrico', description: 'El aislamiento gastado por presión o fricción deja conductores expuestos que pueden hacer chispa y encender papel o cortinas cercanas.', action: 'Desconecta y reemplaza el cable o el equipo dañado; nunca lo arregles con cinta.' },
      { id: 'o-coffee', num: '04', name: 'Taza de café al borde del teclado', zone: 'Área de trabajo', type: 'hazard', icon: CupSoda, norm: 'Prevención ocupacional · Equipos electrónicos', description: 'Una bebida abierta junto al teclado puede derramarse sobre circuitos energizados y causar cortocircuitos.', action: 'Usa recipientes con tapa y ubícalos a un lado, lejos de equipos y regletas.' },
      { id: 'o-cable-tray', num: '05', name: 'Cables organizados en canaleta', zone: 'Bajo el escritorio', type: 'safe', icon: Layers, norm: 'NFPA 101 · Prevención de tropiezos', description: 'Llevar los cables en una bandeja bajo el tablero los protege de aplastamientos con la silla y evita lazos colgantes a la altura de los pies.', action: 'Mantén los cables agrupados, sin tensión ni dobleces fuertes.' },
      { id: 'o-solvents', num: '06', name: 'Aerosoles inflamables junto a la impresora', zone: 'Mueble auxiliar derecho', type: 'hazard', icon: Flame, nfpa704: { health: '2', flam: '4', react: '0', special: '', label: 'Alcohol / aerosol técnico' }, norm: 'NFPA 704 · Almacenamiento de sustancias inflamables', description: 'Limpiadores en aerosol y solventes son muy inflamables (4 en el cuadrante rojo de NFPA 704). El calor de la impresora puede encenderlos o romper el envase.', action: 'Guarda aerosoles y solventes en un gabinete ventilado, lejos de equipos que generen calor o chispas.' },
      { id: 'o-sign', num: '07', name: 'Señalización e iluminación de emergencia', zone: 'Sobre la puerta de salida', type: 'safe', icon: Lightbulb, norm: 'NFPA 101 · Iluminación y señalización de egreso', description: 'La lámpara autónoma y el letrero visible orientan hacia la salida incluso durante un apagón o con humo.', action: 'Presiona cada mes el botón de prueba de la lámpara de emergencia para confirmar que la batería carga.' },
      { id: 'o-exit-boxes', num: '08', name: 'Salida de emergencia bloqueada por cajas', zone: 'Puerta de evacuación derecha', type: 'hazard', icon: PackageX, norm: 'NFPA 101 · Código de Seguridad Humana (medios de egreso)', description: 'Obstruir puertas y vías de salida con cajas o muebles incumple NFPA 101 e impide evacuar rápido, en especial a personas con movilidad reducida.', action: 'Retira las cajas a una bodega y deja un pasillo libre y continuo hasta la salida.' },
    ],
  },
  {
    id: 'living',
    num: '03',
    title: 'Sala de Estar',
    subtitle: 'Detecta riesgos ocultos bajo alfombras, fuentes de calor cerca de tapizados, enchufes saturados y obstáculos en el corredor.',
    summaryIntro: 'Aseguraste la sala: corregiste riesgos de incendio ocultos y despejaste la ruta hacia el exterior.',
    takeaways: [
      'Nunca pases cables bajo alfombras: las pisadas los desgastan y el calor atrapado puede encender las fibras.',
      'Mantén calefactores y velas lejos de cortinas, sofás y madera, y nunca los dejes sin vigilancia.',
      'Los detectores de humo en el techo y los pasillos despejados (NFPA 101) dan alerta temprana y salida libre ante un incendio nocturno.',
    ],
    items: [
      { id: 'l-outlet-safe', num: '01', name: 'Enchufe con protector y sin sobrecarga', zone: 'Pared lateral izquierda', type: 'safe', icon: ShieldCheck, norm: 'Prevención eléctrica doméstica', description: 'Tomacorriente firme, sin adaptadores saturados y con tapa de seguridad que evita contactos accidentales y polvo.', action: 'Revisa que las placas no se calienten, no estén flojas ni tengan marcas oscuras.' },
      { id: 'l-heater', num: '02', name: 'Calefactor pegado a cortinas y sofá', zone: 'Junto a la ventana', type: 'hazard', icon: Thermometer, norm: 'NFPA · Distancia segura de equipos térmicos', description: 'Un calefactor a menos de un metro de cortinas, mantas o tapicería puede calentarlas hasta que se enciendan.', action: 'Deja al menos 1 metro libre alrededor del calefactor y apágalo al salir o dormir.' },
      { id: 'l-smoke', num: '03', name: 'Detector de humo en el techo', zone: 'Techo central de la sala', type: 'safe', icon: BellRing, norm: 'NFPA · Detección y alerta temprana', description: 'Instalado en lo alto, donde sube el humo, suena en los primeros minutos de un incendio y da tiempo para evacuar.', action: 'Prueba el botón cada mes y cambia la batería una vez al año o cuando avise batería baja.' },
      { id: 'l-rug', num: '04', name: 'Cable pelado debajo de la alfombra', zone: 'Centro de la sala', type: 'hazard', icon: Zap, norm: 'NFPA · Incendios por cableado oculto', description: 'Una extensión bajo la alfombra no disipa el calor y se aplasta al pisarla; el aislamiento se daña hasta producir chispas.', action: 'Saca el cable de debajo de la alfombra, cámbialo si está dañado y llévalo por el borde de la pared.' },
      { id: 'l-candle', num: '05', name: 'Vela encendida sin vigilancia', zone: 'Mesa auxiliar junto a libros', type: 'hazard', icon: Flame, norm: 'NFPA · Incendios por llama abierta', description: 'Una vela cerca de madera, papel o corrientes de aire puede caerse y encender los muebles en minutos.', action: 'Apaga las velas al salir de la habitación o usa velas LED cerca de libros y telas.' },
      { id: 'l-tv-plug', num: '06', name: 'Toma saturada detrás del mueble de TV', zone: 'Detrás del televisor', type: 'hazard', icon: PlugZap, norm: 'Prevención de sobrecarga eléctrica', description: 'Muchos equipos en un solo enchufe, apretado detrás de un mueble sin ventilación, acumulan calor y polvo y favorecen fallas por arco eléctrico.', action: 'Usa una regleta con protección contra sobrecarga en un lugar ventilado y con espacio para los conectores.' },
      { id: 'l-walkway', num: '07', name: 'Iluminación uniforme en la zona central', zone: 'Área de circulación', type: 'safe', icon: Sun, norm: 'NFPA 101 · Visibilidad y prevención de caídas', description: 'Una buena iluminación sin cables atravesados permite ver desniveles y bordes y orientarse rápido hacia la salida.', action: 'Mantén los interruptores accesibles a la entrada y las lámparas limpias.' },
      { id: 'l-hall-clutter', num: '08', name: 'Mueble y cajas en el pasillo de salida', zone: 'Corredor hacia la salida', type: 'hazard', icon: OctagonAlert, norm: 'NFPA 101 · Rutas de evacuación libres', description: 'Muebles, cajas o cables en el corredor hacia la puerta bloquean la evacuación y aumentan el riesgo de caídas.', action: 'Despeja el corredor y deja un paso libre y continuo hasta la puerta exterior.' },
    ],
  },
];

export const RISK_NORMS = [
  { title: 'NFPA 101 · Seguridad Humana', text: 'Pide rutas de evacuación y pasillos siempre despejados, señalización e iluminación de emergencia hacia las salidas y prevención de tropiezos y caídas.' },
  { title: 'NFPA 704 · Materiales peligrosos', text: 'Clasifica sustancias con el rombo de colores: salud (azul), inflamabilidad (rojo), inestabilidad (amarillo) y riesgos especiales (blanco: OX, W, SA).' },
  { title: 'Cocina y electricidad', text: 'Cocinar sin vigilancia es la principal causa de incendios en el hogar. Contenido basado en guías de NFPA y OSHA sobre prevención en cocina e instalaciones eléctricas.' },
];
