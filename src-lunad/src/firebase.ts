/* =========================================================
   FIREBASE
   Mismas rutas que la LuNad anterior, para no perder nada:
     artifacts/{APP}/users/{uid}/settings/userSettings
     artifacts/{APP}/users/{uid}/cycles/{id}
     artifacts/{APP}/users/{uid}/logs/{AAAA-MM-DD}
   El SDK se carga desde gstatic (la misma versión que usa
   sesion.js), así comparten la misma sesión.
   ========================================================= */
import type { Ajustes, Ciclo, Fecha, Registro } from "./ciclo";

const SDK = "https://www.gstatic.com/firebasejs/11.6.1/";
const CONFIG = {
  apiKey: "AIzaSyBqXPV9LA3j1MY6swbM-d4YqsuxGT37Q7g",
  authDomain: "nadiapp-b44ae.firebaseapp.com",
  projectId: "nadiapp-b44ae",
  storageBucket: "nadiapp-b44ae.firebasestorage.app",
  messagingSenderId: "458286198231",
  appId: "1:458286198231:web:d9801e0dd6ea4fd0ae2f92",
};
const APP = CONFIG.appId;

// import() con una variable para que el empaquetador no intente incluirlo
const cargar = (m: string): Promise<any> => import(/* @vite-ignore */ SDK + m);

export interface Conexion {
  uid: string;
  escuchar(cb: {
    ajustes: (a: Partial<Ajustes> | null) => void;
    ciclos: (c: Ciclo[]) => void;
    registros: (r: Record<Fecha, Registro>) => void;
    error: (e: unknown) => void;
  }): () => void;
  guardarAjustes(a: Ajustes): Promise<void>;
  nuevoCiclo(inicio: Fecha): Promise<void>;
  actualizarCiclo(id: string, cambios: Partial<Ciclo>): Promise<void>;
  borrarCiclo(id: string): Promise<void>;
  guardarRegistro(f: Fecha, r: Registro | null): Promise<void>;
}

let promesa: Promise<{ auth: any; A: any; db: any; F: any }> | null = null;
function iniciar() {
  if (promesa) return promesa;
  promesa = (async () => {
    const [appMod, A, F] = await Promise.all([cargar("firebase-app.js"), cargar("firebase-auth.js"), cargar("firebase-firestore.js")]);
    const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(CONFIG);
    let db;
    try {
      // guarda una copia en el teléfono: abre al instante y funciona sin internet
      db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
    } catch {
      db = F.getFirestore(app);
    }
    return { auth: A.getAuth(app), A, db, F };
  })();
  promesa.catch(() => { promesa = null; });
  return promesa;
}

/** Espera a que haya sesión (la puerta de NadiApp se encarga de pedirla) */
export async function conectar(): Promise<Conexion> {
  const { auth, A, db, F } = await iniciar();
  const user: any = await new Promise(ok => {
    const quitar = A.onAuthStateChanged(auth, (u: any) => { if (u) { quitar(); ok(u); } });
  });
  const uid: string = user.uid;
  const base = ["artifacts", APP, "users", uid] as const;
  const col = (n: string) => F.collection(db, ...base, n);
  const doc = (...p: string[]) => F.doc(db, ...base, ...p);

  return {
    uid,
    escuchar({ ajustes, ciclos, registros, error }) {
      const q1 = F.onSnapshot(doc("settings", "userSettings"), (s: any) => ajustes(s.exists() ? s.data() : null), error);
      const q2 = F.onSnapshot(col("cycles"), (s: any) => ciclos(s.docs.map((d: any) => ({ id: d.id, ...d.data() }))), error);
      const q3 = F.onSnapshot(col("logs"), (s: any) => {
        const r: Record<Fecha, Registro> = {};
        s.docs.forEach((d: any) => { r[d.id] = d.data(); });
        registros(r);
      }, error);
      return () => { q1(); q2(); q3(); };
    },
    guardarAjustes: a => F.setDoc(doc("settings", "userSettings"), a),
    nuevoCiclo: inicio => F.addDoc(col("cycles"), { startDate: inicio, timestamp: Date.now() }).then(() => {}),
    actualizarCiclo: (id, cambios) => {
      const limpio: Record<string, unknown> = {};
      Object.entries(cambios).forEach(([k, v]) => { limpio[k] = v === undefined ? F.deleteField() : v; });
      return F.updateDoc(doc("cycles", id), limpio);
    },
    borrarCiclo: id => F.deleteDoc(doc("cycles", id)),
    guardarRegistro: (f, r) => r ? F.setDoc(doc("logs", f), { ...r, updatedAt: Date.now() }) : F.deleteDoc(doc("logs", f)),
  };
}
