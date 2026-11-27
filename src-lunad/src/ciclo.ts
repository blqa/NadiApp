/* =========================================================
   LÓGICA DEL CICLO (sin nada de diseño)
   Todas las fechas son texto "AAAA-MM-DD" para evitar
   problemas de zona horaria.
   ========================================================= */

export type Fecha = string;
export type Objetivo = "track" | "avoid" | "conceive";

export interface Ciclo {
  id: string;
  startDate: Fecha;
  endDate?: Fecha;
  timestamp?: number;
}

export interface Registro {
  mood?: string;
  symptoms?: string[];
  flow?: string;
  cervical?: string;
  intimate?: boolean;
  protection?: string;
  notes?: string;
  updatedAt?: number;
}

export interface Ajustes {
  cycleLength: number;
  periodLength: number;
  goal: Objetivo;
  autoPromedio?: boolean;
}

export const AJUSTES_BASE: Ajustes = { cycleLength: 28, periodLength: 5, goal: "track", autoPromedio: true };

/* ---------- Fechas ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
export const aFecha = (y: number, m: number, d: number): Fecha => `${y}-${pad(m + 1)}-${pad(d)}`;
export const hoy = (): Fecha => { const d = new Date(); return aFecha(d.getFullYear(), d.getMonth(), d.getDate()); };
export const partes = (f: Fecha) => { const [y, m, d] = f.split("-").map(Number); return { y, m: m - 1, d }; };
export const numDia = (f: Fecha) => { const { y, m, d } = partes(f); return Math.round(Date.UTC(y, m, d) / 864e5); };
export const desdeNum = (n: number): Fecha => { const t = new Date(n * 864e5); return aFecha(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()); };
export const sumar = (f: Fecha, dias: number) => desdeNum(numDia(f) + dias);
export const dif = (a: Fecha, b: Fecha) => numDia(a) - numDia(b);
export const aDate = (f: Fecha) => { const { y, m, d } = partes(f); return new Date(y, m, d); };
export const bonita = (f: Fecha, op: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" }) => aDate(f).toLocaleDateString("es-MX", op);

/* ---------- Estadísticas ---------- */
export interface Stats {
  largoCiclo: number;      // el que se usa para predecir
  largoPeriodo: number;
  largos: number[];        // largos reales de ciclos terminados (más reciente al final)
  periodos: number[];      // días reales de sangrado registrados
  variacion: number | null;
  regular: boolean | null;
  usandoPromedio: boolean;
}

const prom = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function ordenar(ciclos: Ciclo[]) {
  // un solo ciclo por fecha de inicio, del más viejo al más nuevo
  const porFecha = new Map<Fecha, Ciclo>();
  ciclos.forEach(c => { if (/^\d{4}-\d{2}-\d{2}$/.test(c.startDate) && !porFecha.has(c.startDate)) porFecha.set(c.startDate, c); });
  return [...porFecha.values()].sort((a, b) => numDia(a.startDate) - numDia(b.startDate));
}

export function estadisticas(ciclosAsc: Ciclo[], aj: Ajustes): Stats {
  const largos: number[] = [];
  for (let i = 1; i < ciclosAsc.length; i++) {
    const l = dif(ciclosAsc[i].startDate, ciclosAsc[i - 1].startDate);
    if (l >= 15 && l <= 60) largos.push(l);
  }
  const ultimos = largos.slice(-6);
  const periodos = ciclosAsc
    .filter(c => c.endDate)
    .map(c => dif(c.endDate!, c.startDate) + 1)
    .filter(n => n >= 1 && n <= 15)
    .slice(-6);
  const usar = aj.autoPromedio !== false;
  const usandoPromedio = usar && ultimos.length > 0;
  const largoCiclo = usandoPromedio ? Math.round(prom(ultimos)) : aj.cycleLength;
  const largoPeriodo = usar && periodos.length ? Math.round(prom(periodos)) : aj.periodLength;
  const variacion = ultimos.length >= 2 ? Math.max(...ultimos) - Math.min(...ultimos) : null;
  return {
    largoCiclo: Math.min(60, Math.max(18, largoCiclo)),
    largoPeriodo: Math.min(12, Math.max(1, largoPeriodo)),
    largos, periodos, variacion,
    regular: variacion == null ? null : variacion <= 7,
    usandoPromedio,
  };
}

/* ---------- Fase de un día ---------- */
export type Fase = "menstrual" | "folicular" | "fertil" | "ovulacion" | "lutea" | "retraso";

export interface Estado {
  diaCiclo: number;
  fase: Fase;
  inicio: Fecha;
  finPeriodo: Fecha;
  ovulacion: Fecha;
  fertilIni: Fecha;
  fertilFin: Fecha;
  siguiente: Fecha;
  diasParaPeriodo: number;
  diasParaOvulacion: number;
  probabilidad: "baja" | "media" | "alta";
  enPeriodoAbierto: boolean; // empezó periodo y no ha marcado que terminó
  ciclo: Ciclo;
}

function ventana(inicio: Fecha, largo: number) {
  const ovulacion = sumar(inicio, largo - 14 - 1); // día (largo - 14) del ciclo
  return { ovulacion, fertilIni: sumar(ovulacion, -5), fertilFin: sumar(ovulacion, 1), siguiente: sumar(inicio, largo) };
}

export function estadoDe(fecha: Fecha, ciclosAsc: Ciclo[], st: Stats): Estado | null {
  let idx = -1;
  for (let i = ciclosAsc.length - 1; i >= 0; i--) if (dif(fecha, ciclosAsc[i].startDate) >= 0) { idx = i; break; }
  if (idx < 0) return null;
  const c = ciclosAsc[idx];
  const sig = ciclosAsc[idx + 1];
  // si ya hay un ciclo siguiente registrado, usamos su largo real
  const largo = sig ? dif(sig.startDate, c.startDate) : st.largoCiclo;
  const finPeriodo = c.endDate ?? sumar(c.startDate, st.largoPeriodo - 1);
  const v = ventana(c.startDate, largo);
  const diaCiclo = dif(fecha, c.startDate) + 1;
  let fase: Fase;
  if (dif(fecha, finPeriodo) <= 0) fase = "menstrual";
  else if (fecha === v.ovulacion) fase = "ovulacion";
  else if (dif(fecha, v.fertilIni) >= 0 && dif(fecha, v.fertilFin) <= 0) fase = "fertil";
  else if (dif(fecha, v.fertilIni) < 0) fase = "folicular";
  else if (dif(fecha, v.siguiente) <= 0) fase = "lutea";
  else fase = "retraso";
  const dOv = dif(v.ovulacion, fecha);
  const probabilidad = fase === "menstrual" ? "baja"
    : dOv >= 0 && dOv <= 2 ? "alta"
    : dif(fecha, v.fertilIni) >= 0 && dif(fecha, v.fertilFin) <= 0 ? "media" : "baja";
  return {
    diaCiclo, fase, inicio: c.startDate, finPeriodo, ...v,
    diasParaPeriodo: dif(v.siguiente, fecha),
    diasParaOvulacion: dOv,
    probabilidad,
    enPeriodoAbierto: !c.endDate && diaCiclo <= st.largoPeriodo + 3,
    ciclo: c,
  };
}

/** La ventana fértil que viene (la de este ciclo o, si ya pasó, la del siguiente) */
export function ventanaQueSigue(est: Estado, st: Stats, desde: Fecha = hoy()) {
  if (dif(est.fertilFin, desde) >= 0) return { ovulacion: est.ovulacion, fertilIni: est.fertilIni, fertilFin: est.fertilFin, proxima: false };
  let inicio = est.siguiente;
  if (dif(inicio, desde) < 0) inicio = sumar(desde, 1);
  const v = ventana(inicio, st.largoCiclo);
  return { ovulacion: v.ovulacion, fertilIni: v.fertilIni, fertilFin: v.fertilFin, proxima: true };
}
export const mayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/* ---------- Marcas del calendario ---------- */
export type Marca = "periodo" | "previsto" | "fertil" | "ovulacion";
export interface InfoDia { marca?: Marca; inicio?: boolean; }

export function marcas(ciclosAsc: Ciclo[], st: Stats, desde: Fecha, hasta: Fecha): Map<Fecha, InfoDia> {
  const m = new Map<Fecha, InfoDia>();
  const poner = (f: Fecha, info: InfoDia, fuerza = false) => {
    if (dif(f, desde) < 0 || dif(f, hasta) > 0) return;
    const ya = m.get(f);
    if (ya?.marca === "periodo" && !fuerza) return;
    m.set(f, { ...ya, ...info });
  };
  const rango = (a: Fecha, b: Fecha, info: InfoDia) => { for (let f = a; dif(f, b) <= 0; f = sumar(f, 1)) poner(f, info); };

  ciclosAsc.forEach((c, i) => {
    const sig = ciclosAsc[i + 1];
    const largo = sig ? dif(sig.startDate, c.startDate) : st.largoCiclo;
    const v = ventana(c.startDate, largo);
    rango(v.fertilIni, v.fertilFin, { marca: "fertil" });
    poner(v.ovulacion, { marca: "ovulacion" });
    const fin = c.endDate ?? sumar(c.startDate, st.largoPeriodo - 1);
    for (let f = c.startDate; dif(f, fin) <= 0; f = sumar(f, 1)) poner(f, { marca: "periodo" }, true);
    poner(c.startDate, { marca: "periodo", inicio: true }, true);
  });

  // Predicciones: los siguientes 8 ciclos
  const ult = ciclosAsc[ciclosAsc.length - 1];
  if (ult) {
    let inicio = sumar(ult.startDate, st.largoCiclo);
    const h = hoy();
    if (dif(inicio, h) < 0) inicio = sumar(h, 1); // si hay retraso, la predicción se recorre
    for (let k = 0; k < 8; k++) {
      const v = ventana(inicio, st.largoCiclo);
      rango(v.fertilIni, v.fertilFin, { marca: "fertil" });
      poner(v.ovulacion, { marca: "ovulacion" });
      rango(inicio, sumar(inicio, st.largoPeriodo - 1), { marca: "previsto" });
      inicio = sumar(inicio, st.largoCiclo);
    }
  }
  return m;
}

/* ---------- Próximo periodo (para el resumen) ---------- */
export function proximoPeriodo(ciclosAsc: Ciclo[], st: Stats): Fecha | null {
  const ult = ciclosAsc[ciclosAsc.length - 1];
  if (!ult) return null;
  return sumar(ult.startDate, st.largoCiclo);
}

/* ---------- Conteos para Análisis ---------- */
export function frecuencias(registros: Record<Fecha, Registro>, campo: "symptoms" | "mood", dias = 90) {
  const desde = sumar(hoy(), -dias);
  const cuenta = new Map<string, number>();
  Object.entries(registros).forEach(([f, r]) => {
    if (dif(f, desde) < 0) return;
    const vals = campo === "symptoms" ? r.symptoms ?? [] : r.mood ? [r.mood] : [];
    vals.forEach(v => cuenta.set(v, (cuenta.get(v) ?? 0) + 1));
  });
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1]);
}
