import type { KeyboardEvent, ReactNode } from 'react';
import type { RiskItemType, RiskScenario, ScenarioId } from './riskDetectorContent';

/**
 * Flat 2D scenes for the risk detector. Colours come from the `--vec-*` / `--rd-*` tokens
 * defined on `.risk-detector` in index.css, so the illustration stays legible in both themes.
 */

interface Hotspot { hit: [number, number, number, number]; badge: [number, number]; label: string; art: ReactNode }

const P = 'var(--rd-ink)';

const ROOM_BASE = (floorY: number) => <>
  <rect x="0" y="0" width="960" height={floorY} fill="var(--vec-wall)" />
  <rect x="0" y={floorY} width="960" height={420 - floorY} fill="var(--vec-floor)" />
  <line x1="0" y1={floorY} x2="960" y2={floorY} stroke="var(--vec-floor-line)" strokeWidth="2" />
</>;

const BACKGROUNDS: Record<ScenarioId, ReactNode> = {
  kitchen: <>
    {ROOM_BASE(310)}
    <line x1="160" y1="310" x2="90" y2="420" stroke="var(--vec-floor-line)" strokeWidth="1.5" />
    <line x1="360" y1="310" x2="320" y2="420" stroke="var(--vec-floor-line)" strokeWidth="1.5" />
    <line x1="600" y1="310" x2="640" y2="420" stroke="var(--vec-floor-line)" strokeWidth="1.5" />
    <line x1="800" y1="310" x2="870" y2="420" stroke="var(--vec-floor-line)" strokeWidth="1.5" />
    <rect x="130" y="135" width="770" height="80" fill="var(--vec-white)" stroke="var(--vec-floor-line)" strokeWidth="1.5" />
    <rect x="135" y="25" width="120" height="85" rx="4" fill="var(--vec-wood)" stroke={P} strokeWidth="2" />
    <rect x="690" y="25" width="210" height="85" rx="4" fill="var(--vec-wood)" stroke={P} strokeWidth="2" />
    <line x1="795" y1="25" x2="795" y2="110" stroke={P} strokeWidth="1.5" />
    <rect x="505" y="25" width="150" height="90" rx="4" fill="var(--vec-glass)" stroke={P} strokeWidth="2" />
    <line x1="580" y1="25" x2="580" y2="115" stroke={P} strokeWidth="1.5" />
    <rect x="130" y="215" width="770" height="16" rx="2" fill="var(--vec-metal)" stroke={P} strokeWidth="2" />
    <rect x="135" y="231" width="760" height="94" fill="var(--vec-wood)" stroke={P} strokeWidth="2" />
  </>,
  office: <>
    {ROOM_BASE(310)}
    <rect x="260" y="32" width="240" height="125" rx="4" fill="var(--vec-glass)" stroke={P} strokeWidth="2" />
    <line x1="380" y1="32" x2="380" y2="157" stroke={P} strokeWidth="1.5" />
    <line x1="260" y1="95" x2="500" y2="95" stroke={P} strokeWidth="1.5" />
    <rect x="190" y="218" width="360" height="16" rx="3" fill="var(--vec-wood)" stroke={P} strokeWidth="2" />
    <rect x="206" y="234" width="14" height="90" fill={P} />
    <rect x="520" y="234" width="14" height="90" fill={P} />
    <rect x="310" y="138" width="126" height="72" rx="4" fill={P} />
    <rect x="318" y="145" width="110" height="56" rx="2" fill="var(--vec-glass)" />
    <rect x="364" y="210" width="18" height="8" fill={P} />
    <rect x="328" y="212" width="90" height="5" rx="2" fill="var(--vec-metal)" stroke={P} strokeWidth="1" />
    <rect x="580" y="232" width="120" height="92" rx="3" fill="var(--vec-wood-dark)" stroke={P} strokeWidth="2" />
    <rect x="595" y="196" width="90" height="36" rx="3" fill="var(--vec-white)" stroke={P} strokeWidth="2" />
    <rect x="610" y="186" width="60" height="10" fill="var(--vec-white)" stroke={P} strokeWidth="1.5" />
    <rect x="770" y="88" width="126" height="222" rx="2" fill="var(--vec-white)" stroke={P} strokeWidth="2.5" />
    <rect x="810" y="114" width="46" height="54" rx="2" fill="var(--vec-glass)" stroke={P} strokeWidth="1.5" />
    <rect x="782" y="196" width="8" height="24" rx="2" fill="var(--vec-metal-dark)" />
  </>,
  living: <>
    {ROOM_BASE(305)}
    <rect x="52" y="45" width="150" height="165" rx="3" fill="var(--vec-glass)" stroke={P} strokeWidth="2" />
    <path d="M44 42 L88 42 L82 260 L44 260 Z" fill="var(--vec-fabric-light)" stroke={P} strokeWidth="1.5" />
    <path d="M168 42 L212 42 L212 260 L174 260 Z" fill="var(--vec-fabric-light)" stroke={P} strokeWidth="1.5" />
    <rect x="235" y="185" width="240" height="96" rx="10" fill="var(--vec-fabric)" stroke={P} strokeWidth="2" />
    <rect x="225" y="220" width="24" height="65" rx="6" fill="var(--vec-fabric-light)" stroke={P} strokeWidth="2" />
    <rect x="461" y="220" width="24" height="65" rx="6" fill="var(--vec-fabric-light)" stroke={P} strokeWidth="2" />
    <rect x="252" y="232" width="100" height="32" rx="4" fill="var(--vec-fabric-light)" />
    <rect x="360" y="232" width="100" height="32" rx="4" fill="var(--vec-fabric-light)" />
    <rect x="545" y="228" width="190" height="68" rx="4" fill="var(--vec-wood)" stroke={P} strokeWidth="2" />
    <rect x="568" y="132" width="144" height="84" rx="4" fill={P} />
    <rect x="576" y="140" width="128" height="68" rx="2" fill="var(--vec-glass)" />
    <rect x="630" y="216" width="20" height="12" fill={P} />
    <rect x="815" y="92" width="110" height="213" fill="var(--vec-white)" stroke={P} strokeWidth="2" />
  </>,
};

const RED = 'var(--rd-red)';
const YELLOW = 'var(--rd-yellow)';
const GREEN = 'var(--rd-green)';
const BLUE = 'var(--rd-blue)';
const RUST = 'var(--rd-rust)';

const HOTSPOTS: Record<string, Hotspot> = {
  'k-ext': { hit: [26, 132, 74, 122], badge: [86, 144], label: 'Extintor en la pared izquierda', art: <>
    <rect x="44" y="160" width="38" height="78" rx="10" fill={RED} stroke={P} strokeWidth="2" />
    <rect x="54" y="148" width="18" height="12" fill={P} />
    <path d="M54 152 L36 146 M72 152 L84 166 L80 198" fill="none" stroke={P} strokeWidth="3" strokeLinecap="round" />
    <circle cx="63" cy="182" r="8" fill="var(--vec-white)" stroke={P} strokeWidth="1.5" />
    <circle cx="63" cy="182" r="4" fill={GREEN} />
    <rect x="49" y="196" width="28" height="22" rx="2" fill="var(--vec-white)" />
  </> },
  'k-chem': { hit: [148, 238, 144, 82], badge: [278, 246], label: 'Productos de limpieza junto a alimentos', art: <>
    <rect x="155" y="244" width="130" height="70" rx="3" fill="var(--vec-white)" stroke={P} strokeWidth="2" />
    <rect x="165" y="266" width="26" height="40" rx="4" fill={YELLOW} stroke={P} strokeWidth="1.5" />
    <rect x="167" y="260" width="22" height="6" fill="var(--vec-wood-dark)" />
    <rect x="197" y="274" width="24" height="32" rx="3" fill={GREEN} stroke={P} strokeWidth="1.5" />
    <rect x="232" y="256" width="22" height="50" rx="3" fill={BLUE} stroke={P} strokeWidth="1.5" />
    <polygon points="237,256 249,256 246,248 240,248" fill={RED} />
    <rect x="259" y="264" width="19" height="42" rx="3" fill={RUST} stroke={P} strokeWidth="1.5" />
  </> },
  'k-hood': { hit: [285, 16, 190, 92], badge: [460, 32], label: 'Campana extractora con grasa', art: <>
    <rect x="355" y="20" width="50" height="40" fill="var(--vec-metal)" stroke={P} strokeWidth="2" />
    <polygon points="295,100 465,100 420,60 340,60" fill="var(--vec-metal)" stroke={P} strokeWidth="2" />
    <rect x="308" y="92" width="144" height="8" fill={RUST} opacity="0.85" />
    <circle cx="330" cy="103" r="3" fill={RUST} />
    <circle cx="385" cy="104" r="3.5" fill={RUST} />
    <circle cx="430" cy="103" r="3" fill={RUST} />
  </> },
  'k-stove': { hit: [302, 152, 156, 170], badge: [442, 166], label: 'Sartén con aceite sobre la estufa encendida', art: <>
    <rect x="312" y="215" width="136" height="110" fill="var(--vec-white)" stroke={P} strokeWidth="2" />
    <rect x="330" y="246" width="100" height="62" rx="4" fill={P} />
    <rect x="340" y="256" width="80" height="40" rx="2" fill="var(--vec-glass)" opacity="0.3" />
    <rect x="328" y="206" width="50" height="9" fill={P} />
    <path d="M322 192 L384 192 L378 206 L328 206 Z" fill="var(--vec-metal-dark)" stroke={P} strokeWidth="2" />
    <line x1="384" y1="196" x2="424" y2="188" stroke={P} strokeWidth="5" strokeLinecap="round" />
    <path d="M340 188 Q336 172 346 164 Q352 178 358 160 Q368 175 366 188 Z" fill={RED} />
    <path d="M348 188 Q352 176 358 188 Z" fill={YELLOW} />
  </> },
  'k-lid': { hit: [462, 154, 90, 66], badge: [540, 164], label: 'Tapa metálica y manopla', art: <>
    <ellipse cx="500" cy="204" rx="28" ry="8" fill="var(--vec-metal)" stroke={P} strokeWidth="2" />
    <rect x="494" y="190" width="12" height="6" rx="2" fill={P} />
    <path d="M524 166 C524 158, 538 158, 538 166 L538 192 C538 198, 520 198, 520 190 L520 176 Z" fill={GREEN} stroke={P} strokeWidth="2" />
  </> },
  'k-sink': { hit: [560, 146, 186, 84], badge: [730, 158], label: 'Tostadora junto al fregadero', art: <>
    <rect x="615" y="210" width="115" height="14" rx="2" fill="var(--vec-metal-dark)" stroke={P} strokeWidth="1.5" />
    <path d="M672 210 L672 174 C672 162, 690 162, 690 176" fill="none" stroke="var(--vec-metal-dark)" strokeWidth="5" strokeLinecap="round" />
    <ellipse cx="690" cy="198" rx="18" ry="5" fill={BLUE} opacity="0.35" />
    <rect x="572" y="176" width="44" height="36" rx="6" fill="var(--vec-metal)" stroke={P} strokeWidth="2" />
    <rect x="580" y="172" width="10" height="4" fill={P} />
    <rect x="598" y="172" width="10" height="4" fill={P} />
    <path d="M572 198 Q562 204 566 212" fill="none" stroke={RED} strokeWidth="2.5" />
  </> },
  'k-knives': { hit: [756, 170, 128, 58], badge: [870, 178], label: 'Cuchillos sueltos al borde de la encimera', art: <>
    <rect x="768" y="202" width="96" height="12" rx="2" fill="var(--vec-wood-dark)" stroke={P} strokeWidth="1.5" />
    <polygon points="776,198 818,194 818,200 776,200" fill="var(--vec-metal)" stroke={P} strokeWidth="1.5" />
    <rect x="818" y="193" width="20" height="7" rx="2" fill={P} />
    <polygon points="794,186 838,192 838,196 794,190" fill="var(--vec-metal)" stroke={P} strokeWidth="1.5" />
    <rect x="838" y="191" width="18" height="6" rx="2" fill={RUST} />
  </> },
  'k-floor': { hit: [450, 328, 260, 74], badge: [696, 336], label: 'Piso limpio y despejado', art: <>
    <rect x="466" y="340" width="228" height="50" rx="8" fill="var(--vec-safe-soft)" stroke={GREEN} strokeWidth="2" strokeDasharray="6 4" />
    <path d="M510 365 L640 365 M628 355 L642 365 L628 375" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <text x="580" y="354" textAnchor="middle" fontSize="11" fontWeight="700" fill={GREEN}>PASO DESPEJADO Y SECO</text>
  </> },

  'o-kit': { hit: [48, 114, 92, 92], badge: [128, 126], label: 'Botiquín en la pared izquierda', art: <>
    <rect x="60" y="124" width="68" height="72" rx="6" fill="var(--vec-white)" stroke={P} strokeWidth="2" />
    <rect x="88" y="142" width="12" height="36" rx="2" fill={GREEN} />
    <rect x="76" y="154" width="36" height="12" rx="2" fill={GREEN} />
  </> },
  'o-outlet': { hit: [64, 256, 136, 82], badge: [190, 266], label: 'Regletas conectadas en cascada', art: <>
    <rect x="78" y="268" width="24" height="32" rx="2" fill="var(--vec-white)" stroke={P} strokeWidth="1.5" />
    <rect x="114" y="294" width="66" height="16" rx="3" fill="var(--vec-white)" stroke={RED} strokeWidth="2" />
    <rect x="132" y="316" width="60" height="14" rx="3" fill="var(--vec-white)" stroke={RED} strokeWidth="2" />
    <path d="M90 284 C105 284, 102 302, 114 302 M168 302 C180 302, 185 322, 178 322" fill="none" stroke={P} strokeWidth="2.5" />
    <path d="M124 294 L124 276 M138 294 L138 274 M152 294 L152 278" stroke={RED} strokeWidth="2.5" />
  </> },
  'o-cable-worn': { hit: [200, 130, 96, 94], badge: [284, 140], label: 'Lámpara con cable pelado', art: <>
    <rect x="218" y="206" width="36" height="10" rx="2" fill={P} />
    <path d="M236 206 L222 172 L252 146" fill="none" stroke={P} strokeWidth="4" strokeLinecap="round" />
    <polygon points="244,140 274,152 256,166" fill={BLUE} stroke={P} strokeWidth="2" />
    <path d="M218 212 C205 214, 206 226, 224 226" fill="none" stroke={RED} strokeWidth="3" strokeDasharray="4 3" />
    <polygon points="208,214 214,206 218,216" fill={YELLOW} />
  </> },
  'o-coffee': { hit: [424, 162, 76, 60], badge: [490, 170], label: 'Taza de café junto al teclado', art: <>
    <rect x="440" y="188" width="28" height="28" rx="3" fill={RUST} stroke={P} strokeWidth="2" />
    <path d="M468 194 C478 194, 478 210, 468 210" fill="none" stroke={P} strokeWidth="2.5" />
    <path d="M448 182 Q445 174 452 168 M458 182 Q455 174 462 168" fill="none" stroke="var(--vec-metal-dark)" strokeWidth="2" strokeLinecap="round" />
  </> },
  'o-cable-tray': { hit: [284, 236, 184, 58], badge: [454, 246], label: 'Canaleta de cables bajo el escritorio', art: <>
    <rect x="298" y="246" width="156" height="22" rx="4" fill="var(--vec-safe-soft)" stroke={GREEN} strokeWidth="2" />
    <line x1="312" y1="257" x2="440" y2="257" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
    <rect x="330" y="244" width="8" height="26" rx="2" fill={P} />
    <rect x="414" y="244" width="8" height="26" rx="2" fill={P} />
  </> },
  'o-solvents': { hit: [688, 168, 70, 68], badge: [748, 176], label: 'Aerosoles junto a la impresora', art: <>
    <rect x="698" y="188" width="18" height="42" rx="3" fill={RED} stroke={P} strokeWidth="1.5" />
    <rect x="703" y="180" width="8" height="8" fill="var(--vec-white)" stroke={P} strokeWidth="1" />
    <rect x="722" y="196" width="20" height="34" rx="2" fill={YELLOW} stroke={P} strokeWidth="1.5" />
  </> },
  'o-sign': { hit: [774, 26, 118, 58], badge: [882, 34], label: 'Señal de salida sobre la puerta', art: <>
    <rect x="786" y="38" width="94" height="34" rx="4" fill={GREEN} stroke={P} strokeWidth="2" />
    <text x="833" y="60" textAnchor="middle" fontSize="13" fontWeight="800" fill="#FFFFFF">SALIDA</text>
  </> },
  'o-exit-boxes': { hit: [760, 216, 144, 114], badge: [892, 226], label: 'Cajas bloqueando la salida de emergencia', art: <>
    <rect x="774" y="264" width="64" height="56" rx="3" fill="var(--vec-wood)" stroke={P} strokeWidth="2" />
    <line x1="774" y1="286" x2="838" y2="286" stroke="var(--vec-wood-dark)" strokeWidth="2" />
    <rect x="838" y="274" width="54" height="46" rx="3" fill="var(--vec-wood-dark)" stroke={P} strokeWidth="2" />
    <rect x="794" y="224" width="54" height="40" rx="3" fill="var(--vec-wood)" stroke={P} strokeWidth="2" />
  </> },

  'l-outlet-safe': { hit: [14, 220, 54, 58], badge: [58, 228], label: 'Enchufe con protector', art: <>
    <rect x="26" y="232" width="30" height="36" rx="4" fill="var(--vec-white)" stroke={GREEN} strokeWidth="2" />
    <circle cx="41" cy="250" r="8" fill="var(--vec-safe-soft)" stroke={GREEN} strokeWidth="1.5" />
  </> },
  'l-heater': { hit: [122, 234, 90, 74], badge: [202, 242], label: 'Calefactor junto a cortinas y sofá', art: <>
    <rect x="134" y="246" width="64" height="52" rx="6" fill="var(--vec-white)" stroke={RED} strokeWidth="2" />
    <rect x="144" y="256" width="44" height="26" rx="3" fill={RED} />
    <line x1="150" y1="264" x2="182" y2="264" stroke={YELLOW} strokeWidth="3" />
    <line x1="150" y1="274" x2="182" y2="274" stroke={YELLOW} strokeWidth="3" />
  </> },
  'l-smoke': { hit: [396, 12, 112, 54], badge: [496, 20], label: 'Detector de humo en el techo', art: <>
    <ellipse cx="452" cy="34" rx="40" ry="12" fill="var(--vec-white)" stroke={P} strokeWidth="2" />
    <circle cx="468" cy="36" r="4" fill={GREEN} />
  </> },
  'l-rug': { hit: [242, 320, 236, 84], badge: [466, 330], label: 'Cable pelado bajo la alfombra', art: <>
    <polygon points="270,334 450,334 468,392 252,392" fill="var(--vec-wood)" stroke={P} strokeWidth="2" />
    <path d="M250 364 Q360 352 465 368" fill="none" stroke={RED} strokeWidth="4" strokeDasharray="6 4" />
    <polygon points="444,358 456,348 454,364" fill={YELLOW} />
  </> },
  'l-candle': { hit: [488, 188, 60, 96], badge: [538, 198], label: 'Vela encendida en la mesa auxiliar', art: <>
    <rect x="496" y="246" width="44" height="34" rx="3" fill="var(--vec-wood-dark)" stroke={P} strokeWidth="1.5" />
    <rect x="510" y="218" width="16" height="28" rx="2" fill="var(--vec-white)" stroke={P} strokeWidth="1.5" />
    <path d="M518 214 Q512 204 518 196 Q524 204 518 214 Z" fill={RED} />
  </> },
  'l-tv-plug': { hit: [720, 220, 76, 80], badge: [784, 230], label: 'Toma saturada detrás del televisor', art: <>
    <rect x="732" y="248" width="38" height="36" rx="4" fill="var(--vec-white)" stroke={RED} strokeWidth="2" />
    <path d="M736 258 L718 242 M736 266 L716 266 M736 274 L718 288" stroke={RED} strokeWidth="2.5" />
    <circle cx="751" cy="266" r="6" fill={RED} />
  </> },
  'l-walkway': { hit: [498, 48, 78, 134], badge: [566, 58], label: 'Lámpara de pie en la zona central', art: <>
    <line x1="536" y1="90" x2="536" y2="174" stroke={P} strokeWidth="3" />
    <polygon points="514,90 558,90 548,60 524,60" fill={YELLOW} opacity="0.85" stroke={P} strokeWidth="2" />
  </> },
  'l-hall-clutter': { hit: [802, 228, 134, 106], badge: [922, 238], label: 'Mueble y cajas en el pasillo de salida', art: <>
    <rect x="816" y="264" width="60" height="54" rx="3" fill="var(--vec-wood-dark)" stroke={P} strokeWidth="2" />
    <rect x="866" y="276" width="52" height="44" rx="3" fill="var(--vec-wood)" stroke={P} strokeWidth="2" />
    <rect x="826" y="236" width="42" height="28" rx="3" fill="var(--vec-wood)" stroke={P} strokeWidth="2" />
  </> },
};

function StatusBadge({ type }: { type: RiskItemType }) {
  return type === 'safe'
    ? <>
      <circle r="14" fill={GREEN} stroke="#FFFFFF" strokeWidth="2" />
      <path d="M-6 0 L-2 4 L6 -5" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
    : <>
      <circle r="14" fill={RED} stroke="#FFFFFF" strokeWidth="2" />
      <path d="M0 -6 L0 2" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <circle cy="6.5" r="1.5" fill="#FFFFFF" />
    </>;
}

interface RiskSceneProps {
  scenario: RiskScenario;
  inspected: ReadonlySet<string>;
  onInspect: (itemId: string) => void;
}

export function RiskScene({ scenario, inspected, onInspect }: RiskSceneProps) {
  const onKey = (event: KeyboardEvent<SVGGElement>, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onInspect(id);
    }
  };
  return <svg className="block h-auto w-full select-none" viewBox="0 0 960 420" role="group" aria-label={`Ilustración interactiva: ${scenario.title}`}>
    {BACKGROUNDS[scenario.id]}
    {scenario.items.map((item) => {
      const spot = HOTSPOTS[item.id];
      if (!spot) return null;
      const done = inspected.has(item.id);
      const [x, y, w, h] = spot.hit;
      return <g key={item.id} className={`rd-item${done ? ` is-${item.type}` : ''}`} tabIndex={0} role="button" aria-label={`${spot.label}${done ? (item.type === 'hazard' ? ' (peligro detectado)' : ' (seguro)') : ''}`} onClick={() => onInspect(item.id)} onKeyDown={(event) => onKey(event, item.id)}>
        <rect className="rd-hit" x={x} y={y} width={w} height={h} rx="8" />
        {spot.art}
        {done && <g transform={`translate(${spot.badge[0]}, ${spot.badge[1]})`}><g className="rd-badge"><StatusBadge type={item.type} /></g></g>}
      </g>;
    })}
  </svg>;
}
