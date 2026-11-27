/* =========================================================
   CATÁLOGO DE LA GRANJITA
   Para cambiar precios, tiempos o recetas, edita aquí.
   ========================================================= */

export type Jugador = "nadia" | "luis";
export type CultivoId = "fresa" | "girasol" | "lavanda" | "calabaza" | "rosa";
export type RecetaId = "mermelada" | "ramo" | "pay" | "esencia";
export type DecorId = "cerca" | "camino" | "farol" | "banca" | "maceta";

export const MIN = 60_000;

export interface Cultivo {
  id: CultivoId;
  nombre: string;
  plural: string;
  duracion: number;      // ms de crecimiento (regado por una persona)
  semilla: number;       // precio de la semilla
  venta: number;         // precio de venta de la cosecha normal
  rara?: boolean;
  color: string;
}

export const CULTIVOS: Record<CultivoId, Cultivo> = {
  fresa:    { id: "fresa",    nombre: "Fresa",       plural: "Fresas",       duracion: 15 * MIN,  semilla: 5,   venta: 9,   color: "#e2475a" },
  girasol:  { id: "girasol",  nombre: "Girasol",     plural: "Girasoles",    duracion: 60 * MIN,  semilla: 12,  venta: 24,  color: "#f2b632" },
  lavanda:  { id: "lavanda",  nombre: "Lavanda",     plural: "Lavandas",     duracion: 120 * MIN, semilla: 18,  venta: 38,  color: "#9b7fe0" },
  calabaza: { id: "calabaza", nombre: "Calabaza",    plural: "Calabazas",    duracion: 360 * MIN, semilla: 35,  venta: 90,  color: "#ec8a2c" },
  rosa:     { id: "rosa",     nombre: "Rosa Eterna", plural: "Rosas Eternas", duracion: 720 * MIN, semilla: 150, venta: 320, rara: true, color: "#d6336c" },
};
export const ORDEN_CULTIVOS: CultivoId[] = ["fresa", "girasol", "lavanda", "calabaza", "rosa"];

/** Probabilidad de cosecha dorada */
export const PROB_DORADA = { normal: 0.06, amor: 0.35 };
export const MULT_DORADA = 3; // una dorada vale el triple

export interface Receta {
  id: RecetaId;
  nombre: string;
  descripcion: string;
  ingredientes: Partial<Record<CultivoId, number>>;
  venta: number;
  emoji: string;
}

export const RECETAS: Record<RecetaId, Receta> = {
  mermelada: { id: "mermelada", nombre: "Mermelada de Fresa", descripcion: "Dulce, para untar en pan calientito.", ingredientes: { fresa: 3 }, venta: 40, emoji: "🍓" },
  ramo:      { id: "ramo", nombre: "Ramo de Girasoles y Lavanda", descripcion: "Amarillo y morado, como un atardecer.", ingredientes: { girasol: 2, lavanda: 2 }, venta: 150, emoji: "💐" },
  pay:       { id: "pay", nombre: "Pay de Calabaza", descripcion: "Huele a canela y a casa.", ingredientes: { calabaza: 1, fresa: 2 }, venta: 140, emoji: "🥧" },
  esencia:   { id: "esencia", nombre: "Esencia de Rosa", descripcion: "Unas gotas y todo huele a ti.", ingredientes: { rosa: 1 }, venta: 420, emoji: "🌹" },
};
export const ORDEN_RECETAS: RecetaId[] = ["mermelada", "ramo", "pay", "esencia"];

export const DECORACIONES: Record<DecorId, { id: DecorId; nombre: string; precio: number }> = {
  camino: { id: "camino", nombre: "Caminito de piedra", precio: 10 },
  cerca:  { id: "cerca", nombre: "Cerca de madera", precio: 15 },
  maceta: { id: "maceta", nombre: "Maceta", precio: 25 },
  farol:  { id: "farol", nombre: "Farol", precio: 40 },
  banca:  { id: "banca", nombre: "Banca", precio: 60 },
};
export const ORDEN_DECOR: DecorId[] = ["camino", "cerca", "maceta", "farol", "banca"];

/** Tamaño del terreno: empieza en 6x6 y crece hasta 9x9 */
export const TAMANO_INICIAL = 6;
export const TAMANO_MAX = 9;
export const precioExpansion = (tamanoActual: number) => [0, 0, 0, 0, 0, 0, 250, 600, 1200][tamanoActual] ?? Infinity;

export const INICIO = {
  monedas: 60,
  semillas: { fresa: 6, girasol: 3 } as Partial<Record<CultivoId, number>>,
};

/** Gatito */
export const GATITO = {
  nombre: "Michi",
  carinoCaricia: 3,
  carinoComida: 8,
  carinoMax: 100,
};

export const NOMBRE: Record<Jugador, string> = { nadia: "Nadia", luis: "Luis" };
export const COLOR: Record<Jugador, string> = { nadia: "#e8618c", luis: "#5b8def" };
export const otro = (j: Jugador): Jugador => (j === "nadia" ? "luis" : "nadia");
