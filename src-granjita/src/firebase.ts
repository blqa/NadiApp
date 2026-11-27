/* =========================================================
   FIREBASE · sincronización en tiempo real
   Todo cambio pasa por una transacción: si Nadia y Luis tocan
   lo mismo al mismo tiempo, Firestore reintenta y nadie pierde
   nada (ni se cosecha dos veces la misma planta).
   ========================================================= */
import {
  CULTIVOS, DECORACIONES, GATITO, INICIO, MULT_DORADA, PROB_DORADA, RECETAS, TAMANO_INICIAL, TAMANO_MAX, NOMBRE,
  otro, precioExpansion, type CultivoId, type DecorId, type Jugador, type RecetaId,
} from "./datos";
import { INV_VACIO, type Encargo, type EstadoGranja, type Mascota, type Parcela, type Presencia, type Regalo } from "./tipos";
import { diaCDMX, estaLista } from "./tiempo";

const SDK = "https://www.gstatic.com/firebasejs/11.6.1/";
const CONFIG = {
  apiKey: "AIzaSyBqXPV9LA3j1MY6swbM-d4YqsuxGT37Q7g",
  authDomain: "nadiapp-b44ae.firebaseapp.com",
  projectId: "nadiapp-b44ae",
  storageBucket: "nadiapp-b44ae.firebasestorage.app",
  messagingSenderId: "458286198231",
  appId: "1:458286198231:web:d9801e0dd6ea4fd0ae2f92",
};
const cargar = (m: string): Promise<any> => import(/* @vite-ignore */ SDK + m);

export type Herramienta = "mano" | "arar" | "sembrar" | "regar" | "cosechar" | "decorar";
export interface Resultado { ok: boolean; msg: string; dorada?: boolean; amor?: boolean }

export interface Escucha {
  estado: (e: EstadoGranja | null) => void;
  parcelas: (p: Record<string, Parcela>) => void;
  cofre: (r: Regalo[]) => void;
  encargos: (e: Encargo[]) => void;
  jugadores: (j: Partial<Record<Jugador, Presencia>>) => void;
  mascota: (m: Mascota | null) => void;
  error: (e: unknown) => void;
}

export const idCasilla = (fila: number, col: number) => `${fila}_${col}`;

export async function conectar() {
  const [appMod, A, F] = await Promise.all([cargar("firebase-app.js"), cargar("firebase-auth.js"), cargar("firebase-firestore.js")]);
  const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(CONFIG);
  let db: any;
  try { db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); }
  catch { db = F.getFirestore(app); }
  const auth = A.getAuth(app);
  const user: any = await new Promise(ok => { const q = A.onAuthStateChanged(auth, (u: any) => { if (u) { q(); ok(u); } }); });
  const yo: Jugador = String(user.email || "").startsWith("luis") ? "luis" : "nadia";

  const refEstado = F.doc(db, "granjita", "estado");
  const refMascota = F.doc(db, "granjita", "mascota");
  const sub = (n: string) => F.collection(db, "granjita", "estado", n);
  const refParcela = (id: string) => F.doc(db, "granjita", "estado", "parcelas", id);
  const inc = (n: number) => F.increment(n);
  const tx = <T,>(fn: (t: any) => Promise<T>) => F.runTransaction(db, fn) as Promise<T>;

  async function inicializar() {
    await tx(async t => {
      const s = await t.get(refEstado);
      if (s.exists()) return;
      const e: EstadoGranja = {
        monedas: INICIO.monedas, tamano: TAMANO_INICIAL,
        inv: { ...INV_VACIO, semillas: { ...INICIO.semillas } },
        herbario: {}, recetas: {}, creadoAt: Date.now(),
      };
      t.set(refEstado, e);
      t.set(refMascota, { nombre: GATITO.nombre, carino: 10, caricias: {}, comidas: {} } satisfies Mascota);
    });
  }

  function escuchar(cb: Escucha) {
    const qs = [
      F.onSnapshot(refEstado, (s: any) => cb.estado(s.exists() ? s.data() : null), cb.error),
      F.onSnapshot(sub("parcelas"), (s: any) => { const r: Record<string, Parcela> = {}; s.docs.forEach((d: any) => { r[d.id] = d.data(); }); cb.parcelas(r); }, cb.error),
      F.onSnapshot(sub("cofre"), (s: any) => cb.cofre(s.docs.map((d: any) => ({ id: d.id, ...d.data() })).sort((a: Regalo, b: Regalo) => b.creadoAt - a.creadoAt)), cb.error),
      F.onSnapshot(sub("encargos"), (s: any) => cb.encargos(s.docs.map((d: any) => ({ id: d.id, ...d.data() })).sort((a: Encargo, b: Encargo) => b.creadoAt - a.creadoAt)), cb.error),
      F.onSnapshot(sub("jugadores"), (s: any) => { const r: any = {}; s.docs.forEach((d: any) => { r[d.id] = d.data(); }); cb.jugadores(r); }, cb.error),
      F.onSnapshot(refMascota, (s: any) => cb.mascota(s.exists() ? s.data() : null), cb.error),
    ];
    return () => qs.forEach(q => q());
  }

  /* ---------- Acciones en una casilla ---------- */
  async function casilla(fila: number, col: number, h: Herramienta, op: { cultivo?: CultivoId; decor?: DecorId } = {}): Promise<Resultado> {
    const ref = refParcela(idCasilla(fila, col));
    return tx(async t => {
      const [se, sp] = await Promise.all([t.get(refEstado), t.get(ref)]);
      if (!se.exists()) return { ok: false, msg: "La granja todavía se está preparando" };
      const e: EstadoGranja = se.data();
      if (fila >= e.tamano || col >= e.tamano) return { ok: false, msg: "Esa tierra todavía no es suya" };
      const p: Parcela = sp.exists() ? sp.data() : { estado: "vacia" };
      const ahora = Date.now();

      if (h === "arar") {
        if (p.estado !== "vacia") return { ok: false, msg: p.estado === "arada" ? "Ya está arada" : "Aquí ya hay algo" };
        t.set(ref, { estado: "arada", por: yo } satisfies Parcela);
        return { ok: true, msg: "Tierra lista" };
      }
      if (h === "sembrar") {
        const c = op.cultivo;
        if (!c) return { ok: false, msg: "Elige qué sembrar" };
        if (p.estado !== "arada") return { ok: false, msg: p.estado === "vacia" ? "Primero hay que arar" : "Aquí ya hay algo sembrado" };
        if ((e.inv.semillas?.[c] ?? 0) < 1) return { ok: false, msg: `No hay semillas de ${CULTIVOS[c].nombre.toLowerCase()}` };
        t.update(refEstado, { [`inv.semillas.${c}`]: inc(-1) });
        t.set(ref, { estado: "sembrada", cultivo: c, plantedAt: ahora, wateredBy: [], crecido: 0, por: yo } satisfies Parcela);
        return { ok: true, msg: `${CULTIVOS[c].nombre} sembrada. Ahora a regarla` };
      }
      if (h === "regar") {
        if (p.estado === "sembrada") {
          t.set(ref, { ...p, estado: "regada", wateredAt: ahora, wateredBy: [yo], crecido: 0, desde: ahora, velocidad: 1, por: yo });
          return { ok: true, msg: `Regada. Si ${NOMBRE[otro(yo)]} también la riega, crece al doble ♡` };
        }
        if (p.estado === "regada") {
          if (estaLista(p, ahora)) return { ok: false, msg: "¡Ya está lista para cosechar!" };
          if (p.wateredBy?.includes(yo)) return { ok: false, msg: p.amor ? "Ya tiene Amor Compartido ♡" : `Ya la regaste. Falta que la riegue ${NOMBRE[otro(yo)]}` };
          const crecido = (p.crecido ?? 0) + (ahora - (p.desde ?? ahora)) * (p.velocidad ?? 1);
          t.set(ref, { ...p, wateredBy: [...(p.wateredBy ?? []), yo], crecido, desde: ahora, velocidad: 2, amor: true, wateredAt: ahora, por: yo });
          return { ok: true, msg: "¡Amor Compartido! Ahora crece al doble", amor: true };
        }
        return { ok: false, msg: p.estado === "arada" ? "Primero hay que sembrar" : "No hay nada que regar" };
      }
      if (h === "cosechar") {
        if (!p.cultivo || !estaLista(p, ahora)) return { ok: false, msg: p.cultivo ? "Todavía no está lista" : "No hay nada que cosechar" };
        const c = p.cultivo;
        const dorada = Math.random() < (p.amor ? PROB_DORADA.amor : PROB_DORADA.normal);
        t.update(refEstado, {
          [dorada ? `inv.doradas.${c}` : `inv.cosechas.${c}`]: inc(1),
          [`herbario.${c}.${dorada ? "dorada" : "normal"}`]: inc(1),
        });
        t.set(ref, { estado: "arada", por: yo } satisfies Parcela);
        return { ok: true, dorada, msg: dorada ? `✨ ¡${CULTIVOS[c].nombre} dorada!` : `+1 ${CULTIVOS[c].nombre.toLowerCase()}` };
      }
      if (h === "decorar") {
        if (p.estado === "decoracion" && p.decor) {
          t.update(refEstado, { [`inv.decor.${p.decor}`]: inc(1) });
          t.set(ref, { estado: "vacia", por: yo } satisfies Parcela);
          return { ok: true, msg: `${DECORACIONES[p.decor].nombre} guardada` };
        }
        const d = op.decor;
        if (!d) return { ok: false, msg: "Elige una decoración" };
        if (p.estado !== "vacia" && p.estado !== "arada") return { ok: false, msg: "Esa casilla está ocupada" };
        if ((e.inv.decor?.[d] ?? 0) < 1) return { ok: false, msg: "No tienen esa decoración. Cómprenla en la tienda" };
        t.update(refEstado, { [`inv.decor.${d}`]: inc(-1) });
        t.set(ref, { estado: "decoracion", decor: d, por: yo } satisfies Parcela);
        return { ok: true, msg: `${DECORACIONES[d].nombre} colocada` };
      }
      return { ok: false, msg: "" };
    });
  }

  /* ---------- Tienda ---------- */
  async function comprar(tipo: "semilla" | "decor" | "terreno", id?: string, cantidad = 1): Promise<Resultado> {
    return tx(async t => {
      const e: EstadoGranja = (await t.get(refEstado)).data();
      if (tipo === "terreno") {
        if (e.tamano >= TAMANO_MAX) return { ok: false, msg: "El terreno ya es del tamaño máximo" };
        const precio = precioExpansion(e.tamano);
        if (e.monedas < precio) return { ok: false, msg: `Faltan ${precio - e.monedas} moneditas` };
        t.update(refEstado, { monedas: inc(-precio), tamano: e.tamano + 1 });
        return { ok: true, msg: `¡El terreno creció a ${e.tamano + 1}×${e.tamano + 1}!` };
      }
      const precio = (tipo === "semilla" ? CULTIVOS[id as CultivoId].semilla : DECORACIONES[id as DecorId].precio) * cantidad;
      if (e.monedas < precio) return { ok: false, msg: `Faltan ${precio - e.monedas} moneditas` };
      t.update(refEstado, { monedas: inc(-precio), [`inv.${tipo === "semilla" ? "semillas" : "decor"}.${id}`]: inc(cantidad) });
      return { ok: true, msg: tipo === "semilla" ? `+${cantidad} ${cantidad === 1 ? "semilla" : "semillas"} de ${CULTIVOS[id as CultivoId].nombre.toLowerCase()}` : `${DECORACIONES[id as DecorId].nombre} comprada` };
    });
  }

  async function vender(tipo: "cosecha" | "dorada" | "item", clave: string, cantidad = 1): Promise<Resultado> {
    return tx(async t => {
      const e: EstadoGranja = (await t.get(refEstado)).data();
      const grupo = tipo === "cosecha" ? "cosechas" : tipo === "dorada" ? "doradas" : "items";
      const tengo = (e.inv as any)[grupo]?.[clave] ?? 0;
      if (tengo < cantidad) return { ok: false, msg: "No alcanza" };
      const unit = tipo === "item" ? RECETAS[clave as RecetaId].venta : CULTIVOS[clave as CultivoId].venta * (tipo === "dorada" ? MULT_DORADA : 1);
      t.update(refEstado, { [`inv.${grupo}.${clave}`]: inc(-cantidad), monedas: inc(unit * cantidad) });
      return { ok: true, msg: `+${unit * cantidad} moneditas` };
    });
  }

  /* ---------- Cabaña ---------- */
  async function cocinar(r: RecetaId): Promise<Resultado> {
    return tx(async t => {
      const e: EstadoGranja = (await t.get(refEstado)).data();
      const cambios: Record<string, unknown> = {};
      for (const [c, n] of Object.entries(RECETAS[r].ingredientes) as [CultivoId, number][]) {
        const normales = e.inv.cosechas?.[c] ?? 0, doradas = e.inv.doradas?.[c] ?? 0;
        if (normales + doradas < n) return { ok: false, msg: `Faltan ${n - normales - doradas} ${CULTIVOS[c].plural.toLowerCase()}` };
        const deNormales = Math.min(normales, n);
        if (deNormales) cambios[`inv.cosechas.${c}`] = inc(-deNormales);
        if (n - deNormales) cambios[`inv.doradas.${c}`] = inc(-(n - deNormales));
      }
      cambios[`inv.items.${r}`] = inc(1);
      cambios[`recetas.${r}`] = inc(1);
      t.update(refEstado, cambios);
      return { ok: true, msg: `${RECETAS[r].emoji} ${RECETAS[r].nombre} lista` };
    });
  }

  /* ---------- Cofre compartido ---------- */
  async function regalar(tipo: Regalo["tipo"], clave: string, cantidad: number, nota: string): Promise<Resultado> {
    const ref = F.doc(sub("cofre"));
    return tx(async t => {
      const e: EstadoGranja = (await t.get(refEstado)).data();
      const grupo = tipo === "cosecha" ? "cosechas" : tipo === "dorada" ? "doradas" : "items";
      if (((e.inv as any)[grupo]?.[clave] ?? 0) < cantidad) return { ok: false, msg: "No alcanza" };
      t.update(refEstado, { [`inv.${grupo}.${clave}`]: inc(-cantidad) });
      t.set(ref, { de: yo, para: otro(yo), tipo, clave, cantidad, nota: nota.trim().slice(0, 140), creadoAt: Date.now() });
      return { ok: true, msg: `Regalo guardado en el cofre para ${NOMBRE[otro(yo)]} ♡` };
    });
  }
  async function abrirRegalo(id: string): Promise<Resultado> {
    const ref = F.doc(sub("cofre"), id);
    return tx(async t => {
      const s = await t.get(ref);
      if (!s.exists()) return { ok: false, msg: "Ese regalo ya no está" };
      const r: Regalo = s.data();
      if (r.para !== yo || r.abiertoAt) return { ok: false, msg: "" };
      const grupo = r.tipo === "cosecha" ? "cosechas" : r.tipo === "dorada" ? "doradas" : "items";
      t.update(ref, { abiertoAt: Date.now() });
      t.update(refEstado, { [`inv.${grupo}.${r.clave}`]: inc(r.cantidad) });
      return { ok: true, msg: "Regalo abierto ♡" };
    });
  }

  /* ---------- Tablón ---------- */
  const nuevoEncargo = (texto: string) => F.addDoc(sub("encargos"), { de: yo, texto: texto.trim().slice(0, 90), creadoAt: Date.now() } satisfies Omit<Encargo, "id">);
  const cumplirEncargo = (id: string) => F.updateDoc(F.doc(sub("encargos"), id), { hechoPor: yo, hechoAt: Date.now() });
  const borrarEncargo = (id: string) => F.deleteDoc(F.doc(sub("encargos"), id));

  /* ---------- Presencia ---------- */
  const presencia = (p: Omit<Presencia, "vistoAt">) =>
    F.setDoc(F.doc(sub("jugadores"), yo), { ...p, vistoAt: Date.now() }, { merge: true }).catch(() => {});

  /* ---------- Gatito ---------- */
  async function gatito(accion: "caricia" | "comida"): Promise<Resultado> {
    return tx(async t => {
      const s = await t.get(refMascota);
      const m: Mascota = s.exists() ? s.data() : { nombre: GATITO.nombre, carino: 10, caricias: {}, comidas: {} };
      const hoy = diaCDMX();
      const campo = accion === "caricia" ? "caricias" : "comidas";
      if (m[campo]?.[yo] === hoy) return { ok: false, msg: accion === "caricia" ? `${m.nombre} ya recibió tus mimos hoy. Vuelve mañana` : `${m.nombre} ya comió contigo hoy` };
      const sube = accion === "caricia" ? GATITO.carinoCaricia : GATITO.carinoComida;
      const carino = Math.min(GATITO.carinoMax, (m.carino ?? 0) + sube);
      const nuevo: Partial<Mascota> = { carino, [campo]: { ...(m[campo] ?? {}), [yo]: hoy } };
      let msg = accion === "caricia" ? `${m.nombre} ronronea ♡` : `${m.nombre} comió feliz`;
      if (accion === "comida" && Math.random() < 0.25 + carino / 400) {
        const cultivo: CultivoId = Math.random() < 0.3 + carino / 500 ? "rosa" : (["girasol", "lavanda", "calabaza"] as CultivoId[])[Math.floor(Math.random() * 3)];
        nuevo.hallazgo = { cultivo, para: yo, at: Date.now() };
        t.update(refEstado, { [`inv.semillas.${cultivo}`]: inc(1) });
        msg = `¡${m.nombre} encontró una semilla de ${CULTIVOS[cultivo].nombre.toLowerCase()}!`;
      }
      if (s.exists()) t.update(refMascota, nuevo); else t.set(refMascota, { ...m, ...nuevo });
      return { ok: true, msg };
    });
  }

  return { yo, inicializar, escuchar, casilla, comprar, vender, cocinar, regalar, abrirRegalo, nuevoEncargo, cumplirEncargo, borrarEncargo, presencia, gatito };
}

export type Granja = Awaited<ReturnType<typeof conectar>>;
