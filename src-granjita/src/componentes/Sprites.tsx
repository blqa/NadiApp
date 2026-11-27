/* Dibujos de la granjita (SVG hecho a mano). El (0,0) es el piso. */
import type { CultivoId, DecorId } from "../datos";

const HOJA = "#5d9a3e", HOJA2 = "#4a8331";

function Brote() {
  return <g><path d="M0 0 C0 -6 0 -10 0 -12" stroke={HOJA} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M0 -9 C-6 -13 -9 -10 -9 -7 C-5 -6 -2 -7 0 -9Z" fill={HOJA} /><path d="M0 -11 C5 -16 9 -13 9 -10 C5 -8 2 -9 0 -11Z" fill={HOJA2} /></g>;
}
function Mata({ alto = 20 }: { alto?: number }) {
  return <g><path d={`M0 0 L0 ${-alto}`} stroke={HOJA} strokeWidth="2.4" strokeLinecap="round" />
    <path d={`M0 ${-alto * .35} C-10 ${-alto * .5} -13 ${-alto * .3} -12 ${-alto * .15} C-7 ${-alto * .15} -3 ${-alto * .22} 0 ${-alto * .35}Z`} fill={HOJA} />
    <path d={`M0 ${-alto * .6} C10 ${-alto * .78} 13 ${-alto * .58} 12 ${-alto * .42} C7 ${-alto * .42} 3 ${-alto * .5} 0 ${-alto * .6}Z`} fill={HOJA2} />
    <path d={`M0 ${-alto * .85} C-7 ${-alto} -9 ${-alto * .85} -8 ${-alto * .72} C-5 ${-alto * .72} -2 ${-alto * .76} 0 ${-alto * .85}Z`} fill={HOJA} /></g>;
}

function Fruto({ c, oro }: { c: CultivoId; oro?: boolean }) {
  const dor = (n: string) => (oro ? "#f5c542" : n);
  switch (c) {
    case "fresa":
      return <g><Mata alto={14} />
        {[[-7, -6], [6, -9], [-1, -14]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d="M-4 -2 C-4 4 0 7 0 7 C0 7 4 4 4 -2 C4 -4 -4 -4 -4 -2Z" fill={dor("#e2475a")} stroke="#0002" strokeWidth=".5" />
            <path d="M-3 -3 L0 -5 L3 -3 L0 -2Z" fill={HOJA} /><circle cx="-1.5" cy="1" r=".5" fill="#ffe08a" /><circle cx="1.5" cy="2.5" r=".5" fill="#ffe08a" />
          </g>))}</g>;
    case "girasol":
      return <g><Mata alto={26} /><g transform="translate(0 -29)">
        {Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx="0" cy="-7" rx="2.6" ry="5" fill={dor("#f8c22e")} transform={`rotate(${i * 30})`} />)}
        <circle r="5.5" fill={oro ? "#c98a12" : "#6b3f1d"} /><circle r="5.5" fill="none" stroke="#0003" strokeDasharray="1 1.6" /></g></g>;
    case "lavanda":
      return <g>{[-6, 0, 6].map((x, k) => (
        <g key={k} transform={`translate(${x} 0) rotate(${x * 1.5})`}>
          <path d="M0 0 L0 -26" stroke={HOJA} strokeWidth="1.6" />
          {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={i % 2 ? 1.6 : -1.6} cy={-13 - i * 2.6} rx="2.2" ry="1.8" fill={dor(i % 2 ? "#9b7fe0" : "#8466d3")} />)}
        </g>))}</g>;
    case "calabaza":
      return <g><path d="M-14 -2 C-18 -8 -10 -12 -6 -8 M14 -2 C18 -10 9 -12 7 -7" stroke={HOJA} strokeWidth="2" fill="none" />
        <ellipse cx="-12" cy="-6" rx="6" ry="4" fill={HOJA2} transform="rotate(-25 -12 -6)" />
        <g transform="translate(0 -8)">
          <ellipse cx="-5" cy="0" rx="7" ry="8" fill={dor("#e9832b")} /><ellipse cx="5" cy="0" rx="7" ry="8" fill={dor("#e9832b")} />
          <ellipse cx="0" cy="0" rx="6" ry="8.5" fill={dor("#f39a3d")} /><path d="M0 -8 C0 -11 2 -13 4 -13" stroke="#6b8f3a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g></g>;
    case "rosa":
      return <g><Mata alto={22} /><g transform="translate(0 -26)">
        {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx="0" cy="-4.5" rx="4.6" ry="5" fill={dor("#d6336c")} transform={`rotate(${i * 72})`} />)}
        <circle r="4.6" fill={oro ? "#e0a92a" : "#b11f55"} /><path d="M-3 0 C-3 -3 3 -3.5 3 -.5 C3 2 -1 2.4 -1.4 .4" stroke={dor("#ff7ba3")} strokeWidth="1.2" fill="none" /></g></g>;
  }
}

export function Planta({ cultivo, etapa, oro }: { cultivo: CultivoId; etapa: 0 | 1 | 2 | 3; oro?: boolean }) {
  return (
    <svg viewBox="-20 -38 40 42" className="sprite planta" aria-hidden="true">
      {etapa === 0 && <g>{[-6, 0, 6].map(x => <ellipse key={x} cx={x} cy="-1" rx="1.6" ry="1.1" fill="#7a4e2c" />)}</g>}
      {etapa === 1 && <Brote />}
      {etapa === 2 && <Mata alto={cultivo === "girasol" ? 20 : 15} />}
      {etapa === 3 && <g className="madura"><Fruto c={cultivo} oro={oro} /></g>}
    </svg>
  );
}

export function Decoracion({ id }: { id: DecorId }) {
  return (
    <svg viewBox="-20 -34 40 38" className="sprite decor" aria-hidden="true">
      {id === "camino" && <g>{[[-9, -4, 7], [6, -7, 8], [-2, -15, 6], [9, -19, 5], [-10, -21, 5]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * .7} fill={i % 2 ? "#c9c0b4" : "#b8ad9f"} stroke="#0001" />)}</g>}
      {id === "cerca" && <g fill="#b07a4a" stroke="#7a4f2a" strokeWidth=".8">
        <rect x="-16" y="-18" width="32" height="3.5" rx="1.5" /><rect x="-16" y="-9" width="32" height="3.5" rx="1.5" />
        {[-13, 0, 13].map(x => <path key={x} d={`M${x - 2.5} 1 L${x - 2.5} -22 L${x} -25 L${x + 2.5} -22 L${x + 2.5} 1Z`} />)}</g>}
      {id === "maceta" && <g><path d="M-8 -10 L8 -10 L6 1 L-6 1Z" fill="#c8704a" /><rect x="-9.5" y="-13" width="19" height="4" rx="1.5" fill="#a8532f" />
        {[[-4, -20, "#ff8db1"], [3, -22, "#ffd23f"], [0, -16, "#ff5d73"]].map(([x, y, c], i) => <g key={i}><path d={`M0 -13 L${x} ${y}`} stroke={HOJA} strokeWidth="1.4" /><circle cx={x as number} cy={y as number} r="3.2" fill={c as string} /><circle cx={x as number} cy={y as number} r="1.1" fill="#fff8" /></g>)}</g>}
      {id === "farol" && <g><rect x="-1.5" y="-26" width="3" height="27" fill="#3d3a44" /><rect x="-6" y="-1" width="12" height="2.5" rx="1" fill="#3d3a44" />
        <path d="M-6 -24 L6 -24 L4.5 -33 L-4.5 -33Z" fill="#3d3a44" /><rect className="luz-farol" x="-4.5" y="-32" width="9" height="7.5" rx="1" fill="#ffe08a" /></g>}
      {id === "banca" && <g fill="#a86c3c" stroke="#6e4422" strokeWidth=".8"><rect x="-17" y="-12" width="34" height="4" rx="1.5" /><rect x="-17" y="-20" width="34" height="3.5" rx="1.5" />
        <rect x="-14" y="-8" width="3" height="9" /><rect x="11" y="-8" width="3" height="9" /><rect x="-14" y="-20" width="2.5" height="8" /><rect x="11.5" y="-20" width="2.5" height="8" /></g>}
    </svg>
  );
}

export function Cabana({ luz }: { luz: boolean }) {
  return (
    <svg viewBox="0 0 120 96" className="sprite cabana" aria-hidden="true">
      {luz && <><defs><radialGradient id="halo-cabana"><stop offset="0" stopColor="#ffd56b" stopOpacity=".55" /><stop offset="1" stopColor="#ffd56b" stopOpacity="0" /></radialGradient></defs><ellipse cx="60" cy="72" rx="60" ry="26" fill="url(#halo-cabana)" className="halo" /></>}
      <rect x="18" y="40" width="84" height="50" rx="4" fill="#c98b55" />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M18 ${46 + i * 8} L102 ${46 + i * 8}`} stroke="#a8703f" strokeWidth="1.2" />)}
      <path d="M8 44 L60 10 L112 44 Z" fill="#b5483b" /><path d="M8 44 L60 10 L112 44" fill="none" stroke="#8e3328" strokeWidth="4" strokeLinejoin="round" />
      <rect x="80" y="14" width="10" height="18" fill="#7d5a48" />
      <rect x="51" y="60" width="18" height="30" rx="2" fill="#7a4a2a" /><circle cx="65" cy="76" r="1.6" fill="#e9c46a" />
      {[26, 78].map(x => (
        <g key={x}><rect x={x} y="54" width="16" height="14" rx="1.5" fill={luz ? "#ffd56b" : "#bfe3f0"} className={luz ? "ventana-luz" : ""} />
          <path d={`M${x + 8} 54 L${x + 8} 68 M${x} 61 L${x + 16} 61`} stroke="#7a4a2a" strokeWidth="1.6" /><rect x={x} y="54" width="16" height="14" rx="1.5" fill="none" stroke="#7a4a2a" strokeWidth="1.6" /></g>
      ))}
    </svg>
  );
}

export function Tablon({ pendientes }: { pendientes: number }) {
  return (
    <svg viewBox="0 0 70 70" className="sprite tablon" aria-hidden="true">
      <rect x="12" y="30" width="4" height="38" fill="#7a4f2a" /><rect x="54" y="30" width="4" height="38" fill="#7a4f2a" />
      <rect x="6" y="12" width="58" height="34" rx="3" fill="#b07a4a" stroke="#7a4f2a" strokeWidth="2" />
      <rect x="12" y="17" width="20" height="15" fill="#fff6dc" transform="rotate(-4 22 24)" /><rect x="36" y="18" width="22" height="18" fill="#ffe1ea" transform="rotate(5 47 27)" />
      <circle cx="22" cy="18" r="1.6" fill="#e2475a" /><circle cx="47" cy="19" r="1.6" fill="#5b8def" />
      {pendientes > 0 && <g><circle cx="60" cy="12" r="8" fill="#e2475a" /><text x="60" y="15.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">{pendientes}</text></g>}
    </svg>
  );
}

export function Cofre({ nuevos }: { nuevos: number }) {
  return (
    <svg viewBox="0 0 70 60" className="sprite cofre" aria-hidden="true">
      <rect x="10" y="26" width="50" height="28" rx="3" fill="#a8703f" stroke="#6e4422" strokeWidth="2" />
      <path d="M10 28 C10 12 60 12 60 28Z" fill="#c08550" stroke="#6e4422" strokeWidth="2" />
      <rect x="30" y="24" width="10" height="12" rx="2" fill="#e9c46a" stroke="#a8862a" />
      <path d="M10 34 L60 34" stroke="#6e4422" strokeWidth="2" />
      {nuevos > 0 && <g className="corazones"><path d="M35 8 C32 3 26 6 30 11 L35 15 L40 11 C44 6 38 3 35 8Z" fill="#e8618c" /></g>}
      {nuevos > 0 && <g><circle cx="58" cy="12" r="8" fill="#e8618c" /><text x="58" y="15.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">{nuevos}</text></g>}
    </svg>
  );
}

export function Gato({ sentado, dir = 1 }: { sentado?: boolean; dir?: 1 | -1 }) {
  return (
    <svg viewBox="-16 -22 32 24" className={`sprite gato ${sentado ? "sentado" : "camina"}`} aria-hidden="true" style={{ transform: `scaleX(${dir})` }}>
      <ellipse cx="0" cy="1" rx="11" ry="2" fill="#0002" />
      <path className="cola" d="M-9 -6 C-15 -8 -15 -16 -11 -18" stroke="#f0a35e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="-2" cy="-7" rx="9" ry="6" fill="#f0a35e" />
      {!sentado && <g className="patas" fill="#e08f47"><rect x="-8" y="-3" width="3" height="4" rx="1.4" /><rect x="3" y="-3" width="3" height="4" rx="1.4" /></g>}
      <path d="M-6 -11 L-6 -5 M-2 -12 L-2 -4" stroke="#d9823a" strokeWidth="1.4" opacity=".6" />
      <g transform="translate(7 -12)">
        <circle r="6" fill="#f0a35e" /><path d="M-5 -3 L-4 -9 L0 -5Z M5 -3 L4 -9 L0 -5Z" fill="#f0a35e" /><path d="M-4 -4.5 L-3.6 -7.4 L-1.8 -5.2Z" fill="#ffb3c6" />
        <circle cx="-2" cy="-.5" r="1" fill="#2b1d2c" /><circle cx="2.4" cy="-.5" r="1" fill="#2b1d2c" /><path d="M0 1.4 L-.8 .8 L.8 .8Z" fill="#e8618c" />
        <path d="M3 2 L8 1.5 M3 3 L8 3.4" stroke="#fff" strokeWidth=".5" />
      </g>
    </svg>
  );
}

export function Avatar({ quien, chico }: { quien: "nadia" | "luis"; chico?: boolean }) {
  const c = quien === "nadia" ? "#e8618c" : "#5b8def";
  return (
    <svg viewBox="-12 -24 24 26" className={`sprite avatar ${chico ? "chico" : ""}`} aria-hidden="true">
      <ellipse cx="0" cy="1" rx="7" ry="1.8" fill="#0002" />
      <path d="M-6 0 C-6 -9 6 -9 6 0Z" fill={c} />
      <circle cx="0" cy="-13" r="6" fill="#f4c7a1" />
      {quien === "nadia"
        ? <path d="M-6.5 -12 C-7 -21 7 -21 6.5 -12 C6 -15 3 -17 0 -17 C-3 -17 -6 -15 -6.5 -12Z M-6.5 -12 C-8 -6 -7 -3 -5.5 -2 L-5 -12Z M6.5 -12 C8 -6 7 -3 5.5 -2 L5 -12Z" fill="#3a2418" />
        : <path d="M-6.3 -13 C-7 -20 7 -21 6.3 -13 C5 -16 2 -17 -1 -16.5 C-3 -16 -5 -15 -6.3 -13Z" fill="#2b1d16" />}
      <circle cx="-2" cy="-12.5" r=".9" fill="#2b1d2c" /><circle cx="2" cy="-12.5" r=".9" fill="#2b1d2c" />
      <path d="M-1.5 -10 C-.5 -9.2 .5 -9.2 1.5 -10" stroke="#c0606a" strokeWidth=".8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Moneda() {
  return <svg viewBox="0 0 16 16" className="moneda" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#f5c542" stroke="#c99a1e" strokeWidth="1.4" /><path d="M8 4.5 L9 7 L11.5 7.2 L9.6 8.8 L10.2 11.3 L8 10 L5.8 11.3 L6.4 8.8 L4.5 7.2 L7 7Z" fill="#fff6c8" /></svg>;
}
