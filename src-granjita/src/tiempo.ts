import { CULTIVOS } from "./datos";
import type { Parcela } from "./tipos";

/* ---------- Crecimiento ----------
   Una semilla empieza a crecer cuando alguien la riega.
   Si la riega la otra persona también, crece al doble desde ese momento
   (Amor Compartido) y tiene más probabilidad de salir dorada. */
export function progreso(p: Parcela, ahora = Date.now()): number {
  if (!p.cultivo || (p.estado !== "regada" && p.estado !== "lista")) return 0;
  const dur = CULTIVOS[p.cultivo].duracion;
  const crecido = (p.crecido ?? 0) + Math.max(0, ahora - (p.desde ?? ahora)) * (p.velocidad ?? 1);
  return Math.min(1, crecido / dur);
}
export const estaLista = (p: Parcela, ahora = Date.now()) => p.estado === "lista" || (p.estado === "regada" && progreso(p, ahora) >= 1);

export function faltante(p: Parcela, ahora = Date.now()): number {
  if (!p.cultivo) return 0;
  const dur = CULTIVOS[p.cultivo].duracion;
  const crecido = (p.crecido ?? 0) + Math.max(0, ahora - (p.desde ?? ahora)) * (p.velocidad ?? 1);
  return Math.max(0, (dur - crecido) / (p.velocidad ?? 1));
}

export function duracionBonita(ms: number): string {
  const min = Math.ceil(ms / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/* ---------- Hora de Ciudad de México ---------- */
export type Momento = "amanecer" | "dia" | "atardecer" | "noche";

export function horaCDMX(d = new Date()): number {
  const partes = new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(d);
  const h = Number(partes.find(x => x.type === "hour")?.value ?? 12);
  const m = Number(partes.find(x => x.type === "minute")?.value ?? 0);
  return h + m / 60;
}
export function momento(h = horaCDMX()): Momento {
  if (h >= 6 && h < 8) return "amanecer";
  if (h >= 8 && h < 17.5) return "dia";
  if (h >= 17.5 && h < 19.75) return "atardecer";
  return "noche";
}
/** Fecha AAAA-MM-DD en CDMX (para "una vez al día") */
export function diaCDMX(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
