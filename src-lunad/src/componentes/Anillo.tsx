import type { Estado, Stats } from "../ciclo";
import { dif } from "../ciclo";
import { FASES } from "../opciones";

/* Anillo del ciclo: cada fase es un arco; el puntito es hoy. */
const R = 118, C = 150, GROSOR = 20;

function punto(t: number, r = R) {
  const a = t * 2 * Math.PI - Math.PI / 2;
  return [C + Math.cos(a) * r, C + Math.sin(a) * r];
}
function arco(t0: number, t1: number) {
  const [x0, y0] = punto(t0), [x1, y1] = punto(t1);
  const grande = t1 - t0 > 0.5 ? 1 : 0;
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${R} ${R} 0 ${grande} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export function Anillo({ est, st, children }: { est: Estado; st: Stats; children?: React.ReactNode }) {
  const largo = Math.max(est.diaCiclo, dif(est.siguiente, est.inicio), st.largoCiclo);
  const diaDe = (f: string) => dif(f, est.inicio); // 0 = primer día
  const finP = diaDe(est.finPeriodo) + 1;
  const fIni = diaDe(est.fertilIni), fFin = diaDe(est.fertilFin) + 1, ov = diaDe(est.ovulacion);
  const tramos: { a: number; b: number; color: string }[] = [
    { a: 0, b: finP, color: FASES.menstrual.color },
    { a: finP, b: fIni, color: FASES.folicular.color },
    { a: fIni, b: fFin, color: FASES.fertil.color },
    { a: fFin, b: dif(est.siguiente, est.inicio), color: FASES.lutea.color },
  ];
  if (est.diaCiclo > dif(est.siguiente, est.inicio)) tramos.push({ a: dif(est.siguiente, est.inicio), b: largo, color: FASES.retraso.color });
  const hueco = 0.006;
  const t = (est.diaCiclo - 0.5) / largo;
  const [mx, my] = punto(t);
  const [ox, oy] = punto((ov + 0.5) / largo);

  return (
    <div className="anillo">
      <svg viewBox="0 0 300 300" role="img" aria-label={`Día ${est.diaCiclo} del ciclo, ${FASES[est.fase].nombre}`}>
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--pista)" strokeWidth={GROSOR} />
        {tramos.filter(x => x.b > x.a).map((x, i) => (
          <path key={i} d={arco(x.a / largo + hueco, Math.max(x.a / largo + hueco * 2, x.b / largo - hueco))} fill="none" stroke={x.color} strokeWidth={GROSOR} strokeLinecap="round" opacity={x.a / largo > t ? 0.45 : 1} />
        ))}
        <circle cx={ox} cy={oy} r={5} fill="var(--fondo-tarjeta)" stroke={FASES.ovulacion.color} strokeWidth={3} />
        <circle className="marcador" cx={mx} cy={my} r={15} fill="var(--fondo-tarjeta)" stroke={FASES[est.fase].color} strokeWidth={5} />
        <circle cx={mx} cy={my} r={5} fill={FASES[est.fase].color} />
      </svg>
      <div className="anillo-centro">{children}</div>
    </div>
  );
}
