import type { CultivoId, DecorId, Jugador, RecetaId } from "./datos";

/* ---------- Firestore ----------
   granjita/estado                       → monedas, terreno, inventario, herbario (compartido)
   granjita/estado/parcelas/{fila_col}   → una casilla por documento (sin choques)
   granjita/estado/cofre/{id}            → regalos con notita
   granjita/estado/encargos/{id}         → tablón de pedidos
   granjita/estado/jugadores/{nadia|luis}→ presencia en vivo
   granjita/mascota                      → el gatito
*/

export type EstadoCasilla = "vacia" | "arada" | "sembrada" | "regada" | "lista" | "decoracion";

export interface Parcela {
  estado: EstadoCasilla;
  cultivo?: CultivoId;
  plantedAt?: number;
  wateredAt?: number;
  wateredBy?: Jugador[];
  crecido?: number;      // ms de crecimiento acumulado hasta "desde"
  desde?: number;        // desde cuándo corre la velocidad actual
  velocidad?: number;    // 1 normal, 2 con Amor Compartido
  amor?: boolean;
  decor?: DecorId;
  por?: Jugador;         // último que la tocó
}

export interface Inventario {
  semillas: Partial<Record<CultivoId, number>>;
  cosechas: Partial<Record<CultivoId, number>>;
  doradas: Partial<Record<CultivoId, number>>;
  items: Partial<Record<RecetaId, number>>;
  decor: Partial<Record<DecorId, number>>;
}

export interface EstadoGranja {
  monedas: number;
  tamano: number;
  inv: Inventario;
  herbario: Partial<Record<CultivoId, { normal?: number; dorada?: number }>>;
  recetas: Partial<Record<RecetaId, number>>; // cuántas veces se ha hecho
  creadoAt: number;
}

export interface Regalo {
  id: string;
  de: Jugador;
  para: Jugador;
  tipo: "item" | "cosecha" | "dorada";
  clave: string;      // RecetaId o CultivoId
  cantidad: number;
  nota: string;
  creadoAt: number;
  abiertoAt?: number;
}

export interface Encargo {
  id: string;
  de: Jugador;
  texto: string;
  creadoAt: number;
  hechoPor?: Jugador;
  hechoAt?: number;
}

export interface Presencia {
  fila?: number;
  col?: number;
  accion?: string;
  vistoAt: number;
}

export interface Mascota {
  nombre: string;
  carino: number;
  caricias: Partial<Record<Jugador, string>>; // último día (AAAA-MM-DD) que acarició cada quien
  comidas: Partial<Record<Jugador, string>>;
  hallazgo?: { cultivo: CultivoId; para: Jugador; at: number };
}

export const INV_VACIO: Inventario = { semillas: {}, cosechas: {}, doradas: {}, items: {}, decor: {} };
